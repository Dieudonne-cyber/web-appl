/* =========================================================================
   chatbot.js
   Handles the Chatbot page: loads context from the most recent recognition
   result, renders the conversation, and sends/receives messages.
   ========================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("chatbot");
  const session = requireAuth();
  if (!session) return;

  const chatWindow = document.getElementById("chat-window");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const contextNote = document.getElementById("chat-context");
  const sendBtn = document.getElementById("send-btn");

  const imageId = DB.getActiveImageId();
  const record = imageId ? DB.getImageById(imageId) : null;
  const context = record
    ? { label: record.recognitionLabel, confidence: record.confidenceScore, suggestion: record.suggestion }
    : null;

  if (context) {
    contextNote.textContent = `Context: your last uploaded image ("${record.fileName}") was classified as "${context.label}".`;
  } else {
    contextNote.textContent = "No recent recognition result found — upload an image first for more specific answers.";
  }

  // Restore previous chat history for this session/image, or start fresh
  // with a welcoming message from the bot.
  const history = DB.getChatHistory(session.userId, record ? record.imageId : null);

  if (history.length === 0) {
    const greeting = context
      ? `Hi! I can see your image was classified as "${context.label}" (${context.confidence}% confidence). Ask me anything about it — for example, "what does this mean?" or "what should I do next?".`
      : "Hi! Upload an image first, then come back here and I can answer questions about the result. In the meantime, feel free to ask me how the system works.";
    appendMessage("bot", greeting);
    DB.saveChatMessage({
      userId: session.userId,
      imageId: record ? record.imageId : null,
      sender: "bot",
      messageText: greeting,
    });
  } else {
    history.forEach((m) => appendMessage(m.sender, m.messageText));
  }

  function appendMessage(sender, text) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender === "user" ? "user" : "bot"}`;
    bubble.innerHTML = `<span class="sender">${sender === "user" ? "You" : "Chatbot"}</span>${escapeHtml(text)}`;
    chatWindow.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage("user", text);
    DB.saveChatMessage({
      userId: session.userId,
      imageId: record ? record.imageId : null,
      sender: "user",
      messageText: text,
    });
    chatInput.value = "";
    sendBtn.disabled = true;

    const reply = await AI.getChatbotReply(text, context);

    appendMessage("bot", reply);
    DB.saveChatMessage({
      userId: session.userId,
      imageId: record ? record.imageId : null,
      sender: "bot",
      messageText: reply,
    });
    sendBtn.disabled = false;
    chatInput.focus();
  });
});
