import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '../../../lib/auth';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/models/user';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string; // Optional: Add role if needed
  hospitalName?: string; // Optional: Add hospital association if needed
  contact?: string; // Optional: Add contact if needed
  address?: string; // Optional: Add address if needed
  director?: string; // Optional: Add director if needed
  username?: string; // Ensure username is included
  position?: string; // Optional: Add position if needed
  documentNumber?: string; // Document number for profile
  notifyEmail?: string; // Notification email
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const auth = await verifyAuth(req, res);

  if (!auth) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  const user = await UserModel.findOne({ username: auth.username }).lean();

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const userData: User = {
    id: user.id,
    email: user.email,
    name: user.name || user.email.split('@')[0], // Fallback to email username if name not provided
    role: user.role || 'user', // Default to 'user' if role not provided
    hospitalName: user.hospitalName || '', // Default to empty string if hospitalName not provided
    contact: user.contact || '', // Default to empty string if contact not provided
    address: user.address || '', // Default to empty string if address not provided
    director: user.director || '', // Default to empty string if director not provided
    username: user.username || '', // Ensure username is included
    position: user.position || '', // Default to empty string if position not provided
    documentNumber: user.documentNumber || '', // Default to empty string if documentNumber not provided
    notifyEmail: user.notifyEmail || '', // Default to empty string if notifyEmail not provided
  };

  return res.status(200).json(userData);
} 