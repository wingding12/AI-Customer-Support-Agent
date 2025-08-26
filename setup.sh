#!/bin/bash

# Aven AI Customer Support Setup Script

echo "============================================"
echo "  Aven AI Customer Support Setup"
echo "============================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cat > .env.local << 'EOF'
# OpenAI Configuration
OPENAI_API_KEY=

# Pinecone Configuration
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX_NAME=aven-knowledge-base

# Vapi Configuration
VAPI_API_KEY=
NEXT_PUBLIC_VAPI_PUBLIC_KEY=
NEXT_PUBLIC_VAPI_ASSISTANT_ID=

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
EOF
    echo "✅ Created .env.local file"
    echo "⚠️  Please edit .env.local and add your API keys"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "📋 Setup Instructions:"
echo "------------------------"
echo "1. Edit .env.local and add your API keys:"
echo "   - OpenAI API Key"
echo "   - Pinecone API Key"
echo "   - Vapi API Keys"
echo ""
echo "2. Install dependencies:"
echo "   npm install"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "4. Initialize the knowledge base:"
echo "   - Visit http://localhost:3000?admin=true"
echo "   - Click on the 'Admin' tab"
echo "   - Click 'Initialize Knowledge Base'"
echo ""
echo "5. Start using the app:"
echo "   - Visit http://localhost:3000"
echo ""
echo "============================================"
echo "Happy coding! 🚀"
