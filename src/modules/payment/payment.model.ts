import mongoose, { Schema } from "mongoose";
import { IPayment } from "./payment.interface";
import { PaymentState } from "./payment.enum";

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      required: true,
      default: "INR",
    },

    state: {
      type: String,
      enum: Object.values(PaymentState),
      default: PaymentState.PENDING,
      index: true,
    },

    failureReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

PaymentSchema.index({ bookingId: 1, state: 1 });
PaymentSchema.index({ userId: 1, createdAt: -1 });

export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
