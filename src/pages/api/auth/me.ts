import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '../../../lib/auth';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string; // Optional: Add role if needed
  hospitalName?: string; // Optional: Add hospital association if needed
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = await verifyAuth(req, res);

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userData: User = {
    id: user.id,
    email: user.email,
    name: user.name || user.email.split('@')[0], // Fallback to email username if name not provided
    role: user.role || 'user', // Default to 'user' if role not provided
    hospitalName: user.hospitalName || '', // Default to empty string if hospitalName not provided
  };

  return res.status(200).json(userData);
} 