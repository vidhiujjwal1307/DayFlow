from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Setting
from ..schemas import SettingResponse, SettingUpdate

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("", response_model=SettingResponse)
def get_settings(db: Session = Depends(get_db)):
    setting = db.query(Setting).first()
    if not setting:
        setting = Setting(
            preferred_name="Friend",
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
def update_settings(setting_in: SettingUpdate, db: Session = Depends(get_db)):
    setting = db.query(Setting).first()
    if not setting:
        setting = Setting()
        db.add(setting)

    for field, val in setting_in.model_dump(exclude_unset=True).items():
        setattr(setting, field, val)

    db.commit()
    db.refresh(setting)
    return setting
