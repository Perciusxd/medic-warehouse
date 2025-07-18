"use client";

import { useRouter } from 'next/navigation';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role?: 'admin' | 'user'; // Optional: Add role if needed
  hospitalName?: string; // Optional: Add hospital association if needed
  contact?: string; // Optional: Add contact if needed
  address?: string; // Optional: Add address if needed
  director?: string; // Optional: Add director if needed
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  checkAuth: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Define checkAuth outside useEffect so it can be passed to context
  const checkAuth = async () => {
    try {
      setError(null);
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
        if (res.status === 401) {
          setError('Session expired. Please login again.');
        }
      }
    } catch (error) {
      setUser(null);
      setError('Failed to check authentication status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // เรียก /api/auth/me แค่ครั้งเดียวตอน mount
    checkAuth();
  }, []);

  const logout = async () => {
      try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        setUser(null);
        router.replace('/login'); // ✅ ชัวร์ว่าทำหลัง token ถูกลบ
      } else {
        setError('Logout failed');
      }
    } catch (error) {
      setError('Failed to logout');
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthContext.Provider value={{ user, loading, error, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}