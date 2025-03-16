"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '../../services/firebase'; // Import from centralized config
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
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
      setError(err.message || 'Invalid email or password');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Starting Google sign-in process...");
      
      // Create Google provider
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Sign in with popup
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign-in successful");
      
      // Get token
      const idToken = await result.user.getIdToken(true);
      console.log("ID token obtained successfully");
      
      // Hard-coded API URL as fallback in case env var isn't set
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      console.log("Using API URL:", apiUrl);
      
      try {
        // Send token to backend
        const response = await fetch(`${apiUrl}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
        
        // Read response as text first for debugging
        const responseText = await response.text();
        let data;
        
        // Try to parse as JSON
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Invalid JSON response:", responseText);
          throw new Error("Server returned invalid response format");
        }
        
        if (!response.ok) {
          throw new Error(data?.error || `Authentication failed (${response.status})`);
        }
        
        // Handle successful login - use BOTH the token from Firebase Auth
        // and any user data from our backend
        localStorage.setItem("fi_auth_token", idToken);
        
        // If the backend didn't return a user object, create a basic one
        const userData = data.user || {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || null
        };
        
        localStorage.setItem("user_data", JSON.stringify(userData));
        
        // Redirect to dashboard
        router.push('/dashboard');
        
      } catch (backendError) {
        console.error("Backend authentication error:", backendError);
        
        // Fallback: Just use Firebase auth data if backend fails
        console.log("Using fallback authentication with Firebase only");
        
        localStorage.setItem("fi_auth_token", idToken);
        localStorage.setItem("user_data", JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || null
        }));
        
        // Still redirect to dashboard
        router.push('/dashboard');
      }
      
    } catch (firebaseError) {
      console.error("Firebase Google login error:", firebaseError);
      
      // More descriptive error messages
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed before completing the sign-in.');
      } else if (firebaseError.code?.includes('auth/')) {
        setError(`Authentication error: ${firebaseError.message}`);
      } else {
        setError(firebaseError.message || "Google login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-4 mb-4 text-sm text-red-400 bg-red-900 bg-opacity-20 rounded-lg">
          {error}
        </div>
      )}
      
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
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign In"}
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
        disabled={isLoading}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Sign in with Google
      </button>
      
      <div className="text-sm text-center text-gray-400">
        Don't have an account? <Link href="/auth/signup" className="text-blue-400 hover:underline">Create account</Link>
      </div>
    </form>
  );
}