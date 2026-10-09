import datetime
from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine, Base
from backend.models import Task, Reflection, Setting

def seed_sample_data():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if tasks already exist
    if db.query(Task).count() > 0:
        print("Database already has tasks. Skipping seed.")
        db.close()
        return

    today = datetime.date.today()
    today_str = today.strftime("%Y-%m-%d")
    tomorrow_str = (today + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    yesterday_str = (today - datetime.timedelta(days=1)).strftime("%Y-%m-%d")

    sample_tasks = [
        # Today's tasks
        Task(
            title="Morning Meditation & Sunlight",
            description="15 minutes of quiet breathwork and fresh outdoor light.",
            date=today_str,
            start_time="08:00",
            end_time="08:30",
            category="Health",
            priority="High",
            estimated_duration=30,
            recurrence="Daily",
            completed=True,
        ),
        Task(
            title="Deep Work: DayFlow Architecture & Planning",
            description="Design database schema and component tree for optimal reactivity.",
            date=today_str,
            start_time="09:00",
            end_time="11:30",
            category="Project",
            priority="High",
            estimated_duration=150,
            recurrence="None",
            completed=True,
        ),
        Task(
            title="Campus Computer Science Lecture",
            description="Review algorithms slides and prepare coursework notes.",
            date=today_str,
            start_time="12:00",
            end_time="13:30",
            category="College",
            priority="Medium",
            estimated_duration=90,
            recurrence="Weekdays",
            completed=False,
        ),
        Task(
            title="Read Chapter 5: Cognitive Productivity",
            description="Highlight key ideas on flow states and attentional space.",
            date=today_str,
            start_time="15:00",
            end_time="16:00",
            category="Study",
            priority="Medium",
            estimated_duration=60,
            recurrence="None",
            completed=False,
        ),
        Task(
            title="Evening Walk in the Garden",
            description="Unwind and enjoy the calm evening air.",
            date=today_str,
            start_time="18:00",
            end_time="18:45",
            category="Health",
            priority="Low",
            estimated_duration=45,
            recurrence="Daily",
            completed=False,
        ),
        Task(
            title="Reflect on today's milestones",
            description="Write 3 gratitude notes in DayFlow reflection journal.",
            date=today_str,
            start_time=None,
            end_time=None,
            category="Personal",
            priority="Medium",
            estimated_duration=20,
            recurrence="Daily",
            completed=False,
        ),
        # Tomorrow's tasks
        Task(
            title="Database Optimization & Query Profiling",
            description="Index common lookup columns in SQLite.",
            date=tomorrow_str,
            start_time="10:00",
            end_time="12:00",
            category="Project",
            priority="High",
            estimated_duration=120,
            recurrence="None",
            completed=False,
        ),
        Task(
            title="Grocery run & meal preparation",
            description="Stock fresh ingredients for the weekend.",
            date=tomorrow_str,
            start_time="16:30",
            end_time="17:30",
            category="Personal",
            priority="Low",
            estimated_duration=60,
            recurrence="None",
            completed=False,
        ),
        # Yesterday's tasks
        Task(
            title="Initial UI Prototypes & Palette Selection",
            description="Formulate warm off-white, fresh teal and soft sage color scheme.",
            date=yesterday_str,
            start_time="09:30",
            end_time="12:00",
            category="Project",
            priority="High",
            estimated_duration=150,
            recurrence="None",
            completed=True,
        ),
        Task(
            title="Review weekly priorities & syllabus",
            description="Keep upcoming assignment milestones on schedule.",
            date=yesterday_str,
            start_time="14:00",
            end_time="15:30",
            category="Study",
            priority="Medium",
            estimated_duration=90,
            recurrence="None",
            completed=True,
        ),
    ]

    for t in sample_tasks:
        db.add(t)

    # Add default setting
    setting = Setting(
        preferred_name="Alex",
        theme="light",
        default_start_time="08:30",
        default_end_time="18:30",
        week_start="Monday",
        reminders_enabled=True,
    )
    db.add(setting)

    # Add a sample reflection for yesterday
    reflection = Reflection(
        date=yesterday_str,
        went_well="Designed the foundational palette and wireframes with complete focus.",
        accomplished="Drafted project specifications and set up repository structure.",
        improve_tomorrow="Remember to stretch every 90 minutes and stay hydrated.",
        grateful_for="The peaceful morning coffee and having uninterrupted deep focus.",
        mood="Grateful",
    )
    db.add(reflection)

    db.commit()
    db.close()
    print("Sample data successfully seeded!")

if __name__ == "__main__":
    seed_sample_data()
