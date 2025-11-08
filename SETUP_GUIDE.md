# Setup Guide

## 1. Prerequisites Installation
- Node.js 20+
- Redis
- Database (MySQL, PostgreSQL, or MongoDB)

## 2. Environment Setup
- Copy `.env.example` files:
  - Backend: copy `backend/.env.example` to `backend/.env`
  - Frontend: copy `frontend/.env.local.example` to `frontend/.env.local`
- Add OpenAI and Pinecone API keys
- Configure database credentials

## 3. Database Connection
- Run setup wizard:
```bash
npm run setup
```
- Follow on-screen prompts
- Test connection
- Map tables (products, orders, users)

## 4. FAQ Upload
- Access admin panel: `/admin/faq-manager`
- Upload FAQ file (CSV/JSON/Excel/PDF/TXT)
- Review auto-categorization
- Edit and publish

## 5. Widget Integration
- Copy embed code from Admin > Settings > Widget
- Paste before `</body>` tag on your site
- Customize colors and position
- Test on staging

## 6. Go Live
- Deploy with Docker Compose or your infra
- Monitor analytics dashboard
- Review conversations weekly
- Update FAQs based on gaps

