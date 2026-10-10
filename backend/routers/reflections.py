from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import Reflection, User
from ..schemas import ReflectionCreateOrUpdate, ReflectionResponse
from ..auth import get_current_user_optional

router = APIRouter(prefix="/api/reflections", tags=["Reflections"])

@router.get("", response_model=List[ReflectionResponse])
def get_all_reflections(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Reflection)
    if current_user:
        query = query.filter(Reflection.user_id == current_user.id)
    else:
        query = query.filter(Reflection.user_id.is_(None))
    return query.order_by(Reflection.date.desc()).all()

@router.get("/day/{date}", response_model=Optional[ReflectionResponse])
def get_reflection_by_date(
    date: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Reflection).filter(Reflection.date == date)
    if current_user:
        query = query.filter(Reflection.user_id == current_user.id)
    else:
        query = query.filter(Reflection.user_id.is_(None))
    return query.first()

@router.post("", response_model=ReflectionResponse)
def save_reflection(
    reflection_in: ReflectionCreateOrUpdate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Reflection).filter(Reflection.date == reflection_in.date)
    if current_user:
        query = query.filter(Reflection.user_id == current_user.id)
    else:
        query = query.filter(Reflection.user_id.is_(None))

    existing = query.first()
    if existing:
        for key, value in reflection_in.model_dump().items():
            setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        return existing
    else:
        ref_data = reflection_in.model_dump()
        if current_user:
            ref_data["user_id"] = current_user.id
        new_ref = Reflection(**ref_data)
        db.add(new_ref)
        db.commit()
        db.refresh(new_ref)
        return new_ref

@router.delete("/day/{date}", status_code=204)
def delete_reflection(
    date: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Reflection).filter(Reflection.date == date)
    if current_user:
        query = query.filter(Reflection.user_id == current_user.id)
    else:
        query = query.filter(Reflection.user_id.is_(None))
    existing = query.first()
    if existing:
        db.delete(existing)
        db.commit()
    return None
