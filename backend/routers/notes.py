from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import Note
from ..schemas import NoteCreate, NoteUpdate, NoteResponse

router = APIRouter(prefix="/api/notes", tags=["Notes"])

@router.get("", response_model=List[NoteResponse])
def get_notes(
    search: Optional[str] = None,
    tag: Optional[str] = None,
    pinned_only: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Note)
    if search:
        query = query.filter(
            (Note.title.ilike(f"%{search}%")) | (Note.content.ilike(f"%{search}%"))
        )
    if tag and tag != "All":
        query = query.filter(Note.tag == tag)
    if pinned_only:
        query = query.filter(Note.pinned == True)

    # Order pinned first, then newest updated first
    notes = query.order_by(Note.pinned.desc(), Note.updated_at.desc()).all()
    return notes

@router.post("", response_model=NoteResponse, status_code=201)
def create_note(note_in: NoteCreate, db: Session = Depends(get_db)):
    note = Note(**note_in.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@router.get("/{note_id}", response_model=NoteResponse)
def get_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.put("/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, note_in: NoteUpdate, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    for field, val in note_in.model_dump(exclude_unset=True).items():
        setattr(note, field, val)

    db.commit()
    db.refresh(note)
    return note

@router.patch("/{note_id}/pin", response_model=NoteResponse)
def toggle_pin(note_id: int, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    note.pinned = not note.pinned
    db.commit()
    db.refresh(note)
    return note

@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()
    return None
