import { NextApiRequest, NextApiResponse } from 'next';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || 'your-super-secret-key-change-this-in-production';

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
}

export async function verifyAuth(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function withAuth(handler: Function) {
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