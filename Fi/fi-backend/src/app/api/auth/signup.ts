import { NextResponse } from "next/server";
import { auth } from "@/config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    return NextResponse.json({ 
      message: "Signup successful", 
      user: { uid: user.uid, email: user.email } 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}