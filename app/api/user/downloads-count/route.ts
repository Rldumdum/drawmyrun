import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust path to your database client

export async function GET() {
  try {
    // Count total downloads across all users
    const count = await prisma.download.count();

    return NextResponse.json(
      {
        success: true,
        data: {
          count: count,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching downloads count:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to fetch downloads count",
      },
      { status: 500 }
    );
  }
}
