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
            title="Morning revision flashcards",
            description="Review 20 cards and mark uncertain concepts.",
            date=today_str,
            start_time="08:00",
            end_time="08:30",
            category="Study",
            priority="High",
            estimated_duration=30,
            recurrence="Daily",
            completed=True,
        ),
        Task(
            title="NLP - Revise Lab Viva",
            description="Review language models, parsing, and lab viva questions.",
            date=today_str,
            start_time="09:00",
            end_time="11:30",
            category="College",
            priority="High",
            estimated_duration=150,
            recurrence="None",
            completed=True,
        ),
        Task(
            title="DBMS - Practice Queries",
            description="Complete normalization and join query exercises.",
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
            title="Agile - Test Cases & Jira",
            description="Write test cases and update sprint tasks.",
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
            title="Break",
            description="Rest, hydrate, and prepare for the next session.",
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
            title="Plan tomorrow",
            description="Organize tomorrow's assignments and study priorities.",
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
            title="DSA - Solve 5 Interview Problems",
            description="Practice arrays, stacks, and binary search.",
            date=tomorrow_str,
            start_time="10:00",
            end_time="12:00",
            category="Study",
            priority="High",
            estimated_duration=120,
            recurrence="None",
            completed=False,
        ),
        Task(
            title="Library study session",
            description="Read course material and prepare concise notes.",
            date=tomorrow_str,
            start_time="16:30",
            end_time="17:30",
            category="Study",
            priority="Low",
            estimated_duration=60,
            recurrence="None",
            completed=False,
        ),
        # Yesterday's tasks
        Task(
            title="Review lecture notes",
            description="Summarize machine learning lecture notes.",
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
            title="Prepare weekly syllabus review",
            description="Check upcoming assignments and exam milestones.",
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
        preferred_name="Vidhi",
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
