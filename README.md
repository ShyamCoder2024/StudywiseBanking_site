# StudyWiseBanking

AI-Driven Banking Exam Preparation Platform

## Overview

StudyWiseBanking is a mobile-first, AI-assisted test and performance analysis platform for Indian banking exam aspirants.

## Features

- **Student Portal**: Dashboard, Subject navigation, Quiz engine, AI-powered results
- **Admin Panel**: Complete CRUD for subjects, topics, quizzes, and questions
- **AI Integration**: Gemini-powered descriptive answer analysis
- **Authentication**: JWT-based auth with OTP password recovery

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **AI**: Google Gemini API

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key (optional for AI features)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd Studywise_Banking

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### Configuration

1. Create `.env` in `backend/` (copy from `.env.example`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/studywisebanking
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key
```

2. Create `.env` in `frontend/` (optional):
```
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Create Admin User

Run in MongoDB shell or Compass:
```javascript
db.users.insertOne({
  firstName: "Admin",
  lastName: "User",
  email: "admin@studywisebanking.com",
  mobile: "9999999999",
  password: "$2a$10$...", // bcrypt hash of your password
  gender: "other",
  age: 30,
  status: "other",
  role: "admin"
})
```

## Project Structure

```
Studywise_Banking/
├── frontend/               # React Vite app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context (Auth)
│   │   ├── services/       # API services
│   │   └── styles/         # Design system CSS
│   └── ...
├── backend/                # Express API
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, error handling
│   │   └── services/       # AI service
│   └── ...
└── README.md
```

## Design System

- **Primary Color**: #8A75BA (Purple)
- **Success**: #6EBCC3 (Green)
- **Warning**: #ED6771 (Coral)
- **Background**: #F8F9FA
- **Font**: Inter, system-ui

## License

MIT
# Force redeploy
