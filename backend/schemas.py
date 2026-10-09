from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
import re

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    date: str = Field(..., description="Date formatted as YYYY-MM-DD")
    start_time: Optional[str] = Field(None, description="24-hour time HH:MM")
    end_time: Optional[str] = Field(None, description="24-hour time HH:MM")
    category: str = Field("Personal")
    priority: str = Field("Medium")
    estimated_duration: Optional[int] = None
    recurrence: str = Field("None")
    completed: bool = False

    @field_validator("date")
    @classmethod
    def validate_date_format(cls, v: str) -> str:
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", v):
            raise ValueError("Date must be in YYYY-MM-DD format")
        return v

    @field_validator("start_time", "end_time")
    @classmethod
    def validate_time_format(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v != "":
            if not re.match(r"^([01]\d|2[0-3]):[0-5]\d$", v):
                raise ValueError("Time must be in 24-hour HH:MM format (00:00 to 23:59)")
            return v
        return None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    estimated_duration: Optional[int] = None
    recurrence: Optional[str] = None
    completed: Optional[bool] = None

class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ReflectionBase(BaseModel):
    date: str
    went_well: Optional[str] = None
    accomplished: Optional[str] = None
    improve_tomorrow: Optional[str] = None
    grateful_for: Optional[str] = None
    mood: Optional[str] = None

class ReflectionCreateOrUpdate(ReflectionBase):
    pass

class ReflectionResponse(ReflectionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SettingBase(BaseModel):
    preferred_name: str = "Friend"
    theme: str = "light"
    default_start_time: str = "09:00"
    default_end_time: str = "18:00"
    week_start: str = "Monday"
    reminders_enabled: bool = True

class SettingUpdate(BaseModel):
    preferred_name: Optional[str] = None
    theme: Optional[str] = None
    default_start_time: Optional[str] = None
    default_end_time: Optional[str] = None
    week_start: Optional[str] = None
    reminders_enabled: Optional[bool] = None

class SettingResponse(SettingBase):
    id: int

    class Config:
        from_attributes = True

class NoteBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: Optional[str] = None
    color: str = Field("default")
    pinned: bool = False
    tag: str = Field("General")

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    color: Optional[str] = None
    pinned: Optional[bool] = None
    tag: Optional[str] = None

class NoteResponse(NoteBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConflictWarning(BaseModel):
    task_id: int
    title: str
    start_time: str
    end_time: str
    overlap_with_task_id: Optional[int] = None
    overlap_with_title: Optional[str] = None
    message: str

class DaySummaryResponse(BaseModel):
    date: str
    total_tasks: int
    completed_tasks: int
    completion_rate: float
    total_duration_minutes: int
    tasks: List[TaskResponse]
    conflicts: List[ConflictWarning]

class DayAnalytics(BaseModel):
    date: str
    day_name: str
    planned: int
    completed: int
    completion_rate: float
    total_hours: float

class CategoryBreakdown(BaseModel):
    category: str
    count: int
    completed_count: int

class WeeklyAnalyticsResponse(BaseModel):
    start_date: str
    end_date: str
    total_planned: int
    total_completed: int
    weekly_completion_rate: float
    total_planned_hours: float
    most_productive_day: Optional[str]
    daily_stats: List[DayAnalytics]
    category_distribution: List[CategoryBreakdown]

# AI Planning Request/Response
class AIPlanRequest(BaseModel):
    date: str
    available_hours: Optional[str] = "09:00 - 18:00"
    important_tasks: List[str]
    priorities: Optional[str] = "High focus on critical projects in the morning"
    estimated_durations: Optional[str] = "30-60 mins each"
    fixed_commitments: Optional[str] = "Lunch 13:00 - 14:00"

class AIScheduleItem(BaseModel):
    title: str
    start_time: str
    end_time: str
    category: str
    priority: str
    description: Optional[str] = None
    estimated_duration: Optional[int] = None

class AIPlanResponse(BaseModel):
    summary: str
    suggested_tasks: List[AIScheduleItem]
