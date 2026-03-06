document.addEventListener("DOMContentLoaded", () => {

  // ---------- Helpers ----------
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function initials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] || "S";
    const b = parts[1]?.[0] || "";
    return (a + b).toUpperCase();
  }

  async function safeJson(res) {
    try { return await res.json(); } catch { return null; }
  }

  function isSameDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  // ---------- Auth guard ----------
  const role = (localStorage.getItem("role") || "").toLowerCase();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn || role !== "student") {
    window.location.replace(LOGIN_PATH);
    return;
  }

  // ---------- Theme ----------
  function applyTheme(theme) {
    const t = theme || localStorage.getItem("theme") || "light";
    document.documentElement.dataset.theme = t;
    localStorage.setItem("theme", t);
  }

  applyTheme();

  // ---------- Topbar ----------
  const userNameEl = qs("#userName");
  const avatarBtn = qs("#userAvatar");

  function renderTopbarIdentity() {
    const name = localStorage.getItem("userName") || "Student";
    const avatarData = localStorage.getItem("userAvatar") || "";

    if (userNameEl) userNameEl.textContent = name;

    if (!avatarBtn) return;

    if (avatarData) {
      avatarBtn.style.backgroundImage = `url(${avatarData})`;
      avatarBtn.style.backgroundSize = "cover";
      avatarBtn.style.backgroundPosition = "center";
      avatarBtn.textContent = "";
    } else {
      avatarBtn.style.backgroundImage = "";
      avatarBtn.textContent = initials(name);
    }
  }

  renderTopbarIdentity();

  // ---------- Logout ----------
  function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("userAvatar");

    window.location.replace(LOGIN_PATH);
  }

  qs("#logoutBtn")?.addEventListener("click", logout);
  qs("#sidebarLogout")?.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  // ---------- Personalize Modal ----------
  const personalizeBg = qs("#personalizeBg");
  const openPersonalizeBtn = qs("#openPersonalize");
  const closePersonalizeBtn = qs("#closePersonalize");
  const savePersonalizeBtn = qs("#savePersonalize");

  const profileNameInput = qs("#profileNameInput");
  const profilePhotoInput = qs("#profilePhotoInput");
  const profileEmailInput = qs("#profileEmailInput");
  const profilePhoneInput = qs("#profilePhoneInput");

  const removeAvatarBtn = qs("#removeAvatarBtn");
  const preview = qs("#profileAvatarPreview");

  function openPersonalize() {
    if (!personalizeBg) return;

    loadPersonalize();

    personalizeBg.classList.add("show");
    personalizeBg.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closePersonalize() {
    if (!personalizeBg) return;

    personalizeBg.classList.remove("show");
    personalizeBg.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function loadPersonalize() {
    const name = localStorage.getItem("userName") || "Student";
    const avatarData = localStorage.getItem("userAvatar") || "";
    const email = localStorage.getItem("userEmail") || "";
    const phone = localStorage.getItem("userPhone") || "";

    if (profileNameInput) profileNameInput.value = name;
    if (profileEmailInput) profileEmailInput.value = email;
    if (profilePhoneInput) profilePhoneInput.value = phone;

    if (!preview) return;

    if (avatarData) {
      preview.style.backgroundImage = `url(${avatarData})`;
      preview.style.backgroundSize = "cover";
      preview.style.backgroundPosition = "center";
      preview.textContent = "";
    } else {
      preview.style.backgroundImage = "";
      preview.textContent = initials(name);
    }
  }

  openPersonalizeBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    openPersonalize();
  });

  closePersonalizeBtn?.addEventListener("click", closePersonalize);

  personalizeBg?.addEventListener("click", (e) => {
    if (e.target === personalizeBg) closePersonalize();
  });

  // ---------- Photo Upload ----------
  profilePhotoInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      localStorage.setItem("userAvatar", event.target.result);
      loadPersonalize();
      renderTopbarIdentity();
    };

    reader.readAsDataURL(file);
  });

  removeAvatarBtn?.addEventListener("click", () => {
    localStorage.removeItem("userAvatar");
    loadPersonalize();
    renderTopbarIdentity();
  });

  // ---------- Save Personalize ----------
  savePersonalizeBtn?.addEventListener("click", () => {
    const newName = (profileNameInput?.value || "").trim() || "Student";
    const newEmail = (profileEmailInput?.value || "").trim();
    const newPhone = (profilePhoneInput?.value || "").trim();

    localStorage.setItem("userName", newName);
    localStorage.setItem("userEmail", newEmail);
    localStorage.setItem("userPhone", newPhone);

    renderTopbarIdentity();
    closePersonalize();
  });

  // ---------- Boot ----------
  qs("#y") && (qs("#y").textContent = new Date().getFullYear());
});
setupNotificationsUI();
  loadNotifications();
  setInterval(loadNotifications,15000);
  showPage("dashboard");
