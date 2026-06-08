import { Request, Response, NextFunction } from "express";
import * as service from "./show.service";

const getParamValue = (param: string | string[] | undefined, name: string): string => {
  const value = Array.isArray(param) ? param[0] : param;
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
};

export const createShowController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const show = await service.createShow(req.body);
    res.status(201).json({ message: "Show created successfully", show });
  } catch (error) {
    next(error);
  }
};

export const getAllShowsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getAllShows(req.query as any);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getShowByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getParamValue(req.params.id, "id");
    const show = await service.getShowById(id);
    res.status(200).json({ show });
  } catch (error) {
    next(error);
  }
};

export const getShowsByCityController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const city = getParamValue(req.params.city, "city");
    const result = await service.getShowsByCity(city, req.query as any);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateShowController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getParamValue(req.params.id, "id");
    const show = await service.updateShow(id, req.body);
    res.status(200).json({ message: "Show updated successfully", show });
  } catch (error) {
    next(error);
  }
};

export const deleteShowController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getParamValue(req.params.id, "id");
    await service.deleteShow(id);
    res.status(200).json({ message: "Show deleted successfully" });
  } catch (error) {
    next(error);
  }
};
