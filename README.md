# Aven AI Customer Support Agent

An intelligent AI customer support agent for Aven, a fintech company specializing in credit card solutions and debt management. This application features both text and voice chat capabilities powered by Vapi, OpenAI, and Pinecone vector database.

## Features

- **Voice & Text Chat**: Interact with the AI assistant through both voice (powered by Vapi) and text interfaces
- **RAG System**: Retrieval-Augmented Generation using Pinecone vector database for accurate, context-aware responses
- **Comprehensive Knowledge Base**: Pre-loaded information about Aven's products, services, and policies
- **Modern UI**: Beautiful, responsive interface built with Next.js, Tailwind CSS, and Framer Motion
- **Real-time Voice Transcription**: Live speech-to-text and text-to-speech capabilities
- **Admin Dashboard**: Knowledge base management interface for initializing and updating vector embeddings

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI/ML**: OpenAI GPT-4, Vapi Voice AI, Pinecone Vector Database
- **State Management**: Zustand
- **UI Components**: Shadcn/ui, Radix UI
- **Animations**: Framer Motion
- **Backend**: Next.js API Routes, Server Actions

## Prerequisites

Before you begin, you'll need API keys from:

1. **OpenAI** - For embeddings and chat completions ([Get API Key](https://platform.openai.com/api-keys))
2. **Pinecone** - For vector database storage ([Sign up free](https://www.pinecone.io))
3. **Vapi** - For voice assistant capabilities ([Get Started](https://vapi.ai))

## Setup Instructions

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-repo/voice-ai-customer-support.git
cd voice-ai-customer-support

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory with your API keys:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX_NAME=aven-knowledge-base

# Vapi Configuration
VAPI_API_KEY=your_vapi_api_key_here
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key_here
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Set up Pinecone Index

1. Log into your [Pinecone Console](https://app.pinecone.io)
2. Create a new index with:
   - Name: `aven-knowledge-base`
   - Dimensions: `1536` (for OpenAI embeddings)
   - Metric: `cosine`
   - Cloud: `AWS`
   - Region: `us-west-2`

### 4. Set up Vapi Assistant

1. Log into your [Vapi Dashboard](https://dashboard.vapi.ai)
2. Create a new assistant with the configuration provided in `src/lib/vapi.ts`
3. Copy the Assistant ID to your `.env.local` file

### 5. Initialize the Knowledge Base

```bash
# Start the development server
npm run dev
```

1. Open [http://localhost:3000?admin=true](http://localhost:3000?admin=true)
2. Navigate to the "Admin" tab
3. Click "Initialize Knowledge Base" to populate Pinecone with Aven data

### 6. Start Using the Application

Visit [http://localhost:3000](http://localhost:3000) to start interacting with the AI assistant!

## Usage

### Text Chat

- Type your questions in the input field
- Press Enter or click Send to submit
- View AI responses with relevant context from the knowledge base

### Voice Chat

- Click "Start Voice" to begin a voice conversation
- Speak naturally - the assistant will respond verbally
- Click "End Call" to stop the voice session
- Use the mute button to temporarily disable your microphone

### Admin Panel

Access the admin panel at `http://localhost:3000?admin=true` to:

- Initialize or update the knowledge base
- View vector database statistics
- Manage system configurations

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chat/         # Text chat endpoint
│   │   ├── knowledge/    # Knowledge base management
│   │   ├── vapi/        # Vapi webhooks
│   │   └── voice/       # Voice call management
│   └── page.tsx          # Main application page
├── components/            # React components
│   ├── chat/            # Chat interface components
│   ├── admin/           # Admin dashboard components
│   └── ui/              # Shadcn UI components
├── data/                 # Aven knowledge base data
├── lib/                  # Core libraries
│   ├── embeddings.ts    # OpenAI embeddings
│   ├── pinecone.ts     # Pinecone integration
│   ├── rag.ts          # RAG implementation
│   └── vapi.ts         # Vapi voice integration
└── stores/              # Zustand state management
```

## API Endpoints

- `POST /api/chat` - Process text chat messages
- `POST /api/knowledge/init` - Initialize knowledge base
- `POST /api/knowledge/search` - Search knowledge base
- `POST /api/vapi/webhook` - Vapi webhook handler
- `POST /api/voice/start` - Start voice call

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Format code
npm run format
```

## Deployment

The application can be deployed to any platform that supports Next.js:

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

- AWS Amplify
- Netlify
- Railway
- Self-hosted with Node.js

## Troubleshooting

### Common Issues

1. **"API Key not configured" errors**

   - Ensure all environment variables are set correctly
   - Restart the development server after adding `.env.local`

2. **Voice not working**

   - Check browser permissions for microphone access
   - Ensure Vapi credentials are correct
   - Verify HTTPS is enabled in production

3. **Knowledge base empty**
   - Run the initialization from the admin panel
   - Check Pinecone API key and environment settings
   - Verify OpenAI API key has sufficient credits

## License

This project is proprietary and confidential.

## Support

For issues or questions about the implementation, please contact the development team.

---

Built with ❤️ for Aven customers
