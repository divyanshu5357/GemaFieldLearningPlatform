# GemaField Learning Platform

A modern AI‑powered learning platform that brings together students, teachers, and admins in one place. It focuses on interactive video lessons, tests, assignments, real‑time chat, and adaptive revision so learners can stay engaged and on track.

> **Note:** A live deployment link will be added here in the future once the project is hosted.

---

## Features

### 🎓 For students
- **Personal dashboard** with progress, streaks, XP, and upcoming revision sessions.
- **Courses & lessons** with embedded video player and structured content.
- **Tests & quizzes** with submissions tracked per student.
- **Assignments upload** (files) with status per course.
- **AI mentor chat** (`AIMentorChat`, `TeacherChat`, `AIChatWidget`) for guidance and explanations.
- **AI hints & insights** (`AIHintButton`, `AIInsightsPanel`) to clarify concepts and suggest next steps.
- **Revision system** (`RevisionQuestCard`, `AIRevisionCard`, `UpcomingRevisionPanel`) to revisit weak topics.
- **Gamification**: XP, levels, streaks, and leaderboards (`XPLevelCard`, `StreakCard`, `LeaderboardPanel`).

### 👨‍🏫 For teachers & admins
- **Admin & teacher dashboards** for managing courses, lessons, and content.
- **Course creation & editing** (`CourseForm`, `LessonForm`, `TeacherCourseManager`).
- **Content upload hub** for videos, tests, and assignments.
- **Video & test upload modals** (`VideoUploadModal`, `TestUploadModal`, `TestUploadFromFile`).
- **Student submissions overview** (`StudentAssignmentSubmission`, `StudentTestSubmission`).
- **Real‑time style chat** components to communicate with students.

### 🤖 AI & analytics
- Central AI logic in `src/lib`:
  - `ai-api.ts`, `chat-system.ts`, `ai-hints.ts`, `weakness-analysis.ts`, `revision-system.ts`.
  - `xp-system.ts`, `streak-system.ts`, `learning-hooks.ts` for engagement and progress logic.
- **Supabase Edge Function** at `supabase/functions/mega-llm` to handle heavier AI workloads.
- **Analytics dashboards** (e.g. `AnalyticsPage`, `ActivityChart`) to visualise student activity.

---

## Tech stack

- **Frontend:** React + TypeScript, React Router, Vite
- **Styling:** Tailwind CSS, custom theme + UI components
- **Charts:** Recharts
- **Backend & DB:** Supabase (Postgres, Auth, Storage, Edge Functions)
- **AI integration:** Custom logic + Supabase functions (LLM‑backed `mega-llm` function)

---

## Getting started locally

### 1. Clone the repo

```bash
git clone https://github.com/divyanshu5357/GemaFieldLearningPlatform.git
cd GemaFieldLearningPlatform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root (or copy from `.env.example`):

```bash
cp .env.example .env
```

Then fill in your values (example keys you will typically need):

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
# add any other VITE_ variables used by the app here
```

> `.env` is **ignored by git**. Keep your real keys only in local / server environments.

### 4. Run the app in development

```bash
npm run dev
```

This starts the Vite dev server. Open the printed URL (usually `http://localhost:5173`) in your browser.

### 5. Build & preview

```bash
npm run build
npm run preview
```

---

## Database & SQL migrations

Supabase is used as the backend. There is a helper script to run SQL migrations against your Supabase instance:

- `ASSIGNMENTS_SUBMISSIONS_SQL.sql` – core tables and policies for assignments & submissions.
- `runSQL.js` – Node script that reads the SQL file and executes statements via Supabase.

> These are mainly for local setup / infra management and are not required for everyday app development.

To apply the assignments/submissions migration (optional, if you are setting up your own Supabase instance):

```bash
node runSQL.js
```

Make sure your `.env` has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` before running it.

---

## Project structure (high‑level)

```text
src/
  app/
    App.tsx, appRoutes.tsx
    components/           # Reusable UI + domain components
    pages/                # Route‑level pages (Dashboard, Courses, Auth, etc.)
  lib/
    supabase.ts           # Supabase client setup
    ai-api.ts             # Client for AI/LLM features
    chat-system.ts        # Chat orchestration
    revision-system.ts    # Revision logic
    xp-system.ts          # XP & leveling
    streak-system.ts      # Streak tracking
  styles/                 # Tailwind / theme CSS
supabase/
  functions/mega-llm/     # Edge function for AI logic
```

---

## Screenshots

Screenshots will be added here once the UI is fully polished and deployed. Suggested sections:

- **Student dashboard** – progress, streaks, and upcoming revision.
- **Course view** – video lesson with resources, tests, and assignments.
- **Teacher/admin dashboard** – course management and analytics.
- **AI mentor chat** – example of chat‑based help and hints.

> Tip: once you have images, you can store them in `public/screenshots/` and reference them like:
> `![Student dashboard](public/screenshots/student-dashboard.png)`

---

## Roadmap / future work

- Deploy to a public URL (Vercel or similar) and add the link here.
- Polish dashboards and analytics views.
- Add more AI‑driven insights and personalised learning paths.
- Improve test/assignment authoring UX for teachers.
- Add documentation for Supabase schema and RLS policies.

---

## Contributing

This project is currently focused on core feature development and polish. If you have suggestions or find bugs, feel free to open an issue or a small, focused pull request.

---

## License

TBD – choose a license (for example MIT) if/when you are ready to open source the project formally.
