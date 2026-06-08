import { Document, Types } from "mongoose";
import { PaymentState } from "./payment.enum";

export interface IPayment extends Document {
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  state: PaymentState;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
