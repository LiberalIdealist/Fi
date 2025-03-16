"use client";

import  LoginForm from '../../../components/auth/LoginForm';
import Image from "next/image";

export default function SignIn() {
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
        
        <LoginForm />
      </div>
    </div>
  );
}