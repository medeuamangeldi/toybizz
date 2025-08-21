import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const eventId = formData.get("eventId") as string;
    // Support both old and new field names for backward compatibility
    const fullName = (formData.get("fullName") ||
      formData.get("name")) as string;
    const peopleCount = (formData.get("peopleCount") ||
      formData.get("count")) as string;

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

    // Save registration
    const registrationPath = path.join(
      process.cwd(),
      "data",
      `${eventId}_registrations.txt`
    );
    const registrationEntry = `${fullName} | ${count} | ${new Date().toISOString()}\n`;

    try {
      await fs.appendFile(registrationPath, registrationEntry, "utf-8");
    } catch {
      // If file doesn't exist, create it
      await fs.writeFile(registrationPath, registrationEntry, "utf-8");
    }

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
