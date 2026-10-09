from datetime import datetime, timedelta
from typing import List, Dict
from sqlalchemy.orm import Session
from ..models import Task
from ..schemas import WeeklyAnalyticsResponse, DayAnalytics, CategoryBreakdown

def calculate_weekly_analytics(db: Session, reference_date_str: str) -> WeeklyAnalyticsResponse:
    """Calculate weekly productivity metrics for the 7-day period around reference_date."""
    ref_date = datetime.strptime(reference_date_str, "%Y-%m-%d").date()
    # Calculate start of week (Monday)
    start_of_week = ref_date - timedelta(days=ref_date.weekday())
    end_of_week = start_of_week + timedelta(days=6)

    start_str = start_of_week.strftime("%Y-%m-%d")
    end_str = end_of_week.strftime("%Y-%m-%d")

    # Fetch tasks for the entire week
    week_tasks = db.query(Task).filter(
        Task.date >= start_str,
        Task.date <= end_str
    ).all()

    daily_stats: List[DayAnalytics] = []
    category_counts: Dict[str, Dict[str, int]] = {}

    total_planned = 0
    total_completed = 0
    total_planned_minutes = 0

    best_day_name = None
    best_day_completed = -1

    for day_idx in range(7):
        current_day = start_of_week + timedelta(days=day_idx)
        cur_date_str = current_day.strftime("%Y-%m-%d")
        day_name = current_day.strftime("%a")

        day_tasks = [t for t in week_tasks if t.date == cur_date_str]
        planned = len(day_tasks)
        completed = len([t for t in day_tasks if t.completed])

        day_minutes = 0
        for t in day_tasks:
            if t.estimated_duration:
                day_minutes += t.estimated_duration

        total_planned += planned
        total_completed += completed
        total_planned_minutes += day_minutes

        rate = (completed / planned * 100.0) if planned > 0 else 0.0

        daily_stats.append(DayAnalytics(
            date=cur_date_str,
            day_name=day_name,
            planned=planned,
            completed=completed,
            completion_rate=round(rate, 1),
            total_hours=round(day_minutes / 60.0, 1)
        ))

        if completed > best_day_completed and completed > 0:
            best_day_completed = completed
            best_day_name = current_day.strftime("%A")

    # Category breakdown
    for t in week_tasks:
        cat = t.category or "Other"
        if cat not in category_counts:
            category_counts[cat] = {"count": 0, "completed": 0}
        category_counts[cat]["count"] += 1
        if t.completed:
            category_counts[cat]["completed"] += 1

    category_distribution = [
        CategoryBreakdown(
            category=cat,
            count=data["count"],
            completed_count=data["completed"]
        )
        for cat, data in category_counts.items()
    ]
    # Sort categories by count descending
    category_distribution.sort(key=lambda x: x.count, reverse=True)

    weekly_rate = (total_completed / total_planned * 100.0) if total_planned > 0 else 0.0

    return WeeklyAnalyticsResponse(
        start_date=start_str,
        end_date=end_str,
        total_planned=total_planned,
        total_completed=total_completed,
        weekly_completion_rate=round(weekly_rate, 1),
        total_planned_hours=round(total_planned_minutes / 60.0, 1),
        most_productive_day=best_day_name if best_day_name else "N/A",
        daily_stats=daily_stats,
        category_distribution=category_distribution
    )
