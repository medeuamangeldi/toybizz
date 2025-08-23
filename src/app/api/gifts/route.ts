import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const giftsCollection = db.collection("gifts");

    const gifts = await giftsCollection
      .find({ eventId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ gifts });
  } catch (error) {
    console.error("Error fetching gifts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const {
      eventId,
      name,
      description,
      price,
      currency,
      link,
      image,
      category,
      priority,
    } = body;

    if (!eventId || !name) {
      return NextResponse.json(
        { error: "Event ID and name are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const giftsCollection = db.collection("gifts");

    const giftDoc = {
      eventId,
      name,
      description,
      price,
      currency: currency || "₸",
      link,
      image,
      category: category || "Другое",
      priority: priority || "medium",
      isReserved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await giftsCollection.insertOne(giftDoc);
    const gift = { ...giftDoc, _id: result.insertedId };

    return NextResponse.json({ gift });
  } catch (error) {
    console.error("Error creating gift:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { giftId, ...updateData } = body;

    if (!giftId) {
      return NextResponse.json(
        { error: "Gift ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const giftsCollection = db.collection("gifts");

    const gift = await giftsCollection.findOneAndUpdate(
      { _id: new ObjectId(giftId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!gift) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    return NextResponse.json({ gift });
  } catch (error) {
    console.error("Error updating gift:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

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

    const gift = await giftsCollection.findOneAndDelete({
      _id: new ObjectId(giftId),
    });

    if (!gift) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Gift deleted successfully" });
  } catch (error) {
    console.error("Error deleting gift:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
