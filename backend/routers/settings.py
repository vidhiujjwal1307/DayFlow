from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models import Setting, User
from ..schemas import SettingResponse, SettingUpdate
from ..auth import get_current_user_optional

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("", response_model=SettingResponse)
def get_settings(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Setting)
    if current_user:
        query = query.filter(Setting.user_id == current_user.id)
    else:
        query = query.filter(Setting.user_id.is_(None))

    setting = query.first()
    if not setting:
        name = current_user.name if current_user else "Friend"
        user_id = current_user.id if current_user else None
        setting = Setting(
            user_id=user_id,
            preferred_name=name,
            theme="light",
            default_start_time="09:00",
            default_end_time="18:00",
            week_start="Monday",
            reminders_enabled=True
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting

@router.put("", response_model=SettingResponse)
def update_settings(
    setting_in: SettingUpdate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Setting)
    if current_user:
        query = query.filter(Setting.user_id == current_user.id)
    else:
        query = query.filter(Setting.user_id.is_(None))

    setting = query.first()
    if not setting:
        name = current_user.name if current_user else "Friend"
        user_id = current_user.id if current_user else None
        setting = Setting(user_id=user_id, preferred_name=name)
        db.add(setting)

    for field, val in setting_in.model_dump(exclude_unset=True).items():
        setattr(setting, field, val)

    # If user changed preferred_name and is logged in, sync to User model too
    if current_user and setting_in.preferred_name:
        current_user.name = setting_in.preferred_name

    db.commit()
    db.refresh(setting)
    return setting
