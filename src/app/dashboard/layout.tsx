"use client"
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { useAuth } from "@/components/providers";

interface User {
  id: {
    buffer: {
      [key: number]: number;
    };
  };
  email: string;
  name: string;
}

interface NavDashboardProps {
  children: ReactNode;
}

export default function NavDashboard({
  children
}: NavDashboardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const {  user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div>
      {/* <nav className="flex justify-between p-4 bg-gray-800 text-white">
        <div className="flex space-x-4">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
        </div>
        <div className="relative flex items-center space-x-2">
          <Image
            src="/hospital.png"
            alt="User Image"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          <span className="cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)}>
            {user?.name || 'User'}
          </span>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20">
              <button
                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav> */}
      {children}
    </div>
  );
}
