# StudyPilot AI — Backend API

StudyPilot AI Backend is an Express REST API built with TypeScript and backed by MongoDB Atlas. It handles user authentication, catalog retrieval, personalized AI study plan generation, interactive tutor chats, and adaptive recommendations using Gemini.

This repository contains the Node.js / Express backend server codebase.

---

## Table of Contents
1. [Backend Overview](#backend-overview)
2. [Data Persistence Architecture](#data-persistence-architecture)
3. [Technology Stack](#technology-stack)
4. [Backend Directory Structure](#backend-directory-structure)
5. [API Endpoint Catalog](#api-endpoint-catalog)
6. [Study Plan Generation Data Flow](#study-plan-generation-data-flow)
7. [AI Tutor Context Workflow](#ai-tutor-context-workflow)
8. [AI Recommendation Analytics](#ai-recommendation-analytics)
9. [MongoDB Database Schema Design](#mongodb-database-schema-design)
10. [Database Seeder](#database-seeder)
11. [Authentication & Route Security](#authentication--route-security)
12. [Structured Error Handling](#structured-error-handling)
13. [Environment Variables](#environment-variables)
14. [Local Development](#local-development)
15. [Production Deployment](#production-deployment)
16. [Assignment Compliance](#assignment-compliance)
17. [Troubleshooting Guide](#troubleshooting-guide)
18. [Project Status](#project-status)

---

## Backend Overview

The backend orchestrates the logic of StudyPilot AI. It exposes endpoints to the frontend, communicates with MongoDB Atlas for persistent storage, validates request structures, handles user authentication checks, and interfaces securely with the Gemini API to execute the platform's Agentic workflows.

---

## Data Persistence Architecture

The backend supports the platform's multi-tier data model:
* **Explore Templates**: Public curriculum catalog loaded from the `explore_templates` collection.
* **AI Study Plans**: User-specific roadmaps stored in the `study_plans` collection.
* **My Items Sandbox**: Decoupled from the backend API completely. Manually managed items are kept in browser local storage and do not communicate with backend endpoints.

---

## Technology Stack

* **Runtime**: Node.js & Express.js
* **Language**: TypeScript
* **Database**: MongoDB (Atlas cloud integration)
* **SDKs**: Google Gen AI SDK (Gemini Integration)
* **Security & Middleware**: Better Auth integration, CORS, dotenv, helmet, morgan
* **Build Tools**: TypeScript Compiler (tsc), ts-node

---

## Backend Directory Structure

```
StudyPilot-AI-Server/
├── src/
│   ├── config/             # Database connection setups
│   ├── controllers/        # Express handlers (auth, plan, tutor, recommendations)
│   ├── middleware/         # Auth validation, error handlers, loggers
│   ├── models/             # Mongoose/native schemas (plans, templates, logs)
│   ├── routes/             # REST route path definitions
│   ├── scripts/            # Database seeder scripts (seed.ts)
│   ├── services/           # External API utilities (Gemini connection, auth wrappers)
│   ├── types/              # TypeScript typings
│   └── app.ts              # Express initialization
├── package.json
└── tsconfig.json
```

---

## API Endpoint Catalog

All API endpoints are prefixed with `/api`. Secure routes require a valid Better Auth session cookie.

### 1. Explore Templates
* **GET `/api/templates`**
  - **Auth**: Public
  - **Query Parameters**: `search`, `category`, `difficulty`, `sortBy`, `page`, `limit`
  - **Purpose**: Retrieves a list of reference blueprints from the `explore_templates` database collection.
* **GET `/api/templates/:id`**
  - **Auth**: Public
  - **Purpose**: Fetches metadata for a specific blueprint. Used to populate the AI Planner form.

### 2. Study Plans
* **POST `/api/study-plans/generate`**
  - **Auth**: Required
  - **Request Body**:
    ```json
    {
      "subject": "Intro to Algorithms",
      "examDate": "2026-08-15",
      "studyHoursPerDay": 3,
      "studyDaysPerWeek": 5,
      "difficulty": "Intermediate",
      "weakTopics": ["Binary Search Trees", "Dynamic Programming"],
      "additionalInstructions": "Focus on big-O notation complexity analysis"
    }
    ```
  - **Purpose**: Triggers Gemini `gemini-3.5-flash` to reason, pace tasks, and return a structured study plan JSON matching the schema.
* **POST `/api/study-plans`**
  - **Auth**: Required
  - **Purpose**: Persists a generated study plan to the user's MongoDB `study_plans` collection.
* **GET `/api/study-plans`**
  - **Auth**: Required
  - **Purpose**: Retrieves all study plans belonging to the authenticated user.
* **PATCH `/api/study-plans/:planId/tasks/:taskId`**
  - **Auth**: Required
  - **Request Body**: `{ "completed": true }`
  - **Purpose**: Checks off study roadmap tasks, triggering updates on the dashboard progress metrics.
* **DELETE `/api/study-plans/:id`**
  - **Auth**: Required
  - **Purpose**: Deletes a study plan from the user's account.

### 3. AI Tutor Chat
* **POST `/api/conversations`**
  - **Auth**: Required
  - **Purpose**: Creates a new AI Tutor chat thread.
* **GET `/api/conversations`**
  - **Auth**: Required
  - **Purpose**: Lists all active conversation threads for the user.
* **POST `/api/conversations/:id/messages`**
  - **Auth**: Required
  - **Request Body**: `{ "content": "Explain my current study schedule" }`
  - **Purpose**: Feeds the user's active MongoDB study plans as context into Gemini and generates a tailored study response.
* **DELETE `/api/conversations/:id`**
  - **Auth**: Required
  - **Purpose**: Deletes a chat history thread.

### 4. Recommendations
* **GET `/api/recommendations`**
  - **Auth**: Required
  - **Purpose**: Returns the active calculated recommendations checklist.
* **POST `/api/recommendations/refresh`**
  - **Auth**: Required
  - **Purpose**: Forces Gemini to re-analyze task completions and weak topic scores, returning refreshed strategies.

---

## Study Plan Generation Data Flow

```
[Client App] --(POST /study-plans/generate)--> [Backend API]
                                                      |
                                             (Enforce JSON Schema)
                                                      v
[Client App] <---(Preview JSON Roadmap)--- [Gemini API (gemini-3.5-flash)]
      |
(User clicks Save)
      |
      +--------(POST /study-plans)---------> [MongoDB Atlas (study_plans)]
```

### JSON Schema Verification
The backend enforces structured JSON output using Gemini's configuration flags:
- `responseMimeType: "application/json"`
- `responseSchema`: Standardizes keys to prevent parser failures:
  - `roadmap`: Array of phases containing names and task arrays.
  - `dailySchedule`: Array detailing study timelines.
  - `revisionStrategy`: Instructions for retention.

---

## AI Tutor Context Workflow

1. A message arrives on `/api/conversations/:id/messages`.
2. The middleware authenticates the user ID.
3. The tutor controller queries `study_plans` matching the user.
4. It compiles a context payload detailing: active subjects, task completeness rates (e.g. *Task 1 completed, Task 2 incomplete*), and target deadlines.
5. The tutor controller feeds this payload along with the chat history into Gemini, returning a response relevant to the student's progress.

---

## AI Recommendation Analytics

1. The recommendations controller queries user study plans.
2. It tracks the ratio of completed tasks to total tasks per roadmap.
3. Gemini is prompted with progress parameters to identify areas falling behind and output:
   - High, Medium, and Low priority topics to review.
   - Recommended actions with estimated durations (e.g. *"Spend 45 mins practicing Recursion"*).

---

## MongoDB Database Schema Design

### 1. `explore_templates`
- `title` (String): Curriculum header.
- `description` (String): Core description.
- `category` (String): Academic field.
- `difficulty` (String): Level.
- `tasks` (Array): Sub-activities.
- `rating` (Number): Community grade.

### 2. `study_plans`
- `userId` (String): Reference key.
- `subject` (String): Target topic.
- `description` (String): Reconstructed JSON roadmap container.
- `examDate` (Date): Timeline boundary.
- `completed` (Boolean): Target flag.

---

## Database Seeder

A database script is included to populate the catalog with 100 templates:
```bash
# Execute seeding script
npm run seed
```
This loads templates across Software Development, Business, Science, Design, and Humanities into the `explore_templates` collection.

---

## Authentication & Route Security

- Route requests are processed by the auth middleware before database access.
- Validates the active session signature using the Better Auth client headers.
- Restricts cross-origin requests using CORS whitelist configurations.

---

## Structured Error Handling

Standardized API errors return clean descriptors:
- `CONFIG_ERROR`: Gemini API Key or credentials missing.
- `AI_PROVIDER_ERROR`: Google Gemini returned an execution failure.
- `AI_EMPTY_RESPONSE`: Gemini returned an empty payload.

---

## Environment Variables

Create a `StudyPilot-AI-Server/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/studypilot_ai
GEMINI_API_KEY=AIzaSy...
BETTER_AUTH_SECRET=secret_token...
FRONTEND_URL=http://localhost:3000
```

---

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Seed catalog data**:
   ```bash
   npm run seed
   ```
3. **Start development server**:
   ```bash
   npm run dev
   ```
4. **Compile TypeScript**:
   ```bash
   npm run build
   ```

---

## Production Deployment

Recommended deploy on environments like **Render**, **Railway**, or **Heroku**:
```bash
npm run build
npm start
```
Make sure database variables and the Gemini API key are loaded in your deployment panel environment dashboard.

---

## Assignment Compliance

Fulfills backend criteria of the SCIC-13 assignment, incorporating a secure Node.js/Express API structure in TypeScript, MongoDB Atlas cloud storage, and secure Gemini model integrations with strict JSON schema constraints.

---

## Troubleshooting Guide

### 1. Gemini API Key Errors (403/400)
Verify that your `GEMINI_API_KEY` env variable is set and supports model generation.

### 2. JSON Parsing Anomalies
Verify that the prompt specifies `gemini-3.5-flash` which supports Gemini JSON schemas.

### 3. CORS Preflight Failures
Ensure `FRONTEND_URL` matches the domain of the client Next.js application.

---

## Project Status

**STABLE / ACTIVE**: The backend successfully handles user authentication, routes data persistence, seeds catalogs, and runs Gemini integrations.
