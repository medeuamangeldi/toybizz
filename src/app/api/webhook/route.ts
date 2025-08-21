import { NextRequest, NextResponse } from "next/server";
import { webhookCallback } from "grammy";
import { getBot } from "@/lib/bot";

export async function POST(req: NextRequest) {
  try {
    const bot = getBot();
    const handleWebhook = webhookCallback(bot, "std/http");

    // Handle the webhook directly with Grammy
    await handleWebhook(req as unknown as Request);

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Bot webhook endpoint is running",
    timestamp: new Date().toISOString(),
  });
}
