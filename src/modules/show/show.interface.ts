import { Document, Types } from "mongoose";

export interface IShow extends Document {
  venueId: Types.ObjectId;
  movieName: string;
  date: string;
  time: string;
  totalSeats: number;
  availableSeats: number;
}
