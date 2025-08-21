import { NextRequest, NextResponse } from "next/server";
import { saveRegistration } from "@/lib/database";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const eventId = formData.get("eventId") as string;
    // Support both old and new field names for backward compatibility
    const fullName = (formData.get("fullName") ||
      formData.get("name")) as string;
    const peopleCount = (formData.get("peopleCount") ||
      formData.get("count")) as string;
    const phone = formData.get("phone") as string;
    const willAttend = formData.get("willAttend") !== "false";

    if (!eventId || !fullName || !peopleCount) {
      return NextResponse.json(
        { error: "Заполните все поля" },
        { status: 400 }
      );
    }

    // Validate people count
    const count = parseInt(peopleCount);
    if (isNaN(count) || count < 1) {
      return NextResponse.json(
        { error: "Укажите корректное количество людей" },
        { status: 400 }
      );
    }

    // Save registration to MongoDB
    const registration = {
      eventId,
      name: fullName,
      phone: phone || undefined,
      willAttend,
      guestCount: count,
      registeredAt: new Date(),
    };

    await saveRegistration(registration);

    return NextResponse.json({
      success: true,
      message: "Регистрация успешна!",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Произошла ошибка при регистрации" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "Registration endpoint is running" });
}
