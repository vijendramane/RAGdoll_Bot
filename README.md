# Chatbot System

A production-ready, modular e-commerce chatbot with RAG, real-time database integration, FAQ management, and voice input.

## Quick Start

See **[QUICK_START.md](./QUICK_START.md)** for a 5-minute setup guide.

### Quick Commands

```bash
# Install dependencies
cd backend && npm install 
cd frontend && npm install 

# Start backend (Terminal 1)
cd backend && npm run dev

# Start frontend (Terminal 2)
cd frontend && npm run dev
```

##Access admin panel
Open your browser: `http://localhost:3000/admin/setup-wizard`


## Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes
- **[DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md)** - Connect your database for real-time data
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions

## Project Structure

- `frontend/`: Next.js 14 UI (chat widget + admin panel)
- `backend/`: Node.js + Express + TypeScript API
- `shared/`: Shared types and constants

## Features

✅ **Modern Claude-like UI** - Professional, user-friendly chat interface  
✅ **RAG System** - Retrieval-Augmented Generation with vector embeddings  
✅ **FAQ Management** - Upload CSV, JSON, Excel, PDF, TXT files  
✅ **Voice Input** - Click microphone icon for voice-to-text  
✅ **Database Integration** - Connect MySQL, PostgreSQL, or MongoDB  
✅ **Real-time Data** - Fetch live product, order, and inventory data  
✅ **Source Citations** - Always cite sources in responses  
✅ **Smart Clarification** - Shows options when confidence is low  

