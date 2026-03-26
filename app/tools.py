from sqlalchemy.orm import Session

from app import models


def save_note_tool(db: Session, title: str, content: str, summary: str = None):
    note = models.Note(title=title, content=content, summary=summary)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def list_notes_tool(db: Session):
    return db.query(models.Note).order_by(models.Note.id.desc()).all()


def create_task_tool(
    db: Session,
    title: str,
    description: str = None,
    priority: str = "medium",
    source_note_id: int = None,
):
    task = models.Task(
        title=title,
        description=description,
        priority=priority,
        source_note_id=source_note_id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def list_tasks_tool(db: Session):
    return db.query(models.Task).order_by(models.Task.id.desc()).all()


def create_schedule_block_tool(db: Session, title: str, start_time: str, end_time: str):
    block = models.ScheduleBlock(
        title=title,
        start_time=start_time,
        end_time=end_time,
    )
    db.add(block)
    db.commit()
    db.refresh(block)
    return block


def list_schedule_blocks_tool(db: Session):
    return db.query(models.ScheduleBlock).order_by(models.ScheduleBlock.id.desc()).all()


def log_workflow_tool(db: Session, user_input: str, agent_path: str, result: str):
    log = models.WorkflowLog(
        user_input=user_input,
        agent_path=agent_path,
        result=result,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log