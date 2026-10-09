# DayFlow — Make Today Count

A fresh, mood-boosting personal daily planner that helps students and busy people organize their day, manage tasks, schedule activities, track progress, and reflect on what they accomplished.

> **Core Philosophy:** *A fresh morning, a clear mind, and one small step at a time.*

---

## 🌟 Key Features

1. **My Day Dashboard**
   - Time-sensitive greeting (`Good morning ☀️`, `Good afternoon 🌤️`, `Good evening ✨`)
   - Daily progress card with circular percentage ring and encouraging feedback
   - Seamless switching between **Chronological Timeline** and **List View**
   - Instant task completion with celebration confetti
   - Overlap warning for conflicting same-day task times
   - Inline reschedule modal to move tasks to tomorrow or future dates

2. **Notes & Thoughts**
   - Clean, flexible space for jotting ideas, checklists, reading notes, and quick reminders
   - 6 soft, nature-inspired card colors (`Crisp White`, `Soft Sage`, `Warm Cream`, `Teal Mist`, `Petal Blush`, `Morning Sky`)
   - Pin important notes to the top of your workspace
   - Categorize with tags (`General`, `Ideas`, `Quick Note`, `Study`, `Project`, `Personal`)
   - Real-time instant search across titles and note contents

3. **All Tasks**
   - Instant search across task titles and notes
   - Dynamic filters by Status (`Incomplete`, `Completed`, `Overdue`), Category, and Priority
   - Overdue badges automatically computed for uncompleted past tasks

4. **Weekly Overview**
   - Interactive Recharts visualizations:
     - **Tasks Planned vs. Completed** bar chart
     - **Focus by Category** radial distribution ring
   - Live metrics: Total planned hours, weekly completion rate, most productive day
   - Week-by-week pagination navigation

5. **Daily Reflection Journal**
   - Mindful evening check-in prompts:
     - *What went well today?*
     - *What did I accomplish?*
     - *What could I gently improve tomorrow?*
     - *One thing I'm grateful for*
   - Mood selector (`🌿 Peaceful`, `⚡ Energized`, `🌟 Proud`, `💛 Grateful`, `☕ Restful`)
   - Historical journal viewer by date

6. **AI-Powered "Plan My Day"**
   - Input your available hours, fixed commitments, and task goals
   - Returns a structured, realistic daily timeline with mindful breaks
   - Review, customize, and selectively import directly into your day
   - Uses Google Gemini API when `GEMINI_API_KEY` is provided; automatically falls back to an intelligent rhythm generator if no key is configured

7. **Personal Settings**
   - Preferred name customization
   - Working hours configuration
   - Week start preference (`Monday` or `Sunday`)
   - Gentle reminders toggle

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Lucide React, Recharts, Axios, Canvas Confetti
- **Styling:** Vanilla CSS with custom design tokens (`#F8FAF7` warm off-white, `#0F9D8A` fresh teal, `#DDEDE3` soft sage)
- **Backend:** Python 3.12, FastAPI, SQLAlchemy ORM, Uvicorn, Pydantic
- **Database:** SQLite (persisted locally in `dayflow.db`)

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

---

### 2. Backend Setup

```bash
# In the DayFlow root directory
python -m venv venv

# Activate venv:
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Seed sample data
python seed_data.py

# Run backend API server
uvicorn backend.main:app --reload --port 8000
```

The FastAPI Swagger documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The React web application will be live at: [http://localhost:5173](http://localhost:5173)

---

### 4. Optional AI Configuration

To enable Gemini-powered scheduling:

1. Create a `.env` file in the root or set the environment variable:
   ```bash
   # Windows PowerShell:
   $env:GEMINI_API_KEY="your-gemini-api-key"
   ```
2. Restart the backend server. If no API key is set, DayFlow automatically uses its built-in mindful heuristic scheduling generator.

---

## 📁 Project Architecture

```
DayFlow/
├── backend/
│   ├── main.py                  # FastAPI app & CORS middleware
│   ├── database.py              # SQLAlchemy database engine & session
│   ├── models.py                # Task, Reflection, Setting models
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── routers/
│   │   ├── tasks.py             # Task CRUD, day summary, overlaps
│   │   ├── reflections.py       # Journal reflections endpoints
│   │   ├── analytics.py         # Weekly productivity calculations
│   │   ├── settings.py          # User settings preferences
│   │   └── ai.py                # Mindful schedule generator (Gemini + fallback)
│   └── services/
│       ├── task_service.py      # Durations, overlap logic, recurrence
│       └── analytics_service.py # Weekly aggregation algorithms
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # Navigation & motivational quote
│   │   │   ├── Header.jsx       # Greeting, date navigation, actions
│   │   │   ├── ProgressCard.jsx # Progress bar, ring & encouragement
│   │   │   ├── TaskCard.jsx     # Card with categories, times, badges
│   │   │   ├── TaskTimeline.jsx # Visual chronological timeline
│   │   │   ├── TaskForm.jsx     # Add/Edit task modal
│   │   │   ├── AIPlanModal.jsx  # AI daily schedule planner modal
│   │   │   ├── RescheduleModal.jsx # Move task to another day
│   │   │   ├── EmptyState.jsx   # Botanical calm empty states
│   │   │   └── ConfirmDialog.jsx# Delete confirmation modal
│   │   ├── pages/
│   │   │   ├── MyDay.jsx        # Primary daily dashboard
│   │   │   ├── Upcoming.jsx     # Grouped future schedule
│   │   │   ├── AllTasks.jsx     # Searchable task manager
│   │   │   ├── WeeklyOverview.jsx # Recharts weekly analytics
│   │   │   ├── DailyReflection.jsx # Evening journal & mood
│   │   │   └── Settings.jsx     # Personal preferences
│   │   ├── services/
│   │   │   └── api.js           # Axios REST client
│   │   ├── styles/
│   │   ├── App.jsx              # Routing & global toast notices
│   │   ├── index.css            # Nature-inspired design system
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── requirements.txt
├── seed_data.py
└── README.md
```
