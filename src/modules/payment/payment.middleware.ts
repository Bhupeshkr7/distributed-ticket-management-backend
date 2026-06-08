import { Response, NextFunction } from "express";
import crypto from "crypto";
import { env } from "../../config/env.config";
import { CustomError } from "../../shared/error/custom.error";
import { getIdempotency, setIdempotency } from "../../utils/redis/redis.cache";
import { CacheKeys, CacheTTL } from "../../utils/redis/redis.keys";
import { AuthenticatedRequest } from "../user/user.interface";

export const verifyRazorpayWebhook = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const signature = req.headers["x-razorpay-signature"] as string;

  if (!signature) {
    return next(new CustomError("Missing webhook signature", 400));
  }

  if (!Buffer.isBuffer(req.body)) {
    return next(new CustomError("Invalid webhook payload", 400));
  }

  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.body)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return next(new CustomError("Invalid webhook signature", 400));
  }

  next();
};

export const paymentIdempotency = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const key = crypto
      .createHash("sha256")
      .update(`${req.user.id}:${req.body.bookingId}`)
      .digest("hex");

    const cached = await getIdempotency<object>(CacheKeys.idempotency(key));

    if (cached) {
      res.status(200).json({ success: true, data: cached });
      return;
    }

    res.locals.idempotencyKey = key;

    const originalJson = res.json.bind(res);

    res.json = (data: any) => {
      const result = originalJson(data);

      if (res.statusCode === 201 && data?.success) {
        setIdempotency(CacheKeys.idempotency(key), data.data, CacheTTL.IDEMPOTENCY).catch(
          (err) => console.error("Idempotency cache write failed", err)
        );
      }

      return result;
    };

    next();
  } catch (err) {
    next(err);
  }
};
