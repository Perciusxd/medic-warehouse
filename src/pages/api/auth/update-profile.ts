import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '../../../lib/auth';
import { UserModel } from '../../../models/user';
import dbConnect from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = await verifyAuth(req, res);

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await dbConnect();

    const { directorName, position, documentNumber, contact, notifyEmail } = req.body;

    // Validate required fields
    if (!directorName || !notifyEmail) {
      return res.status(400).json({ message: 'Director name and notification email are required' });
    }

    console.log(directorName, position, documentNumber, contact, notifyEmail);

    // Check if email is already taken by another user
    // const existingUser = await UserModel.findOne({
    //   email
    // });

    // if (existingUser) {
    //   return res.status(400).json({ message: 'Email is already taken' });
    // }

    // Update user
    const updatedUser = await UserModel.findOneAndUpdate(
      { username: user.username },
      {
        director: directorName,
        position: position,
        documentNumber: documentNumber,
        contact: contact,
        notifyEmail: notifyEmail,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Return updated user data (without password)
    const userData = {
      id: (updatedUser._id as Types.ObjectId).toString(),
      email: updatedUser.email,
      name: updatedUser.name,
      director: updatedUser.director,
      contact: updatedUser.contact,
      role: updatedUser.role,
      documentNumber: updatedUser.documentNumber,
      position: updatedUser.position,
      username: updatedUser.username,
      hospitalName: updatedUser.hospitalName,
      address: updatedUser.address,
      notifyEmail: updatedUser.notifyEmail,
    };

    return res.status(200).json(userData);
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}