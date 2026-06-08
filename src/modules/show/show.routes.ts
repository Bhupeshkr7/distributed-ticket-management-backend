import { Router } from "express";
import {
  createShowController,
  deleteShowController,
  getAllShowsController,
  getShowByIdController,
  getShowsByCityController,
  updateShowController,
} from "./show.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";

export const showRouter = Router();

showRouter.get("/", getAllShowsController);
showRouter.get("/city/:city", getShowsByCityController);
showRouter.get("/:id", getShowByIdController);
showRouter.post("/", authenticate, createShowController);
showRouter.put("/:id", authenticate, updateShowController);
showRouter.delete("/:id", authenticate, deleteShowController);
