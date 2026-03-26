TASK_EXTRACTION_PROMPT = """
You are an expert enterprise workflow assistant.

Read the meeting note below and extract actionable enterprise tasks.

Rules:
- Return only actionable tasks.
- Keep each task short and practical.
- Assign one priority: high, medium, or low.
- Infer an owner if possible, otherwise write unassigned.
- If there are no clear tasks, return: NO_TASKS

Output format exactly:
Task title | priority | owner | short description

Meeting note:
{note_content}
"""


DAY_PLANNING_PROMPT = """
You are an enterprise workflow planning assistant.

Using the tasks and free slots below, create a short execution plan.

Rules:
- Prioritize high priority tasks first.
- Group work logically.
- Keep the answer concise and practical.
- Mention blockers or escalation risks if visible.

Tasks:
{tasks}

Free slots:
{free_slots}
"""