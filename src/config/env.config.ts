import dotenv from "dotenv";
dotenv.config();

export const env = {
  APP_ENV: process.env.APP_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,

  MONGO_URI:
    "mongodb+srv://bkbhaskar858186_db_user:vy1hMhBgmkJvNhpB@ticket-booking.uofpxed.mongodb.net",

  ACCESS_TOKEN_SECRET:
    process.env.ACCESS_TOKEN_SECRET ||
    "9f3c8e5a7b2d1f6c9a8e4d3b7c1f2a9e6b4c8d1e2f3a5b6c7d8e9f1a2b3c4d5",

  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET ||
    "a7b2d1c9e8f4a6b3c5d7e9f1a2b4c6d8e0f2a3b5c7d9e1f4a6b8c0d2e4f6a8",

  ACCESS_TOKEN_EXPIRES_IN:
    process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m",

  REFRESH_TOKEN_EXPIRES_IN:
    process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d",

  COOKIE_SECRET_KEY:
    process.env.COOKIE_SECRET_KEY ??
    "c9e8f4a6b3d7e9f1a2b4c6d8e0f2a3b5c7d9e1f4a6b8c0d2e4f6a8b7c9d1e2",
  EMAIL_USER: process.env.EMAIL_USER || "powerfulindia850@gmail.com",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "pqyc aidu fqcw sdod",
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "rzp_test_SySwZtWbZUFOHI",
  RAZORPAY_KEY_SECRET:
    process.env.RAZORPAY_KEY_SECRET || "gguHNN59ncsoGxekouZvWdG6",
  RAZORPAY_WEBHOOK_SECRET:
    process.env.RAZORPAY_WEBHOOK_SECRET || "bhupeshkr2912dfsdfnsdfnsdfndsfdsfsd",
};
