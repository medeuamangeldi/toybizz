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

    // Return demo gifts for demo event
    if (eventId === "demo-wedding-123") {
      const demoGifts = [
        {
          _id: "demo-gift-1",
          eventId: "demo-wedding-123",
          name: "Кофемашина Delonghi",
          description:
            "Автоматическая кофемашина с капучинатором для создания идеального кофе каждое утро",
          price: 85000,
          currency: "₸",
          link: "https://kaspi.kz/shop/p/delonghi-dinamica-ecam350-15-b-chernyj-13728409/",
          image:
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
          category: "Бытовая техника",
          priority: "high" as const,
          isReserved: false,
          createdAt: new Date("2024-08-01"),
          updatedAt: new Date("2024-08-01"),
        },
        {
          _id: "demo-gift-2",
          eventId: "demo-wedding-123",
          name: "Набор постельного белья",
          description:
            "Элитное постельное белье из сатина, 1.5 спальный комплект в нежных тонах",
          price: 25000,
          currency: "₸",
          link: "https://kaspi.kz/shop/p/arya-home-satin-lux/",
          image:
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80",
          category: "Дом и уют",
          priority: "medium" as const,
          isReserved: true,
          reservedBy: {
            name: "Мария Сидорова",
            email: "maria.sidorova@email.com",
            reservedAt: new Date("2024-08-15"),
          },
          createdAt: new Date("2024-07-28"),
          updatedAt: new Date("2024-08-15"),
        },
        {
          _id: "demo-gift-3",
          eventId: "demo-wedding-123",
          name: "Сервиз для ужина на 6 персон",
          description:
            "Элегантный фарфоровый сервиз с золотой каймой для особых случаев",
          price: 45000,
          currency: "₸",
          image:
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80",
          category: "Посуда",
          priority: "high" as const,
          isReserved: false,
          createdAt: new Date("2024-07-30"),
          updatedAt: new Date("2024-07-30"),
        },
        {
          _id: "demo-gift-4",
          eventId: "demo-wedding-123",
          name: "Набор полотенец",
          description:
            "Мягкие банные полотенца из бамбукового волокна, 4 штуки разных размеров",
          price: 15000,
          currency: "₸",
          image:
            "https://images.unsplash.com/photo-1631889992492-5b0f6b3e5e8d?w=400&q=80",
          category: "Дом и уют",
          priority: "medium" as const,
          isReserved: false,
          createdAt: new Date("2024-08-02"),
          updatedAt: new Date("2024-08-02"),
        },
        {
          _id: "demo-gift-5",
          eventId: "demo-wedding-123",
          name: "Мультиварка Redmond",
          description:
            "Умная мультиварка с 45 программами приготовления и управлением через приложение",
          price: 35000,
          currency: "₸",
          link: "https://kaspi.kz/shop/p/redmond-rmc-m800s-chernyj/",
          image:
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
          category: "Бытовая техника",
          priority: "medium" as const,
          isReserved: false,
          createdAt: new Date("2024-08-03"),
          updatedAt: new Date("2024-08-03"),
        },
        {
          _id: "demo-gift-6",
          eventId: "demo-wedding-123",
          name: "Романтический ужин на двоих",
          description:
            "Сертификат на романтический ужин в ресторане с видом на город",
          price: 20000,
          currency: "₸",
          image:
            "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&q=80",
          category: "Впечатления",
          priority: "low" as const,
          isReserved: true,
          reservedBy: {
            name: "Александр Петров",
            email: "alex.petrov@email.com",
            phone: "+7 777 987 65 43",
            reservedAt: new Date("2024-08-10"),
          },
          createdAt: new Date("2024-08-05"),
          updatedAt: new Date("2024-08-10"),
        },
      ];

      return NextResponse.json({ gifts: demoGifts });
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
