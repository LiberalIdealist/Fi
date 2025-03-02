import NextAuth from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Example of handling API response
/*
async function fetchData() {
  try {
    const response = await fetch('/api/endpoint'); // Replace with your API endpoint
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}

fetchData();
*/