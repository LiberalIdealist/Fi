"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaUser, FaChartPie } from "react-icons/fa";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: <FaHome /> },
  { name: "Profile", href: "/dashboard/profile", icon: <FaUser /> },
  { name: "Portfolio", href: "/dashboard/portfolio", icon: <FaChartPie /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full bg-gray-800 p-4">
      <div className="flex items-center justify-center py-4">
        <img src="/logo.png" alt="Fi Logo" className="h-12" />
      </div>

      <nav className="mt-4 space-y-2">
        {menuItems.map((item) => (
          <Link key={item.name} href={item.href} className={`flex items-center p-3 rounded-md text-gray-300 transition ${
            pathname === item.href ? "bg-gray-700 text-white" : "hover:bg-gray-700"
          }`}>
            <span className="mr-3">{item.icon}</span> {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}