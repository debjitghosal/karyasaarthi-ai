# KaryaSaarthi AI  
### Multi-Agent Productivity & Workflow Assistant

KaryaSaarthi AI is a multi-agent AI system that transforms unstructured inputs (such as meeting notes) into structured tasks, execution plans, and workload insights using Google Vertex AI (Gemini).

---

## Live Deployment

- **Frontend:**  
  https://karyasaarthi-frontend-1003198441621.us-central1.run.app  

- **Backend API:**  
  https://karyasaarthi-ai-1003198441621.us-central1.run.app  

- **Swagger Docs:**  
  https://karyasaarthi-ai-1003198441621.us-central1.run.app/docs  

---

## Problem

Users struggle to convert:
- meeting notes  
- ideas  
- unstructured discussions  

into clear, actionable workflows.

---

## Solution

KaryaSaarthi AI uses a multi-agent architecture to:

- Extract tasks from notes  
- Organize and prioritize them  
- Suggest execution plans  
- Provide workload visibility  
- Enable workflow automation  

---

## Architecture Overview

```text
+------------------+
|       User       |
+------------------+
         |
         v
+--------------------------------------+
| Frontend Dashboard (Cloud Run)       |
| - Note Input                         |
| - Task View                          |
| - Execution Plan View                |
| - AI Workload Planner / Calendar     |
+--------------------------------------+
         |
         v
+--------------------------------------+
| FastAPI Backend (Cloud Run)          |
+--------------------------------------+
         |
         v
+--------------------------------------+
| Orchestrator Agent                   |
| Routes requests and coordinates flow |
+--------------------------------------+
   |            |            |            |
   v            v            v            v
+----------+ +----------+ +-------------+ +-------------+
| Notes    | | Task     | | Schedule    | | Workflow    |
| Agent    | | Agent    | | Agent       | | Agent       |
+----------+ +----------+ +-------------+ +-------------+
     |            |            |               |
     |            |            |               |
     +------------+------------+---------------+
                          |
                          v
+--------------------------------------------------+
| Structured Data Store                            |
| - Notes                                          |
| - Tasks                                          |
| - Workflow Logs                                  |
+--------------------------------------------------+

+--------------------------------------+
| Gemini on Vertex AI                  |
| - Task extraction                    |
| - Prioritization support             |
| - Execution plan generation          |
+--------------------------------------+

Outputs returned to frontend:
- Structured Tasks
- Suggested Time Slots
- Execution Plan
- Workload Visibility


Author

Debjit Ghosal
