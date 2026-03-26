from typing import List, Optional

from pydantic import BaseModel


class NoteCreate(BaseModel):
    title: str
    content: str


class NoteResponse(BaseModel):
    id: int
    title: str
    content: str
    summary: Optional[str] = None

    class Config:
        from_attributes = True


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    source_note_id: Optional[int] = None

    class Config:
        from_attributes = True


class ScheduleBlockCreate(BaseModel):
    title: str
    start_time: str
    end_time: str


class ScheduleBlockResponse(BaseModel):
    id: int
    title: str
    start_time: str
    end_time: str
    status: str

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    intent: str
    agents_used: List[str]
    result: dict