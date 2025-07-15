import { NextApiRequest, NextApiResponse } from 'next';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role?: string;
  hospitalName?: string; // Optional: Add hospital association if needed
  contact?: string; // Optional: Add contact if needed
  address?: string; // Optional: Add address if needed
  director?: string; // Optional: Add director if needed
}

export async function verifyAuth(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<any> | void
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = await verifyAuth(req, res);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Add user to request object
    (req as any).user = user;

    return handler(req, res);
  };
}