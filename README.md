# InterviewPilot

AI-Powered Interview Simulator with resume-based interviews.

## Overview

InterviewPilot is a full-stack application using React + Vite frontend and Node.js + Express backend. It enables users to upload a resume, generate resume-specific interview questions, record text or voice answers, evaluate answers via AI, and save reports.

## Features

- User authentication with JWT
- PDF resume upload with validation
- Resume text extraction using `pdf-parse`
- AI provider abstraction for Groq and future providers
- Resume analysis and tailored interview question generation
- Interview flow with voice-to-text support
- Answer evaluation and report generation
- Reports page with PDF export

## Architecture

- `backend/`
  - `controllers/`: route logic
  - `models/`: Mongoose schemas
  - `routes/`: Express route definitions
  - `services/ai/`: AI integration providers
  - `middlewares/`: auth, upload, error handling
  - `validators/`: request validation

- `frontend/`
  - `src/api/`: API clients
  - `src/components/`: shared components
  - `src/contexts/`: auth and app state
  - `src/hooks/`: reusable hooks
  - `src/pages/`: UI screens
  - `src/styles/`: Tailwind CSS

## Setup

1. Copy `.env.example` to `backend/.env` and set environment variables.
2. Start backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3. Start frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Environment Variables

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `AI_PROVIDER`
- `GROQ_API_KEY`

## Notes

- The app is designed to add future interview modules without a major rewrite.
- The AI provider layer is abstracted so you can swap Groq for Gemini/OpenAI later.
