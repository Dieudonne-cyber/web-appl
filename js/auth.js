/* =========================================================================
   auth.js
   Handles client-side validation and submission for the Registration
   and Login pages.
   ========================================================================= */

function showFieldError(inputEl, message) {
  const errorEl = document.getElementById(`${inputEl.id}-error`);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add("show");
  }
  inputEl.setAttribute("aria-invalid", "true");
}

function clearFieldError(inputEl) {
  const errorEl = document.getElementById(`${inputEl.id}-error`);
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.classList.remove("show");
  }
  inputEl.removeAttribute("aria-invalid");
}

function showFormMessage(el, message, type) {
  el.textContent = message;
  el.classList.remove("error", "success");
  el.classList.add("show", type);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/* ---------------------------- Registration ---------------------------- */
function initRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  const fullName = document.getElementById("fullName");
  const username = document.getElementById("username");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const message = document.getElementById("form-message");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    [fullName, username, email, password, confirmPassword].forEach(clearFieldError);
    message.classList.remove("show", "error", "success");

    let valid = true;

    if (fullName.value.trim().length < 2) {
      showFieldError(fullName, "Please enter your full name.");
      valid = false;
    }
    if (username.value.trim().length < 3) {
      showFieldError(username, "Username must be at least 3 characters.");
      valid = false;
    }
    if (!isValidEmail(email.value.trim())) {
      showFieldError(email, "Please enter a valid email address.");
      valid = false;
    }
    if (password.value.length < 6) {
      showFieldError(password, "Password must be at least 6 characters.");
      valid = false;
    }
    if (confirmPassword.value !== password.value) {
      showFieldError(confirmPassword, "Passwords do not match.");
      valid = false;
    }

    if (!valid) return;

    const result = DB.registerUser({
      fullName: fullName.value.trim(),
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value,
    });

    if (!result.ok) {
      showFormMessage(message, result.error, "error");
      return;
    }

    showFormMessage(message, "Account created successfully. Redirecting to login…", "success");
    form.reset();
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);
  });
}

/* ------------------------------- Login --------------------------------- */
function initLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  const identifier = document.getElementById("identifier");
  const password = document.getElementById("password");
  const message = document.getElementById("form-message");

  // If already logged in, skip straight to the upload page.
  if (DB.getCurrentSession()) {
    window.location.href = "upload.html";
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    [identifier, password].forEach(clearFieldError);
    message.classList.remove("show", "error", "success");

    let valid = true;
    if (identifier.value.trim().length === 0) {
      showFieldError(identifier, "Enter your username or email.");
      valid = false;
    }
    if (password.value.length === 0) {
      showFieldError(password, "Enter your password.");
      valid = false;
    }
    if (!valid) return;

    const result = DB.authenticate(identifier.value.trim(), password.value);
    if (!result.ok) {
      showFormMessage(message, result.error, "error");
      return;
    }

    DB.startSession(result.user);
    showFormMessage(message, "Login successful. Redirecting…", "success");
    setTimeout(() => {
      window.location.href = "upload.html";
    }, 700);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initRegisterForm();
  initLoginForm();
});
