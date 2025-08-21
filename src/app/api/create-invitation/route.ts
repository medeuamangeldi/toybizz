import { NextRequest, NextResponse } from "next/server";
import { GridFSBucket, ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/database";
import { verifyAuth } from "@/lib/auth";
import { Readable } from "stream";

interface EventData {
  type: string;
  name: string;
  language: string;
  date: string;
  time: string;
  location: string;
  style: string;
  customStyle?: string;
  photoUrls?: string[];
  melodyUrl?: string | null;
}

// Helper to convert File to Buffer
async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Upload file to GridFS with enhanced metadata
async function uploadToGridFS(
  bucket: GridFSBucket,
  filename: string,
  buffer: Buffer,
  contentType: string,
  eventId: string,
  fileType: "photo" | "melody"
): Promise<{ fileId: ObjectId; url: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType,
      metadata: {
        eventId,
        fileType,
        originalName: filename,
        uploadDate: new Date(),
        fileSize: buffer.length,
      },
    });

    uploadStream.on("finish", () => {
      const fileId = uploadStream.id as ObjectId;
      // Store relative URL for flexibility
      const url = `/api/files/${
        fileType === "photo" ? "photos" : "melodies"
      }/${fileId}`;
      resolve({ fileId, url });
    });

    uploadStream.on("error", (error) => {
      console.error(`Error uploading ${fileType} to GridFS:`, error);
      reject(error);
    });

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}

// Generate invitation HTML using OpenAI
async function generateInvitation(
  eventData: EventData,
  eventId: string
): Promise<string> {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    throw new Error("OpenAI API key not configured");
  }

  const styleConfig = {
    классический: `🖤 КЛАССИЧЕСКИЙ STYLE - Black & White Elegance:
- Background: bg-white or bg-gray-50
- Text: text-gray-900 (black) for headers, text-gray-700 for content
- Typography: font-serif EVERYWHERE
- Borders: border-gray-900 (black borders) with ornamental patterns
- Buttons: bg-gray-900 text-white with elegant hover effects
- Accents: ONLY black, white, and subtle grays
- Ceremonial elements: ❦ ❧ ☙ decorative flourishes, elegant dividers
- Special effects: subtle drop-shadows, ornamental borders`,

    нежный_розовый: `🌸 НЕЖНЫЙ РОЗОВЫЙ STYLE - Soft Pink Romance:
- Background: bg-rose-50 or bg-pink-50
- Headers: text-rose-600 or text-pink-600
- Content: text-rose-700
- Borders: border-rose-200 with delicate floral patterns
- Buttons: bg-rose-500 hover:bg-rose-600 text-white
- Accents: rose-100, pink-100, soft pastels only
- Ceremonial elements: 🌹 ❀ ❁ floral motifs, romantic flourishes
- Special effects: soft glowing shadows, petal-like decorations`,

    яркий_синий: `🌈 ЯРКИЙ СИНИЙ STYLE - Vibrant Blue:
- Background: bg-gradient-to-br from-blue-400 to-blue-600
- Headers: text-white or text-blue-100
- Content: text-blue-900 on light sections
- Borders: border-blue-500
- Buttons: bg-blue-600 hover:bg-blue-700 text-white
- Accents: blue-500, blue-600, sky-400`,

    золотой: `✨ ЗОЛОТОЙ STYLE - Luxury Gold:
- Background: bg-gradient-to-br from-yellow-50 to-amber-100
- Headers: text-yellow-700 or text-amber-800
- Content: text-yellow-800
- Borders: border-yellow-400 with royal ornamental patterns
- Buttons: bg-gradient-to-r from-yellow-500 to-amber-600 text-white
- Accents: yellow-100, amber-200, gold tones
- Ceremonial elements: 👑 💎 ✨ royal symbols, golden flourishes
- Special effects: metallic gradients, golden glow effects, luxury borders`,

    фиолетовый: `💜 ФИОЛЕТОВЫЙ STYLE - Purple Elegance:
- Background: bg-gradient-to-br from-purple-50 to-violet-100
- Headers: text-purple-700 or text-violet-800
- Content: text-purple-800
- Borders: border-purple-400
- Buttons: bg-purple-600 hover:bg-purple-700 text-white
- Accents: purple-100, violet-200, lavender tones`,

    зеленый: `🌿 ЗЕЛЕНЫЙ STYLE - Natural Green:
- Background: bg-gradient-to-br from-green-50 to-emerald-100
- Headers: text-green-700 or text-emerald-800
- Content: text-green-800
- Borders: border-green-400
- Buttons: bg-green-600 hover:bg-green-700 text-white
- Accents: green-100, emerald-200, forest tones`,

    оранжевый: `🧡 ОРАНЖЕВЫЙ STYLE - Warm Orange:
- Background: bg-gradient-to-br from-orange-50 to-amber-100
- Headers: text-orange-700 or text-amber-800
- Content: text-orange-800
- Borders: border-orange-400
- Buttons: bg-orange-600 hover:bg-orange-700 text-white
- Accents: orange-100, amber-200, sunset tones`,

    красный: `❤️ КРАСНЫЙ STYLE - Bold Red:
- Background: bg-gradient-to-br from-red-50 to-rose-100
- Headers: text-red-700 or text-rose-800
- Content: text-red-800
- Borders: border-red-400
- Buttons: bg-red-600 hover:bg-red-700 text-white
- Accents: red-100, rose-200, crimson tones`,

    морской: `🌊 МОРСКОЙ STYLE - Ocean Blue:
- Background: bg-gradient-to-br from-cyan-50 to-teal-100
- Headers: text-cyan-700 or text-teal-800
- Content: text-cyan-800
- Borders: border-cyan-400
- Buttons: bg-cyan-600 hover:bg-cyan-700 text-white
- Accents: cyan-100, teal-200, ocean tones`,

    минимальный: `🤍 МИНИМАЛЬНЫЙ STYLE - Ultra Clean:
- Background: bg-white only
- Headers: text-gray-900 (pure black)
- Content: text-gray-600
- Borders: border-gray-100 (very subtle)
- Buttons: bg-gray-900 text-white
- Accents: ONLY white, gray-50, gray-100
- Maximum whitespace, minimal elements`,

    неон: `⚡ НЕОН STYLE - Electric Neon:
- Background: bg-black or bg-gray-900 (dark base)
- Headers: text-cyan-400 or text-pink-400 with neon glow effects
- Content: text-green-400 or text-purple-400
- Borders: border-cyan-500 or border-pink-500 with glow
- Buttons: bg-gradient-to-r from-cyan-500 to-pink-500 text-black font-bold
- Accents: cyan-400, pink-400, green-400, purple-400 (bright neon colors)
- Ceremonial elements: ⚡ 🌟 ✨ 💫 electric symbols
- Special effects: 
  * text-shadow with neon glow: shadow-lg shadow-cyan-400/50
  * box-shadow with neon effects: shadow-xl shadow-pink-500/50
  * Pulsing animations: animate-pulse
  * Gradient borders with neon colors
  * Electric particle effects using CSS animations`,

    звездные_войны: `🌌 ЗВЕЗДНЫЕ ВОЙНЫ STYLE - Star Wars Galaxy:
- Background: bg-black with starfield pattern or bg-gradient-to-b from-indigo-900 to-black
- Headers: text-yellow-300 (classic Star Wars yellow) with bold fonts
- Content: text-blue-300 or text-gray-200
- Borders: border-yellow-400 with sci-fi geometric patterns
- Buttons: bg-gradient-to-r from-blue-600 to-purple-600 text-white
- Accents: yellow-300, blue-400, red-500 (lightsaber colors)
- Ceremonial elements: ⭐ 🚀 🌌 ⚔️ galactic symbols
- Special effects:
  * Lightsaber-style borders with glowing effects
  * Star field background patterns
  * Sci-fi fonts (monospace or futuristic)
  * Holographic text effects with blue glow
  * Imperial/Rebel alliance styling based on content
  * Epic space battle atmosphere
  * Scrolling text effects like movie opening`,

    кибер_панк: `🤖 КИБЕР-ПАНК STYLE - Cyberpunk Future:
- Background: bg-gradient-to-br from-purple-900 via-black to-pink-900
- Headers: text-cyan-300 with digital glitch effects
- Content: text-green-300 or text-pink-300
- Borders: border-cyan-400 with digital circuit patterns
- Buttons: bg-gradient-to-r from-purple-600 to-cyan-600 text-white
- Accents: cyan-300, pink-300, green-300, purple-300
- Ceremonial elements: 🤖 💻 ⚡ 🔮 tech symbols
- Special effects:
  * Matrix-style digital rain background
  * Glitch text animations
  * Neon grid patterns
  * Holographic UI elements
  * Circuit board decorative patterns`,

    ретро_вейв: `🌈 РЕТРО-ВЕЙВ STYLE - 80s Retrowave:
- Background: bg-gradient-to-b from-purple-800 via-pink-600 to-orange-500
- Headers: text-white with retro shadow effects
- Content: text-cyan-200 or text-pink-200
- Borders: border-pink-400 with geometric 80s patterns
- Buttons: bg-gradient-to-r from-pink-500 to-cyan-500 text-white
- Accents: pink-400, cyan-400, purple-400, orange-400
- Ceremonial elements: 🌴 🌅 🎵 📼 retro symbols
- Special effects:
  * Synthwave grid backgrounds
  * Chrome text effects
  * Neon palm tree decorations
  * Sunset gradient overlays
  * VHS-style scan lines`,
  };

  const prompt = `You are a world-class web designer. Create a BEAUTIFUL invitation that MUST follow the user's exact style choice.

EVENT DETAILS:
- Type: ${eventData.type}
- Name: ${eventData.name} 
- Language: ${
    eventData.language
  } (CRITICAL: Use ONLY this language for ALL text)
- Date: ${eventData.date}
- Time: ${eventData.time}
- Location: ${eventData.location}
- Photos: ${eventData.photoUrls?.length || 0} uploaded
- Music: ${eventData.melodyUrl ? "Yes" : "No"}
- USER'S STYLE CHOICE: "${eventData.style || "минимальный"}"

🚨🚨🚨 ABSOLUTE LANGUAGE REQUIREMENT - CRITICAL 🚨🚨🚨
${
  eventData.language === "казахский"
    ? `
ALL TEXT MUST BE IN KAZAKH LANGUAGE ONLY!
- Headings, titles, greetings: ALL IN KAZAKH
- Event details labels: "Күні:", "Уақыты:", "Орны:"
- Ceremonial phrases: "Үйлену тойына шақырамыз" (for wedding)
- NO Russian or English text anywhere!
- Use Kazakh cultural context and appropriate ceremonial language
`
    : eventData.language === "русский"
    ? `
ALL TEXT MUST BE IN RUSSIAN LANGUAGE ONLY!
- Use formal Russian ceremonial language
- Proper Russian greetings and phrases
`
    : `
ALL TEXT MUST BE IN ENGLISH LANGUAGE ONLY!
- Use formal English ceremonial language
- Proper English greetings and phrases
`
}

🚨 CRITICAL LANGUAGE REQUIREMENTS:
- ALL text must be in ${eventData.language} ONLY
- NO mixing of languages - use only ${eventData.language}
- Form labels, buttons, content - everything in ${eventData.language}
- Use appropriate cultural context for the selected language

${
  eventData.language === "казахский"
    ? `
🇰🇿 KAZAKH LANGUAGE REQUIREMENTS:
- Event titles and headers must be in Kazakh
- Use these specific phrases:
  * Wedding: "Үйлену тойына шақырамыз", "Бұл ерекше күнді бірге атап өтуге қуанамыз"
  * Birthday: "Туған күнді тойлауға шақырамыз", "Мерекеге қатысуыңызды күтеміз"  
  * Anniversary: "Мерейтойды тойлауға шақырамыз", "Салтанатты шараға шақырамыз"
  * Corporate: "Корпоративтік шараға қатысуға шақырамыз", "Корпоративтік іс-шараға күтеміз"
  * Custom: "Сізді шақырамыз", "Біздің мерекеде көруге қуанамыз"
- Event details labels in Kazakh:
  * Date: "Күні:", Time: "Уақыты:", Location: "Орны:"
  * "Іс-шара туралы мәліметтер" (Event Details)
  * "Қатысуға тіркелу" (Registration for Attendance)
- ALL decorative text, greetings, and content must be in Kazakh
`
    : eventData.language === "русский"
    ? `
🇷🇺 RUSSIAN LANGUAGE REQUIREMENTS:
- All content must be in Russian with proper formal tone
- Use ceremonial Russian phrases appropriate for the event type
`
    : `
🇺🇸 ENGLISH LANGUAGE REQUIREMENTS:
- All content must be in English with proper formal tone
- Use ceremonial English phrases appropriate for the event type
`
}

🚨 CRITICAL: You MUST implement the "${
    eventData.style || "минимальный"
  }" style exactly as specified below!

TECHNICAL SETUP:
- Include: <script src="https://cdn.tailwindcss.com"></script>
- Use ONLY Tailwind CSS utility classes

MANDATORY STYLE IMPLEMENTATION:
${
  eventData.style === "custom" && eventData.customStyle
    ? `🎨 КАСТОМНЫЙ СТИЛЬ - User Defined:
${eventData.customStyle}

IMPORTANT: Implement the above custom style description exactly as specified by the user. Use appropriate colors, patterns, and visual elements that match their description. Be creative and interpret their vision while maintaining high design quality.`
    : styleConfig[eventData.style as keyof typeof styleConfig] ||
      styleConfig.минимальный
}

PHOTO INTEGRATION:
${
  eventData.photoUrls?.length
    ? `
*** USE THESE EXACT PHOTO PATHS - NO PLACEHOLDERS ***
${eventData.photoUrls
  .map(
    (url: string, i: number) =>
      `<img src="${url}" alt="Фото ${
        i + 1
      }" class="w-full rounded-lg shadow-md hover:shadow-lg transition-all duration-500" data-aos="fade-up" data-aos-delay="${
        i * 200
      }" loading="eager" onerror="this.style.display='none'" onload="this.style.opacity='1'">`
  )
  .join("\n")}

- IMPORTANT: Photos in ONE COLUMN (w-full), not grid!
- Use: flex flex-col gap-6 for photo container
- Each photo: w-full rounded-lg shadow-md
- Style photos according to the ${eventData.style} theme
- NEVER use placeholder images!`
    : `- No photos provided`
}

🎵 MUSIC PLAYER:
${
  eventData.melodyUrl
    ? `
- Add a floating music button (top-right corner)
- Button: fixed top-4 right-4 z-50 with music note emoji 🎵
- Audio source: <audio id="bgMusic" loop><source src="${eventData.melodyUrl}" type="audio/mpeg"></audio>
- Button toggles play/pause with visual feedback
- Style according to chosen color theme
- Code: <button id="musicBtn" class="fixed top-4 right-4 z-50 bg-{themeColor} text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all">🎵</button>
- Add JavaScript for play/pause functionality`
    : `- Use default open source melody: https://www.soundjay.com/misc/sounds/bell-ringing-05.wav`
}

� CEREMONIAL DESIGN ELEMENTS:
- Add decorative borders using CSS: border patterns, ornamental frames
- Use elegant dividers between sections: <hr> with custom styling or decorative symbols ✦ ❋ ✧ ❈
- Include ceremonial flourishes: scrollwork patterns using Unicode symbols ❦ ❧ ☙ ❃ ❊
- Add corner decorations: position corner ornaments with absolute positioning
- Use elegant typography hierarchy: mix of script-like (cursive) and serif fonts
- Include subtle shadow effects: drop-shadow, text-shadow for depth
- Add ceremonial symbols based on event type:
  * Wedding: ♡ ❤ 💕 ❣ ♥ 💖 ❀ ❁ 🌹 💒 👑 💍 💎
  * Birthday: 🎂 🎉 ⭐ ✨ 🎊 🎁 🎈 🌟 💫 🎭 🎪
  * Anniversary: 🥂 🍾 ✨ 💐 🌺 🎊 💝 👑 💎 🎉
  * Corporate: 🏆 ⭐ 🎯 💼 🎖 🏅 ✨ 🌟
  * Custom/Other: 🎭 🎪 ✨ 🌟 🎊 💫 🎨 🎵 🎬 🎯 (versatile celebration symbols)

🎭 CEREMONIAL LAYOUT ENHANCEMENTS:
- Create ornamental headers with decorative elements surrounding the title
- Use elegant card-like sections with subtle borders and shadows
- Add ceremonial banners or ribbons using CSS transforms
- Include decorative frames around important information (date, time, location)
- Use gradient overlays for sophisticated depth: linear-gradient with opacity
- Add elegant hover effects on interactive elements
- Create ceremonial countdown or special date highlighting
- Use ornamental bullet points: ❖ ❈ ✧ ❋ instead of regular dots

🌟 VISUAL SOPHISTICATION:
- Add subtle patterns or textures using CSS: repeating-linear-gradient
- Use elegant spacing with golden ratio proportions
- Include ceremonial color accents: metallic effects with gradients
- Add soft glowing effects around important elements: box-shadow with blur
- Use decorative typography: first letter styling (::first-letter)
- Create elegant transition effects: fade-ins, slide-ups with easing
- Add ceremonial background patterns: subtle geometric or floral motifs
- Include ornamental separators between content sections
🎭 CEREMONIAL TYPOGRAPHY & LAYOUT:
- Main event title: Use elegant decorative framing with symbols like ❖ EVENT NAME ❖
- Date and time: Highlight with ceremonial boxes or ornamental borders
- Location: Frame with decorative elements ☙ VENUE NAME ❧
- Use ceremonial text styling: 
  * ::first-letter pseudo-element for drop caps
  * Mix font weights: font-light for elegance, font-bold for emphasis
  * Add letter-spacing for sophistication: tracking-wide, tracking-wider
- Create elegant section dividers:
  * Horizontal rules with decorative elements: ◦ ◦ ◦ or ❋ ❋ ❋
  * Use before/after pseudo-elements for ornamental borders
- Add ceremonial spacing: generous whitespace with purposeful padding
- Include event-specific ceremonial greetings in ${eventData.language}:

${
  eventData.language === "казахский"
    ? `
  * Wedding: "Үйлену тойына шақырамыз", "Бұл ерекше күнді бірге атап өтуге қуанамыз"
  * Birthday: "Туған күнді тойлауға шақырамыз", "Мерекеге қатысуыңызды күтеміз"
  * Anniversary: "Мерейтойды тойлауға шақырамыз", "Салтанатты шараға шақырамыз"
  * Corporate: "Корпоративтік шараға қатысуға шақырамыз", "Корпоративтік іс-шараға күтеміз"
  * Custom: "Сізді шақырамыз", "Біздің мерекеде көруге қуанамыз"
`
    : eventData.language === "русский"
    ? `
  * Wedding: "С радостью приглашаем", "Будем рады разделить с вами этот особенный день"
  * Birthday: "Приглашаем отпраздновать", "Ждем вас на праздновании дня рождения"
  * Anniversary: "Отметим вместе", "Приглашаем на торжественное мероприятие"
  * Corporate: "Приглашаем принять участие", "Ждем вас на корпоративном мероприятии"
  * Custom: "Приглашаем вас", "Будем рады видеть вас на нашем празднике"
`
    : `
  * Wedding: "We joyfully invite you", "We would be delighted to share this special day with you"
  * Birthday: "We invite you to celebrate", "We look forward to celebrating with you"
  * Anniversary: "Let's celebrate together", "We invite you to our ceremonial event"
  * Corporate: "We invite you to participate", "We look forward to seeing you at our corporate event"
  * Custom: "We invite you", "We would be happy to see you at our celebration"
`
}

� CUSTOM EVENT HANDLING:
- For "другое" (custom/other) events: Use the event name to determine appropriate ceremonial elements
- Analyze the event name for context clues (graduation, engagement, housewarming, etc.)
- Apply versatile ceremonial symbols: 🎭 🎪 ✨ 🌟 🎊 💫 🎨 🎵 🎬 🎯
- Use elegant, universal ceremonial language that works for any celebration
- Include adaptable decorative elements that suit various occasions
- Apply sophisticated styling that feels appropriate for formal or casual events
- If event name suggests specific theme (music, art, sports), incorporate relevant symbols

�🎊 INTERACTIVE CEREMONIAL ELEMENTS:
- Animated entrance effects for each section (fade-in, slide-up)
- Hover effects on important information with elegant transitions
- Ceremonial buttons with special styling: borders, shadows, gradients
- Add festive cursor effects on interactive elements
- Include ceremonial loading states and micro-animations
- Create elegant reveal animations for photos and content
- Add ceremonial sound effects integration (if melody provided)

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

📱 RESPONSIVE TEXT & SPACING:
- Main title: text-2xl sm:text-3xl lg:text-4xl xl:text-5xl
- Section headers: text-xl sm:text-2xl lg:text-3xl
- Body text: text-base sm:text-lg
- Sections spacing: space-y-8 sm:space-y-12 lg:space-y-16
- Content padding: px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16
- Form elements: w-full p-3 sm:p-4 text-base sm:text-lg
- Buttons: w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg

📱 RESPONSIVE LAYOUT REQUIREMENTS:
- MUST use: min-h-screen (minimum full viewport height)
- Body: m-0 p-0 (remove all default margins/padding)
- Main container: min-h-screen w-full (full width and height)
- NO max-width containers that create side gaps on mobile
- Mobile-first: padding only px-4 sm:px-6 lg:px-8 (responsive padding)
- Container: w-full (always full width, never max-w-2xl or similar)
- Background should cover entire viewport: min-h-screen
- On desktop: center content vertically and horizontally but keep full width background

CRITICAL MOBILE REQUIREMENTS:
- NO horizontal gaps or margins on mobile devices
- Text must be readable on small screens (min-w-0 for text wrapping)
- Buttons and forms must be touch-friendly (min-height: 44px)
- Images must be responsive: w-full h-auto
- Use proper viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1.0">

DESKTOP ENHANCEMENTS:
- Use responsive grid: sm:grid-cols-2 lg:grid-cols-3 where appropriate
- Larger text sizes on bigger screens: text-lg sm:text-xl lg:text-2xl
- More generous padding on larger screens: p-4 sm:p-6 lg:p-8

FORM REQUIREMENTS:
${
  eventData.language === "русский"
    ? `- Russian labels: "Полное имя", "Количество гостей", "Подтвердить участие", "Отправить"`
    : eventData.language === "казахский"
    ? `- Kazakh labels: "Толық атыңыз", "Қонақтар саны", "Қатысуды растау", "Жіберу"`
    : `- English labels: "Full Name", "Number of Guests", "Confirm Attendance", "Submit"`
}
- Field names: name="fullName", name="peopleCount", name="eventId"
- eventId value: "${eventId}"
- Form action="/api/register" method="POST"
- Style form inputs according to ${eventData.style} theme

EVENT SYMBOL: ${
    eventData.type === "свадьба"
      ? "♡"
      : eventData.type?.includes("день рождения")
      ? "⭐"
      : eventData.type === "юбилей"
      ? "🎉"
      : eventData.type === "корпоратив"
      ? "🏆"
      : eventData.type === "вечеринка"
      ? "🎊"
      : eventData.type === "другое"
      ? "🎭"
      : "✨"
  }

🚨 ABSOLUTE REQUIREMENTS:
1. You MUST use the exact colors specified for "${eventData.style}" style
2. NO generic gray designs allowed - MUST be ceremonial and elegant
3. The design MUST visually match the style choice with ceremonial elements
4. Include <script src="/js/form-handler.js"></script> before </body>
5. ALL TEXT IN ${eventData.language.toUpperCase()} ONLY - no language mixing! Use ceremonial and formal tone appropriate to the language
6. Mobile responsive with NO side gaps
7. MUST include AOS animations: <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet"> and <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script> then AOS.init()
8. Photos in ONE COLUMN layout (not grid) with elegant frames and borders
9. Music player button with ceremonial styling and play/pause functionality
10. Form positioned at the very bottom with elegant styling
11. Smooth scroll behavior and ceremonial transitions
12. Preload images with loading="eager" for better performance
13. MUST include ceremonial decorative elements: borders, flourishes, symbols
14. Use elegant typography with proper hierarchy and ceremonial styling
15. Create a truly FESTIVE and CELEBRATORY atmosphere that feels special

HTML STRUCTURE TEMPLATE:
<!DOCTYPE html>
<html lang="${
    eventData.language === "казахский"
      ? "kk"
      : eventData.language === "английский"
      ? "en"
      : "ru"
  }" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Event Name]</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
</head>
<body class="m-0 p-0 overflow-x-hidden">
  <div class="min-h-screen w-full [BACKGROUND_ACCORDING_TO_STYLE]">
    <!-- Content sections with proper spacing -->
    <div class="w-full px-4 sm:px-6 lg:px-8 py-8">
      <!-- All content goes here with proper responsive classes -->
    </div>
  </div>
  <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
  <script>AOS.init({duration: 800, once: true});</script>
  <script src="/js/form-handler.js"></script>
</body>
</html>

Return ONLY HTML code without markdown formatting.`;

  console.log(`🤖 Calling OpenAI API for invitation generation...`);
  console.log(`📝 Prompt length: ${prompt.length} characters`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log(`⏰ OpenAI request timeout after 45 seconds`);
    controller.abort();
  }, 45000); // 45 second timeout

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an expert web designer specializing in beautiful, responsive invitation designs. Always return clean, modern HTML with embedded CSS.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 6000,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`❌ OpenAI API error (${response.status}): ${errorBody}`);
      console.log(`🔄 Falling back to template HTML...`);
      return generateFallbackHTML(eventData, eventId);
    }

    console.log(`✅ OpenAI API response received (${response.status})`);

    const result = await response.json();
    console.log(`📝 OpenAI response processed, generating HTML...`);
    let htmlContent = result.choices[0].message.content || "";

    // Fallback HTML if OpenAI response is empty
    if (!htmlContent.trim()) {
      console.log(
        `⚠️ OpenAI returned empty response, using fallback template...`
      );
      htmlContent = generateFallbackHTML(eventData, eventId);
    }

    console.log(`✅ HTML content ready (${htmlContent.length} characters)`);

    // Clean up any markdown formatting
    htmlContent = htmlContent
      .replace(/```html\s*/g, "")
      .replace(/```\s*/g, "")
      .replace(/^```/gm, "")
      .trim();

    return htmlContent;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      console.log(`⏰ OpenAI request was aborted due to timeout`);
    } else {
      console.error(`❌ OpenAI API error:`, error);
    }

    console.log(`🔄 Using fallback template due to error...`);
    return generateFallbackHTML(eventData, eventId);
  }
}

// Fallback HTML template function
function generateFallbackHTML(eventData: EventData, eventId: string): string {
  const languageContent = {
    русский: {
      name: "Полное имя",
      guests: "Количество гостей",
      submit: "Отправить",
      eventDetails: "Детали мероприятия",
      date: "Дата",
      time: "Время",
      location: "Место",
    },
    казахский: {
      name: "Толық атыңыз",
      guests: "Қонақтар саны",
      submit: "Жіберу",
      eventDetails: "Іс-шара туралы мәліметтер",
      date: "Күні",
      time: "Уақыты",
      location: "Орны",
    },
    английский: {
      name: "Full Name",
      guests: "Number of Guests",
      submit: "Submit",
      eventDetails: "Event Details",
      date: "Date",
      time: "Time",
      location: "Location",
    },
  };

  const content =
    languageContent[eventData.language as keyof typeof languageContent] ||
    languageContent["русский"];

  return `<!DOCTYPE html>
<html lang="${
    eventData.language === "казахский"
      ? "kk"
      : eventData.language === "английский"
      ? "en"
      : "ru"
  }" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${eventData.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
  <div class="min-h-screen w-full px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-lg shadow-xl p-8">
        <h1 class="text-3xl font-bold text-center text-indigo-800 mb-6">${
          eventData.name
        }</h1>
        <div class="space-y-4 text-center mb-8">
          <h2 class="text-xl font-semibold text-indigo-700">${
            content.eventDetails
          }</h2>
          <p class="text-lg text-indigo-600">${eventData.type}</p>
          <p class="text-gray-700">📅 ${content.date}: ${eventData.date}</p>
          <p class="text-gray-700">🕐 ${content.time}: ${eventData.time}</p>
          <p class="text-gray-700">📍 ${content.location}: ${
    eventData.location
  }</p>
        </div>
        
        ${
          eventData.photoUrls
            ?.map(
              (url) =>
                `<img src="${url}" class="w-full rounded-lg mb-4" alt="Photo" loading="eager">`
            )
            .join("") || ""
        }
        
        <form action="/api/register" method="POST" class="space-y-4">
          <input type="hidden" name="eventId" value="${eventId}">
          <input type="text" name="fullName" placeholder="${content.name}" 
                 class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500" required>
          <input type="number" name="peopleCount" placeholder="${
            content.guests
          }" min="1" 
                 class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500" required>
          <button type="submit" class="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors">
            ${content.submit}
          </button>
        </form>
      </div>
    </div>
  </div>
  <script src="/js/form-handler.js"></script>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    // Require user authentication - no more free trial
    const authUser = await verifyAuth(request);
    if (!authUser) {
      return NextResponse.json(
        {
          error:
            "Authentication required. Please log in to create invitations.",
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    // Get the base URL from the request
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host") || "localhost:3000";
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      `${protocol}://${host}`;

    console.log(`🌐 Using base URL: ${baseUrl}`);

    // Extract event data
    const eventData = {
      type: formData.get("type") as string,
      name: formData.get("name") as string,
      language: formData.get("language") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      location: formData.get("location") as string,
      style: formData.get("style") as string,
      customStyle: formData.get("customStyle") as string,
    };

    // Generate event ID
    const eventId = `event_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const { db } = await connectToDatabase();
    const photosBucket = new GridFSBucket(db, { bucketName: "photos" });
    const melodyBucket = new GridFSBucket(db, { bucketName: "melodies" });

    // Upload photos to GridFS
    const photoUrls: string[] = [];
    const photoIds: ObjectId[] = [];
    const photoFiles: Array<{
      fileId: ObjectId;
      url: string;
      filename: string;
    }> = [];

    let photoIndex = 0;
    while (formData.get(`photo_${photoIndex}`)) {
      const photo = formData.get(`photo_${photoIndex}`) as File;
      if (photo) {
        console.log(
          `📸 Uploading photo ${photoIndex + 1}: ${photo.name} (${
            photo.size
          } bytes)`
        );

        // Validate photo size (max 5MB)
        if (photo.size > 5 * 1024 * 1024) {
          throw new Error(`Photo ${photo.name} is too large. Max size is 5MB.`);
        }

        const buffer = await fileToBuffer(photo);
        const result = await uploadToGridFS(
          photosBucket,
          `${eventId}_photo_${photoIndex}_${photo.name}`,
          buffer,
          photo.type,
          eventId,
          "photo"
        );

        photoIds.push(result.fileId);
        photoUrls.push(result.url);
        photoFiles.push({
          fileId: result.fileId,
          url: result.url,
          filename: photo.name,
        });

        console.log(
          `✅ Photo ${photoIndex + 1} uploaded with ID: ${result.fileId}`
        );
      }
      photoIndex++;
    }

    // Upload melody to GridFS
    let melodyUrl: string | null = null;
    let melodyId: ObjectId | null = null;
    let melodyFile: { fileId: ObjectId; url: string; filename: string } | null =
      null;

    const melody = formData.get("melody") as File;
    if (melody) {
      console.log(`🎵 Uploading melody: ${melody.name} (${melody.size} bytes)`);

      // Validate melody size (max 10MB)
      if (melody.size > 10 * 1024 * 1024) {
        throw new Error(
          `Melody ${melody.name} is too large. Max size is 10MB.`
        );
      }

      const buffer = await fileToBuffer(melody);
      const result = await uploadToGridFS(
        melodyBucket,
        `${eventId}_melody_${melody.name}`,
        buffer,
        melody.type,
        eventId,
        "melody"
      );

      melodyId = result.fileId;
      melodyUrl = result.url;
      melodyFile = {
        fileId: result.fileId,
        url: result.url,
        filename: melody.name,
      };

      console.log(`✅ Melody uploaded with ID: ${result.fileId}`);
    }

    // Prepare data for OpenAI with full URLs
    // Convert relative URLs to absolute URLs for HTML generation
    const absolutePhotoUrls = photoUrls.map((url) => {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      return url; // Already absolute
    });

    const absoluteMelodyUrl =
      melodyUrl && melodyUrl.startsWith("/")
        ? `${baseUrl}${melodyUrl}`
        : melodyUrl;

    const eventDataForAI = {
      ...eventData,
      photoUrls: absolutePhotoUrls,
      melodyUrl: absoluteMelodyUrl,
    };

    // Generate HTML invitation
    console.log(`🎨 Starting invitation generation...`);
    console.log(
      `📊 Event data: ${JSON.stringify({
        type: eventData.type,
        name: eventData.name,
        language: eventData.language,
        photoCount: absolutePhotoUrls.length,
        hasMusic: !!absoluteMelodyUrl,
      })}`
    );

    const htmlContent = await generateInvitation(eventDataForAI, eventId);
    console.log(
      `✅ HTML invitation generated (${htmlContent.length} characters)`
    );

    // Check free trial limit before creating invitation
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({
      _id: new ObjectId(authUser.userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has a paid plan
    const hasPaidPlan = user.plan && user.plan !== "free";

    // If no paid plan, check free trial limit
    if (!hasPaidPlan) {
      const currentTrialCount = user.freeTrialCount || 0;
      if (currentTrialCount >= 3) {
        return NextResponse.json(
          {
            error: "Free trial has ended",
            message:
              "You have reached the limit of 3 free invitations. Please upgrade to a paid plan to continue creating invitations.",
            freeTrialEnded: true,
          },
          { status: 403 }
        );
      }
    }

    // Save to database with enhanced metadata
    const eventsCollection = db.collection("events");
    const eventDocument = {
      eventId,
      // User association (authenticated users only)
      userId: new ObjectId(authUser.userId),
      userEmail: authUser.email,
      // Rename eventData fields to match dashboard
      title: eventData.name,
      eventType: eventData.type,
      language: eventData.language,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      style: eventData.style,
      customStyle: eventData.customStyle,
      // File references
      photoIds,
      melodyId,
      // File metadata for easier querying
      files: {
        photos: photoFiles,
        melody: melodyFile,
      },
      // Generated content
      htmlContent,
      // Analytics
      analytics: {
        views: 0,
        registrations: 0,
        createdAt: new Date(),
        lastViewed: null,
      },
      // Status
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await eventsCollection.insertOne(eventDocument);
    console.log(`✅ Event document saved with ID: ${eventId}`);

    // Increment free trial count if user doesn't have a paid plan
    if (!hasPaidPlan) {
      await usersCollection.updateOne(
        { _id: new ObjectId(authUser.userId) },
        { $inc: { freeTrialCount: 1 } }
      );
      console.log(
        `📊 Free trial count incremented for user: ${authUser.email}`
      );
    }

    return NextResponse.json({
      eventId,
      message: "Invitation created successfully",
      stats: {
        photosUploaded: photoFiles.length,
        melodyUploaded: !!melodyFile,
        htmlSize: htmlContent.length,
      },
    });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}
