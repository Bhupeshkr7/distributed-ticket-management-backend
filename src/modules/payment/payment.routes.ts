import { Router, raw } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { verifyRazorpayWebhook, paymentIdempotency } from "./payment.middleware";
import {
  initiatePaymentController,
  webhookController,
  getPaymentByBookingController,
  getMyPaymentsController,
  verifyPaymentController,
} from "./payment.controller";

export const paymentRouter = Router();

paymentRouter.post(
  "/webhook",
  raw({ type: "application/json" }),
  verifyRazorpayWebhook,
  webhookController
);

paymentRouter.use(authenticate);

paymentRouter.post(
  "/initiate", 
  paymentIdempotency,
  initiatePaymentController
);

paymentRouter.get("/booking/:bookingId", getPaymentByBookingController);
paymentRouter.get("/my", getMyPaymentsController);
paymentRouter.post("/verify/:bookingId", verifyPaymentController);
