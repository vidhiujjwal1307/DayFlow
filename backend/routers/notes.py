from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import Note, User
from ..schemas import NoteCreate, NoteUpdate, NoteResponse
from ..auth import get_current_user_optional

router = APIRouter(prefix="/api/notes", tags=["Notes"])

@router.get("", response_model=List[NoteResponse])
def get_notes(
    search: Optional[str] = None,
    tag: Optional[str] = None,
    pinned_only: Optional[bool] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Note)
    if current_user:
        query = query.filter(Note.user_id == current_user.id)
    else:
        query = query.filter(Note.user_id.is_(None))

    if search:
        query = query.filter(
            (Note.title.ilike(f"%{search}%")) | (Note.content.ilike(f"%{search}%"))
        )
    if tag and tag != "All":
        query = query.filter(Note.tag == tag)
    if pinned_only:
        query = query.filter(Note.pinned == True)

    notes = query.order_by(Note.pinned.desc(), Note.updated_at.desc()).all()
    return notes

@router.post("", response_model=NoteResponse, status_code=201)
def create_note(
    note_in: NoteCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    note_data = note_in.model_dump()
    if current_user:
        note_data["user_id"] = current_user.id

    note = Note(**note_data)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@router.get("/{note_id}", response_model=NoteResponse)
def get_note(
    note_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Note).filter(Note.id == note_id)
    if current_user:
        query = query.filter(Note.user_id == current_user.id)
    note = query.first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.put("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: int,
    note_in: NoteUpdate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Note).filter(Note.id == note_id)
    if current_user:
        query = query.filter(Note.user_id == current_user.id)
    note = query.first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    for field, val in note_in.model_dump(exclude_unset=True).items():
        setattr(note, field, val)

    db.commit()
    db.refresh(note)
    return note

@router.patch("/{note_id}/pin", response_model=NoteResponse)
def toggle_pin(
    note_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Note).filter(Note.id == note_id)
    if current_user:
        query = query.filter(Note.user_id == current_user.id)
    note = query.first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    note.pinned = not note.pinned
    db.commit()
    db.refresh(note)
    return note

@router.delete("/{note_id}", status_code=204)
def delete_note(
    note_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Note).filter(Note.id == note_id)
    if current_user:
        query = query.filter(Note.user_id == current_user.id)
    note = query.first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()
    return None
