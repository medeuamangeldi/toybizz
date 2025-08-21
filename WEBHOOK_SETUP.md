# Webhook Setup Instructions

## For Development (Using ngrok)

1. Install ngrok: https://ngrok.com/download
2. Start your development server: `npm run dev`
3. In another terminal, start ngrok: `ngrok http 3000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Set your bot webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://abc123.ngrok.io/api/webhook"}'
```

## For Production

1. Deploy your app to Vercel/Netlify/etc.
2. Get your production URL (e.g., `https://yourapp.vercel.app`)
3. Set webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://yourapp.vercel.app/api/webhook"}'
```

## Alternative: Polling Mode (Development)

If you don't want to set up webhooks, the bot script (`npm run bot`) runs in polling mode automatically and doesn't require webhook setup.

## Check Webhook Status

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

## Remove Webhook (switch to polling)

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook"
```
