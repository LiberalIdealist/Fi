"use client";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleDashboardRedirect = useCallback(() => {
    if (session?.user) {
      router.push("/dashboard");
    }
  }, [session?.user, router]);

  useEffect(() => {
    handleDashboardRedirect();
  }, [handleDashboardRedirect]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
              Welcome to Fi
            </h1>
            <p className="text-xl text-gray-400">
              Your Personal Financial Advisor
            </p>
          </div>
          
          {session ? (
            <div className="space-y-6 bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-gray-700">
              <div className="flex flex-col items-center space-y-6">
                {session.user?.image && (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-blue-500/50">
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        layout="fill"
                        objectFit="cover"
                        priority
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">
                    Welcome back, {session.user?.name}!
                  </h2>
                  <p className="text-gray-400">{session.user?.email}</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleDashboardRedirect}
                    className="group px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg transition-all duration-200 font-medium hover:shadow-lg hover:shadow-blue-500/25"
                  >
                    Go to Dashboard
                    <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-gray-700">
              <h2 className="text-2xl font-semibold">Get Started</h2>
              <p className="text-gray-400">
                Get Smarter with your Money in just a few clicks!
              </p>
              <button
                onClick={handleGoogleSignIn}
                className="group flex items-center justify-center space-x-2 w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg transition-all duration-200 font-medium hover:shadow-lg hover:shadow-blue-500/25"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
