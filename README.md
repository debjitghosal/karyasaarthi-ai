# KaryaSaarthi AI  
### Multi-Agent Productivity & Workflow Assistant

KaryaSaarthi AI is a multi-agent AI system that transforms unstructured user inputs (such as meeting notes) into structured tasks, schedules, and execution plans using Google Cloud Vertex AI (Gemini).

---

## Problem

Users often struggle to convert:
- meeting notes  
- ideas  
- unstructured inputs  

into clear, actionable workflows.

---

## Solution

KaryaSaarthi AI uses a multi-agent architecture to:

- Extract tasks from notes  
- Organize and prioritize them  
- Suggest execution plans  
- Enable workflow automation  

---

## Architecture Overview

```mermaid
flowchart TD
    A[User Input] --> B[Orchestrator Agent]

    B --> C[Notes Agent]
    B --> D[Task Agent]
    B --> E[Schedule Agent]

    C --> F[Workflow Agent]
    D --> F
    E --> F

    F --> G[Execution Plan Output]
    G --> H[(SQLite Database)]

    C --> I[Gemini Vertex AI]
    D --> I
    E --> I
    F --> I

```mermaid
flowchart TD
    A[User Input] --> B[Orchestrator Agent]

    B --> C[Notes Agent]
    B --> D[Task Agent]
    B --> E[Schedule Agent]

    C --> F[Workflow Agent]
    D --> F
    E --> F

    F --> G[Execution Plan Output]
    G --> H[(Database - SQLite)]

    F --> I[Gemini (Vertex AI)]
    C --> I
    D --> I
    E --> I


    Agents
Agent	Responsibility
Orchestrator Agent	Routes user requests and coordinates workflow
Notes Agent	Extracts tasks from notes
Task Agent	Stores and manages structured tasks
Schedule Agent	Finds available time slots
Workflow Agent	Generates execution plans using AI
Tools & Integrations
Gemini (Vertex AI) — reasoning and planning
SQLite Database — notes, tasks, workflows
Tool Layer (MCP-style):
Task Manager
Notes Storage
Scheduling Logic
Workflow Example
User submits meeting notes
Notes Agent extracts tasks
Tasks stored in database
Schedule Agent suggests time slots
Workflow Agent generates execution plan
API Endpoints
Endpoint	Description
POST /notes	Save meeting notes
GET /notes	Retrieve notes
POST /tasks/from-note/{id}	Extract tasks
GET /tasks	List tasks
POST /schedule/block	Add schedule block
GET /schedule/free-slots	Get available slots
POST /chat	Multi-agent execution planning
Live Deployment

Cloud Run API:
https://karyasaarthi-ai-1003198441621.us-central1.run.app

Swagger Documentation:
https://karyasaarthi-ai-1003198441621.us-central1.run.app/docs

Tech Stack
Backend: FastAPI (Python)
AI: Google Vertex AI (Gemini)
Database: SQLite
Deployment: Google Cloud Run
Containerization: Docker
Local Setup
1. Clone the repository
git clone <your-repo-link>
cd karyasaarthi-ai
2. Create virtual environment
python -m venv venv
3. Activate environment (Windows)
venv\Scripts\Activate.ps1
4. Install dependencies
pip install -r requirements.txt
5. Set environment variables
set GOOGLE_GENAI_USE_VERTEXAI=true
set GOOGLE_CLOUD_PROJECT=karyasaarthi-ai
set GOOGLE_CLOUD_LOCATION=us-central1
6. Run the server
uvicorn app.main:app --reload
Deployment (Cloud Run)
gcloud run deploy karyasaarthi-ai \
  --source . \
  --allow-unauthenticated \
  --region us-central1
Key Highlights
Multi-agent architecture
Real-world workflow automation
AI + structured data integration
API-based system
Cloud-native deployment
Impact
Reduces manual task planning effort
Converts unstructured notes into actionable workflows
Improves productivity and execution clarity


<!-- Author

Debjit Ghosal -->