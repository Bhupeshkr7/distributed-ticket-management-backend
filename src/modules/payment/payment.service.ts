import Razorpay from "razorpay";
import { CustomError } from "../../shared/error/custom.error";
import { env } from "../../config/env.config";
import { invalidateCache } from "../../utils/redis/redis.cache";
import { CacheKeys } from "../../utils/redis/redis.keys";
import { Payment } from "./payment.model";
import { PaymentState } from "./payment.enum";
import { WebhookPayloadDTO, webhookPayloadDTO } from "./payment.dto";
import { getBookingById, updateBookingState } from "../booking/booking.service";
import { releaseSeats } from "../seat/seat.service";
import { BookingState } from "../booking/booking.enum";

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const initiatePayment = async (userId: string, bookingId: string) => {
  const booking = await getBookingById(bookingId);
  if (booking.userId.toString() !== userId) {
    throw new CustomError("Unauthorized", 403);
  }

  if (booking.state !== BookingState.INIT && booking.state !== BookingState.LOCKED) {
    throw new CustomError(`Booking is in state ${booking.state}, cannot initiate payment`, 400);
  }

  const existingPayment = await Payment.findOne({
    bookingId: booking._id || bookingId,
    state: PaymentState.PENDING,
  }).lean();

  if (existingPayment) {
    return {
      orderId: existingPayment.razorpayOrderId,
      amount: existingPayment.amount,
      currency: existingPayment.currency,
      keyId: env.RAZORPAY_KEY_ID,
      bookingId: booking._id,
    };
  }

  const order = await razorpay.orders.create({
    amount: booking.amount * 100,
    currency: "INR",
    receipt: booking._id.toString(),
  });

  const session = await Payment.startSession();
  session.startTransaction();

  try {
    const payment = new Payment({
      bookingId: booking._id,
      userId,
      razorpayOrderId: order.id,
      amount: booking.amount,
      currency: "INR",
      state: PaymentState.PENDING,
    });

    await payment.save({ session });
    await updateBookingState(bookingId, BookingState.PAYMENT_PENDING, { paymentId: order.id });
    await session.commitTransaction();

    return {
      orderId: order.id,
      amount: booking.amount,
      currency: "INR",
      keyId: env.RAZORPAY_KEY_ID,
      bookingId: booking._id,
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const handleWebhook = async (rawBody: Buffer) => {
  const payload = webhookPayloadDTO.parse(JSON.parse(rawBody.toString()));
  const entity = payload.payload.payment.entity;

  const payment = await Payment.findOne({ razorpayOrderId: entity.order_id });
  if (!payment) throw new CustomError("Payment record not found", 404);

  if (payload.event === "payment.captured") {
    await executeCapturedSaga(payment, entity.id);
    return;
  }

  if (payload.event === "payment.failed") {
    await executeFailedSaga(payment, entity.error_description ?? "Payment failed");
    return;
  }
};

const executeCapturedSaga = async (payment: any, razorpayPaymentId: string) => {
  const session = await Payment.startSession();
  session.startTransaction();

  try {
    await Payment.findByIdAndUpdate(
      payment._id,
      { state: PaymentState.CAPTURED, razorpayPaymentId },
      { session }
    );

    await updateBookingState(payment.bookingId.toString(), BookingState.CONFIRM, {
      paymentId: razorpayPaymentId,
    });

    await session.commitTransaction();
    await invalidateCache(CacheKeys.bookingDetail(payment.bookingId.toString()));
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

const executeFailedSaga = async (payment: any, reason: string) => {
  const session = await Payment.startSession();
  session.startTransaction();

  try {
    await Payment.findByIdAndUpdate(
      payment._id,
      { state: PaymentState.FAILED, failureReason: reason },
      { session }
    );

    const booking = await getBookingById(payment.bookingId.toString());
    await releaseSeats(
      booking.showId.toString(),
      booking.seatIds.map((id: any) => id.toString())
    );
    await updateBookingState(payment.bookingId.toString(), BookingState.FAILED);

    await session.commitTransaction();
    await invalidateCache(CacheKeys.bookingDetail(payment.bookingId.toString()));
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const getPaymentByBookingId = async (bookingId: string) => {
  const payment = await Payment.findOne({ bookingId }).lean();
  if (!payment) throw new CustomError("Payment not found", 404);
  return payment;
};

export const getPaymentsByUserId = async (userId: string) => {
  return await Payment.find({ userId })
    .populate({
      path: 'bookingId',
      populate: {
        path: 'showId'
      }
    })
    .sort({ createdAt: -1 })
    .lean();
};

// Manual verification fallback for when webhook fails
export const verifyAndConfirmPayment = async (userId: string, bookingId: string) => {
  const booking = await getBookingById(bookingId);
  if (booking.userId.toString() !== userId) {
    throw new CustomError("Unauthorized", 403);
  }

  const payment = await Payment.findOne({ bookingId });
  if (!payment) throw new CustomError("Payment not found", 404);

  // If already captured, just return current state
  if (payment.state === PaymentState.CAPTURED) {
    return { bookingState: BookingState.CONFIRM, paymentState: PaymentState.CAPTURED };
  }

  if (payment.state !== PaymentState.PENDING) {
    return { bookingState: booking.state, paymentState: payment.state };
  }

  // Fetch order from Razorpay to check real payment status
  try {
    const order = await razorpay.orders.fetch(payment.razorpayOrderId);
    if (order.status === "paid") {
      // Fetch the payment for this order
      const payments = await razorpay.orders.fetchPayments(payment.razorpayOrderId);
      const successfulPayment = (payments as any).items?.find((p: any) => p.status === "captured");
      if (successfulPayment) {
        await executeCapturedSaga(payment, successfulPayment.id);
        return { bookingState: BookingState.CONFIRM, paymentState: PaymentState.CAPTURED };
      }
    }
  } catch (e) {
    console.error("Razorpay verification error:", e);
  }

  return { bookingState: booking.state, paymentState: payment.state };
};
