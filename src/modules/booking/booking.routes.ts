
import { Router } from "express";
import {
  createBookingController,
  getAllBookingController,
  getBookingByIdController,
  updateBookingController,
  deleteBookingController,
  getMyBookingsController
} from "./booking.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";

export const bookingRouter = Router();

bookingRouter.post("/", authenticate, createBookingController);
bookingRouter.get("/my", authenticate, getMyBookingsController);
bookingRouter.get("/", getAllBookingController);
bookingRouter.get("/:id", getBookingByIdController);
bookingRouter.patch("/:id", updateBookingController);
bookingRouter.delete("/:id", deleteBookingController);
