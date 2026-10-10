from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(100), default="Friend")
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    reflections = relationship("Reflection", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    setting = relationship("Setting", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
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

    user = relationship("User", back_populates="tasks")

class Reflection(Base):
    __tablename__ = "reflections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    went_well = Column(Text, nullable=True)
    accomplished = Column(Text, nullable=True)
    improve_tomorrow = Column(Text, nullable=True)
    grateful_for = Column(Text, nullable=True)
    mood = Column(String(30), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="reflections")

class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    preferred_name = Column(String(100), default="Friend")
    theme = Column(String(20), default="light")
    default_start_time = Column(String(5), default="09:00")
    default_end_time = Column(String(5), default="18:00")
    week_start = Column(String(20), default="Monday")  # Monday, Sunday
    reminders_enabled = Column(Boolean, default=True)

    user = relationship("User", back_populates="setting")

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)
    color = Column(String(30), default="default")  # default, sage, cream, teal, blush, sky
    pinned = Column(Boolean, default=False)
    tag = Column(String(50), default="General")    # General, Ideas, Quick Note, Study, Project
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="notes")
