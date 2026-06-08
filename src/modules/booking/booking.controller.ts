
import { Request, Response, NextFunction } from "express";
import * as service from "./booking.service";
import { AuthenticatedRequest } from "../user/user.interface";

export const createBookingController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await service.createBooking(req.user.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getAllBookingController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getAllBooking();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getBookingByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getBookingById(req.params.id as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const updateBookingController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.updateBooking(req.params.id as string, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const deleteBookingController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.deleteBooking(req.params.id as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getMyBookingsController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await service.getAllBooking({ userId: req.user.id });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
