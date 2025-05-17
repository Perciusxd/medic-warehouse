import { NextApiRequest, NextApiResponse } from 'next';
import { SignJWT } from 'jose';
import { compare } from 'bcryptjs';
import { serialize } from 'cookie';
import dbConnect from '@/lib/mongodb';
import { UserModel } from '@/models/user';

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || 'your-super-secret-key-change-this-in-production';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        await dbConnect();
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isValid = await compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const secret = new TextEncoder().encode(JWT_SECRET);
        const token = await new SignJWT({ 
            id: user._id,
            email: user.email,
            name: user.name
        })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(secret);

        // Set cookie using the cookie package
        res.setHeader(
            'Set-Cookie',
            serialize('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 86400, // 1 day
                path: '/',
            })
        );

        res.status(200).json({ 
            message: 'Login successful',
            redirect: true,
            redirectUrl: '/dashboard'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
