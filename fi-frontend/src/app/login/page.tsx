"use client";
import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 shadow-md rounded-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to Fi</h1>
        <button
          onClick={() => signIn("google")}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
