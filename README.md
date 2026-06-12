# PlacementPrep AI 🚀

PlacementPrep AI is an AI-powered placement preparation platform built to help students practice interviews, analyze resumes, improve coding preparation, generate personalized roadmaps, and track preparation progress from one dashboard.

The platform combines AI interview evaluation, ATS-style resume analysis, coding practice support, AWS S3 resume storage, Redis caching, PostgreSQL persistence, and career preparation tools in one full-stack web application.

---

## 🔗 Live Demo

**Live App:** https://placement-prep-ai-ft14.vercel.app/
**GitHub Repository:** https://github.com/hariom-p1306/PlacementPrepAI

---

## 🎯 Project Objective

Students usually prepare for placements using separate tools for interviews, resumes, coding practice, roadmaps, and progress tracking. PlacementPrep AI solves this problem by providing a single platform where students can:

* Practice HR, technical, DBMS, OOPS, and DSA interviews
* Get AI-generated feedback on interview answers
* Analyze resumes for ATS and role-specific improvements
* Upload resumes securely using AWS S3 presigned uploads
* Practice coding-style interview questions
* Generate personalized learning roadmaps
* Track interview scores, resume feedback, weak areas, and recent activity
* Improve placement readiness through AI-powered guidance

---

## ✨ Key Features

### 🤖 AI Interview Practice

* Supports HR, DBMS, OOPS, DSA, and technical interview questions
* Generates interview questions based on selected topic and difficulty
* Evaluates candidate answers using AI
* Provides score, strengths, weaknesses, improvement tips, and ideal answers
* Includes timer-based interview session experience
* Supports voice input for answer practice
* Saves interview sessions and feedback for progress tracking

---

### 📄 Resume Analyzer

* Supports PDF and text resume upload
* Extracts resume content from uploaded files
* Uploads resume files securely to AWS S3 using presigned URLs
* Analyzes resumes for selected target roles
* Provides overall score, ATS match score, skills match, and keyword match
* Suggests missing skills and improvement points
* Generates role-specific resume feedback
* Stores resume analysis history using PostgreSQL and Prisma

---

### ☁️ AWS S3 Resume Storage

PlacementPrep AI uses AWS S3 for secure cloud-based resume storage.

**Upload Flow:**

```txt
User selects resume file
        ↓
Frontend requests presigned URL
        ↓
Next.js API authenticates user with Clerk
        ↓
Backend generates AWS S3 presigned upload URL
        ↓
Frontend uploads file directly to private S3 bucket
        ↓
S3 key is stored/used for resume workflow
```

**Why this approach is secure:**

* AWS credentials are never exposed to the frontend
* Files are uploaded to a private S3 bucket
* Upload URLs are temporary and time-limited
* IAM policy follows limited S3 bucket access

---

### 📊 Progress Dashboard

* Tracks total interview attempts
* Shows average interview score
* Displays resume ATS score
* Identifies weak areas from interview and resume analysis
* Shows recent activity and preparation progress
* Uses PostgreSQL for persistent history
* Uses Redis for faster repeated AI workflows and caching
* Includes fallback handling to prevent dashboard crashes

---

### 🧠 AI Roadmap Generator

* Generates personalized preparation roadmaps
* Creates structured step-by-step learning paths
* Helps students focus on missing skills
* Supports goal-based roadmap generation

---

### 💬 AI Mentor

* Acts as a placement preparation mentor
* Helps students with DSA, resume, interview, project, and career guidance
* Provides practical answers for fresher-level preparation
* Supports chat-style interaction

---

### 📝 Cover Letter Generator

* Generates role-specific cover letters
* Supports different tones and job descriptions
* Helps students apply for internships and full-time roles

---

### ⚙️ Coding Practice Support

* Includes DSA-based coding interview preparation
* Supports coding-style interview questions
* Provides AI-based answer/code feedback workflow
* Designed to support future queue-based code execution and analytics

---

## 🛠️ Tech Stack

| Category             | Technology                                       |
| -------------------- | ------------------------------------------------ |
| Frontend             | Next.js, React, TypeScript, Tailwind CSS         |
| Backend              | Next.js API Routes                               |
| AI Integration       | Groq LLM API                                     |
| Authentication       | Clerk                                            |
| Database             | PostgreSQL, Prisma                               |
| Cache                | Redis / Upstash                                  |
| Cloud Storage        | AWS S3, Presigned URLs                           |
| File Upload Security | IAM-based S3 access, private bucket, CORS config |
| State Management     | Zustand                                          |
| Charts / Analytics   | Recharts                                         |
| Resume Parsing       | PDF.js                                           |
| Deployment           | Vercel                                           |
| Containerization     | Docker                                           |
| Version Control      | Git, GitHub                                      |

---

## 🏗️ System Architecture

PlacementPrep AI follows a modular full-stack architecture where the frontend, backend APIs, AI provider, PostgreSQL database, Redis cache, and AWS S3 storage work together.

```txt
User / Student
     ↓
Next.js Frontend
     ↓
Next.js API Routes
     ↓
Authentication with Clerk
     ↓
AI Provider API / Resume Upload API / Dashboard API
     ↓
PostgreSQL + Prisma
     ↓
Redis Cache
     ↓
AWS S3 File Storage
     ↓
Dashboard Analytics
```

---

## 🧩 Architecture Diagram

```mermaid
flowchart TD
    A[User / Student] --> B[Next.js Frontend]
    B --> C[Next.js API Routes]

    C --> D[Clerk Authentication]

    C --> E[AI Interview API]
    C --> F[Resume Analyzer API]
    C --> G[Roadmap Generator API]
    C --> H[AI Mentor API]
    C --> I[Cover Letter API]
    C --> J[S3 Presigned Upload API]

    E --> K[Groq LLM API]
    F --> K
    G --> K
    H --> K
    I --> K

    C --> L[Prisma ORM]
    L --> M[PostgreSQL Database]

    C --> N[Redis / Upstash Cache]

    J --> O[AWS S3 Private Bucket]

    M --> P[Dashboard Analytics]
    N --> P
    P --> B
```

---

## 📌 Major Modules

### 1. Interview Module

The interview module allows users to practice placement-style interviews. It supports multiple categories and evaluates answers using AI.

**Core functionalities:**

* Question generation
* Topic and difficulty selection
* Timer-based session
* Voice input support
* AI answer evaluation
* Score calculation
* Strengths and weaknesses detection
* Ideal answer generation
* Interview history and feedback tracking

---

### 2. Resume Analyzer Module

The resume analyzer helps students improve their resumes before applying to internships and jobs.

**Core functionalities:**

* PDF and text resume upload
* Secure resume upload to AWS S3
* Resume text extraction
* ATS-style scoring
* Skills match calculation
* Keyword match calculation
* Role-specific feedback
* Missing skills detection
* Improvement suggestions
* Resume analysis history

---

### 3. AWS S3 Upload Module

This module handles secure resume file uploads.

**Core functionalities:**

* Authenticated upload flow using Clerk
* Presigned URL generation through Next.js API route
* Private S3 bucket storage
* File type validation for PDF, TXT, and DOCX
* User-specific S3 object path
* CORS configuration for browser-based uploads

---

### 4. Dashboard Module

The dashboard tracks real preparation progress using PostgreSQL and Redis.

**Core functionalities:**

* Total interviews tracking
* Average score tracking
* Resume ATS score tracking
* Weak area detection
* Recent activity history
* Progress visualization
* Dashboard fallback response to prevent UI crash

---

### 5. Roadmap Module

The roadmap module generates personalized learning paths based on the user’s goal, level, duration, and focus area.

---

### 6. AI Mentor Module

The AI Mentor helps users with placement strategy, learning direction, resume improvement, DSA planning, project guidance, and interview preparation.

---

### 7. Cover Letter Module

The cover letter generator creates professional role-specific cover letters for internship and job applications.

---

## 🚀 Production-Level Improvements Implemented

* PostgreSQL and Prisma integration for persistent user data
* AWS S3 presigned uploads for secure resume file storage
* Redis/Upstash caching for faster repeated AI workflows
* Clerk-based authentication
* Production-safe API route structure
* Timeout and fallback handling for dashboard APIs
* Resume analysis history
* Interview history and feedback tracking
* Secure environment variable handling
* Vercel deployment with production environment variables
* PDF resume parsing support
* Modular API route separation
* Docker setup for local services
* Responsive dashboard and interview session UI
* CORS-enabled S3 upload flow

---

## 🔐 Environment Variables

Create a `.env.local` file in the `my-app` directory and add the required variables.

```env
GROQ_API_KEY="your_groq_api_key"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"

DATABASE_URL="your_postgresql_database_url"
REDIS_URL="your_redis_or_upstash_url"

AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="your_aws_access_key_id"
AWS_SECRET_ACCESS_KEY="your_aws_secret_access_key"
AWS_S3_BUCKET_NAME="placementprep-ai-hariom-reports"
```

For local Redis using Docker:

```env
REDIS_URL="redis://localhost:6379"
```

For Upstash Redis in production:

```env
REDIS_URL="rediss://default:your_token@your-upstash-host.upstash.io:6379"
```

> Do not push `.env`, `.env.local`, or any secret keys to GitHub.

---

## ☁️ AWS S3 Setup Summary

### 1. Create S3 Bucket

Recommended bucket settings:

```txt
Bucket name: placementprep-ai-hariom-reports
Region: Asia Pacific (Mumbai) ap-south-1
Block all public access: ON
Object Ownership: ACLs disabled
Encryption: SSE-S3
```

### 2. Create IAM Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PlacementPrepS3Access",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::placementprep-ai-hariom-reports/*"
    }
  ]
}
```

### 3. Add S3 CORS

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET", "POST"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://placement-prep-ai-ft14.vercel.app"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

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

Create a `.env.local` file and add the required API keys, database URL, Redis URL, and AWS S3 variables.

### 4. Start Redis and PostgreSQL using Docker

```bash
docker compose up -d redis postgres
```

### 5. Generate Prisma client

```bash
npx prisma generate
```

### 6. Push Prisma schema if needed

```bash
npx prisma db push
```

### 7. Run the development server

```bash
npm run dev
```

The app will run on:

```txt
http://localhost:3000
```

---

## 🧪 Useful API Routes

| Route                       | Purpose                                |
| --------------------------- | -------------------------------------- |
| `/api/interview/generate`   | Generates interview questions          |
| `/api/interview/evaluate`   | Evaluates interview answers            |
| `/api/interview/history`    | Fetches interview history              |
| `/api/interview/cleanup`    | Cleans incomplete abandoned sessions   |
| `/api/interview/run-code`   | Runs or evaluates coding practice code |
| `/api/resume/analyze`       | Analyzes resume content                |
| `/api/resume/history`       | Fetches resume analysis history        |
| `/api/upload/presigned-url` | Generates AWS S3 presigned upload URL  |
| `/api/dashboard`            | Fetches progress dashboard data        |
| `/api/roadmap`              | Generates learning roadmap             |
| `/api/mentor`               | AI mentor guidance                     |
| `/api/cover-letter`         | Generates cover letters                |
| `/api/redis-test`           | Tests Redis connection                 |
| `/api/debug/redis`          | Debugs Redis keys and connection       |

---

## 📊 Dashboard Tracking Flow

```txt
Interview / Resume Action
        ↓
Next.js API Route
        ↓
AI Evaluation / Resume Analysis
        ↓
Result saved in PostgreSQL
        ↓
Repeated AI workflows cached in Redis
        ↓
Dashboard API reads persisted data
        ↓
User sees updated analytics
```

---

## 📄 Resume Upload Flow

```txt
Resume File Selected
        ↓
Frontend sends file name and type to API
        ↓
API validates user with Clerk
        ↓
API generates AWS S3 presigned URL
        ↓
Frontend uploads file directly to S3
        ↓
Resume text is extracted and analyzed
        ↓
Analysis result is saved in PostgreSQL
```

---

## 📁 Folder Structure

```txt
my-app
├── prisma
│   └── schema.prisma
├── public
├── src
│   ├── app
│   │   ├── api
│   │   │   ├── interview
│   │   │   ├── resume
│   │   │   ├── upload
│   │   │   │   └── presigned-url
│   │   │   ├── dashboard
│   │   │   ├── roadmap
│   │   │   ├── mentor
│   │   │   └── cover-letter
│   │   ├── interview
│   │   ├── resume
│   │   ├── roadmap
│   │   ├── mentor
│   │   └── cover-letter
│   ├── components
│   ├── data
│   ├── features
│   ├── hooks
│   └── lib
│       ├── groq.ts
│       ├── prisma.ts
│       ├── redis.ts
│       ├── s3.ts
│       ├── upload-to-s3.ts
│       └── interview-history.ts
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

---

## 💡 What I Learned

While building PlacementPrep AI, I worked on several real-world engineering concepts:

* Building full-stack applications with Next.js and TypeScript
* Creating backend APIs using Next.js API routes
* Integrating LLM APIs for AI-powered features
* Using AWS S3 presigned URLs for secure file uploads
* Creating IAM-based limited access for S3 operations
* Configuring S3 CORS for browser uploads
* Using Redis/Upstash for caching and faster repeated AI workflows
* Using Prisma and PostgreSQL for structured persistent data
* Managing environment variables securely in local and production
* Debugging Vercel production build and runtime issues
* Handling timeout and fallback logic in APIs
* Building responsive dashboards and interview workflows
* Structuring a scalable project for real-world users

---

## 🔮 Future Improvements

* GitHub Actions CI/CD pipeline
* Sentry error monitoring
* Rate limiting for AI APIs
* Downloadable resume and interview reports
* Store generated reports in AWS S3
* BullMQ-based background job processing
* EC2-based background worker for report generation
* Advanced resume keyword comparison with job descriptions
* More DSA practice problems with difficulty filters
* Admin dashboard for platform analytics
* Email notifications for generated reports

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
