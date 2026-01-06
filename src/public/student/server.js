const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET = "supersecretkey"; // move to env later

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();

app.use(cors());
app.use(express.json());

const read = (file) =>
  JSON.parse(fs.readFileSync(`./data/${file}`, "utf8"));
const write = (file, data) =>
  fs.writeFileSync(`./data/${file}`, JSON.stringify(data, null, 2));

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const users = read("users.json");

  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  if (!bcrypt.compareSync(password, user.password))
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      role: user.role
    },
    SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, role: user.role }
  });
});

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
}


/* ===== COURSES ===== */
app.get("/api/courses", (req, res) => {
  res.json(read("courses.json"));
});

/* ===== ENROLL ===== */
app.post("/api/enroll", (req, res) => {
  const { userId, courseId } = req.body;
  const enrollments = read("enrollments.json");

  if (!enrollments[userId]) enrollments[userId] = [];
  if (!enrollments[userId].includes(courseId)) {
    enrollments[userId].push(courseId);
  }

  write("enrollments.json", enrollments);
  res.json({ success: true });
});

/* ===== MY COURSES ===== */
app.get("/api/my-courses/:userId", (req, res) => {
  const enrollments = read("enrollments.json");
  const courses = read("courses.json");

  const ids = enrollments[req.params.userId] || [];
  res.json(courses.filter(c => ids.includes(c.id)));
});

/* ===== ASSIGNMENTS ===== */
app.get("/api/assignments", (req, res) => {
  res.json(read("assignments.json"));
});

/*===========NEWS===========*/
app.get("/api/news", (req, res) => {
  res.json(read("news.json"));
});


fetch(url, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
);
