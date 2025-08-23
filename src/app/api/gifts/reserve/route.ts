import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { giftId, name, email, phone } = body;

    if (!giftId || !name || !email) {
      return NextResponse.json(
        { error: "Gift ID, name, and email are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const giftsCollection = db.collection("gifts");

    const gift = await giftsCollection.findOne({ _id: new ObjectId(giftId) });
    if (!gift) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    if (gift.isReserved) {
      return NextResponse.json(
        { error: "Gift is already reserved" },
        { status: 400 }
      );
    }

    // Reserve the gift
    const updatedGift = await giftsCollection.findOneAndUpdate(
      { _id: new ObjectId(giftId) },
      {
        $set: {
          isReserved: true,
          reservedBy: {
            name,
            email,
            phone,
            reservedAt: new Date(),
          },
        },
      },
      { returnDocument: "after" }
    );

    return NextResponse.json({
      gift: updatedGift,
      message: "Gift reserved successfully",
    });
  } catch (error) {
    console.error("Error reserving gift:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const giftId = searchParams.get("giftId");

    if (!giftId) {
      return NextResponse.json(
        { error: "Gift ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const giftsCollection = db.collection("gifts");

    // Unreserve the gift
    const updatedGift = await giftsCollection.findOneAndUpdate(
      { _id: new ObjectId(giftId) },
      {
        $set: { isReserved: false },
        $unset: { reservedBy: 1 },
      },
      { returnDocument: "after" }
    );

    if (!updatedGift) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    return NextResponse.json({
      gift: updatedGift,
      message: "Gift reservation removed successfully",
    });
  } catch (error) {
    console.error("Error removing gift reservation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
