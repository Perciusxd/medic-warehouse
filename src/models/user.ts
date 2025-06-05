import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  role: 'admin' | 'user'; // Optional: Add role if needed
  hospitalName: string; // Optional: Add hospital association if needed
  // role: 'admin' | 'user'; // Optional: Add role if needed
  // hospitalName?: string; // Optional: Add hospital association if needed
  // Songkla Hospital
// Hatyai Hospital
// Na Mom Hospital
// Jana Hospital
}

const UserSchema: Schema<IUser> = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  role: { type: String, enum: ['admin', 'user']}, // Optional: Add role if needed
  hospitalName: { type: String, default: '' }, // Optional: Add hospital association if needed
});

export const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 