from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from datetime import datetime
from .database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    start_time = Column(String(5), nullable=True)          # HH:MM (24h)
    end_time = Column(String(5), nullable=True)            # HH:MM (24h)
    category = Column(String(50), default="Personal")      # Study, College, Project, Personal, Health, Other
    priority = Column(String(20), default="Medium")        # High, Medium, Low
    estimated_duration = Column(Integer, nullable=True)    # In minutes
    recurrence = Column(String(50), default="None")        # None, Daily, Weekdays
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Reflection(Base):
    __tablename__ = "reflections"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(10), unique=True, nullable=False, index=True)  # YYYY-MM-DD
    went_well = Column(Text, nullable=True)
    accomplished = Column(Text, nullable=True)
    improve_tomorrow = Column(Text, nullable=True)
    grateful_for = Column(Text, nullable=True)
    mood = Column(String(30), nullable=True)  # Calmed, Energized, Grateful, Proud, Relaxed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    preferred_name = Column(String(100), default="Friend")
    theme = Column(String(20), default="light")
    default_start_time = Column(String(5), default="09:00")
    default_end_time = Column(String(5), default="18:00")
    week_start = Column(String(20), default="Monday")  # Monday, Sunday
    reminders_enabled = Column(Boolean, default=True)

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)
    color = Column(String(30), default="default")  # default, sage, cream, teal, blush, sky
    pinned = Column(Boolean, default=False)
    tag = Column(String(50), default="General")    # General, Ideas, Quick Note, Study, Project
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

