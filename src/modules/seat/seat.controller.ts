import { NextFunction, Request, Response } from "express";
import * as service from "./seat.service";

export const createSeatsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.createSeats(req.body);
    res.status(201).json({ message: "Seats created successfully", result });
  } catch (error) {
    next(error);
  }
};

export const getShowSeatsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const showId = Array.isArray(req.params.showId) ? req.params.showId.join("/") : req.params.showId;
    const seats = await service.getShowSeats(showId);
    res.status(200).json({ seats });
  } catch (error) {
    next(error);
  }
};
