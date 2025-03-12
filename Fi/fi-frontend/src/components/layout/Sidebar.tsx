import Link from "next/link";

export const Sidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white p-6 space-y-4">
      <h2 className="text-xl font-bold mb-6">Fi</h2>
      <ul>
        <li>
          <Link href="/dashboard" className="block p-2 rounded-md hover:bg-gray-800 hover:text-blue-400 transition-colors">
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/profile" className="block p-2 rounded-md hover:bg-gray-800 hover:text-blue-400 transition-colors">
            Profile
          </Link>
        </li>
      </ul>
    </aside>
  );
};