import dotenv from "dotenv";
import { getBot } from "../src/lib/bot.js";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Check if we're in production (Vercel)
const isProduction = process.env.NODE_ENV === "production";

async function setupBot() {
  console.log(
    `🤖 Setting up bot for ${
      isProduction ? "PRODUCTION" : "DEVELOPMENT"
    } mode...`
  );

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN is required");
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY is required");
    process.exit(1);
  }

  try {
    const bot = getBot();

    if (isProduction) {
      // In production (Vercel), set up webhook
      const webhookUrl = `${process.env.NEXTAUTH_URL}/api/webhook`;
      console.log(`🔗 Setting webhook URL: ${webhookUrl}`);

      await bot.api.setWebhook(webhookUrl);
      console.log("✅ Webhook set successfully for production");
      console.log("📱 Bot is ready to receive messages via webhook");
    } else {
      // In development, use polling
      console.log("🔄 Starting bot in polling mode...");
      const botInfo = await bot.api.getMe();
      console.log(
        `✅ Bot connected: @${botInfo.username} (${botInfo.first_name})`
      );

      await bot.start();
      console.log("✅ Bot is running in polling mode!");
      console.log(`📱 Send /start to @${botInfo.username} to test it`);
      console.log("🛑 Press Ctrl+C to stop the bot");
    }
  } catch (error: unknown) {
    console.error("❌ Error setting up bot:", error);

    const telegramError = error as { description?: string };
    if (telegramError.description) {
      console.error("📝 Error details:", telegramError.description);

      if (telegramError.description.includes("Unauthorized")) {
        console.error("💡 Your bot token appears to be invalid");
      } else if (telegramError.description.includes("Not Found")) {
        console.error("💡 Bot not found. Check your token from @BotFather");
      }
    }

    if (!isProduction) {
      process.exit(1);
    }
  }
}

// Handle graceful shutdown (only for development polling)
if (!isProduction) {
  process.once("SIGINT", async () => {
    console.log("\n⏹️  Shutting down gracefully...");
    try {
      const bot = getBot();
      await bot.stop();
      console.log("✅ Bot stopped successfully");
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log("Error during shutdown:", errorMsg);
    }
    process.exit(0);
  });

  process.once("SIGTERM", async () => {
    console.log("\n⏹️  Shutting down gracefully...");
    try {
      const bot = getBot();
      await bot.stop();
      console.log("✅ Bot stopped successfully");
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log("Error during shutdown:", errorMsg);
    }
    process.exit(0);
  });
}

setupBot();
