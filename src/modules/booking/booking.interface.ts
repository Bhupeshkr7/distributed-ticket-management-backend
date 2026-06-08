import { Types, Document, Model } from "mongoose";
import { BookingState } from "./booking.enum";

export interface IBooking extends Document {
  userId: Types.ObjectId;
  showId: Types.ObjectId;
  seatIds: Types.ObjectId[];

  state: BookingState;

  idempotencyKey?: string;

  paymentId?: string;
  amount: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface IBookingStatics extends Model<IBooking> {
  createBooking(data: Partial<IBooking>): Promise<IBooking>;
  findByBookingId(id: string): Promise<IBooking | null>;
}
