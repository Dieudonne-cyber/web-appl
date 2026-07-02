// Security & Authentication Module
class AuthenticationManager {
  constructor() {
    this.storageKey = 'users_database';
    this.currentUserKey = 'current_user';
    this.initializeStorage();
  }

  // Initialize storage with default users if empty
  initializeStorage() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  // Get all registered users
  getAllUsers() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  // Check if user exists by email
  userExists(email) {
    const users = this.getAllUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // Register new user
  register(email, password, fullName = '') {
    if (this.userExists(email)) {
      return { success: false, message: 'Email already registered' };
    }

    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    const users = this.getAllUsers();
    const newUser = {
      id: Date.now(),
      email: email.toLowerCase(),
      password: this.hashPassword(password),
      fullName: fullName,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    return { success: true, message: 'Account created successfully' };
  }

  // Login user
  login(email, password) {
    const users = this.getAllUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, message: 'Email not found' };
    }

    if (!this.verifyPassword(password, user.password)) {
      return { success: false, message: 'Invalid password' };
    }

    // Store current user session
    const sessionUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      loginTime: new Date().toISOString()
    };

    localStorage.setItem(this.currentUserKey, JSON.stringify(sessionUser));
    return { success: true, message: 'Login successful', user: sessionUser };
  }

  // Logout user
  logout() {
    localStorage.removeItem(this.currentUserKey);
    return { success: true, message: 'Logged out successfully' };
  }

  // Get current logged-in user
  getCurrentUser() {
    const user = localStorage.getItem(this.currentUserKey);
    return user ? JSON.parse(user) : null;
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  }

  // Simple password hashing (for demo - use stronger methods in production)
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  // Verify password
  verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  }

  // Update user profile
  updateProfile(email, fullName) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return { success: false, message: 'No user logged in' };

    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex !== -1) {
      users[userIndex].fullName = fullName;
      localStorage.setItem(this.storageKey, JSON.stringify(users));

      // Update session
      currentUser.fullName = fullName;
      localStorage.setItem(this.currentUserKey, JSON.stringify(currentUser));

      return { success: true, message: 'Profile updated' };
    }

    return { success: false, message: 'User not found' };
  }
}

// Create global auth manager instance
const authManager = new AuthenticationManager();

// Page Protection Utility
function protectPage(requiredLogin = true) {
  const isLoggedIn = authManager.isLoggedIn();

  if (requiredLogin && !isLoggedIn) {
    // Redirect to login if page requires authentication and user not logged in
    console.warn('Access denied. Please login first.');
    // Uncomment to auto-redirect: window.location.href = 'login.html';
  }

  if (!requiredLogin && isLoggedIn) {
    // Optionally redirect logged-in users away from auth pages
    console.log('User is already logged in');
  }
}

// Update UI based on login status
function updateNavigation() {
  const currentUser = authManager.getCurrentUser();
  const nav = document.querySelector('.site-nav');

  if (!nav) return;

  if (currentUser) {
    // User is logged in
    const userGreeting = document.createElement('span');
    userGreeting.className = 'user-greeting';
    userGreeting.textContent = `Welcome, ${currentUser.fullName || currentUser.email}`;
    userGreeting.style.cssText = 'margin-right: 15px; color: #333;';
    nav.insertBefore(userGreeting, nav.firstChild);

    // Add logout button
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'logout-btn';
    logoutBtn.textContent = 'Logout';
    logoutBtn.style.cssText = `
      background: #dc3545;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 10px;
    `;
    logoutBtn.onclick = () => {
      authManager.logout();
      window.location.href = 'index.html';
    };
    nav.appendChild(logoutBtn);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', updateNavigation);
