<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Toybiz - Telegram Event Invitation Bot

This is a Next.js TypeScript project that runs a Telegram bot for creating event invitations (weddings, parties, etc.).

## Project Architecture

- **Next.js 15** with App Router and TypeScript
- **Telegram Bot API** for user interactions
- **OpenAI API** for generating HTML invitation templates
- **File-based storage** for user registrations
- **Tailwind CSS** for styling

## Key Features

1. Telegram bot that collects event details from users
2. AI-generated HTML invitations with custom styling
3. Registration forms embedded in invitations
4. File-based storage for guest registrations
5. Admin commands for checking registration counts

## Code Style Guidelines

- Use TypeScript with strict type checking
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Implement proper error handling for bot interactions
- Use environment variables for sensitive data (BOT_TOKEN, OPENAI_API_KEY)
