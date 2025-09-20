import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '../../../lib/auth';
import { UserModel } from '../../../models/user';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = await verifyAuth(req, res);

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Get user from database
    const dbUser = await UserModel.findOne({ username: user.username });

    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await UserModel.findOneAndUpdate(
      { username: user.username },
      {
        password: hashedNewPassword,
        updatedAt: new Date(),
      }
    );

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}