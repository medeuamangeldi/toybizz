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

// Generate invitation JSON content using OpenAI
export async function generateInvitation(
  eventData: EventData,
  eventId: string
): Promise<string> {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    throw new Error("OpenAI API key not configured");
  }

  const prompt = `You are a world-class content creator. Create invitation CONTENT in JSON format (NOT HTML).

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

🚨 LANGUAGE REQUIREMENT 🚨
${
  eventData.language === "казахский"
    ? `ALL TEXT MUST BE IN KAZAKH LANGUAGE ONLY!`
    : eventData.language === "русский"
    ? `ALL TEXT MUST BE IN RUSSIAN LANGUAGE ONLY!`
    : `ALL TEXT MUST BE IN ENGLISH LANGUAGE ONLY!`
}

Return ONLY a JSON object with this exact structure:
{
  "title": "[Event title in ${eventData.language}]",
  "date": "${eventData.date}",
  "location": "${eventData.location}",
  "description": "[Warm invitation message in ${eventData.language}]",
  "schedule": [
    {"time": "${eventData.time}", "event": "[Main event name in ${
    eventData.language
  }]"},
    {"time": "[time]", "event": "[Optional second event in ${
      eventData.language
    }]"}
  ],
  "photos": ${eventData.photoUrls ? JSON.stringify(eventData.photoUrls) : "[]"},
  "rsvpText": "[RSVP button text in ${eventData.language}]",
  "eventId": "${eventId}"
}

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
              "You are an expert content creator specializing in beautiful, ceremonial invitations. Always return valid JSON with appropriate event content.",
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
      description: "Будем рады видеть вас на нашем особенном мероприятии!",
      rsvpText: "Подтвердить участие",
      mainEvent: "Основное мероприятие",
    },
    казахский: {
      description: "Біздің ерекше шарамызда көруге қуанамыз!",
      rsvpText: "Қатысуды растау",
      mainEvent: "Негізгі іс-шара",
    },
    английский: {
      description: "We would be delighted to see you at our special event!",
      rsvpText: "Confirm Attendance",
      mainEvent: "Main Event",
    },
  };

  const content =
    languageContent[eventData.language as keyof typeof languageContent] ||
    languageContent.русский;

  const fallbackData = {
    title: eventData.name,
    date: eventData.date,
    location: eventData.location,
    description: content.description,
    schedule: [
      {
        time: eventData.time,
        event: content.mainEvent,
      },
    ],
    photos: eventData.photoUrls || [],
    rsvpText: content.rsvpText,
    eventId: eventId,
  };

  return JSON.stringify(fallbackData, null, 2);
}
