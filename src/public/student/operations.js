// Courses data
const courses = [
  { id: 1, name: "Culinary" },
  { id: 2, name: "Dutch" },
  { id: 3, name: "English" },
  { id: 4, name: "Papiamentu" },
  { id: 5, name: "Information Technology" }
];

const myCoursesList = document.getElementById('myCoursesList');
const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');

// Render enrolled courses
if (enrolledCourses.length === 0) {
  myCoursesList.innerHTML = '<p class="empty-message">You have not enrolled in any courses yet.</p>';
} else {
  enrolledCourses.forEach(courseId => {
    const course = courses.find(c => c.id === courseId);
    const progress = Math.floor(Math.random() * 101);

    const courseCard = document.createElement('div');
    courseCard.className = 'course-card';
    courseCard.innerHTML = `
      <h3>${course.name}</h3>
      <div class="progress-bar">
        <div class="progress-bar-inner" style="width:${progress}%"></div>
      </div>
      <p>${progress}% complete</p>
    `;
    myCoursesList.appendChild(courseCard);
  });
}

// Display student name
const studentName = localStorage.getItem('studentName') || 'Student';
document.getElementById('studentName').textContent = `Welcome, ${studentName}`;

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('studentName');
  localStorage.removeItem('studentCode');
  localStorage.removeItem('enrolledCourses');
  window.location.href = 'student login.html';
});
