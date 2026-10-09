from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime

from ..database import get_db
from ..schemas import WeeklyAnalyticsResponse
from ..services.analytics_service import calculate_weekly_analytics

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/weekly", response_model=WeeklyAnalyticsResponse)
def get_weekly_analytics(
    date: str = Query(default_factory=lambda: datetime.now().strftime("%Y-%m-%d")),
    db: Session = Depends(get_db)
):
    return calculate_weekly_analytics(db, date)
