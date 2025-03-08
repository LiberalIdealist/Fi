import Link from "next/link";

export const Sidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white p-4">
      <h2 className="text-xl font-bold mb-6">Fi</h2>
      <ul>
        <li>
          <Link href="/dashboard" className="block p-2 hover:bg-gray-800">
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/profile" className="block p-2 hover:bg-gray-800">
            Profile
          </Link>
        </li>
      </ul>
    </aside>
  );
};