import { z } from "zod";

export const createSeatsDTO = z.object({
  showId: z.string().min(1, "Show ID is required"),
  rows: z.number().min(1).max(26),
  cols: z.number().min(1).max(50),
});

export type CreateSeatsDTO = z.infer<typeof createSeatsDTO>;
