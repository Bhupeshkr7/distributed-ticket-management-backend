import { CustomError } from "../../shared/error/custom.error";
import { getOrSetCache, getIdempotency, setIdempotency, invalidateCache, invalidateCacheByPattern } from "../../utils/redis/redis.cache";
import { CacheKeys, CacheTTL } from "../../utils/redis/redis.keys";
import { acquireLock, releaseLock } from "../../utils/redis/redis.lock";
import { lockSeats } from "../seat/seat.service";
import { CreateBookingDTO } from "./booking.dto";
import { BookingState } from "./booking.enum";
import { Booking } from "./booking.model";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      const isConflict = err instanceof CustomError && err.statusCode === 409;
      if (isConflict && i < maxRetries - 1) {
        await wait(100 * Math.pow(2, i));
        continue;
      }
      throw err;
    }
  }
  throw new CustomError("Max retries exceeded", 409);
};

export const createBooking = async (userId: string, data: CreateBookingDTO) => {
  console.log("Creating booking with data:", { userId, ...data });
  if (!userId && !data.idempotencyKey) {
    throw new CustomError("Either userId or idempotencyKey must be provided", 400);
  }

  // 1. Idempotency check
  if (data.idempotencyKey) {
    const cachedBooking = await getIdempotency<any>(CacheKeys.idempotency(data.idempotencyKey));
    if (cachedBooking) return cachedBooking;
  }

  const lockOwnerId = userId ?? data.idempotencyKey!;
  const lockedKeys: string[] = [];

  try {
    // 2. Acquire Redis Locks for all seats
    for (const seatId of data.seatIds) {
      const lockKey = CacheKeys.seatLock(seatId);
      const acquired = await acquireLock(lockKey, lockOwnerId, CacheTTL.SEAT_LOCK);
      if (!acquired) {
        throw new CustomError(`Seat ${seatId} is currently being processed by another request`, 409);
      }
      lockedKeys.push(lockKey);
    }

    // 3. Database Transaction
    const session = await Booking.startSession();
    session.startTransaction();
    try {
      const isLocked = await lockSeats(data.showId, data.seatIds, lockOwnerId, session);
      if (!isLocked) {
        throw new CustomError("Some seats are not available", 409);
      }

      const booking = new Booking({
        userId: userId,
        showId: data.showId,
        seatIds: data.seatIds,
        amount: data.amount,
        idempotencyKey: data.idempotencyKey,
        state: BookingState.INIT,
      });

      await booking.save({ session });
      await session.commitTransaction();

      // 4. Invalidate List Caches and Set Idempotency
      await invalidateCacheByPattern("bookings:list:*");
      if (data.idempotencyKey) {
        await setIdempotency(CacheKeys.idempotency(data.idempotencyKey), booking.toObject(), CacheTTL.IDEMPOTENCY);
      }
      console.log("Booking created successfully:", booking);
      return booking;
    } catch (dbError) {
      await session.abortTransaction();
      throw dbError;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error in createBooking:", error instanceof Error ? error.message : error);
    if (error instanceof CustomError) throw error;
    throw new CustomError(error instanceof Error ? error.message : "An unexpected error occurred", 500);
  } finally {
    // 5. Release Redis Locks
    await Promise.all(lockedKeys.map(key => releaseLock(key, lockOwnerId)));
  }
};

export const getAllBooking = async (filter: any = {}) => {
  const key = CacheKeys.bookingsList(filter.userId || "all");
  return await getOrSetCache(key, CacheTTL.BOOKING_LIST, async () => {
    return await Booking.find(filter).populate("showId").populate("seatIds").lean();
  });
};

export const getBookingById = async (id: string) => {
  const key = CacheKeys.bookingDetail(id);
  return await getOrSetCache(key, CacheTTL.BOOKING_DETAIL, async () => {
    const booking = await Booking.findById(id).populate("showId").populate("seatIds").lean();
    if (!booking) throw new CustomError("Booking not found", 404);
    return booking;
  });
};

export const updateBooking = async (id: string, data: any) => {
  const booking = await Booking.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!booking) throw new CustomError("Booking not found", 404);

  await Promise.all([
    invalidateCache(CacheKeys.bookingDetail(id)),
    invalidateCacheByPattern("bookings:list:*"),
  ]);

  return booking;
};

export const deleteBooking = async (id: string) => {
  const booking = await Booking.findByIdAndDelete(id).lean();
  if (!booking) throw new CustomError("Booking not found", 404);

  await Promise.all([
    invalidateCache(CacheKeys.bookingDetail(id)),
    invalidateCacheByPattern("bookings:list:*"),
  ]);
};

export const updateBookingState = async (
  id: string,
  state: BookingState,
  extra: Record<string, unknown> = {}
) => {
  const booking = await Booking.findByIdAndUpdate(
    id,
    { state, ...extra },
    { new: true }
  ).lean();

  if (!booking) throw new CustomError("Booking not found", 404);

  await Promise.all([
    invalidateCache(CacheKeys.bookingDetail(id)),
    invalidateCacheByPattern("bookings:list:*"),
  ]);

  return booking;
};

