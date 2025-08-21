# Vercel Deployment Guide

## 🚀 Deploy to Vercel

### 1. Prepare Environment Variables

In your Vercel dashboard, add these environment variables:

```bash
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your_production_secret
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
NODE_ENV=production
```

### 2. Deploy

```bash
# Connect to Vercel (if not done already)
npx vercel

# Deploy
git add .
git commit -m "Ready for production"
git push

# Or deploy directly
npx vercel --prod
```

### 3. Set Webhook (After Deployment)

Replace `YOUR_BOT_TOKEN` and `YOUR_VERCEL_URL` with your actual values:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://YOUR_VERCEL_URL.vercel.app/api/webhook"}'
```

### 4. Test

1. Visit your deployed website
2. Click the Telegram bot link
3. Send `/start` to test the bot
4. Create an invitation and verify it works

## 🔄 Development vs Production

### Development (Local)

- **Bot Mode**: Polling (long-running process)
- **Start**: `npm run start:dev`
- **Bot runs**: Continuously in terminal

### Production (Vercel)

- **Bot Mode**: Webhook (serverless)
- **Start**: Automatic on deployment
- **Bot responds**: Only when receiving messages

## 📁 File Structure (Production)

```
public/
├── invitations/          # Generated HTML files (created by bot)
│   └── event_123_456.html
└── js/
    └── form-handler.js   # Registration form logic

data/                     # Registration files (created by bot)
└── event_123_456_registrations.txt
```

## 🐛 Troubleshooting

### Bot not responding in production:

1. Check environment variables in Vercel dashboard
2. Verify webhook URL is set correctly
3. Check function logs in Vercel dashboard

### HTML invitations not found:

1. Ensure `/api/webhook` endpoint is working
2. Check if OpenAI API key is valid
3. Verify file permissions in production

### Registration form not working:

1. Check `/api/register` endpoint
2. Verify `form-handler.js` is loading correctly
3. Check browser console for JavaScript errors
