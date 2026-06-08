import expres from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { globalErrorMiddleware } from "./middlewares/global.error.middleware";
import { env } from "./config/env.config";
import { userRouter } from "./modules/user/user.routes";
import { venueRouter } from "./modules/venue/venue.routes";
import { showRouter } from "./modules/show/show.routes";
import { seatRouter } from "./modules/seat/seat.routes";
import { bookingRouter } from "./modules/booking/booking.routes";
import { paymentRouter } from "./modules/payment/payment.routes";
const app = expres();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        origin === "http://localhost:5173" ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);
app.use(helmet());
app.use(cookieParser(env.COOKIE_SECRET_KEY));

app.use(morgan("dev"));
app.use((req, res, next) => {
  if (req.path === "/api/payment/webhook") return next();
  expres.json()(req, res, next);
});

import mongoose from "mongoose";
import redisClient from "./config/redis.config";

app.get("/health", async (req, res) => {
  try {
    const isRedisConnected = redisClient.status === "ready";
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isRedisConnected && isMongoConnected) {
      res.status(200).json({ 
        status: "ok", 
        services: { redis: "up", mongo: "up" },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: "error",
        services: {
          redis: isRedisConnected ? "up" : "down",
          mongo: isMongoConnected ? "up" : "down"
        },
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: "Health check failed" });
  }
});
app.use("/api/users", userRouter);
app.use("/api/venues", venueRouter);
app.use("/api/shows", showRouter);
app.use("/api/seats", seatRouter);
app.use("/api/booking", bookingRouter);
app.use('/api/payment', paymentRouter);
app.use(globalErrorMiddleware);

export default app;

