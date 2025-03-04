"use client";

import Link from "next/link";
import { FaSignOutAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/signout");
    router.push("/auth/signin");
  };

  return (
    <nav className="h-16 flex items-center justify-between px-6 bg-gray-900 shadow-lg">
      <h1 className="text-lg font-bold text-white">Fi Dashboard</h1>
      
      <button onClick={handleLogout} className="flex items-center text-gray-300 hover:text-white">
        <FaSignOutAlt className="mr-2" /> Logout
      </button>
    </nav>
  );
}