from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import Reflection
from ..schemas import ReflectionCreateOrUpdate, ReflectionResponse

router = APIRouter(prefix="/api/reflections", tags=["Reflections"])

@router.get("", response_model=List[ReflectionResponse])
def get_all_reflections(db: Session = Depends(get_db)):
    return db.query(Reflection).order_by(Reflection.date.desc()).all()

@router.get("/day/{date}", response_model=Optional[ReflectionResponse])
def get_reflection_by_date(date: str, db: Session = Depends(get_db)):
    reflection = db.query(Reflection).filter(Reflection.date == date).first()
    return reflection

@router.post("", response_model=ReflectionResponse)
def save_reflection(reflection_in: ReflectionCreateOrUpdate, db: Session = Depends(get_db)):
    existing = db.query(Reflection).filter(Reflection.date == reflection_in.date).first()
    if existing:
        # Update existing
        for key, value in reflection_in.model_dump().items():
            setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_ref = Reflection(**reflection_in.model_dump())
        db.add(new_ref)
        db.commit()
        db.refresh(new_ref)
        return new_ref

@router.delete("/day/{date}", status_code=204)
def delete_reflection(date: str, db: Session = Depends(get_db)):
    existing = db.query(Reflection).filter(Reflection.date == date).first()
    if existing:
        db.delete(existing)
        db.commit()
    return None
