import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white h-screen p-6">
      <h1 className="text-xl font-bold">Fi</h1>
      <nav>
        <ul className="mt-4 space-y-2">
          <li>
            <Link href="/" className="block py-2 px-4 hover:bg-gray-700">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/insights" className="block py-2 px-4 hover:bg-gray-700">
              AI Insights
            </Link>
          </li>
          <li>
            <Link href="/upload" className="block py-2 px-4 hover:bg-gray-700">
              Data Upload
            </Link>
          </li>
          <li>
            <Link href="/chat" className="block py-2 px-4 hover:bg-gray-700">
              AI Chatbot
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
