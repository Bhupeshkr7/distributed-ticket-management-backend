import { z } from "zod";

export const createShowDTO = z.object({
  venueId: z.string().min(1, "Venue is required"),
  movieName: z.string().min(1, "Movie name is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  totalSeats: z.number().min(1, "Total seats must be at least 1"),
});

export const updateShowDTO = createShowDTO.partial();

export const showQueryDTO = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  date: z.string().optional(),
  venueId: z.string().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

export type CreateShowDTO = z.infer<typeof createShowDTO>;
export type UpdateShowDTO = z.infer<typeof updateShowDTO>;
export type ShowQueryDTO = z.infer<typeof showQueryDTO>;
