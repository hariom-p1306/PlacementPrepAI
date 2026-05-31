# PlacementPrep AI 🚀

PlacementPrep AI is an AI-powered placement preparation platform built to help students practice interviews, analyze resumes, generate personalized learning roadmaps, and track preparation progress through an intelligent dashboard.

The platform combines AI interview evaluation, ATS-style resume analysis, coding practice support, progress tracking, and career preparation tools in one production-ready web application.

---

## 🔗 Live Demo

**Live App:** https://placement-prep-ai-eight.vercel.app
**GitHub Repository:** https://github.com/hariom-p1306/PlacementPrepAI

---

## 🎯 Project Objective

Many students prepare for placements using separate tools for resumes, interviews, coding practice, and progress tracking. PlacementPrep AI solves this problem by providing a single platform where students can:

* Practice HR, technical, and DSA interviews
* Get AI-generated feedback on answers
* Analyze resumes for ATS and role-specific improvements
* Generate personalized preparation roadmaps
* Track weak areas, scores, and learning progress
* Improve consistency through dashboard-based progress tracking

---

## ✨ Key Features

### 🤖 AI Interview Practice

* Supports HR, DBMS, OOPS, DSA, and technical interview questions
* Generates interview questions based on selected topic and difficulty
* Evaluates candidate answers using AI
* Provides score, strengths, weaknesses, improvement tips, and ideal answers
* Includes timer-based interview session experience

### 📄 Resume Analyzer

* Supports PDF and text resume upload
* Extracts resume content from uploaded files
* Analyzes resume for selected target roles
* Provides overall score, ATS match score, skills match, and keyword match
* Suggests missing skills and improvement points
* Generates role-specific resume feedback

### 📊 Progress Dashboard

* Tracks total interview attempts
* Shows average interview score
* Displays resume ATS score
* Identifies weak areas from interview and resume analysis
* Shows recent activity and preparation progress
* Uses Redis/Upstash for fast progress tracking

### 🧠 AI Roadmap Generator

* Generates personalized preparation roadmaps
* Helps students focus on missing skills
* Provides structured next steps for improvement

### 💬 AI Mentor

* Acts as a placement preparation mentor
* Helps students with guidance, learning direction, and career preparation

### 📝 Cover Letter Generator

* Generates role-specific cover letters
* Helps students apply for internships and full-time roles

### ⚙️ Coding Practice Support

* Includes DSA-based interview preparation
* Integrated code execution setup using Judge0
* Supports coding practice and AI-based review workflow

---

## 🛠️ Tech Stack

| Category                  | Technology                               |
| ------------------------- | ---------------------------------------- |
| Frontend                  | Next.js, React, TypeScript, Tailwind CSS |
| Backend                   | Next.js API Routes                       |
| AI Integration            | Groq LLM API                             |
| Authentication            | Clerk                                    |
| Database                  | PostgreSQL, Prisma                       |
| Cache / Progress Tracking | Redis, Upstash                           |
| Code Execution            | Judge0                                   |
| State Management          | Zustand                                  |
| Charts / Analytics        | Recharts                                 |
| Resume Parsing            | PDF.js                                   |
| Deployment                | Vercel                                   |
| Containerization          | Docker                                   |
| Version Control           | Git, GitHub                              |

---

## 🏗️ System Architecture

PlacementPrep AI follows a modular full-stack architecture where the frontend, backend APIs, AI services, Redis tracking layer, and database work together to provide a real-time placement preparation experience.

```txt
User / Student
     ↓
Next.js Frontend
     ↓
Next.js API Routes
     ↓
AI Provider API
     ↓
Redis / Upstash Progress Tracking
     ↓
PostgreSQL + Prisma
     ↓
Dashboard Analytics
```

### Architecture Diagram

```mermaid
flowchart TD
    A[User / Student] --> B[Next.js Frontend]
    B --> C[Next.js API Routes]

    C --> D[AI Interview Evaluation API]
    C --> E[Resume Analyzer API]
    C --> F[Roadmap Generator API]
    C --> G[AI Mentor API]
    C --> H[Cover Letter API]

    D --> I[Groq LLM API]
    E --> I
    F --> I
    G --> I
    H --> I

    D --> J[Redis / Upstash]
    E --> J

    J --> K[Progress Tracking]
    K --> L[Dashboard Analytics]

    C --> M[Prisma ORM]
    M --> N[PostgreSQL Database]

    L --> B
```

---

## 📌 Major Modules

### 1. Interview Module

The interview module allows users to practice placement-style interviews. It supports multiple interview categories and evaluates answers using AI.

**Core functionalities:**

* Question generation
* Topic and difficulty selection
* Timer-based session
* Voice input support
* AI answer evaluation
* Score calculation
* Strengths and weaknesses detection
* Ideal answer generation

---

### 2. Resume Analyzer Module

The resume analyzer helps students improve their resumes before applying to internships and jobs.

**Core functionalities:**

* PDF and text resume upload
* Resume text extraction
* ATS-style scoring
* Skills match calculation
* Keyword match calculation
* Role-specific feedback
* Missing skills detection
* Improvement suggestions

---

### 3. Dashboard Module

The dashboard tracks real preparation progress using Redis/Upstash.

**Core functionalities:**

* Total interviews tracking
* Average score tracking
* Resume ATS score tracking
* Weak area detection
* Recent activity history
* Preparation streak UI
* Progress visualization

---

### 4. Roadmap Module

The roadmap module generates personalized learning paths based on the user’s goal or missing skills.

---

### 5. AI Mentor Module

The AI Mentor helps users with career guidance, placement strategy, and learning direction.

---

### 6. Cover Letter Module

The cover letter generator creates professional role-specific cover letters for internship and job applications.

---

## 🚀 Production-Level Improvements Implemented

* Redis/Upstash integration for progress tracking
* Production-safe Redis connection handling
* Timeout handling for AI evaluation APIs
* Background save logic for interview progress
* Dashboard fallback response to prevent UI crash
* Vercel deployment with environment variables
* Secure environment variable handling
* PDF resume parsing support
* API route separation for modular backend logic
* Build issue fixes for production deployment
* Docker setup for local services
* Judge0 setup for code execution workflow

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```env
GROQ_API_KEY="your_groq_api_key"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"

DATABASE_URL="your_postgresql_database_url"
REDIS_URL="your_redis_or_upstash_url"
```

For local Redis using Docker:

```env
REDIS_URL="redis://localhost:6379"
```

For Upstash Redis in production:

```env
REDIS_URL="rediss://default:your_token@your-upstash-host.upstash.io:6379"
```

> Do not push `.env` or `.env.local` files to GitHub.

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/hariom-p1306/PlacementPrepAI.git
cd PlacementPrepAI/my-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env.local` file and add the required API keys and database URLs.

### 4. Start Redis and PostgreSQL using Docker

```bash
docker compose up -d redis postgres
```

### 5. Generate Prisma client

```bash
npx prisma generate
```

### 6. Run the development server

```bash
npm run dev
```

The app will run on:

```txt
http://localhost:3000
```

---

## 🧪 Useful API Routes

| Route                     | Purpose                          |
| ------------------------- | -------------------------------- |
| `/api/interview/generate` | Generates interview questions    |
| `/api/interview/evaluate` | Evaluates interview answers      |
| `/api/resume/analyze`     | Analyzes resume content          |
| `/api/dashboard`          | Fetches progress dashboard data  |
| `/api/roadmap`            | Generates learning roadmap       |
| `/api/mentor`             | AI mentor guidance               |
| `/api/cover-letter`       | Generates cover letters          |
| `/api/redis-test`         | Tests Redis connection           |
| `/api/debug/redis`        | Debugs Redis keys and connection |

---

## 📊 Dashboard Tracking Flow

```txt
Interview / Resume Action
        ↓
Next.js API Route
        ↓
AI Evaluation / Resume Analysis
        ↓
Save Result in Redis / Upstash
        ↓
Dashboard API Reads Progress
        ↓
User Sees Updated Analytics
```

---

## 📁 Folder Structure

```txt
my-app
├── prisma
│   └── schema.prisma
├── public
│   └── pdfjs
├── src
│   ├── app
│   │   ├── api
│   │   │   ├── interview
│   │   │   ├── resume
│   │   │   ├── dashboard
│   │   │   ├── roadmap
│   │   │   ├── mentor
│   │   │   └── cover-letter
│   │   ├── interview
│   │   ├── resume
│   │   ├── roadmap
│   │   └── mentor
│   ├── components
│   ├── data
│   ├── features
│   ├── hooks
│   └── lib
│       ├── groq.ts
│       ├── prisma.ts
│       ├── redis.ts
│       └── progress.ts
├── docker-compose.yml
├── package.json
└── README.md
```

---

## 💡 What I Learned

While building PlacementPrep AI, I worked on several real-world engineering concepts:

* Building full-stack applications with Next.js and TypeScript
* Creating backend APIs using Next.js API routes
* Integrating LLM APIs for AI-powered features
* Handling production deployment issues on Vercel
* Using Redis/Upstash for fast progress tracking
* Using Prisma and PostgreSQL for structured data storage
* Managing environment variables securely
* Debugging production build errors
* Handling timeout and fallback logic in APIs
* Structuring a scalable project for real-world users

---

## 🔮 Future Improvements

* User-wise progress tracking using Clerk user ID
* Permanent interview and resume history in PostgreSQL
* BullMQ-based background job processing
* GitHub Actions CI/CD pipeline
* Sentry error monitoring
* Rate limiting for AI APIs
* Advanced resume keyword comparison with job descriptions
* More DSA practice problems with difficulty filters
* Admin dashboard for analytics
* Downloadable interview and resume reports

---

## 👨‍💻 Author

**Hariom Patel**
Full Stack Developer | MERN Stack | Next.js | TypeScript | AI Projects | DSA

* GitHub: https://github.com/hariom-p1306
* LinkedIn: https://www.linkedin.com/in/hariom-patel-dev
* Portfolio: https://future-fs-01-ten-ashen.vercel.app/

---

## ⭐ Show Your Support

If you like this project, consider giving it a star on GitHub.

```txt
Built with dedication for placement preparation and real-world full-stack learning.
```
