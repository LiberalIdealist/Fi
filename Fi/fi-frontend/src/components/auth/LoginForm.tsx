"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/authService';
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from '../../services/firebase'; // Import from centralized config

// Firebase config is already handled in the centralized firebase.ts file

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
      await authService.login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      console.log('Starting Google sign-in process...');
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful, getting ID token...');
      const idToken = await result.user.getIdToken();
      
      console.log('ID token obtained, sending to backend...');
      await authService.googleLogin(idToken);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500 text-white rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 mb-4"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
        
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-400">or</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>
        
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center bg-white text-gray-800 py-2 px-4 rounded focus:outline-none hover:bg-gray-100"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>
      </form>
    </div>
  );
}