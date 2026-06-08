
import { z } from "zod";

export const createBookingDTO = z.object({
  showId: z.string(),
  seatIds: z.array(z.string()),
  amount: z.number(),
  idempotencyKey: z.string().optional()
});

export type CreateBookingDTO = z.infer<typeof createBookingDTO>;
