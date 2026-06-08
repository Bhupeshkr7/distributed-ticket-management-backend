import { Schema, model } from "mongoose";
import { ISeat } from "./seat.interface";
import { SeatStatus } from "./seat.enum";

const seatSchema = new Schema<ISeat>(
  {
    showId: { type: Schema.Types.ObjectId, ref: "Show", required: true },
    row: { type: String, required: true },
    col: { type: Number, required: true },
    status: { type: String, enum: Object.values(SeatStatus), default: SeatStatus.AVAILABLE },
    version: { type: Number, default: 0 },
    lockedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    lockedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

seatSchema.index({ showId: 1, row: 1, col: 1 }, { unique: true });
seatSchema.index({ showId: 1, status: 1 });
seatSchema.index({ lockedAt: 1 }, { expireAfterSeconds: 600 });

export const SeatModel = model<ISeat>("Seat", seatSchema);
