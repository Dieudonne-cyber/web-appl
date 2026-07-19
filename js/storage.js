/* =========================================================================
   storage.js
   Client-side data layer for the AI-Powered Image Recognition and
   Intelligent Chatbot System.

   The project uses only HTML5, CSS3 and JavaScript, so there is no
   server-side database. Instead, this file implements the conceptual
   data model from the technical report (User, UploadedImage,
   ChatMessage) as JSON records persisted in the browser's
   localStorage (permanent, per-browser) and sessionStorage
   (per-tab session state).
   ========================================================================= */

const DB = (() => {
  const KEYS = {
    USERS: "airc_users",
    IMAGES: "airc_images",
    CHATS: "airc_chats",
    SESSION: "airc_session",
  };

  // ---- low-level helpers -------------------------------------------------
  function readList(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error(`Failed to read ${key} from localStorage`, err);
      return [];
    }
  }

  function writeList(key, list) {
    try {
      localStorage.setItem(key, JSON.stringify(list));
      return true;
    } catch (err) {
      console.error(`Failed to write ${key} to localStorage`, err);
      return false;
    }
  }

  function uid(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  // Simple non-cryptographic hash used only so raw passwords are not kept
  // in localStorage in plain text. This is NOT secure and is only
  // appropriate for a client-side classroom prototype — a production
  // system would authenticate against a real backend instead.
  function simpleHash(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    return `h${hash}`;
  }

  // ---- User records --------------------------------------------------------
  function getUsers() {
    return readList(KEYS.USERS);
  }

  function findUserByIdentifier(identifier) {
    const id = identifier.trim().toLowerCase();
    return getUsers().find(
      (u) => u.username.toLowerCase() === id || u.email.toLowerCase() === id
    );
  }

  function registerUser({ fullName, username, email, password }) {
    const users = getUsers();
    const exists = users.some(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() ||
        u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) {
      return { ok: false, error: "An account with that username or email already exists." };
    }
    const user = {
      userId: uid("user"),
      fullName,
      username,
      email,
      passwordHash: simpleHash(password),
      registeredDate: new Date().toISOString(),
    };
    users.push(user);
    writeList(KEYS.USERS, users);
    return { ok: true, user };
  }

  function authenticate(identifier, password) {
    const user = findUserByIdentifier(identifier);
    if (!user || user.passwordHash !== simpleHash(password)) {
      return { ok: false, error: "Incorrect username/email or password." };
    }
    return { ok: true, user };
  }

  // ---- Session ---------------------------------------------------------
  function startSession(user) {
    sessionStorage.setItem(
      KEYS.SESSION,
      JSON.stringify({ userId: user.userId, username: user.username, fullName: user.fullName })
    );
  }

  function getCurrentSession() {
    try {
      const raw = sessionStorage.getItem(KEYS.SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function endSession() {
    sessionStorage.removeItem(KEYS.SESSION);
  }

  // ---- UploadedImage records --------------------------------------------
  function saveImage(record) {
    const images = readList(KEYS.IMAGES);
    const full = {
      imageId: uid("img"),
      uploadDate: new Date().toISOString(),
      ...record,
    };
    images.push(full);
    writeList(KEYS.IMAGES, images);
    return full;
  }

  function getImageById(imageId) {
    return readList(KEYS.IMAGES).find((img) => img.imageId === imageId);
  }

  function getUserImages(userId) {
    return readList(KEYS.IMAGES)
      .filter((img) => img.userId === userId)
      .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  }

  // ---- ChatMessage records -----------------------------------------------
  function saveChatMessage(record) {
    const chats = readList(KEYS.CHATS);
    const full = {
      messageId: uid("msg"),
      timestamp: new Date().toISOString(),
      ...record,
    };
    chats.push(full);
    writeList(KEYS.CHATS, chats);
    return full;
  }

  function getChatHistory(userId, imageId = null) {
    return readList(KEYS.CHATS)
      .filter((m) => m.userId === userId && (!imageId || m.imageId === imageId))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  // ---- Last-active-image helper (used to link Results -> Chatbot) -------
  function setActiveImageId(imageId) {
    sessionStorage.setItem("airc_active_image", imageId);
  }

  function getActiveImageId() {
    return sessionStorage.getItem("airc_active_image");
  }

  return {
    registerUser,
    authenticate,
    findUserByIdentifier,
    startSession,
    getCurrentSession,
    endSession,
    saveImage,
    getImageById,
    getUserImages,
    saveChatMessage,
    getChatHistory,
    setActiveImageId,
    getActiveImageId,
  };
})();
