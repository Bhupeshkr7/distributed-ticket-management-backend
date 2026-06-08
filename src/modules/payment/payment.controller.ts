import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../user/user.interface";
import { initiatePaymentDTO } from "./payment.dto";
import * as service from "./payment.service";

export const initiatePaymentController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const body = initiatePaymentDTO.parse(req.body);
    const data = await service.initiatePayment(req.user.id, body.bookingId as string);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const webhookController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await service.handleWebhook(req.body as Buffer);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const getPaymentByBookingController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await service.getPaymentByBookingId(req.params.bookingId as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getMyPaymentsController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await service.getPaymentsByUserId(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const verifyPaymentController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await service.verifyAndConfirmPayment(req.user.id, req.params.bookingId as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
