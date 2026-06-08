import mongoose, { Schema, Model } from "mongoose";
import { IUserDocument } from "./user.interface";
import bcrypt from "bcrypt";

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String, default: "" },
    expiresAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export const UserModel: Model<IUserDocument> = mongoose.model<IUserDocument>("User", userSchema);
