from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from app.agents import notes_agent_extract_tasks, orchestrator_agent, schedule_agent_find_free_slots
from app.db import Base, engine, get_db
from app.models import Note
from app.schemas import (
    ChatRequest,
    ChatResponse,
    NoteCreate,
    NoteResponse,
    ScheduleBlockCreate,
    ScheduleBlockResponse,
    TaskResponse,
)
from app.tools import create_schedule_block_tool, list_notes_tool, list_tasks_tool, save_note_tool

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="KaryaSaarthi AI",
    description="An autonomous enterprise workflow assistant for notes, tasks, schedules, and execution planning.",
    version="0.2.0",
)


@app.get("/")
def root():
    return {
        "project": "KaryaSaarthi AI",
        "status": "running",
        "message": "Welcome to the autonomous enterprise workflow assistant API."
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/notes", response_model=NoteResponse)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    saved_note = save_note_tool(db, title=note.title, content=note.content, summary=None)
    return saved_note


@app.get("/notes", response_model=list[NoteResponse])
def get_notes(db: Session = Depends(get_db)):
    return list_notes_tool(db)


@app.post("/tasks/from-note/{note_id}", response_model=list[TaskResponse])
def extract_tasks_from_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    tasks = notes_agent_extract_tasks(db, note.content, source_note_id=note.id)
    return tasks


@app.get("/tasks", response_model=list[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    return list_tasks_tool(db)


@app.post("/schedule/block", response_model=ScheduleBlockResponse)
def create_schedule_block(block: ScheduleBlockCreate, db: Session = Depends(get_db)):
    created = create_schedule_block_tool(
        db,
        title=block.title,
        start_time=block.start_time,
        end_time=block.end_time,
    )
    return created


@app.get("/schedule/free-slots")
def get_free_slots(db: Session = Depends(get_db)):
    return {"free_slots": schedule_agent_find_free_slots(db)}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    return orchestrator_agent(db, request.message)