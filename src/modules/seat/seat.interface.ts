import { Document, Types } from "mongoose";
import { SeatStatus } from "./seat.enum";

export interface ISeat extends Document {
  showId: Types.ObjectId;
  row: string;
  col: number;
  status: SeatStatus;
  version: number;
  lockedBy: Types.ObjectId | null;
  lockedAt: Date | null;
}
