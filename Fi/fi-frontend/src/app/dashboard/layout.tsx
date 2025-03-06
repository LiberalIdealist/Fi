import { Sidebar } from "../../components/Sidebar";
import { Navbar } from "../../components/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar Navigation */}
      <Sidebar />

      <div className="flex flex-col flex-1">
        {/* Top Navbar */}
        <Navbar />
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
          {children}
        </main>
      </div>
    </div>
  );
}