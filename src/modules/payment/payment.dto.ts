import { z } from "zod";

export const initiatePaymentDTO = z.object({
  bookingId: z.string(),
});

export type InitiatePaymentDTO = z.infer<typeof initiatePaymentDTO>;

export const webhookPayloadDTO = z.object({
  event: z.string(),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string(),
        order_id: z.string(),
        amount: z.number(),
        currency: z.string(),
        status: z.string(),
        error_description: z.string().nullable().optional(),
      }),
    }),
  }),
});

export type WebhookPayloadDTO = z.infer<typeof webhookPayloadDTO>;
