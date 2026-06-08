import { z } from "zod";

export const createVenueDTO = z.object({
  name: z.string().min(1, "Name is required"),
  city: z.string().min(1, "City is required"),
  totalSeats: z.number().min(1, "Total seats must be at least 1"),
});

export const updateVenueDTO = createVenueDTO.partial();

export const venueQueryDTO = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

export type CreateVenueDTO = z.infer<typeof createVenueDTO>;
export type UpdateVenueDTO = z.infer<typeof updateVenueDTO>;
export type VenueQueryDTO = z.infer<typeof venueQueryDTO>;
