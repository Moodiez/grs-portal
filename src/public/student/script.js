// ================== ELEMENTS ==================
const yearSpan = document.getElementById("y");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const overlay = document.getElementById("overlay");
const menuLinks = document.querySelectorAll("nav a");
const pages = document.querySelectorAll(".page-section");

// ================== GLOBAL STATE ==================
const user = JSON.parse(localStorage.getItem("user"));
const USER_ID = user?.id;
const API = "http://localhost:3000/api";
let courses = [];

if (!USER_ID) window.location.href = "login.html";

// ================== SIDEBAR ==================
menuBtn?.addEventListener("click", toggleSidebar);
overlay?.addEventListener("click", closeSidebar);

window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) closeSidebar();
});

function toggleSidebar() {
  sidebar.classList.toggle("-translate-x-full");
  overlay.classList.toggle("hidden");
}

function closeSidebar() {
  sidebar.classList.add("-translate-x-full");
  overlay.classList.add("hidden");
}


// ================== NAVIGATION ==================
menuLinks.forEach(link => {
  link.addEventListener("click", async e => {
    e.preventDefault();
    const page = link.dataset.page;
    await showPage(page);
    highlightNav(link);
    closeSidebar();
  });
});

function highlightNav(active) {
  menuLinks.forEach(l => l.classList.remove("bg-[#1C1820]", "text-white"));
  active?.classList.add("bg-[#1C1820]", "text-white");
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

// ================== LOAD COURSES ==================
async function loadCourses() {
  const res = await fetch(`${API}/courses`);
  courses = await res.json();
}

// ================== DASHBOARD ==================
async function loadDashboard() {
  const res = await fetch(`${API}/my-courses/${USER_ID}`);
  const myCourses = await res.json();

  document.getElementById("activeCoursesCount").textContent = myCourses.length;
  document.getElementById("totalCoursesCount").textContent = courses.length;

  const container = document.getElementById("continueCourses");
  if (!container) return;

  container.innerHTML = "";

  if (!myCourses.length) {
    container.innerHTML = `<p class="text-gray-500 italic">No courses yet.</p>`;
    return;
  }

  localStorage.setItem("lastCourse", myCourses[0].id);

  myCourses.slice(0, 2).forEach(course => {
    container.innerHTML += `
      <div class="bg-white p-4 rounded-xl shadow">
        <h4 class="font-semibold">${course.title}</h4>
        <p class="text-sm text-gray-600">${course.description}</p>
        <p class="text-xs text-gray-500 mt-1">Progress: 0%</p>
        <button class="mt-2 text-blue-600 text-sm" onclick="showPage('courses')">
          Continue
        </button>
      </div>`;
  });
}

// ================== COURSE CARD ==================
function createCourseCard(course, mode = "enroll") {
  const card = document.createElement("div");
  card.className = "bg-white p-4 rounded-xl shadow";

  card.innerHTML = `
    <h3 class="font-semibold">${course.title}</h3>
    <p class="text-sm text-gray-600">${course.description}</p>
  `;

  const btn = document.createElement("button");
  btn.textContent = mode === "unenroll" ? "Unenroll" : "Enroll";
  btn.className = "mt-3 px-3 py-1 border rounded";

  btn.onclick = () =>
    mode === "unenroll"
      ? unenrollCourse(course.id)
      : enrollCourse(course.id);

  card.appendChild(btn);
  return card;
}


// ================== MY COURSES ==================
async function loadMyCourses() {
  const section = document.getElementById("courses");
  const res = await fetch(`${API}/my-courses/${USER_ID}`);
  const myCourses = await res.json();

  if (!myCourses.length) {
    section.innerHTML = `
      <section class="content-box text-center">
        <h2 class="text-xl font-semibold">My Courses</h2>
        <p class="opacity-70 mt-4">You're not enrolled in any courses yet.</p>
      </section>`;
    return;
  }

  section.innerHTML = `
    <section class="content-box">
      <h2 class="text-xl font-semibold mb-4">My Courses</h2>
      <div id="myCoursesList" class="grid md:grid-cols-2 gap-4"></div>
    </section>`;

  const list = document.getElementById("myCoursesList");
  myCourses.forEach(course =>
    list.appendChild(createCourseCard(course, "unenroll"))
  );
}

// ================== ENROLL ==================
async function loadEnroll() {
  const section = document.getElementById("enroll");
  section.innerHTML = `
    <section class="content-box">
      <h2 class="text-xl font-semibold mb-4">Enroll in Courses</h2>
      <div id="enrollCoursesList" class="grid md:grid-cols-2 gap-4"></div>
    </section>`;

  const list = document.getElementById("enrollCoursesList");

  const res = await fetch(`${API}/my-courses/${USER_ID}`);
  const myCourses = await res.json();
  const myIds = new Set(myCourses.map(c => c.id));

  courses
    .filter(c => !myIds.has(c.id))
    .forEach(course => list.appendChild(createCourseCard(course)));
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
  const res = await fetch(`${API}/my-courses/${USER_ID}`);
  const myCourses = await res.json();
  const updatedCourses = myCourses.filter(c => c.id !== courseId);

  // Simulate unenrollment by rewriting enrollments
  const enrollments = {};
  enrollments[USER_ID] = updatedCourses.map(c => c.id);
  await fetch(`${API}/unenroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(enrollments)
  });
  await loadMyCourses();
  await loadEnroll();
}

// ================== ASSIGNMENTS ==================
async function loadAssignments() {
  const res = await fetch(`${API}/assignments`);
  const apiAssignments = await res.json();

  const list = document.getElementById("assignmentsList");
 
  const assignments = JSON.parse(localStorage.getItem("teacherAssignments") || "[]")
  list.innerHTML = assignments.length
    ? assignments.map(a => `
      <div class="bg-white p-4 rounded shadow">
        <h3 class="font-semibold">${a.title}</h3>
        <p class="text-sm">${a.description}</p>
      </div>`).join("")
    : `<p class="italic text-gray-500">No assignments posted.</p>`;
}


// ================== SCHEDULE ==================
let schedDate = new Date();
let activeDate = null;
const plans = JSON.parse(localStorage.getItem("plans") || "{}");

function loadSchedule() {
  renderCalendar();
  renderPlans();
}

function renderCalendar() {
  const y = schedDate.getFullYear();
  const m = schedDate.getMonth();
  const today = new Date().toDateString();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();

  monthYear.textContent = schedDate.toLocaleString("default", { month: "long", year: "numeric" });
  calendarDays.innerHTML = "";

  for (let i = 0; i < first; i++) calendarDays.innerHTML += "<div></div>";

  for (let d = 1; d <= days; d++) {
    const key = new Date(y, m, d).toISOString().split("T")[0];
    const isToday = new Date(y, m, d).toDateString() === today;

    calendarDays.innerHTML += `
      <div class="p-2 text-sm rounded cursor-pointer text-center
      ${isToday ? "bg-green-200" : plans[key] ? "bg-blue-100" : "hover:bg-gray-100"}"
      onclick="openPlan('${key}')">${d}</div>`;
  }
}

function renderPlans() {
  plansList.innerHTML = "";
  const keys = Object.keys(plans).sort((a, b) => new Date(a) - new Date(b));
  plansList.innerHTML = keys.length
    ? keys.map(k => `<div onclick="openPlan('${k}')" class="cursor-pointer hover:underline">${k}: ${plans[k]}</div>`).join("")
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

//=================NEWS==================
async function loadNews() {
  const res = await fetch(`${API}/news`);
  const news = await res.json();
}

// ================== LOGIN ==================
localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));
localStorage.setItem("isLoggedIn", "true");


// ================== PROFILE DROPDOWN ==================
  const userName = document.getElementById("userName");
  const userAvatar = document.getElementById("userAvatar");

  const name = localStorage.getItem("userName") || "Student";
  userName.textContent = name;

  userAvatar.style.backgroundImage = "url('https://i.pravatar.cc/40')";
  userAvatar.style.backgroundSize = "cover";

  const dropdown = document.createElement("div");
  dropdown.id = "profileMenu";
  dropdown.className =
    "absolute right-4 top-14 bg-[#3E3B59] text-[#F2F0E5] rounded-lg shadow-lg hidden";
  dropdown.innerHTML = `
    <button id="viewProfile" class="block w-full text-left px-4 py-2 hover:bg-[#4E4A69]">View Profile</button>
    <button id="logoutBtn2" class="block w-full text-left px-4 py-2 hover:bg-[#4E4A69]">Logout</button>
  `;
  document.body.appendChild(dropdown);

  userAvatar.addEventListener("click", () =>
    dropdown.classList.toggle("hidden")
  );
  document.addEventListener("click", e => {
  if (!userAvatar.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.add("hidden");
  }
});

document.getElementById("logoutBtn2").onclick = logout;

  function logout() {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "login.html"; 
  }

// ================== INIT ==================
(async function init() {
  await loadCourses();
  highlightNav(document.querySelector('[data-page="dashboard"]'));
  await showPage("dashboard");
})();


