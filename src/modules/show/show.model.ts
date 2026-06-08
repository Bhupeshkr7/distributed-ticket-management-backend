import { Schema, model } from "mongoose";
import { IShow } from "./show.interface";

const showSchema = new Schema<IShow>(
  {
    venueId: { type: Schema.Types.ObjectId, ref: "Venue", required: true },
    movieName: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    totalSeats: { type: Number, required: true, min: 1 },
    availableSeats: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

showSchema.index({ movieName: 1 });
showSchema.index({ date: 1 });
showSchema.index({ venueId: 1 });

export const ShowModel = model<IShow>("Show", showSchema);
