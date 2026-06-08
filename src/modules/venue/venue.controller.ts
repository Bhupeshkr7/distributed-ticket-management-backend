import { Request, Response, NextFunction } from "express";
import * as service from "./venue.service";

export const createVenueController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const venue = await service.createVenue(req.body);
    res.status(201).json({ message: "Venue created successfully", venue });
  } catch (error) {
    next(error);
  }
};

export const getAllVenuesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getAllVenues(req.query as any);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getVenueByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const venue = await service.getVenueById(id);
    res.status(200).json({ venue });
  } catch (error) {
    next(error);
  }
};

export const updateVenueController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const venue = await service.updateVenue(id, req.body);
    res.status(200).json({ message: "Venue updated successfully", venue });
  } catch (error) {
    next(error);
  }
};

export const deleteVenueController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await service.deleteVenue(id);
    res.status(200).json({ message: "Venue deleted successfully" });
  } catch (error) {
    next(error);
  }
};
