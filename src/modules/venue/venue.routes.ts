import { Router } from "express";

import {
  createVenueController,
  deleteVenueController,
  getAllVenuesController,
  getVenueByIdController,
  updateVenueController,
} from "./venue.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";

export const venueRouter = Router();

venueRouter.get("/", getAllVenuesController);
venueRouter.get("/:id", getVenueByIdController);
venueRouter.post("/", authenticate, createVenueController);
venueRouter.put("/:id", authenticate, updateVenueController);
venueRouter.delete("/:id", authenticate, deleteVenueController);
