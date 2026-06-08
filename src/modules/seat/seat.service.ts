import { CustomError } from "../../shared/error/custom.error";
import { getOrSetCache, invalidateCache, invalidateCacheByPattern } from "../../utils/redis/redis.cache";
import { CacheKeys, CacheTTL } from "../../utils/redis/redis.keys";
import { getShowById } from "../show/show.service";
import { ShowModel } from "../show/show.model";
import { CreateSeatsDTO } from "./seat.dto";
import { SeatStatus } from "./seat.enum";
import { SeatModel } from "./seat.model";

export const createSeats = async (data: CreateSeatsDTO) => {
  await getShowById(data.showId);

  const existing = await SeatModel.findOne({ showId: data.showId }).lean();
  if (existing) throw new CustomError("Seats already created for this show", 400);

  const rows = Array.from({ length: data.rows }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  const seats = rows.flatMap((row) =>
    Array.from({ length: data.cols }, (_, i) => ({
      showId: data.showId,
      row,
      col: i + 1,
      status: SeatStatus.AVAILABLE,
      version: 0,
      lockedBy: null,
      lockedAt: null,
    }))
  );

  const result = await SeatModel.insertMany(seats);
  await invalidateCache(CacheKeys.showSeats(data.showId));

  return { total: result.length, rows: data.rows, cols: data.cols };
};

export const getShowSeats = async (showId: string) => {
  const key = CacheKeys.showSeats(showId);

  return await getOrSetCache(key, CacheTTL.SHOW_SEATS, async () => {
    await getShowById(showId);

    const seats = await SeatModel.find({ showId })
      .select("-__v -createdAt -updatedAt")
      .lean();

    if (!seats.length) throw new CustomError("No seats found for this show", 404);

    const grouped = seats.reduce<Record<string, any[]>>((acc, seat) => {
      if (!acc[seat.row]) acc[seat.row] = [];
      acc[seat.row].push(seat);
      return acc;
    }, {});

    Object.values(grouped).forEach((row) => row.sort((a, b) => a.col - b.col));

    return grouped;
  });
};

export const lockSeats = async (
  showId: string,
  seatIds: string[],
  userId: string,
  session: any
) => {
  const result = await SeatModel.updateMany(
    { _id: { $in: seatIds }, showId, status: SeatStatus.AVAILABLE },
    { $set: { status: SeatStatus.LOCKED, lockedBy: userId, lockedAt: new Date() } },
    { session }
  );

  const success = result.modifiedCount === seatIds.length;
  if (success) {
    // Decrement availableSeats on the Show document
    await ShowModel.findByIdAndUpdate(
      showId,
      { $inc: { availableSeats: -seatIds.length } },
      { session }
    );
    // Bust show caches so the frontend sees the updated seat count immediately
    await Promise.all([
      invalidateCache(CacheKeys.showSeats(showId)),
      invalidateCache(CacheKeys.showDetail(showId)),
      invalidateCacheByPattern("shows:list:*"),
    ]);
  }
  return success;
};

export const lockSeatOptimistic = async (
  seatId: string,
  userId: string,
  currentVersion: number
) => {
  const result = await SeatModel.findOneAndUpdate(
    { _id: seatId, status: SeatStatus.AVAILABLE, version: currentVersion },
    {
      $set: { status: SeatStatus.LOCKED, lockedBy: userId, lockedAt: new Date() },
      $inc: { version: 1 },
    },
    { new: true }
  ).lean();

  if (!result) throw new CustomError("Seat not available or version mismatch", 409);

  await invalidateCache(CacheKeys.showSeats(result.showId.toString()));
  return result;
};

export const releaseStaleSeats = async () => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  // Find stale seats before releasing so we can group by showId
  const staleSeats = await SeatModel.find(
    { status: SeatStatus.LOCKED, lockedAt: { $lt: tenMinutesAgo } },
    { showId: 1 }
  ).lean();

  if (staleSeats.length === 0) return;

  // Group by showId to count how many seats to free per show
  const countByShow = staleSeats.reduce<Record<string, number>>((acc, seat) => {
    const id = seat.showId.toString();
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  // Release the seats
  await SeatModel.updateMany(
    { status: SeatStatus.LOCKED, lockedAt: { $lt: tenMinutesAgo } },
    { $set: { status: SeatStatus.AVAILABLE, lockedBy: null, lockedAt: null } }
  );

  // Increment availableSeats and bust caches for each affected show
  await Promise.all(
    Object.entries(countByShow).flatMap(([showId, count]) => [
      ShowModel.findByIdAndUpdate(showId, { $inc: { availableSeats: count } }),
      invalidateCache(CacheKeys.showSeats(showId)),
      invalidateCache(CacheKeys.showDetail(showId)),
    ])
  );
  await invalidateCacheByPattern("shows:list:*");
};

export const releaseSeats = async (showId: string, seatIds: string[]) => {
  const result = await SeatModel.updateMany(
    { _id: { $in: seatIds }, showId },
    { $set: { status: SeatStatus.AVAILABLE, lockedBy: null, lockedAt: null } }
  );

  if (result.modifiedCount > 0) {
    // Increment availableSeats back on the Show document
    await ShowModel.findByIdAndUpdate(
      showId,
      { $inc: { availableSeats: result.modifiedCount } }
    );
    // Bust show caches so the frontend reflects the freed seats
    await Promise.all([
      invalidateCache(CacheKeys.showSeats(showId)),
      invalidateCache(CacheKeys.showDetail(showId)),
      invalidateCacheByPattern("shows:list:*"),
    ]);
  }

  return result;
};

