#!/bin/bash

echo "🎉 Setting up ToyBiz Event Invitation Bot"
echo "=========================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📄 Creating .env.local file from template..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env.local and add your API keys:"
    echo "   - TELEGRAM_BOT_TOKEN (get from @BotFather)"
    echo "   - OPENAI_API_KEY (get from OpenAI Platform)"
    echo ""
else
    echo "✅ .env.local already exists"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p data
mkdir -p public/invitations
mkdir -p public/uploads
echo "✅ Directories created"

echo ""
echo "🚀 Setup complete! Next steps:"
echo "1. Edit .env.local with your API keys"
echo "2. Run 'npm run dev:all' to start both servers"
echo "3. Test your bot by sending /start"
echo ""
echo "Need help? Check the README.md file!"
