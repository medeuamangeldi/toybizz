import dotenv from "dotenv";
import { bot } from "../src/lib/bot.js";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function startBot() {
  console.log("🤖 Starting Telegram bot...");

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN is required in .env.local");
    console.error("💡 Get your token from @BotFather on Telegram");
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY is required in .env.local");
    console.error("💡 Get your API key from OpenAI Platform");
    process.exit(1);
  }

  try {
    // Test bot token by getting bot info
    console.log("🔍 Testing bot token...");
    const botInfo = await bot.api.getMe();
    console.log(
      `✅ Bot connected: @${botInfo.username} (${botInfo.first_name})`
    );

    // Start the bot in polling mode
    console.log("🔄 Starting bot in polling mode...");
    await bot.start();
    console.log("✅ Bot is running successfully!");
    console.log(`📱 Send /start to @${botInfo.username} to test it`);
    console.log("🛑 Press Ctrl+C to stop the bot");
  } catch (error: unknown) {
    console.error("❌ Error starting bot:", error);

    // Type guard for telegram API errors
    const telegramError = error as { description?: string };
    if (telegramError.description) {
      console.error("📝 Error details:", telegramError.description);

      if (telegramError.description.includes("Unauthorized")) {
        console.error(
          "💡 Your bot token appears to be invalid. Check your .env.local file"
        );
      } else if (telegramError.description.includes("Not Found")) {
        console.error(
          "💡 Bot not found. Make sure you copied the token correctly from @BotFather"
        );
      }
    }

    process.exit(1);
  }
}

// Handle graceful shutdown
process.once("SIGINT", async () => {
  console.log("\n⏹️  Shutting down gracefully...");
  try {
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
    await bot.stop();
    console.log("✅ Bot stopped successfully");
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log("Error during shutdown:", errorMsg);
  }
  process.exit(0);
});

startBot();
