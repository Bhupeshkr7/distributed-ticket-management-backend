import { Document } from "mongoose";

export interface IVenue extends Document {
  name: string;
  city: string;
  totalSeats: number;
}
