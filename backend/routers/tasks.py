from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import Task
from ..schemas import TaskCreate, TaskUpdate, TaskResponse, DaySummaryResponse
from ..services.task_service import (
    calculate_duration,
    check_task_overlaps,
    generate_recurring_instances
)

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("", response_model=List[TaskResponse])
def get_all_tasks(
    category: Optional[str] = None,
    priority: Optional[str] = None,
    completed: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Task)
    if category and category != "All":
        query = query.filter(Task.category == category)
    if priority and priority != "All":
        query = query.filter(Task.priority == priority)
    if completed is not None:
        query = query.filter(Task.completed == completed)
    if search:
        query = query.filter(Task.title.ilike(f"%{search}%"))

    # Order by date asc, start_time asc
    tasks = query.order_by(Task.date.asc(), Task.start_time.asc().nulls_last()).all()
    return tasks

@router.get("/day/{date}", response_model=DaySummaryResponse)
def get_day_tasks(date: str, db: Session = Depends(get_db)):
    # First sync recurring instances for this day if needed
    try:
        generate_recurring_instances(db, date)
    except Exception:
        pass

    tasks = db.query(Task).filter(Task.date == date).order_by(
        Task.start_time.asc().nulls_last(),
        Task.created_at.asc()
    ).all()

    total = len(tasks)
    completed = len([t for t in tasks if t.completed])
    rate = (completed / total * 100.0) if total > 0 else 0.0

    total_mins = 0
    for t in tasks:
        if t.estimated_duration:
            total_mins += t.estimated_duration

    conflicts = check_task_overlaps(tasks)

    return DaySummaryResponse(
        date=date,
        total_tasks=total,
        completed_tasks=completed,
        completion_rate=round(rate, 1),
        total_duration_minutes=total_mins,
        tasks=tasks,
        conflicts=conflicts
    )

@router.get("/upcoming", response_model=List[TaskResponse])
def get_upcoming_tasks(
    from_date: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    if not from_date:
        from_date = datetime.now().strftime("%Y-%m-%d")

    query = db.query(Task).filter(Task.date >= from_date)
    if category and category != "All":
        query = query.filter(Task.category == category)
    if priority and priority != "All":
        query = query.filter(Task.priority == priority)

    tasks = query.order_by(Task.date.asc(), Task.start_time.asc().nulls_last()).all()
    return tasks

@router.post("", response_model=TaskResponse, status_code=201)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db)):
    # Validate start/end time logic
    if task_in.start_time and task_in.end_time:
        if task_in.end_time <= task_in.start_time:
            raise HTTPException(
                status_code=400,
                detail="End time must be later than start time for same-day scheduled tasks."
            )
        # Auto-compute duration if not manually provided
        if not task_in.estimated_duration:
            task_in.estimated_duration = calculate_duration(task_in.start_time, task_in.end_time)

    db_task = Task(**task_in.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_in: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_in.model_dump(exclude_unset=True)

    # Check times validity if updated
    start = update_data.get("start_time", task.start_time)
    end = update_data.get("end_time", task.end_time)
    if start and end:
        if end <= start:
            raise HTTPException(
                status_code=400,
                detail="End time must be later than start time."
            )
        if "estimated_duration" not in update_data or update_data["estimated_duration"] is None:
            update_data["estimated_duration"] = calculate_duration(start, end)

    for field, val in update_data.items():
        setattr(task, field, val)

    db.commit()
    db.refresh(task)
    return task

@router.patch("/{task_id}/toggle", response_model=TaskResponse)
def toggle_task_completion(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.completed = not task.completed
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return None

@router.post("/{task_id}/reschedule", response_model=TaskResponse)
def reschedule_task(task_id: int, new_date: str, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.date = new_date
    db.commit()
    db.refresh(task)
    return task
