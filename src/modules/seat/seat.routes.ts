import { Router } from "express";
import { createSeatsController, getShowSeatsController } from "./seat.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";

export const seatRouter = Router();

seatRouter.post("/", authenticate, createSeatsController);
seatRouter.get("/:showId", authenticate, getShowSeatsController);
