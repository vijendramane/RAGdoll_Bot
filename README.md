# RAGdoll Bot - E-commerce Chatbot System

A production-ready, intelligent e-commerce chatbot with RAG capabilities, real-time database integration, FAQ management, analytics dashboard, and modern AI aesthetics.

## 🚀 Features

✅ **Smart RAG System** - Retrieval-Augmented Generation with vector embeddings (Pinecone/In-memory)
✅ **Database Integration** - Connect MySQL, PostgreSQL, or MongoDB for real-time data
✅ **FAQ Management** - Upload, edit, and manage CSV, JSON, Excel, PDF, TXT files
✅ **Order ID Intelligence** - Automatically asks for order ID when needed
✅ **Analytics Dashboard** - Real-time insights into chat performance and usage
✅ **Modern AI UI** - Beautiful, gradient-based interface with animations
✅ **Voice Input** - Click microphone icon for voice-to-text
✅ **Source Citations** - Always cite sources in responses
✅ **Error Handling** - Comprehensive error handling and user feedback

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key (required for chat functionality)
- Pinecone account (optional - in-memory fallback available)
- MySQL, PostgreSQL, or MongoDB (optional - for real-time data)

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd RAGdoll_Bot

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend Environment (`backend/.env`)

Create a `backend/.env` file with your configuration:

```bash
# Core Settings
NODE_ENV=development
PORT=4000
JWT_SECRET=your-secret-key-change-this-in-production

# OpenAI API (Required for chat functionality)
OPENAI_API_KEY=sk-your-openai-api-key

# Pinecone Vector Database (Optional - will use in-memory fallback if not set)
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX=chatbotoms

# Redis (Optional - for caching responses)
REDIS_URL=redis://localhost:6379

# Database Connection (Optional - can be configured through admin panel)
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
```

#### Frontend Environment (`frontend/.env.local`)

Create a `frontend/.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

### 3. Start the Application

```bash
# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Start frontend
cd frontend
npm run dev
```

### 4. Access the Application

- **Chat Interface**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Database Setup**: http://localhost:3000/admin/setup-wizard
- **FAQ Manager**: http://localhost:3000/admin/faq-manager
- **Analytics**: http://localhost:3000/admin/analytics

## 📊 Pinecone Vector Database Setup (Optional but Recommended)

### If Using Pinecone:

1. **Sign up** at https://pinecone.io
2. **Create a new index** with these settings:
   - Name: `chatbotoms` (or your preferred name)
   - Dimension: 1536 (for OpenAI text-embedding-3-small)
   - Metric: cosine
3. **Get your API key** and add to environment variables
4. **Update PINECONE_INDEX** in `.env` to match your index name

### If Not Using Pinecone:
- The system automatically falls back to in-memory vector storage
- FAQ data persists only while the server is running
- For production use, Pinecone is recommended

## 🗄️ Database Setup Options

### Option 1: Use Admin Panel (Recommended)
1. Start the backend server
2. Navigate to `/admin/setup-wizard`
3. Follow the step-by-step configuration
4. Test connection and save configuration

### Option 2: Manual Configuration
1. Install your preferred database (MySQL, PostgreSQL, or MongoDB)
2. Create a database for the application
3. Add connection details to `backend/.env`
4. Ensure your database has these expected tables/collections:
   - `products` (id, name, sku, price, description, stock_quantity)
   - `orders` (id, status, total_amount, created_at, customer_email)
   - `order_items` (id, order_id, product_id, quantity, price)

## 🔧 Manual Directory Setup

The application automatically creates these directories, but if you encounter permission errors:

```bash
# Create directories manually with proper permissions
mkdir -p backend/uploads backend/data
chmod 755 backend/uploads backend/data
```

## 📋 Testing Your Setup

### 1. Verify Backend
http://localhost:4000 - Should return "Backend running"

### 2. Verify Frontend
http://localhost:3000 - Should load the chat interface

### 3. Test File Upload
- Navigate to `/admin/faq-manager`
- Upload a sample CSV, JSON, or PDF file
- Verify it appears in the file list

### 4. Test Database Connection
- Navigate to `/admin/setup-wizard`
- Configure and test your database connection

### 5. Test Chat Functionality
- Ask questions about your uploaded FAQ content
- Test order tracking: "Where is my order?" (should ask for order ID)
- Test product queries: "What products do you have?"

## 🐛 Common Issues and Solutions

### File Upload Fails
- Check if `backend/uploads/` directory exists and has write permissions
- Verify file size is under 10MB limit
- Check backend logs for specific error messages

### Database Connection Fails
- Verify database is running and accessible
- Check connection credentials in admin panel
- Ensure firewall allows connection from application
- Check database user has required permissions

### Chat Not Working
- Verify OpenAI API key is valid and has credits
- Check Pinecone configuration if using vector storage
- Review backend logs for error messages
- Test with simple questions first

### Admin Pages Not Loading
- Ensure backend server is running on port 4000
- Check frontend API URL configuration in `.env.local`
- Verify CORS is properly configured in backend

## 🚀 Production Deployment

### Using Docker (Recommended)
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment
1. Build frontend: `npm run build` in frontend directory
2. Set environment variables for production
3. Use process manager like PM2: `pm2 start backend/src/server.ts`
4. Configure reverse proxy (nginx/Apache) to serve both frontend and backend
5. Set up SSL certificates for HTTPS

## 🔒 Security Considerations

- Change default JWT_SECRET to a secure random string
- Use HTTPS in production
- Sanitize all user inputs
- Implement rate limiting (already configured)
- Keep API keys secure and rotate regularly
- Use environment-specific database credentials
- Enable database connection encryption
- Regularly update dependencies

## 📈 Monitoring and Maintenance

- Check backend logs regularly for errors
- Monitor OpenAI API usage and costs
- Backup database regularly
- Monitor disk space for uploads directory
- Update FAQ content as business needs change
- Review analytics dashboard for usage patterns

## 🏗️ Project Structure

```
RAGdoll_Bot/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── analytics/    # Analytics service
│   │   │   ├── chat/         # Chat logic with RAG
│   │   │   ├── faq/          # FAQ processing and management
│   │   │   └── rag/          # Vector DB and embedding services
│   │   ├── config/           # Database, OpenAI, vector DB configs
│   │   ├── adapters/         # Database adapters (MySQL, PostgreSQL, MongoDB)
│   │   └── routes/           # API routes
│   ├── data/                 # Database configs and analytics data
│   ├── uploads/              # Temporary file storage
│   └── .env                  # Environment variables
├── frontend/
│   ├── pages/
│   │   ├── admin/            # Admin dashboard pages
│   │   ├── api/proxy/        # API proxy routes
│   │   └── chat.tsx          # Main chat interface
│   ├── components/           # React components
│   └── .env.local            # Frontend environment variables
└── shared/
    └── types/                # Shared TypeScript types
```

## 🎯 Usage Tips

### For Best Results:
1. **Upload Quality FAQs** - Use structured FAQ documents with clear Q&A pairs
2. **Configure Database** - Connect your product database for real-time order/product queries
3. **Monitor Analytics** - Regularly check the analytics dashboard for usage insights
4. **Update Content** - Keep FAQ content current with latest business information
5. **Order ID Feature** - The bot automatically asks for order IDs when discussing orders/payments/refunds

### Advanced Features:
- **Voice Input** - Click the microphone icon for voice-to-text input
- **File Editing** - Edit uploaded FAQ content directly in the admin panel
- **Real-time Analytics** - Monitor chat performance with live updates
- **Source Citations** - Bot always cites its sources for transparency

## 📞 Support

If you encounter any issues:

1. Check this README for common solutions
2. Review the admin analytics for error patterns
3. Check browser console and backend logs
4. Ensure all environment variables are properly configured

---

**Built with ❤️ using Next.js, Node.js, TypeScript, OpenAI, and modern web technologies.**  

