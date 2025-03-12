"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Initialize Firebase (move this to a separate config file for production)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("fi_auth_token", data.token);
      localStorage.setItem("user_data", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Add debug logging
      console.log("Starting Google sign-in process...");
      
      // 1. Sign in with Google using Firebase client SDK
      const provider = new GoogleAuthProvider();
      // Add scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign-in successful");
      
      // 2. Get the ID token with force refresh to ensure it's new
      const idToken = await result.user.getIdToken(true);
      console.log("ID token obtained, length:", idToken.length);
      
      // Debug info about the token
      const tokenParts = idToken.split('.');
      if (tokenParts.length === 3) {
        console.log("Valid JWT structure (3 parts)");
        
        try {
          // Look at token payload for debugging (NOT for production code)
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log("Token issuer:", payload.iss);
          console.log("Token audience:", payload.aud);
          console.log("Token subject:", payload.sub);
          
          // Check if the audience matches your Firebase project
          const expectedAudience = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
          if (payload.aud !== expectedAudience) {
            console.warn(`Token audience (${payload.aud}) doesn't match expected project (${expectedAudience})`);
          }
        } catch (e) {
          console.error("Error parsing token payload:", e);
        }
      } else {
        console.warn("Token doesn't have standard JWT structure");
      }
      
      // 3. Send ID token to your backend
      console.log("Sending token to backend...", process.env.NEXT_PUBLIC_API_URL);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });
      
      console.log("Backend response status:", response.status);
      
      // Parse the response
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }
      
      if (!response.ok) {
        throw new Error(data?.error || `Server responded with status ${response.status}`);
      }
      
      // 4. Store authentication data
      localStorage.setItem("fi_auth_token", idToken);
      localStorage.setItem("user_data", JSON.stringify(data.user));
      
      // 5. Navigate to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gray-900 text-white">
      {/* Animated background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 backdrop-blur-lg bg-gray-800 bg-opacity-50 rounded-xl shadow-2xl">
        <div className="mb-8 text-center">
          <Image src="/logo.png" alt="Fi Logo" width={60} height={60} className="mx-auto mb-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 text-transparent bg-clip-text mb-2">Sign In to Fi</h1>
          <p className="text-gray-300">Access your financial dashboard</p>
        </div>
        
        {error && (
          <div className="p-4 mb-4 text-sm text-red-400 bg-red-900 bg-opacity-20 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">Email</label>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember" type="checkbox" className="w-4 h-4 bg-gray-700 border-gray-600 rounded" />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-300">Remember me</label>
            </div>
            <a href="#" className="text-sm text-blue-400 hover:underline">Forgot password?</a>
          </div>
          
          <button
            type="submit"
            className="w-full py-3 px-4 font-medium rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>
          
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 font-medium rounded-lg flex items-center justify-center bg-white text-gray-800 hover:bg-gray-100 transition-all duration-300"
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
          
          <div className="text-sm text-center text-gray-400">
            Don't have an account? <Link href="/signup" className="text-blue-400 hover:underline">Create account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}