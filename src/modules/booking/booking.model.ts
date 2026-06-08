import mongoose, { Schema } from "mongoose";
import { IBooking, IBookingStatics } from "./booking.interface";
import { BookingState } from "./booking.enum";

const BookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    showId: {
      type: Schema.Types.ObjectId,
      ref: "Show",
      required: true,
      index: true
    },

    seatIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Seat",
        required: true
      }
    ],

    state: {
      type: String,
      enum: Object.values(BookingState),
      default: BookingState.INIT,
      index: true
    },

    idempotencyKey: {
      type: String,
      index: true
    },

    paymentId: {
      type: String,
      index: true
    },

    amount: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);
BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ showId: 1 });
BookingSchema.index({ idempotencyKey: 1 });
BookingSchema.index({ state: 1 });
export const Booking = mongoose.model<IBooking, IBookingStatics>(
  "Booking",
  BookingSchema
);
