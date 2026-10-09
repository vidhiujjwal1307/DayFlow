from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import tasks, reflections, analytics, settings, ai, notes

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DayFlow API",
    description="Backend for DayFlow - Make Today Count",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks.router)
app.include_router(notes.router)
app.include_router(reflections.router)
app.include_router(analytics.router)
app.include_router(settings.router)
app.include_router(ai.router)

@app.get("/")
def root():
    return {
        "app": "DayFlow API",
        "status": "online",
        "motto": "Small steps make beautiful progress."
    }
