from datetime import datetime, timedelta
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from ..models import Task
from ..schemas import TaskCreate, TaskUpdate, ConflictWarning

def time_to_minutes(time_str: str) -> int:
    """Convert HH:MM to minutes from midnight."""
    h, m = map(int, time_str.split(":"))
    return h * 60 + m

def minutes_to_time(minutes: int) -> str:
    """Convert minutes from midnight to HH:MM."""
    h = (minutes // 60) % 24
    m = minutes % 60
    return f"{h:02d}:{m:02d}"

def calculate_duration(start_time: Optional[str], end_time: Optional[str]) -> Optional[int]:
    """Calculate duration in minutes between start_time and end_time."""
    if not start_time or not end_time:
        return None
    start_min = time_to_minutes(start_time)
    end_min = time_to_minutes(end_time)
    if end_min >= start_min:
        return end_min - start_min
    # if crosses midnight
    return (24 * 60 - start_min) + end_min

def check_task_overlaps(tasks: List[Task]) -> List[ConflictWarning]:
    """Find all time conflicts between scheduled tasks on the same day."""
    warnings = []
    # Filter tasks with both start and end times
    timed_tasks = [t for t in tasks if t.start_time and t.end_time]
    
    for i in range(len(timed_tasks)):
        t1 = timed_tasks[i]
        start1 = time_to_minutes(t1.start_time)
        end1 = time_to_minutes(t1.end_time)
        if end1 <= start1:
            end1 += 24 * 60 # Handle crossing midnight

        for j in range(i + 1, len(timed_tasks)):
            t2 = timed_tasks[j]
            start2 = time_to_minutes(t2.start_time)
            end2 = time_to_minutes(t2.end_time)
            if end2 <= start2:
                end2 += 24 * 60

            # Overlap condition: start1 < end2 and start2 < end1
            if start1 < end2 and start2 < end1:
                warnings.append(ConflictWarning(
                    task_id=t1.id,
                    title=t1.title,
                    start_time=t1.start_time,
                    end_time=t1.end_time,
                    overlap_with_task_id=t2.id,
                    overlap_with_title=t2.title,
                    message=f"'{t1.title}' ({t1.start_time}-{t1.end_time}) overlaps with '{t2.title}' ({t2.start_time}-{t2.end_time})"
                ))
    return warnings

def generate_recurring_instances(db: Session, target_date_str: str):
    """
    Check recurring tasks and create instances for target_date if not already present.
    Rules:
    - Daily: every day
    - Weekdays: Monday to Friday (weekday 0-4)
    Avoids duplicate creations by checking (title, date, recurrence).
    """
    target_date = datetime.strptime(target_date_str, "%Y-%m-%d").date()
    target_weekday = target_date.weekday() # 0 is Monday, 6 is Sunday

    # Find templates / recurring definitions created on or before target_date
    recurring_templates = db.query(Task).filter(
        Task.recurrence.in_(["Daily", "Weekdays"]),
        Task.date <= target_date_str
    ).all()

    for item in recurring_templates:
        if item.date == target_date_str:
            continue # already this day's original task

        should_create = False
        if item.recurrence == "Daily":
            should_create = True
        elif item.recurrence == "Weekdays" and target_weekday < 5:
            should_create = True

        if should_create:
            # Check if already exists on target_date with same title and recurrence
            exists = db.query(Task).filter(
                Task.date == target_date_str,
                Task.title == item.title,
                Task.recurrence == item.recurrence
            ).first()

            if not exists:
                new_task = Task(
                    title=item.title,
                    description=item.description,
                    date=target_date_str,
                    start_time=item.start_time,
                    end_time=item.end_time,
                    category=item.category,
                    priority=item.priority,
                    estimated_duration=item.estimated_duration,
                    recurrence=item.recurrence,
                    completed=False
                )
                db.add(new_task)
    db.commit()
