import { model, models, Schema, Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  username: string;
  photo: string;
  firstName: string;
  lastName: string;
  creditBalance: number;
}

const UserSchema = new Schema({
  clerkId: { type: String, require: true, unique: true },
  email: { type: String, require: true, unique: true },
  username: { type: String, require: true, unique: true },
  photo: { type: String, require: true },
  firstName: { type: String },
  lastName: { type: String },
  creditBalance: { type: Number, default: 0 },
});

const User = models?.User || model("User", UserSchema);

export default User;
