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
  schedule?: { time: string; event: string }[];
}

// Generate invitation JSON content using OpenAI
export async function generateInvitation(
  eventData: EventData,
  eventId: string
): Promise<string> {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    throw new Error("OpenAI API key not configured");
  }

  const prompt = `You are a world-class content creator and event planner. Create invitation CONTENT in JSON format (NOT HTML).

EVENT DETAILS:
- Type: ${eventData.type}
- Name: ${eventData.name} 
- Language: ${
    eventData.language
  } (CRITICAL: Use ONLY this language for ALL text)
- Date: ${eventData.date}
- Time: ${eventData.time}
- Location: ${eventData.location}
- Schedule: ${
    eventData.schedule ? JSON.stringify(eventData.schedule) : "Not provided"
  }
- Photos: ${
    eventData.photoUrls?.length || 0
  } uploaded (not included in generation)
- Music: ${eventData.melodyUrl ? "Yes" : "No"}

🚨 LANGUAGE REQUIREMENT 🚨
${
  eventData.language === "казахский"
    ? `ALL TEXT MUST BE IN KAZAKH LANGUAGE ONLY!`
    : eventData.language === "русский"
    ? `ALL TEXT MUST BE IN RUSSIAN LANGUAGE ONLY!`
    : `ALL TEXT MUST BE IN ENGLISH LANGUAGE ONLY!`
}

📍 LOCATION ENHANCEMENT 📍
If the provided location appears generic or incomplete (like just "Almaty" or "restaurant"), enhance it with a realistic, specific venue:
- For restaurants: Add a real restaurant name and address
- For cities: Add a real venue (hotel, restaurant, park, etc.) with full address
- For Kazakhstan: Use real addresses in Almaty, Astana, Shymkent, etc.
- For Russia: Use real addresses in Moscow, St. Petersburg, etc.
- Make it sound authentic and professional

✨ CONTENT ENHANCEMENT ✨
- Fix any grammar or spelling errors in the original event name/details
- Create poetic, warm, and elegant descriptions
- Use ceremonial language appropriate for the event type
- Ensure all text flows naturally and sounds professional
- Add cultural context appropriate for the language/region

Return ONLY a JSON object with this exact structure:

Return ONLY a JSON object with this exact structure:
{
  "title": "[Enhanced, grammatically correct event title in ${
    eventData.language
  }]",
  "date": "${eventData.date}",
  "location": "[Enhanced specific venue with full address in ${
    eventData.language
  }]",
  "description": "[Warm, poetic invitation message in ${
    eventData.language
  } (50-120 words)]",
  "schedule": [
    {"time": "${eventData.time}", "event": "[Main ceremony/event name in ${
    eventData.language
  }]"}
  ],
  "photos": [],
  "rsvpText": "[Elegant RSVP button text in ${eventData.language}]",
  "eventId": "${eventId}",
  "eventType": "${eventData.type}"
}

ENHANCED GUIDELINES:
- Improve and perfect the original event name if needed (fix spelling, make it more elegant)
- Transform generic locations into specific, realistic venues with full addresses
- Create beautiful, heartfelt descriptions that capture the event's essence
- Use appropriate cultural references and traditions for the language/region
- Keep ALL schedule items with EXACT times as provided - do not change or omit any!
- If multiple schedule items are provided, include ALL of them in the response
- Use appropriate cultural references and traditions for the language/region
- For weddings: Include romantic, ceremonial language
- For birthdays: Include celebratory, joyful language
- For corporate events: Use professional yet warm language
- Add local cultural elements when appropriate

Guidelines:
- Create appropriate content for ${eventData.type} in ${eventData.language}
- Include warm, ceremonial language appropriate for the event type
- Keep description between 30-100 words
- Include realistic schedule times if multiple events
- Use formal, inviting tone

Guidelines:
- Create appropriate content for ${eventData.type} in ${eventData.language}
- Include warm, ceremonial language appropriate for the event type
- Keep description between 30-100 words
- Include realistic schedule times if multiple events
- Use formal, inviting tone

Return ONLY the JSON object, no markdown formatting.`;

  console.log(`🤖 Calling OpenAI API for invitation JSON generation...`);
  console.log(`📝 Prompt length: ${prompt.length} characters`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log(`⏰ OpenAI request timeout after 45 seconds`);
    controller.abort();
  }, 45000);

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
              "You are an expert content creator, event planner, and linguist specializing in beautiful, ceremonial invitations. You excel at improving grammar, enhancing locations with specific venues and addresses, and creating warm, culturally appropriate content. Always return valid JSON with enhanced, professional event content that sounds natural to native speakers.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`❌ OpenAI API error (${response.status}): ${errorBody}`);
      console.log(`🔄 Falling back to template JSON...`);
      return generateFallbackJSON(eventData, eventId);
    }

    console.log(`✅ OpenAI API response received (${response.status})`);

    const result = await response.json();
    console.log(`📝 OpenAI response processed, generating JSON...`);
    let jsonContent = result.choices[0].message.content || "";

    // Fallback JSON if OpenAI response is empty
    if (!jsonContent.trim()) {
      console.log(
        `⚠️ OpenAI returned empty response, using fallback template...`
      );
      jsonContent = generateFallbackJSON(eventData, eventId);
    }

    console.log(`✅ JSON content ready (${jsonContent.length} characters)`);

    // Clean up any markdown formatting
    jsonContent = jsonContent
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .replace(/^```/gm, "")
      .trim();

    // Validate JSON
    try {
      JSON.parse(jsonContent);
    } catch (parseError) {
      console.error(`❌ Invalid JSON from OpenAI:`, parseError);
      console.log(`🔄 Using fallback template due to invalid JSON...`);
      jsonContent = generateFallbackJSON(eventData, eventId);
    }

    return jsonContent;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      console.log(`⏰ OpenAI request was aborted due to timeout`);
    } else {
      console.error(`❌ OpenAI API error:`, error);
    }

    console.log(`🔄 Using fallback template due to error...`);
    return generateFallbackJSON(eventData, eventId);
  }
}

// Fallback JSON template function
function generateFallbackJSON(eventData: EventData, eventId: string): string {
  const languageContent = {
    русский: {
      description:
        "С большой радостью приглашаем вас разделить с нами этот особенный момент! Ваше присутствие сделает наш праздник еще более незабываемым и значимым.",
      rsvpText: "Подтвердить участие",
      mainEvent: "Основная церемония",
      secondEvent: "Банкет и развлечения",
    },
    казахский: {
      description:
        "Бізбен бірге осы ерекше сәтті бөлісуге шақырамыз! Сіздің қатысуыңыз біздің мерекемізді одан да есте қаларлық және мәнді етеді.",
      rsvpText: "Қатысуды растау",
      mainEvent: "Негізгі дәстүр",
      secondEvent: "Банкет және көңіл көтеру",
    },
    английский: {
      description:
        "We joyfully invite you to share this special moment with us! Your presence will make our celebration even more memorable and meaningful.",
      rsvpText: "Confirm Attendance",
      mainEvent: "Main Ceremony",
      secondEvent: "Reception and Celebration",
    },
  };

  // Enhance location if it's too generic
  const enhanceLocation = (location: string, language: string): string => {
    const lowerLoc = location.toLowerCase();

    // If location is just a city name, add a venue
    if (lowerLoc === "алматы" || lowerLoc === "almaty") {
      return language === "русский"
        ? "Отель Rixos Almaty, проспект Сейфуллина 506/99, Алматы"
        : language === "казахский"
        ? "Rixos Almaty қонақ үйі, Сейфуллин даңғылы 506/99, Алматы"
        : "Rixos Almaty Hotel, Seifullina Avenue 506/99, Almaty";
    }
    if (
      lowerLoc === "астана" ||
      lowerLoc === "нур-султан" ||
      lowerLoc === "astana"
    ) {
      return language === "русский"
        ? "Отель The Ritz-Carlton Astana, проспект Достык 5/1, Астана"
        : language === "казахский"
        ? "The Ritz-Carlton Astana қонақ үйі, Достық даңғылы 5/1, Астана"
        : "The Ritz-Carlton Astana, Dostyk Avenue 5/1, Astana";
    }
    if (lowerLoc === "москва" || lowerLoc === "moscow") {
      return language === "русский"
        ? "Отель Four Seasons Moscow, улица Охотный Ряд 2, Москва"
        : "Four Seasons Moscow Hotel, Okhotny Ryad Street 2, Moscow";
    }
    if (
      lowerLoc.includes("ресторан") &&
      !lowerLoc.includes("улица") &&
      !lowerLoc.includes("проспект")
    ) {
      return language === "русский"
        ? "Ресторан «Достар», проспект Абая 150/230, Алматы"
        : language === "казахский"
        ? "«Достар» мейрамханасы, Абай даңғылы 150/230, Алматы"
        : "Dostar Restaurant, Abai Avenue 150/230, Almaty";
    }

    return location; // Return original if already specific
  };

  const content =
    languageContent[eventData.language as keyof typeof languageContent] ||
    languageContent.русский;

  const fallbackData = {
    title: eventData.name,
    date: eventData.date,
    location: enhanceLocation(eventData.location, eventData.language),
    description: content.description,
    schedule:
      eventData.schedule && eventData.schedule.length > 0
        ? eventData.schedule.map((item) => ({
            time: item.time,
            event: item.event,
          }))
        : [
            {
              time: eventData.time,
              event: content.mainEvent,
            },
          ],
    photos: eventData.photoUrls || [],
    rsvpText: content.rsvpText,
    eventId: eventId,
    eventType: eventData.type,
  };

  return JSON.stringify(fallbackData, null, 2);
}
