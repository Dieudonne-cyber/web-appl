/* =========================================================================
   nav.js
   Renders the shared navigation bar into <div id="site-navbar"></div> and
   provides a simple auth guard for pages that require a logged-in user
   (Upload, Results, Chatbot).
   ========================================================================= */

function renderNavbar(activePage) {
  const mount = document.getElementById("site-navbar");
  if (!mount) return;

  const session = DB.getCurrentSession();

  const links = [
    { key: "home", label: "Home", href: "index.html" },
    { key: "upload", label: "Upload", href: "upload.html" },
    { key: "results", label: "Results", href: "results.html" },
    { key: "chatbot", label: "Chatbot", href: "chatbot.html" },
  ];

  const linksHtml = links
    .map(
      (l) =>
        `<li><a href="${l.href}" class="${l.key === activePage ? "active" : ""}">${l.label}</a></li>`
    )
    .join("");

  const authHtml = session
    ? `<li><a href="login.html" class="${activePage === "account" ? "active" : ""}">${escapeHtml(session.fullName || session.username)}</a></li>
       <li><button type="button" class="link-style" id="logout-btn">Logout</button></li>`
    : `<li><a href="login.html" class="${activePage === "login" || activePage === "register" ? "active" : ""}">Login/Register</a></li>`;

  mount.innerHTML = `
    <nav class="navbar" aria-label="Main navigation">
      <a href="index.html" class="brand">AI Recognition &amp; Chatbot System</a>
      <button type="button" class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="nav-links">☰ Menu</button>
      <ul class="nav-links" id="nav-links">
        ${linksHtml}
        ${authHtml}
      </ul>
    </nav>
  `;

  const toggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      DB.endSession();
      window.location.href = "login.html";
    });
  }
}

// Redirects to login.html if no user is currently logged in. Call at the
// top of any page that requires authentication (Upload, Results, Chatbot).
function requireAuth() {
  const session = DB.getCurrentSession();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }
  return session;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
