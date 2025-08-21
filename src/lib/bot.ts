import { Bot, Context, session, SessionFlavor } from "grammy";
import OpenAI from "openai";
import {
  saveEvent,
  savePhoto,
  getEvent,
  getUserEvents,
  getRegistrationCount,
  getEventRegistrations,
  EventData,
  PhotoData,
} from "./database";

// Session interface for storing user state
interface SessionData {
  step:
    | "idle"
    | "start"
    | "event_type"
    | "event_name"
    | "event_date"
    | "event_time"
    | "event_location"
    | "style_preference"
    | "media_upload"
    | "generating";
  eventData: {
    photos?: string[];
    type?: string;
    name?: string;
    date?: string;
    time?: string;
    location?: string;
    style?: string;
  };
}

type BotContext = Context & SessionFlavor<SessionData>;

// Initialize OpenAI client lazily
let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

// Initialize bot lazily
let botInstance: Bot<BotContext> | null = null;

function createBot(): Bot<BotContext> {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN environment variable is required");
  }

  const bot = new Bot<BotContext>(process.env.TELEGRAM_BOT_TOKEN);

  // Install session middleware
  bot.use(
    session({
      initial: (): SessionData => ({
        step: "idle",
        eventData: { photos: [] },
      }),
    })
  );

  // Start command
  bot.command("start", (ctx) => {
    ctx.session.step = "idle";
    ctx.session.eventData = { photos: [] };

    return ctx.reply(
      "🎉 Добро пожаловать! Я помогу вам создать красивое приглашение на мероприятие.\n\n" +
        "Команды:\n" +
        "/create - Создать новое приглашение\n" +
        "/stats - Посмотреть все ваши мероприятия и статистику\n" +
        "/help - Показать эту справку"
    );
  });

  // Create invitation command
  bot.command("create", (ctx) => {
    ctx.session.step = "event_type";
    ctx.session.eventData = { photos: [] };

    return ctx.reply(
      "🎊 Давайте создадим приглашение!\n\n" +
        "Сначала скажите, какое это мероприятие? (например: свадьба, день рождения, юбилей, корпоратив)"
    );
  });

  // Handle photos
  bot.on("message:photo", async (ctx) => {
    if (ctx.session.step === "media_upload") {
      const photo = ctx.msg.photo[ctx.msg.photo.length - 1];

      // Check file size first (Telegram limit: 20MB for bot API)
      if (photo.file_size && photo.file_size > 20 * 1024 * 1024) {
        return ctx.reply(
          "❌ Фото слишком большое! Максимальный размер: 20 МБ\n" +
            "Попробуйте сжать фото или отправить другое"
        );
      }

      try {
        // Get file info from Telegram
        const file = await ctx.api.getFile(photo.file_id);
        const photoFileName = `photo_${Date.now()}_${ctx.from!.id}.jpg`;

        // Create Telegram CDN URL
        const telegramPhotoUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

        // Save photo metadata to MongoDB
        const photoData: PhotoData = {
          photoId: `${Date.now()}_${ctx.from!.id}_${photo.file_id}`,
          eventId: "", // Will be set when event is created
          userId: ctx.from!.id,
          telegramFileId: photo.file_id,
          telegramUrl: telegramPhotoUrl,
          filename: photoFileName,
          mimeType: "image/jpeg",
          fileSize: photo.file_size,
          uploadedAt: new Date(),
        };

        await savePhoto(photoData);
        console.log(`✅ Photo metadata saved to MongoDB: ${photoData.photoId}`);

        // Store the photo ID in session for now
        ctx.session.eventData.photos = ctx.session.eventData.photos || [];
        ctx.session.eventData.photos.push(photoData.photoId);

        return ctx.reply(
          `✅ Фото добавлено и сохранено! Всего фото: ${ctx.session.eventData.photos.length}\n` +
            "Отправьте еще фото или нажмите /done для завершения"
        );
      } catch (error) {
        console.error("❌ Error processing photo:", error);
        return ctx.reply(
          "❌ Не удалось обработать фото. Попробуйте отправить другое фото меньшего размера."
        );
      }
    }
  }); // Handle documents (photos sent as documents)
  bot.on("message:document", async (ctx) => {
    if (ctx.session.step === "media_upload") {
      const document = ctx.msg.document;

      // Only accept image documents
      const isImage = document.mime_type?.startsWith("image/");

      if (!isImage) {
        return ctx.reply(
          "❌ Поддерживаются только фото\n" +
            "Отправьте фото или нажмите /done для завершения"
        );
      }

      // Check file size
      if (document.file_size && document.file_size > 20 * 1024 * 1024) {
        return ctx.reply(
          "❌ Фото слишком большое! Максимальный размер: 20 МБ\n" +
            "Попробуйте сжать фото или отправить другое"
        );
      }

      try {
        // Get file info from Telegram
        const file = await ctx.api.getFile(document.file_id);
        const photoFileName = `photo_${Date.now()}_${ctx.from!.id}.jpg`;

        // Create Telegram CDN URL
        const telegramPhotoUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

        // Save photo metadata to MongoDB
        const photoData: PhotoData = {
          photoId: `${Date.now()}_${ctx.from!.id}_${document.file_id}`,
          eventId: "", // Will be set when event is created
          userId: ctx.from!.id,
          telegramFileId: document.file_id,
          telegramUrl: telegramPhotoUrl,
          filename: photoFileName,
          mimeType: document.mime_type || "image/jpeg",
          fileSize: document.file_size,
          uploadedAt: new Date(),
        };

        await savePhoto(photoData);
        console.log(
          `✅ Photo document metadata saved to MongoDB: ${photoData.photoId}`
        );

        // Store the photo ID in session for now
        ctx.session.eventData.photos = ctx.session.eventData.photos || [];
        ctx.session.eventData.photos.push(photoData.photoId);

        return ctx.reply(
          `✅ Фото добавлено и сохранено! Всего фото: ${ctx.session.eventData.photos.length}\n` +
            "Отправьте еще фото или нажмите /done для завершения"
        );
      } catch (error) {
        console.error("❌ Error processing photo document:", error);
        return ctx.reply(
          "❌ Не удалось обработать фото. Попробуйте отправить фото меньшего размера."
        );
      }
    }
  });

  // Done command to finish media upload
  bot.command("done", async (ctx) => {
    console.log("📋 /done command received, session step:", ctx.session.step);

    if (ctx.session.step === "media_upload") {
      ctx.session.step = "generating";

      try {
        await ctx.reply(
          "🤖 Создаю красивое приглашение с помощью ИИ... Это может занять несколько секунд."
        );
        console.log("💡 Starting invitation generation...");

        // Save event to MongoDB
        const eventId = `event_${Date.now()}_${ctx.from!.id}`;

        // Get actual photo URLs from MongoDB
        const photoUrls: string[] = [];
        if (
          ctx.session.eventData.photos &&
          ctx.session.eventData.photos.length > 0
        ) {
          const { getPhotosCollection } = await import("./database");
          const photosCollection = await getPhotosCollection();

          for (const photoId of ctx.session.eventData.photos) {
            const photoDoc = await photosCollection.findOne({ photoId });
            if (photoDoc) {
              photoUrls.push(photoDoc.telegramUrl);
            }
          }
        }

        // Update the session data with real photo URLs for AI generation
        const eventDataForAI = {
          ...ctx.session.eventData,
          photos: photoUrls,
        };

        // Generate HTML with actual photo URLs
        const invitationHtml = await generateInvitation(
          eventDataForAI,
          ctx.from!.id,
          eventId
        );
        console.log("✅ Invitation HTML generated successfully");

        const eventData: EventData = {
          eventId,
          userId: ctx.from!.id,
          eventType: ctx.session.eventData.type || "",
          brideName:
            ctx.session.eventData.type === "wedding"
              ? ctx.session.eventData.name?.split(" и ")[0]
              : undefined,
          groomName:
            ctx.session.eventData.type === "wedding"
              ? ctx.session.eventData.name?.split(" и ")[1]
              : undefined,
          eventName:
            ctx.session.eventData.type !== "wedding"
              ? ctx.session.eventData.name
              : undefined,
          date: ctx.session.eventData.date || "",
          time: ctx.session.eventData.time || "",
          location: ctx.session.eventData.location || "",
          photos: photoUrls,
          htmlContent: invitationHtml,
          stylePreference: parseInt(ctx.session.eventData.style || "1"),
          createdAt: new Date(),
        };

        await saveEvent(eventData);
        console.log(`✅ Event saved to MongoDB: ${eventId}`);

        // Update photo documents with the actual event ID
        if (
          ctx.session.eventData.photos &&
          ctx.session.eventData.photos.length > 0
        ) {
          const { getPhotosCollection } = await import("./database");
          const photosCollection = await getPhotosCollection();

          for (const photoId of ctx.session.eventData.photos) {
            await photosCollection.updateOne(
              { photoId },
              { $set: { eventId } }
            );
          }
          console.log(
            `✅ Updated ${ctx.session.eventData.photos.length} photos with eventId`
          );
        }

        // Create invitation URL
        const invitationUrl = `${
          process.env.NEXTAUTH_URL ||
          process.env.VERCEL_URL ||
          "http://localhost:3000"
        }/event/${eventId}`;

        console.log("🔗 Invitation URL:", invitationUrl);

        ctx.session.step = "idle";
        ctx.session.eventData = { photos: [] };

        // Send success message first
        await ctx.reply(
          `🎊 Приглашение готово!\n\n` +
            ` ID для статистики: ${eventId}\n\n` +
            `Используйте /stats для просмотра всех ваших мероприятий`
        );

        // Send clickable link as separate message
        return ctx.reply(`${invitationUrl}`, {
          link_preview_options: { is_disabled: false },
        });
      } catch (error) {
        console.error("❌ Error generating invitation:", error);
        ctx.session.step = "idle";
        return ctx.reply(
          "❌ Произошла ошибка при создании приглашения. Попробуйте еще раз.\n" +
            "Убедитесь, что все данные заполнены правильно и попробуйте /create снова."
        );
      }
    } else {
      console.log(
        "⚠️ /done called but not in media_upload step. Current step:",
        ctx.session.step
      );
      return ctx.reply("Сначала начните создание приглашения командой /create");
    }
  });

  // Stats command - show user's events with buttons
  bot.command("stats", async (ctx) => {
    try {
      const userId = ctx.from!.id;

      // Get user events from MongoDB
      const userEvents = await getUserEvents(userId);

      if (userEvents.length === 0) {
        return ctx.reply(
          "📝 У вас пока нет созданных мероприятий. Используйте /create чтобы создать первое!"
        );
      }

      // Create inline keyboard with event buttons
      const keyboard = {
        inline_keyboard: userEvents.map((event) => [
          {
            text: `📊 ${event.eventType} - ${event.date}`,
            callback_data: `info_${event.eventId}`,
          },
        ]),
      };

      return ctx.reply(
        `📊 Ваши мероприятия (${userEvents.length}):\n\n` +
          `Выберите мероприятие для просмотра:`,
        { reply_markup: keyboard }
      );
    } catch (error) {
      console.error("Error in stats command:", error);
      return ctx.reply("❌ Ошибка при получении списка мероприятий");
    }
  });

  // Handle callback queries from inline keyboard buttons
  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;

    // Handle style selection
    if (data.startsWith("style_")) {
      const styleMap: { [key: string]: string } = {
        style_classic: "классический",
        style_pink: "нежный_розовый",
        style_blue: "яркий_синий",
        style_gold: "золотой",
        style_purple: "фиолетовый",
        style_green: "зеленый",
        style_orange: "оранжевый",
        style_red: "красный",
        style_minimal: "минимальный",
        style_ocean: "морской",
      };

      const styleDisplayMap: { [key: string]: string } = {
        style_classic: "🖤 Классический",
        style_pink: "🌸 Нежный розовый",
        style_blue: "🌈 Яркий синий",
        style_gold: "✨ Золотой",
        style_purple: "💜 Фиолетовый",
        style_green: "🌿 Зеленый",
        style_orange: "🧡 Оранжевый",
        style_red: "❤️ Красный",
        style_minimal: "🤍 Минимальный",
        style_ocean: "🌊 Морской",
      };

      if (styleMap[data] && ctx.session.step === "style_preference") {
        ctx.session.eventData.style = styleMap[data];
        ctx.session.step = "media_upload";

        await ctx.answerCallbackQuery();
        return ctx.reply(
          `✅ Выбрана тема: **${styleDisplayMap[data]}**\n\n` +
            "📸 Теперь отправьте фотографии для приглашения!\n\n" +
            "📏 Ограничения:\n" +
            "• Максимум 20 МБ на фото\n" +
            "• Поддерживаются только фотографии\n\n" +
            "Отправьте фото или нажмите /done если фото не нужны"
        );
      }
    }

    if (data.startsWith("info_")) {
      const eventId = data.replace("info_", "");

      try {
        // Get event details from MongoDB
        const event = await getEvent(eventId);
        if (!event) {
          await ctx.answerCallbackQuery();
          return ctx.reply("❌ Мероприятие не найдено");
        }

        // Get registration statistics
        const registrationCount = await getRegistrationCount(eventId);
        const registrations = await getEventRegistrations(eventId);
        const totalPeople = registrations.reduce(
          (sum, reg) => sum + (reg.guestCount || 1),
          0
        );

        // Build response message
        let message = `📊 ${event.eventType} - ${event.date}\n`;
        message += `📍 ${event.location}\n`;
        message += `⏰ ${event.time}\n\n`;

        // Statistics section
        message += `📈 СТАТИСТИКА:\n`;
        message += `👥 Зарегистрировано: ${registrationCount} гостей\n`;
        message += `👨‍👩‍👧‍👦 Общее количество людей: ${totalPeople}\n\n`;

        // Guest list section
        if (registrations.length > 0) {
          message += `📋 СПИСОК ГОСТЕЙ:\n`;
          registrations.forEach((reg, index) => {
            const attendStatus = reg.willAttend ? "✅" : "❌";
            const guestCount = reg.guestCount || 1;
            message += `${index + 1}. ${attendStatus} ${
              reg.name
            } (${guestCount} чел.)\n`;
            if (reg.phone) {
              message += `   📞 ${reg.phone}\n`;
            }
          });
        } else {
          message += `📋 СПИСОК ГОСТЕЙ:\n`;
          message += `Пока никто не зарегистрировался\n`;
        }

        await ctx.answerCallbackQuery();
        return ctx.reply(message);
      } catch (error) {
        console.error("Error getting event info:", error);
        await ctx.answerCallbackQuery();
        return ctx.reply("❌ Ошибка при получении информации о мероприятии");
      }
    }

    // Keep old handlers for backward compatibility (can be removed later)
    if (data.startsWith("stats_")) {
      const eventId = data.replace("stats_", "");

      try {
        const registrationCount = await getRegistrationCount(eventId);

        // Get detailed registrations to count total people
        const registrations = await getEventRegistrations(eventId);
        const totalPeople = registrations.reduce(
          (sum, reg) => sum + (reg.guestCount || 1),
          0
        );

        await ctx.answerCallbackQuery();
        return ctx.reply(
          `📊 Статистика регистраций\n\n` +
            `👥 Зарегистрировано гостей: ${registrationCount}\n` +
            `👨‍👩‍👧‍👦 Общее количество людей: ${totalPeople}`
        );
      } catch (error) {
        console.error("Error getting event stats:", error);
        await ctx.answerCallbackQuery();
        return ctx.reply("❌ Мероприятие не найдено или нет регистраций");
      }
    }

    if (data.startsWith("list_")) {
      const eventId = data.replace("list_", "");

      try {
        const registrations = await getEventRegistrations(eventId);

        if (registrations.length === 0) {
          await ctx.answerCallbackQuery();
          return ctx.reply(
            "📝 Пока никто не зарегистрировался на это мероприятие"
          );
        }

        let message = `📋 Список зарегистрированных гостей:\n\n`;

        registrations.forEach((reg, index) => {
          const attendStatus = reg.willAttend ? "✅ Придёт" : "❌ Не придёт";
          const guestCount = reg.guestCount || 1;
          message += `${index + 1}. ${
            reg.name
          } (${guestCount} чел.) - ${attendStatus}\n`;
          if (reg.phone) {
            message += `   📞 ${reg.phone}\n`;
          }
        });

        await ctx.answerCallbackQuery();
        return ctx.reply(message);
      } catch (error) {
        console.error("Error getting event registrations:", error);
        await ctx.answerCallbackQuery();
        return ctx.reply("❌ Мероприятие не найдено или нет регистраций");
      }
    }
  });

  // Help command
  bot.command("help", (ctx) => {
    return ctx.reply(
      "🤖 Справка по командам:\n\n" +
        "/start - Начать работу с ботом\n" +
        "/create - Создать новое приглашение\n" +
        "/stats - Посмотреть все ваши мероприятия и статистику\n" +
        "/help - Эта справка"
    );
  });

  // Handle messages based on session step (fallback handler - should be last)
  bot.on("message:text", async (ctx) => {
    const step = ctx.session.step;
    const text = ctx.msg.text;

    // Skip if it's a command (let command handlers process it)
    if (text.startsWith("/")) {
      return;
    }

    switch (step) {
      case "event_type":
        ctx.session.eventData.type = text;
        ctx.session.step = "event_name";
        return ctx.reply("📝 Отлично! Теперь напишите название мероприятия:");

      case "event_name":
        ctx.session.eventData.name = text;
        ctx.session.step = "event_date";
        return ctx.reply(
          "📅 Укажите дату мероприятия (например: 15 июня 2024):"
        );

      case "event_date":
        ctx.session.eventData.date = text;
        ctx.session.step = "event_time";
        return ctx.reply("⏰ Укажите время начала (например: 18:00):");

      case "event_time":
        ctx.session.eventData.time = text;
        ctx.session.step = "event_location";
        return ctx.reply("📍 Укажите место проведения:");

      case "event_location":
        ctx.session.eventData.location = text;
        ctx.session.step = "style_preference";

        // Create inline keyboard with color combinations
        const styleKeyboard = {
          inline_keyboard: [
            [
              { text: "🖤 Классический", callback_data: "style_classic" },
              { text: "🌸 Нежный розовый", callback_data: "style_pink" },
            ],
            [
              { text: "🌈 Яркий синий", callback_data: "style_blue" },
              { text: "✨ Золотой", callback_data: "style_gold" },
            ],
            [
              { text: "💜 Фиолетовый", callback_data: "style_purple" },
              { text: "🌿 Зеленый", callback_data: "style_green" },
            ],
            [
              { text: "🧡 Оранжевый", callback_data: "style_orange" },
              { text: "❤️ Красный", callback_data: "style_red" },
            ],
            [
              { text: "🤍 Минимальный", callback_data: "style_minimal" },
              { text: "🌊 Морской", callback_data: "style_ocean" },
            ],
          ],
        };

        return ctx.reply("🎨 Выберите цветовую тему приглашения:", {
          reply_markup: styleKeyboard,
        });

      case "style_preference":
        // This is now handled by callback queries, not text input
        return ctx.reply(
          "🎨 Пожалуйста, выберите цветовую тему из кнопок выше ⬆️"
        );

      default:
        return ctx.reply("Используйте /start для начала работы с ботом");
    }
  });

  // Global error handler
  bot.catch(async (err) => {
    console.error("❌ Bot error:", err);

    // Try to send a user-friendly error message
    try {
      if (err.ctx && err.ctx.reply) {
        const errorMsg = err.error as { description?: string };
        if (errorMsg?.description?.includes("file is too big")) {
          await err.ctx.reply(
            "❌ Фото слишком большое!\n" +
              "📏 Максимальный размер: 20 МБ\n\n" +
              "Попробуйте сжать фото и отправить снова"
          );
        } else {
          await err.ctx.reply(
            "❌ Произошла ошибка. Попробуйте еще раз или обратитесь в поддержку."
          );
        }
      }
    } catch (replyError) {
      console.error("Failed to send error message to user:", replyError);
    }
  });

  return bot;
}

// Generate invitation HTML using OpenAI
async function generateInvitation(
  eventData: SessionData["eventData"],
  userId: number,
  eventId: string
): Promise<string> {
  console.log("🔄 Generating invitation with data:", eventData);

  const prompt = `You are a world-class web designer. Create a BEAUTIFUL invitation that MUST follow the user's exact style choice.

EVENT DETAILS:
- Type: ${eventData.type}
- Name: ${eventData.name} 
- Date: ${eventData.date}
- Time: ${eventData.time}
- Location: ${eventData.location}
- Photos: ${eventData.photos?.length || 0} uploaded
- USER'S STYLE CHOICE: "${eventData.style || "минимальный"}"

🚨 CRITICAL: You MUST implement the "${
    eventData.style || "минимальный"
  }" style exactly as specified below!

TECHNICAL SETUP:
- Include: <script src="https://cdn.tailwindcss.com"></script>
- Use ONLY Tailwind CSS utility classes

MANDATORY STYLE IMPLEMENTATION:

${(() => {
  switch (eventData.style) {
    case "классический":
      return `🖤 КЛАССИЧЕСКИЙ STYLE - Black & White Elegance:
- Background: bg-white or bg-gray-50
- Text: text-gray-900 (black) for headers, text-gray-700 for content
- Typography: font-serif EVERYWHERE
- Borders: border-gray-900 (black borders)
- Buttons: bg-gray-900 text-white
- Accents: ONLY black, white, and subtle grays`;

    case "нежный_розовый":
      return `🌸 НЕЖНЫЙ РОЗОВЫЙ STYLE - Soft Pink Romance:
- Background: bg-rose-50 or bg-pink-50
- Headers: text-rose-600 or text-pink-600
- Content: text-rose-700
- Borders: border-rose-200 
- Buttons: bg-rose-500 hover:bg-rose-600 text-white
- Accents: rose-100, pink-100, soft pastels only`;

    case "яркий_синий":
      return `🌈 ЯРКИЙ СИНИЙ STYLE - Vibrant Blue:
- Background: bg-gradient-to-br from-blue-400 to-blue-600
- Headers: text-white or text-blue-100
- Content: text-blue-900 on light sections
- Borders: border-blue-500
- Buttons: bg-blue-600 hover:bg-blue-700 text-white
- Accents: blue-500, blue-600, sky-400`;

    case "золотой":
      return `✨ ЗОЛОТОЙ STYLE - Luxury Gold:
- Background: bg-gradient-to-br from-yellow-50 to-amber-100
- Headers: text-yellow-700 or text-amber-800
- Content: text-yellow-800
- Borders: border-yellow-400
- Buttons: bg-gradient-to-r from-yellow-500 to-amber-600 text-white
- Accents: yellow-100, amber-200, gold tones`;

    case "фиолетовый":
      return `💜 ФИОЛЕТОВЫЙ STYLE - Purple Elegance:
- Background: bg-gradient-to-br from-purple-50 to-violet-100
- Headers: text-purple-700 or text-violet-800
- Content: text-purple-800
- Borders: border-purple-400
- Buttons: bg-purple-600 hover:bg-purple-700 text-white
- Accents: purple-100, violet-200, lavender tones`;

    case "зеленый":
      return `🌿 ЗЕЛЕНЫЙ STYLE - Natural Green:
- Background: bg-gradient-to-br from-green-50 to-emerald-100
- Headers: text-green-700 or text-emerald-800
- Content: text-green-800
- Borders: border-green-400
- Buttons: bg-green-600 hover:bg-green-700 text-white
- Accents: green-100, emerald-200, forest tones`;

    case "оранжевый":
      return `🧡 ОРАНЖЕВЫЙ STYLE - Warm Orange:
- Background: bg-gradient-to-br from-orange-50 to-amber-100
- Headers: text-orange-700 or text-amber-800
- Content: text-orange-800
- Borders: border-orange-400
- Buttons: bg-orange-600 hover:bg-orange-700 text-white
- Accents: orange-100, amber-200, sunset tones`;

    case "красный":
      return `❤️ КРАСНЫЙ STYLE - Bold Red:
- Background: bg-gradient-to-br from-red-50 to-rose-100
- Headers: text-red-700 or text-rose-800
- Content: text-red-800
- Borders: border-red-400
- Buttons: bg-red-600 hover:bg-red-700 text-white
- Accents: red-100, rose-200, crimson tones`;

    case "морской":
      return `🌊 МОРСКОЙ STYLE - Ocean Blue:
- Background: bg-gradient-to-br from-cyan-50 to-teal-100
- Headers: text-cyan-700 or text-teal-800
- Content: text-cyan-800
- Borders: border-cyan-400
- Buttons: bg-cyan-600 hover:bg-cyan-700 text-white
- Accents: cyan-100, teal-200, ocean tones`;

    default:
      return `🤍 МИНИМАЛЬНЫЙ STYLE - Ultra Clean:
- Background: bg-white only
- Headers: text-gray-900 (pure black)
- Content: text-gray-600
- Borders: border-gray-100 (very subtle)
- Buttons: bg-gray-900 text-white
- Accents: ONLY white, gray-50, gray-100
- Maximum whitespace, minimal elements`;
  }
})()}

PHOTO INTEGRATION:
${
  eventData.photos?.length
    ? `
*** USE THESE EXACT PHOTO PATHS - NO PLACEHOLDERS ***
${eventData.photos
  .map(
    (photo, i) =>
      `<img src="${photo}" alt="Фото ${
        i + 1
      }" class="w-full rounded-lg shadow-md hover:shadow-lg transition-all duration-500 opacity-0 animate-fade-in" data-aos="fade-up" data-aos-delay="${
        i * 200
      }">`
  )
  .join("\n")}

- IMPORTANT: Photos in ONE COLUMN (w-full), not grid!
- Use: flex flex-col gap-6 for photo container
- Each photo: w-full rounded-lg shadow-md
- Style photos according to the ${eventData.style} theme
- NEVER use placeholder images!`
    : `- No photos provided`
}

🎬 ANIMATION REQUIREMENTS:
- Add scroll animations using AOS (Animate On Scroll)
- Include: <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
- Include: <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
- Initialize: AOS.init({duration: 800, once: true});
- Header section: data-aos="fade-down"
- Event details: data-aos="fade-right" data-aos-delay="200"
- Photos: data-aos="fade-up" with staggered delays (200ms, 400ms, 600ms...)
- Form: data-aos="fade-up" data-aos-delay="300"
- Use smooth transitions: transition-all duration-500

🎵 MUSIC PLAYER:
- Add a floating music button (top-right corner)
- Button: fixed top-4 right-4 z-50 with music note emoji 🎵
- Use this open source melody: https://www.soundjay.com/misc/sounds/bell-ringing-05.wav
- Button toggles play/pause with visual feedback
- Style according to chosen color theme
- Code: <button id="musicBtn" class="fixed top-4 right-4 z-50 bg-{themeColor} text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all">🎵</button>
- Add JavaScript for play/pause functionality

📱 LAYOUT STRUCTURE:
1. Header with event title (animated fade-down)
2. Event details section (animated fade-right)  
3. Photos section in ONE COLUMN (animated fade-up with staggered delays)
4. Registration form AT THE END (animated fade-up)
- Use: max-w-2xl mx-auto px-4 py-8 for main container
- Sections: space-y-12 for good spacing
- Mobile-first responsive design

FORM REQUIREMENTS:
- Russian labels: "Полное имя", "Количество гостей"
- Field names: name="fullName", name="peopleCount", name="eventId"
- eventId value: "EVENT_ID_PLACEHOLDER"
- Form action="/api/register" method="POST"
- Style form inputs according to ${eventData.style} theme

EVENT SYMBOL: ${
    eventData.type === "свадьба"
      ? "♡"
      : eventData.type?.includes("день рождения")
      ? "⭐"
      : "✨"
  }

🚨 ABSOLUTE REQUIREMENTS:
1. You MUST use the exact colors specified for "${eventData.style}" style
2. NO generic gray designs allowed
3. The design MUST visually match the style choice
4. Include <script src="/js/form-handler.js"></script> before </body>
5. All text in Russian
6. Mobile responsive
7. MUST include AOS animations on ALL sections
8. Photos in ONE COLUMN layout (not grid)
9. Music player button with play/pause functionality
10. Form positioned at the very bottom
11. Smooth scroll behavior and transitions

Return ONLY HTML code without markdown formatting.`;

  try {
    console.log("🤖 Calling OpenAI API...");
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Latest model for better HTML/CSS generation
      messages: [
        {
          role: "system",
          content:
            "You are an expert web designer specializing in beautiful, responsive invitation designs. Always return clean, modern HTML with embedded CSS.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 6000,
    });
    console.log("✅ OpenAI API response received");

    let html = completion.choices[0].message.content || "";

    // Clean up any markdown formatting from OpenAI response
    html = html
      .replace(/```html\s*/g, "")
      .replace(/```\s*/g, "")
      .replace(/^```/gm, "")
      .trim();

    // Replace placeholder with actual event ID (passed as parameter)
    html = html.replace(/EVENT_ID_PLACEHOLDER/g, eventId);
    console.log("✅ HTML generated and event ID replaced");

    return html;
  } catch (error) {
    console.error("❌ OpenAI API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to generate invitation: ${errorMessage}`);
  }
}

// Export a getter function for the bot
export function getBot(): Bot<BotContext> {
  if (!botInstance) {
    botInstance = createBot();
  }
  return botInstance;
}

// Export bot as a getter for backwards compatibility
export const bot = {
  get api() {
    return getBot().api;
  },
  start: () => getBot().start(),
  stop: () => getBot().stop(),
};

// Initialize directories on startup
