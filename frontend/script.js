const API_BASE = "https://karyasaarthi-ai-1003198441621.us-central1.run.app";

const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const extractTasksBtn = document.getElementById("extractTasksBtn");
const savedNoteId = document.getElementById("savedNoteId");
const tasksContainer = document.getElementById("tasksContainer");
const planBtn = document.getElementById("planBtn");
const planContainer = document.getElementById("planContainer");
const loadTasksBtn = document.getElementById("loadTasksBtn");

const notesCount = document.getElementById("notesCount");
const tasksCount = document.getElementById("tasksCount");
const planStatus = document.getElementById("planStatus");

const calendarGrid = document.getElementById("calendarGrid");
const monthLabel = document.getElementById("monthLabel");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");

const dayModal = document.getElementById("dayModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const closeModalBtn = document.getElementById("closeModalBtn");

let currentNoteId = null;
let allTasks = [];
let allNotes = [];
let currentCalendarDate = new Date();

function priorityClass(priority) {
  if (priority === "high") return "priority-high";
  if (priority === "low") return "priority-low";
  return "priority-medium";
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function updateStats() {
  notesCount.textContent = allNotes.length;
  tasksCount.textContent = allTasks.length;
}

function renderTasks(tasks) {
  if (!tasks || tasks.length === 0) {
    tasksContainer.innerHTML = `<div class="empty-state">No tasks available.</div>`;
    return;
  }

  const html = tasks
    .map(
      (task) => `
        <div class="task-item">
          <div class="task-header">
            <div class="task-title">${escapeHtml(task.title)}</div>
            <span class="priority-badge ${priorityClass(task.priority)}">
              ${escapeHtml(task.priority.toUpperCase())}
            </span>
          </div>
          <div><strong>Status:</strong> ${escapeHtml(task.status)}</div>
          <div><strong>Description:</strong> ${escapeHtml(task.description || "No description")}</div>
          <div><strong>Source Note ID:</strong> ${task.source_note_id ?? "N/A"}</div>
        </div>
      `
    )
    .join("");

  tasksContainer.innerHTML = `<div class="task-list">${html}</div>`;
}

async function fetchNotes() {
  try {
    const response = await fetch(`${API_BASE}/notes`);
    if (!response.ok) throw new Error("Failed to fetch notes");
    allNotes = await response.json();
    updateStats();
  } catch (error) {
    console.error(error);
  }
}

async function saveNote() {
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();

  if (!title || !content) {
    alert("Please enter both note title and note content.");
    return;
  }

  savedNoteId.textContent = "Saving...";
  savedNoteId.className = "loading";

  try {
    const response = await fetch(`${API_BASE}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      throw new Error("Failed to save note");
    }

    const data = await response.json();
    currentNoteId = data.id;
    savedNoteId.textContent = data.id;
    savedNoteId.className = "success";

    await fetchNotes();
  } catch (error) {
    savedNoteId.textContent = "Error saving note";
    savedNoteId.className = "error";
    console.error(error);
  }
}

async function extractTasks() {
  if (!currentNoteId) {
    alert("Please save the note first.");
    return;
  }

  tasksContainer.innerHTML = `<div class="loading">Extracting tasks...</div>`;

  try {
    const response = await fetch(`${API_BASE}/tasks/from-note/${currentNoteId}`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to extract tasks");
    }

    const data = await response.json();
    allTasks = data;
    renderTasks(data);
    updateStats();
    renderCalendar();
  } catch (error) {
    tasksContainer.innerHTML = `<div class="error">Failed to extract tasks.</div>`;
    console.error(error);
  }
}

async function loadTasks() {
  tasksContainer.innerHTML = `<div class="loading">Loading tasks...</div>`;

  try {
    const response = await fetch(`${API_BASE}/tasks`);

    if (!response.ok) {
      throw new Error("Failed to load tasks");
    }

    const data = await response.json();
    allTasks = data;
    renderTasks(data);
    updateStats();
    renderCalendar();
  } catch (error) {
    tasksContainer.innerHTML = `<div class="error">Failed to load tasks.</div>`;
    console.error(error);
  }
}

async function generatePlan() {
  planContainer.innerHTML = `<div class="loading">Generating execution plan...</div>`;
  planStatus.textContent = "Generating...";

  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Create an execution plan for today",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate plan");
    }

    const data = await response.json();
    const result = data.result || {};

    const topTasks = (result.top_tasks || [])
      .map((task) => `<li>${escapeHtml(task)}</li>`)
      .join("");

    const freeSlots = (result.free_slots || [])
      .map((slot) => `<li>${escapeHtml(slot)}</li>`)
      .join("");

    planContainer.innerHTML = `
      <div class="plan-box">
        <strong>Intent:</strong> ${escapeHtml(data.intent)}<br><br>

        <strong>Agents Used:</strong><br>
        ${data.agents_used.map(escapeHtml).join(" → ")}<br><br>

        <strong>Top Tasks:</strong>
        <ul class="meta-list">${topTasks || "<li>No tasks found</li>"}</ul>

        <strong>Free Slots:</strong>
        <ul class="meta-list">${freeSlots || "<li>No slots found</li>"}</ul>

        <strong>Suggested Plan:</strong><br><br>
        ${escapeHtml(result.suggested_plan || "No plan generated")}
      </div>
    `;

    planStatus.textContent = "Generated";
  } catch (error) {
    planContainer.innerHTML = `<div class="error">Failed to generate execution plan.</div>`;
    planStatus.textContent = "Error";
    console.error(error);
  }
}

function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getFirstDayOfMonth(year, monthIndex) {
  return new Date(year, monthIndex, 1).getDay();
}

function formatDateKey(year, monthIndex, day) {
  const mm = String(monthIndex + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function buildMonthTaskMap(tasks, year, monthIndex) {
  const taskMap = {};
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const today = new Date();

  for (let day = 1; day <= daysInMonth; day++) {
    taskMap[formatDateKey(year, monthIndex, day)] = [];
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    const score = { high: 0, medium: 1, low: 2 };
    return (score[a.priority] ?? 3) - (score[b.priority] ?? 3);
  });

  let highIndex = 0;
  let mediumIndex = 0;
  let lowIndex = 0;

  sortedTasks.forEach((task) => {
    let day;

    if (task.priority === "high") {
      day = Math.min(daysInMonth, Math.max(1, today.getDate()) + (highIndex % 3));
      highIndex += 1;
    } else if (task.priority === "medium") {
      day = Math.min(daysInMonth, Math.max(1, today.getDate()) + 3 + (mediumIndex % 5));
      mediumIndex += 1;
    } else {
      day = Math.min(daysInMonth, Math.max(1, today.getDate()) + 8 + (lowIndex % 7));
      lowIndex += 1;
    }

    const key = formatDateKey(year, monthIndex, day);
    if (taskMap[key]) {
      taskMap[key].push(task);
    }
  });

  return taskMap;
}

function renderCalendar() {
  const year = currentCalendarDate.getFullYear();
  const monthIndex = currentCalendarDate.getMonth();
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const firstDay = getFirstDayOfMonth(year, monthIndex);
  const today = new Date();

  monthLabel.textContent = currentCalendarDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const taskMap = buildMonthTaskMap(allTasks, year, monthIndex);

  calendarGrid.innerHTML = "";

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty";
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const key = formatDateKey(year, monthIndex, day);
    const tasksForDay = taskMap[key] || [];
    const count = tasksForDay.length;

    const dayEl = document.createElement("div");
    dayEl.className = "calendar-day";

    if (count === 0) {
      dayEl.classList.add("free");
    } else if (count <= 2) {
      dayEl.classList.add("medium");
    } else {
      dayEl.classList.add("busy");
    }

    if (
      today.getFullYear() === year &&
      today.getMonth() === monthIndex &&
      today.getDate() === day
    ) {
      dayEl.classList.add("today");
    }

    dayEl.innerHTML = `
      <div class="day-number">${day}</div>
      <div class="day-count">${count === 0 ? "Free" : `${count} task${count > 1 ? "s" : ""}`}</div>
    `;

    dayEl.addEventListener("click", () => openDayModal(day, key, tasksForDay));
    calendarGrid.appendChild(dayEl);
  }
}

function openDayModal(day, dateKey, tasksForDay) {
  const dateObj = new Date(dateKey);
  modalTitle.textContent = dateObj.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!tasksForDay || tasksForDay.length === 0) {
    modalBody.innerHTML = `<div class="no-task">No tasks or meetings are planned for this day.</div>`;
  } else {
    modalBody.innerHTML = tasksForDay
      .map(
        (task) => `
          <div class="modal-task">
            <div><strong>Title:</strong> ${escapeHtml(task.title)}</div>
            <div><strong>Priority:</strong> ${escapeHtml(task.priority)}</div>
            <div><strong>Status:</strong> ${escapeHtml(task.status)}</div>
            <div><strong>Description:</strong> ${escapeHtml(task.description || "No description")}</div>
          </div>
        `
      )
      .join("");
  }

  dayModal.classList.remove("hidden");
}

function closeDayModal() {
  dayModal.classList.add("hidden");
}

prevMonthBtn.addEventListener("click", () => {
  currentCalendarDate = new Date(
    currentCalendarDate.getFullYear(),
    currentCalendarDate.getMonth() - 1,
    1
  );
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentCalendarDate = new Date(
    currentCalendarDate.getFullYear(),
    currentCalendarDate.getMonth() + 1,
    1
  );
  renderCalendar();
});

closeModalBtn.addEventListener("click", closeDayModal);

dayModal.addEventListener("click", (event) => {
  if (event.target === dayModal) {
    closeDayModal();
  }
});

saveNoteBtn.addEventListener("click", saveNote);
extractTasksBtn.addEventListener("click", extractTasks);
planBtn.addEventListener("click", generatePlan);
loadTasksBtn.addEventListener("click", loadTasks);

async function initDashboard() {
  await fetchNotes();
  await loadTasks();
  renderCalendar();
}

initDashboard();