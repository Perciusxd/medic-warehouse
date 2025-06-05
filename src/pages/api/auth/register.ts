import { NextApiRequest, NextApiResponse } from 'next';
import { hash } from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/models/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Log the request body for debugging
        console.log('Request body:', req.body);

        const { email, password, name, role, hospitalName } = req.body;

        // Validate each field individually with specific error messages
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        await dbConnect();
        
        // Check for existing user
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Use email username as default name if not provided
        const displayName = name || email.split('@')[0];

        // Hash password and create user
        const hashedPassword = await hash(password, 10);
        const user = await UserModel.create({
            email,
            password: hashedPassword,
            role,
            hospitalName,
            name: displayName,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return res.status(201).json({ 
            message: 'User registered successfully', 
            userId: user._id,
            user: {
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ 
            message: 'Internal server error', 
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
