"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoadingState from "@/components/LoadingState";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <LoadingState />;
  }

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="glass-panel p-8">
        <div className="flex items-center space-x-4">
          {session.user.image && (
            <div className="relative w-16 h-16 rounded-full overflow-hidden">
              <Image
                src={session.user.image}
                alt={session.user.name || "Profile picture"}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{session.user.name}</h1>
            <p className="text-gray-400">{session.user.email}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-8">
        <h2 className="gradient-heading mb-4">Quick Actions</h2>
        <button
          onClick={() => router.push("/dashboard")}
          className="btn-primary w-full"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}