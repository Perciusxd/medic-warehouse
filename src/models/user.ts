import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  username: string; // Ensure username is unique
  address: string; // Optional: Add address if needed
  director: string; // Optional: Add director if needed
  contact: string; // Optional: Add contact if needed
  documentNumber: string; // Document number for profile
  name: string;
  createdAt: Date;
  updatedAt: Date;
  role: 'admin' | 'user'; // Optional: Add role if needed
  hospitalName: string; // Optional: Add hospital association if needed,
  position: string; // Optional: Add position if needed
  notifyEmail: string; // Notification email
  // role: 'admin' | 'user'; // Optional: Add role if needed
  // hospitalName?: string; // Optional: Add hospital association if needed
  // Songkla Hospital
// Hatyai Hospital
// Na Mom Hospital
// Jana Hospital
}

const UserSchema: Schema<IUser> = new Schema<IUser>({
  email: { type: String, required: true },
  username: { type: String, required: true, unique: true }, // Ensure username is unique
  address: { type: String, default: '' }, // Optional: Add address if needed
  director: { type: String, default: '' }, // Optional: Add director if needed
  contact: { type: String, default: '' }, // Optional: Add contact if needed
  documentNumber: { type: String, default: '' }, // Document number for profile
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  role: { type: String, enum: ['admin', 'user']}, // Optional: Add role if needed
  position: { type: String, default: '' }, // Optional: Add position if needed
  hospitalName: { type: String, default: '' }, // Optional: Add hospital association if needed
  notifyEmail: { type: String, default: '' }, // Optional: Add notification email if needed
});

export const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 