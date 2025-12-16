// ===== ELEMENTS =====
const yearSpan = document.getElementById("y");
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const overlay = document.getElementById("overlay");
const menuLinks = document.querySelectorAll("nav a");
const pages = document.querySelectorAll(".page-section");

if (yearSpan) yearSpan.textContent = new Date().getFullYear();

// ===== DATA =====
const courses = [
  { id: 1, title: "Mental Health First Aid", description: "Learn how to provide initial support to someone in crisis." },
  { id: 2, title: "JavaScript", description: "Master the fundamentals of JavaScript programming." },
  { id: 3, title: "English", description: "Improve your English communication and writing." },
  { id: 4, title: "Papiamentu", description: "Explore the local language and culture." },
  { id: 5, title: "Information Technology", description: "Learn programming and computer systems." }
];

const STORAGE = "enrolledCourses";
let enrolledCourses = JSON.parse(localStorage.getItem(STORAGE) || "[]");
const saveEnrolled = () => localStorage.setItem(STORAGE, JSON.stringify(enrolledCourses));

// ===== SIDEBAR =====
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

// ===== NAVIGATION =====
menuLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    showPage(link.dataset.page);
    highlightNav(link);
    closeSidebar();
  });
});

function highlightNav(activeLink) {
  menuLinks.forEach(l => l.classList.remove("bg-[#1C1820]", "text-white"));
  activeLink.classList.add("bg-[#1C1820]", "text-white");
}

function showPage(id) {
  pages.forEach(p => p.classList.add("hidden"));
  document.getElementById(id)?.classList.remove("hidden");

  switch (id) {
    case "dashboard": loadDashboard(); break;
    case "courses": loadMyCourses(); break;
    case "enroll": loadEnroll(); break;
    case "assignments": loadAssignments(); break;
    case "schedule": loadSchedule(); break;
  }
}

// ===== DASHBOARD =====
function loadDashboard() {
  document.getElementById("activeCoursesCount").textContent = enrolledCourses.length;
  document.getElementById("totalCoursesCount").textContent = courses.length;
}

// ===== COURSE CARD =====
function createCourseCard(course, mode = "enroll") {
  const card = document.createElement("div");
  card.className = "bg-white p-4 rounded-xl shadow";

  const btn = document.createElement("button");
  const enrolled = enrolledCourses.includes(course.id);

  btn.textContent = mode === "unenroll" ? "Unenroll" : enrolled ? "Enrolled" : "Enroll";
  btn.className = `px-3 py-2 mt-3 rounded-xl border border-blue-300 transition
    ${enrolled && mode === "enroll" ? "bg-blue-500 text-white" : "hover:bg-blue-600 hover:text-white"}`;

  btn.addEventListener("click", () => {
    mode === "unenroll" ? unenrollCourse(course.id) : enrollCourse(course.id);
  });

  card.innerHTML = `
    <h3 class="text-lg font-semibold mb-2">${course.title}</h3>
    <p class="text-sm text-gray-600">${course.description}</p>
  `;
  card.appendChild(btn);

  return card;
}

// ===== MY COURSES =====
function loadMyCourses() {
  const section = document.getElementById("courses");

  if (!enrolledCourses.length) {
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
  enrolledCourses
    .map(id => courses.find(c => c.id === id))
    .forEach(course => list.appendChild(createCourseCard(course, "unenroll")));
}

// ===== ENROLL =====
function loadEnroll() {
  const section = document.getElementById("enroll");
  section.innerHTML = `
    <section class="content-box">
      <h2 class="text-xl font-semibold mb-4">Enroll in Courses</h2>
      <div id="enrollCoursesList" class="grid md:grid-cols-2 gap-4"></div>
    </section>`;

  const list = document.getElementById("enrollCoursesList");
  courses.forEach(course => list.appendChild(createCourseCard(course)));
}

// ===== ENROLL ACTIONS =====
function enrollCourse(id) {
  if (!enrolledCourses.includes(id)) {
    enrolledCourses.push(id);
    saveEnrolled();
    loadEnroll();
    loadDashboard();
  }
}

function unenrollCourse(id) {
  enrolledCourses = enrolledCourses.filter(cid => cid !== id);
  saveEnrolled();
  loadMyCourses();
  loadDashboard();
}

// ===== ASSIGNMENTS =====
function loadAssignments() {
  const list = document.getElementById("assignmentsList");
  const assignments = JSON.parse(localStorage.getItem("teacherAssignments") || "[]");

  list.innerHTML = assignments.length
    ? assignments.map(a => `
        <div class="bg-white p-4 rounded-xl shadow">
          <h3 class="font-semibold">${a.title}</h3>
          <p class="text-sm text-gray-600">${a.description}</p>
        </div>`).join("")
    : `<p class="text-gray-500 italic text-center">No assignments posted.</p>`;
}

// ===== SCHEDULE =====
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
    const key = `${y}-${m + 1}-${d}`;
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



// ======== PROFILE DROPDOWN ========
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

  document.getElementById("logoutBtn2").onclick = logout;

  function logout() {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "student login.html"; 
  }

// ===== INIT =====
showPage("dashboard");
loadDashboard();
