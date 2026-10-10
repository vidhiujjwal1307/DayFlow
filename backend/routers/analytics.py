from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from ..database import get_db
from ..models import User
from ..schemas import WeeklyAnalyticsResponse
from ..services.analytics_service import calculate_weekly_analytics
from ..auth import get_current_user_optional

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/weekly", response_model=WeeklyAnalyticsResponse)
def get_weekly_analytics(
    date: str = Query(default_factory=lambda: datetime.now().strftime("%Y-%m-%d")),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    return calculate_weekly_analytics(db, date, user_id=user_id)
