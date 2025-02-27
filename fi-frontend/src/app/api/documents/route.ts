import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth.config";

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documents = await prisma.financialDocument.findMany({
      where: { userEmail: session.user.email },
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        createdAt: true,  // Using standard Prisma timestamp field
        analyzedAt: true,
      },
    });

    return NextResponse.json({ documents });

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching documents:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}