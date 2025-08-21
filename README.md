# ToyBiz - Telegram Event Invitation Bot

A Next.js application that runs a Telegram bot for creating beautiful event invitations (weddings, parties, etc.) with AI-generated HTML templates.

## 🚀 Quick Start

1. **Visit the website:** [http://localhost:3000](http://localhost:3000)
2. **Open Telegram bot:** [@toybizz_bot](https://t.me/toybizz_bot)
3. **Send `/start`** to the bot
4. **Follow the simple steps** to create your invitation
5. **Share the generated link** with your guests

## How It Works

1. **Chat with the bot** - Tell it about your event (wedding, birthday, etc.)
2. **Provide details** - Name, date, time, location, description
3. **Add photos/videos** - Optional media to make it special
4. **AI creates HTML** - Beautiful, responsive invitation page
5. **Get shareable link** - `http://localhost:3000/invitations/your-event-id`
6. **Track guests** - Built-in registration form and analytics

## Bot Commands

- `/start` - Welcome message and instructions
- `/create` - Create a new event invitation
- `/stats <event_id>` - View registration statistics
- `/list <event_id>` - Get list of registered guests
- `/help` - Show help information

## Features

- 🤖 **Simple Telegram Interface** - No complex forms, just chat
- 🎨 **AI-Generated Design** - Beautiful, unique invitations via OpenAI
- 📱 **Mobile Responsive** - Perfect on all devices
- 📝 **Guest Registration** - Embedded RSVP forms
- 📊 **Real-time Analytics** - Track who's coming
- 🇷🇺 **Russian Language** - Fully localized

## Setup for Developers

### Prerequisites

- Node.js 18+
- Telegram Bot Token from [@BotFather](https://t.me/BotFather)
- OpenAI API Key from [OpenAI Platform](https://platform.openai.com/)

### Environment Variables

Create `.env.local`:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
OPENAI_API_KEY=your_openai_api_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
```

### Installation & Run

```bash
# Install dependencies
npm install

# Development (recommended)
npm run start:dev     # Runs both Next.js + Bot in polling mode

# Or run separately:
npm run dev          # Next.js server only
npm run bot:dev      # Telegram bot only (polling mode)

# Production setup (for Vercel)
npm run build        # Builds app + sets webhook
npm start            # Runs Next.js (bot works via webhook)
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── webhook/route.ts      # Telegram webhook (optional)
│   │   └── register/route.ts     # Guest registration
│   ├── invitations/[eventId]/
│   │   └── page.tsx              # Display generated invitations
│   └── page.tsx                  # Simple landing page
├── lib/
│   └── bot.ts                    # Telegram bot logic & OpenAI integration
public/
├── invitations/                  # Generated HTML files (created by bot)
└── js/form-handler.js           # Interactive registration forms
data/                             # Guest registration files
```

## Example Workflow

1. User chats with [@toybizz_bot](https://t.me/toybizz_bot)
2. Bot collects: event type, name, date, time, location, description
3. User uploads photos/videos (optional)
4. Bot calls OpenAI to generate beautiful HTML
5. HTML saved to `public/invitations/event_123456_userid.html`
6. Bot returns link: `http://localhost:3000/invitations/event_123456_userid`
7. Guests visit link, see invitation, fill registration form
8. Registration data saved to `data/event_123456_userid_registrations.txt`
9. User can check `/stats` and `/list` anytime

## Technologies

- **Next.js 15** - React framework
- **Grammy** - Telegram bot framework
- **OpenAI** - AI-generated HTML templates
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## License

MIT License
