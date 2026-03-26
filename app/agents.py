from sqlalchemy.orm import Session

from app.ai import generate_text
from app.prompts import DAY_PLANNING_PROMPT, TASK_EXTRACTION_PROMPT
from app.tools import (
    create_task_tool,
    list_schedule_blocks_tool,
    list_tasks_tool,
    log_workflow_tool,
)


def notes_agent_extract_tasks(db: Session, note_content: str, source_note_id: int = None):
    prompt = TASK_EXTRACTION_PROMPT.format(note_content=note_content)
    model_output = generate_text(prompt)

    created_tasks = []

    if model_output and model_output.strip() != "NO_TASKS":
        lines = [line.strip() for line in model_output.splitlines() if line.strip()]

        for line in lines[:8]:
            parts = [p.strip() for p in line.split("|")]
            if len(parts) >= 4:
                title, priority, owner, description = parts[0], parts[1].lower(), parts[2], parts[3]

                if priority not in ["high", "medium", "low"]:
                    priority = "medium"

                full_description = f"Owner: {owner}. {description}"

                task = create_task_tool(
                    db=db,
                    title=title[:100],
                    description=full_description,
                    priority=priority,
                    source_note_id=source_note_id,
                )
                created_tasks.append(task)

    if created_tasks:
        return created_tasks

    # Fallback if Gemini is unavailable or returns nothing useful
    lines = [line.strip("-• ").strip() for line in note_content.splitlines() if line.strip()]

    for line in lines[:8]:
        priority = "medium"
        lowered = line.lower()

        if any(word in lowered for word in ["urgent", "asap", "important", "immediately", "blocker"]):
            priority = "high"
        elif any(word in lowered for word in ["later", "optional", "sometime"]):
            priority = "low"

        task = create_task_tool(
            db=db,
            title=line[:100],
            description=f"Owner: unassigned. {line}",
            priority=priority,
            source_note_id=source_note_id,
        )
        created_tasks.append(task)

    return created_tasks


def schedule_agent_find_free_slots(db: Session):
    blocks = list_schedule_blocks_tool(db)

    if not blocks:
        return [
            "Tomorrow 10:00 AM - 12:00 PM",
            "Tomorrow 3:00 PM - 5:00 PM",
            "Tomorrow 7:00 PM - 8:30 PM",
        ]

    return [
        "Tomorrow 8:00 AM - 9:00 AM",
        "Tomorrow 1:00 PM - 2:00 PM",
        "Tomorrow 6:00 PM - 7:00 PM",
    ]


def workflow_agent_plan_day(db: Session):
    tasks = list_tasks_tool(db)[:5]
    free_slots = schedule_agent_find_free_slots(db)

    task_lines = []
    for task in tasks:
        task_lines.append(f"{task.title} | {task.priority} | {task.status} | {task.description}")

    prompt = DAY_PLANNING_PROMPT.format(
        tasks="\n".join(task_lines) if task_lines else "No tasks available",
        free_slots="\n".join(free_slots),
    )

    model_plan = generate_text(prompt)

    result = {
        "top_tasks": [task.title for task in tasks],
        "free_slots": free_slots,
        "suggested_plan": model_plan if model_plan else (
            "Start with the highest-priority task in the first free slot, then complete medium-priority "
            "items in the next slot, and reserve the final slot for review and escalation handling."
        ),
    }

    return result


def orchestrator_agent(db: Session, message: str):
    lowered = message.lower()

    if "plan my day" in lowered or "today" in lowered or "execution plan" in lowered:
        result = workflow_agent_plan_day(db)
        log_workflow_tool(
            db,
            message,
            "orchestrator->task_agent->schedule_agent->workflow_agent",
            str(result),
        )
        return {
            "intent": "execution_planning",
            "agents_used": ["orchestrator", "task_agent", "schedule_agent", "workflow_agent"],
            "result": result,
        }

    if "free slot" in lowered or "schedule" in lowered or "block" in lowered:
        free_slots = schedule_agent_find_free_slots(db)
        result = {"free_slots": free_slots}
        log_workflow_tool(db, message, "orchestrator->schedule_agent", str(result))
        return {
            "intent": "schedule_management",
            "agents_used": ["orchestrator", "schedule_agent"],
            "result": result,
        }

    tasks = list_tasks_tool(db)[:5]
    result = {
        "message": "I can help extract enterprise tasks from meeting notes, create execution plans, and suggest scheduling slots.",
        "current_task_count": len(tasks),
    }
    log_workflow_tool(db, message, "orchestrator", str(result))
    return {
        "intent": "general_enterprise_workflow",
        "agents_used": ["orchestrator"],
        "result": result,
    }