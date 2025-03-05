import { auth } from "@/config/firebase";

async function testAuth() {
  const users = await auth.listUsers(5);
  console.log(users.users);
}

testAuth().catch(console.error);