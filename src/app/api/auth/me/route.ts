import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { verifyAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await verifyAuth(request);
    if (!authUser || !authUser.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database and fetch updated user data
    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne(
      { _id: new ObjectId(authUser.userId) },
      {
        projection: {
          password: 0, // Exclude password from response
        },
      }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      plan: user.plan || "free",
      freeTrialCount: user.freeTrialCount || 0,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
