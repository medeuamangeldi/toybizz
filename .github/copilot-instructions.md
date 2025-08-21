<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Toybiz - Web-based Event Invitation Creator

This is a Next.js TypeScript project that provides a web interface for creating event invitations (weddings, parties, etc.).

## Project Architecture

- **Next.js 15** with App Router and TypeScript
- **Web Interface** for user interactions
- **OpenAI API** for generating HTML invitation templates
- **GridFS** for file storage (photos and melodies)
- **Tailwind CSS** for styling

## Key Features

1. Web interface that collects event details from users
2. AI-generated HTML invitations with custom styling
3. Registration forms embedded in invitations
4. GridFS storage for guest registrations and uploaded files
5. Payment system with subscription options

## Code Style Guidelines

- Use TypeScript with strict type checking
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Implement proper error handling for web interactions
- Use environment variables for sensitive data (OPENAI_API_KEY, MONGODB_URI)
