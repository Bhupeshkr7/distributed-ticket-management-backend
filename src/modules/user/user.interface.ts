import mongoose, { Document } from "mongoose";

import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: mongoose.Types.ObjectId;
}
