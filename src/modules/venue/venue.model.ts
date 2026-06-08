import { Schema, model } from "mongoose";
import { IVenue } from "./venue.interface";

const venueSchema = new Schema<IVenue>(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    totalSeats: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

venueSchema.index({ city: 1 });
venueSchema.index({ name: "text" });

export const VenueModel = model<IVenue>("Venue", venueSchema);
