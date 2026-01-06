/* ===================== CONFIG ===================== */
const API = "http://localhost:3000/api";

/* ===================== AUTH ===================== */
const user = JSON.parse(localStorage.getItem("user"));
const USER_ID = user?.id;

if (!USER_ID) {
  window.location.href = "login.html";
}

/* ===================== ELEMENTS ===================== */
const yearSpan = document.getElementById("y");
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const overlay = document.getElementById("overlay");
const menuLinks = document.querySelectorAll("nav a");
const pages = document.querySelectorAll(".page-section");

const userName = document.getElementById("userName");
const userAvatar = document.getElementById("userAvatar");

/* Schedule */
const monthYear = document.getElementById("monthYear");
const calendarDays = document.getElementById("calendarDays");
const plansList = document.getElementById("plansList");
const planModal = document.getElementById("planModal");
const modalDate = document.getElementById("modalDate");
const planInput = document.getElementById("planInput");
const savePlan = document.getElementById("savePlan");
const deletePlan = document.getElementById("deletePlan");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

/* ===================== STATE ===================== */
let courses = [];
let schedDate = new Date();
let activeDate = null;
const plans = JSON.parse(localStorage.getItem("plans") || "{}");

/* ===================== INIT ===================== */
yearSpan.textContent = new Date().getFullYear();
userName.textContent = user.name || "Student";
userAvatar.style.backgroundImage = "url('https://i.pravatar.cc/40')";
userAvatar.style.backgroundSize = "cover";

/* ===================== SIDEBAR ===================== */
menuBtn?.addEventListener("click", toggleSidebar);
overlay?.addEventListener("click", closeSidebar);

function toggleSidebar() {
  sidebar.classList.toggle("-translate-x-full");
  overlay.classList.toggle("hidden");
}

function closeSidebar() {
  sidebar.classList.add("-translate-x-full");
  overlay.classList.add("hidden");
}

/* ===================== NAVIGATION ===================== */
menuLinks.forEach(link => {
  link.addEventListener("click", async e => {
    e.preventDefault();
    const page = link.dataset.page;
    highlightNav(link);
    closeSidebar();
    await showPage(page);
  });
});

function highlightNav(active) {
  menuLinks.forEach(l => l.classList.remove("bg-[#1C1820]", "text-white"));
  active.classList.add("bg-[#1C1820]", "text-white");
}

async function showPage(id) {
  pages.forEach(p => p.classList.add("hidden"));
  document.getElementById(id)?.classList.remove("hidden");

  if (id === "dashboard") await loadDashboard();
  if (id === "courses") await loadMyCourses();
  if (id === "enroll") await loadEnroll();
  if (id === "assignments") await loadAssignments();
  if (id === "schedule") loadSchedule();
}

/* ===================== DATA ===================== */
async function loadCourses() {
  const res = await fetch(`${API}/courses`);
  courses = await res.json();
}

/* ===================== DASHBOARD ===================== */
async function loadDashboard() {
  const res = await fetch(`${API}/my-courses/${USER_ID}`);
  const myCourses = await res.json();

  document.getElementById("activeCoursesCount").textContent = myCourses.length;
  document.getElementById("totalCoursesCount").textContent = courses.length;

  const container = document.getElementById("continueCourses");
  container.innerHTML = "";

  if (!myCourses.length) {
    container.innerHTML = `<p class="italic text-gray-500">No courses yet.</p>`;
    return;
  }

  myCourses.slice(0, 2).forEach(course => {
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded-xl shadow";
    card.innerHTML = `
      <h4 class="font-semibold">${course.title}</h4>
      <p class="text-sm text-gray-600">${course.description}</p>
    `;
    container.appendChild(card);
  });
}

/* ===================== COURSES ===================== */
function createCourseCard(course, enrolled) {
  const card = document.createElement("div");
  card.className = "bg-white p-4 rounded-xl shadow";

  const btn = document.createElement("button");
  btn.textContent = enrolled ? "Unenroll" : "Enroll";
  btn.className = "mt-3 px-3 py-1 border rounded";

  btn.onclick = async () => {
    if (enrolled) {
      await unenrollCourse(course.id);
    } else {
      await enrollCourse(course.id);
    }
  };

  card.innerHTML = `
    <h3 class="font-semibold">${course.title}</h3>
    <p class="text-sm text-gray-600">${course.description}</p>
  `;
  card.appendChild(btn);

  return card;
}

async function loadMyCourses() {
  const section = document.getElementById("courses");
  const res = await fetch(`${API}/my-courses/${USER_ID}`);
  const myCourses = await res.json();

  section.innerHTML = `
    <section class="content-box">
      <h2 class="text-xl font-semibold mb-4">My Courses</h2>
      <div id="myCoursesList" class="grid md:grid-cols-2 gap-4"></div>
    </section>
  `;

  const list = document.getElementById("myCoursesList");
  myCourses.forEach(c => list.appendChild(createCourseCard(c, true)));
}

async function loadEnroll() {
  const section = document.getElementById("enroll");
  const res = await fetch(`${API}/my-courses/${USER_ID}`);
  const myCourses = await res.json();
  const myIds = new Set(myCourses.map(c => c.id));

  section.innerHTML = `
    <section class="content-box">
      <h2 class="text-xl font-semibold mb-4">Enroll in Courses</h2>
      <div id="enrollCoursesList" class="grid md:grid-cols-2 gap-4"></div>
    </section>
  `;

  const list = document.getElementById("enrollCoursesList");
  courses.filter(c => !myIds.has(c.id))
    .forEach(c => list.appendChild(createCourseCard(c, false)));
}

async function enrollCourse(courseId) {
  await fetch(`${API}/enroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: USER_ID, courseId })
  });
  await loadMyCourses();
  await loadEnroll();
}

async function unenrollCourse(courseId) {
  await fetch(`${API}/unenroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: USER_ID, courseId })
  });
  await loadMyCourses();
  await loadEnroll();
}

/* ===================== ASSIGNMENTS ===================== */
async function loadAssignments() {
  const res = await fetch(`${API}/assignments`);
  const assignments = await res.json();
  const list = document.getElementById("assignmentsList");

  list.innerHTML = assignments.length
    ? assignments.map(a => `
      <div class="bg-white p-4 rounded shadow">
        <h3 class="font-semibold">${a.title}</h3>
        <p class="text-sm">${a.description}</p>
      </div>
    `).join("")
    : `<p class="italic text-gray-500">No assignments.</p>`;
}

const section = document.getElementById("assignments");
  section.innerHTML = `
    <section class="content-box">
      <h2 class="text-xl font-semibold mb-4">Assignments</h2>
      <div id="assignmentsList" class="space-y-4"></div>
    </section>
  `;    
  assignments.forEach(a => {
    const div = document.createElement("div");
    div.className = "p-4 border rounded"; 
    div.innerHTML = `
      <h3 class="font-semibold">${a.title}</h3>
      <p>${a.description}</p>   
      <button onclick="submitAssignment(${a.id})" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Submit</button>
    `;
    document.getElementById("assignmentsList").appendChild(div);
  });       
async function submitAssignment(assignmentId) {
  const content = prompt("Enter your assignment submission:");
  if (!content) return; 
  await fetch(`${API}/submit-assignment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: USER_ID, assignmentId, content })
  });
  alert("Assignment submitted successfully!");
}


/* ===================== SCHEDULE ===================== */
function loadSchedule() {
  renderCalendar();
  renderPlans();
}

function renderCalendar() {
  const y = schedDate.getFullYear();
  const m = schedDate.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();

  monthYear.textContent = schedDate.toLocaleString("default", { month: "long", year: "numeric" });
  calendarDays.innerHTML = "";

  for (let i = 0; i < first; i++) calendarDays.appendChild(document.createElement("div"));

  for (let d = 1; d <= days; d++) {
    const key = new Date(y, m, d).toISOString().split("T")[0];
    const cell = document.createElement("div");

    cell.textContent = d;
    cell.className = "p-2 text-sm rounded cursor-pointer text-center hover:bg-gray-100";
    if (plans[key]) cell.classList.add("bg-blue-100");

    cell.onclick = () => openPlan(key);
    calendarDays.appendChild(cell);
  }
}

function renderPlans() {
  plansList.innerHTML = Object.keys(plans).length
    ? Object.entries(plans).map(([k, v]) =>
        `<div class="cursor-pointer hover:underline" onclick="openPlan('${k}')">${k}: ${v}</div>`
      ).join("")
    : `<p class="italic text-gray-400">No plans yet</p>`;
}

function openPlan(date) {
  activeDate = date;
  modalDate.textContent = date;
  planInput.value = plans[date] || "";
  planModal.classList.remove("hidden");
}

savePlan.onclick = () => {
  planInput.value.trim()
    ? plans[activeDate] = planInput.value.trim()
    : delete plans[activeDate];

  localStorage.setItem("plans", JSON.stringify(plans));
  planModal.classList.add("hidden");
  renderCalendar();
  renderPlans();
};

deletePlan.onclick = () => {
  delete plans[activeDate];
  localStorage.setItem("plans", JSON.stringify(plans));
  planModal.classList.add("hidden");
  renderCalendar();
  renderPlans();
};

prevMonth.onclick = () => { schedDate.setMonth(schedDate.getMonth() - 1); renderCalendar(); };
nextMonth.onclick = () => { schedDate.setMonth(schedDate.getMonth() + 1); renderCalendar(); };

/* ===================== LOGOUT ===================== */
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// ================== INIT ==================
(async function init() {
  await loadCourses();
  highlightNav(document.querySelector('[data-page="dashboard"]'));
  await showPage("dashboard");
})();

