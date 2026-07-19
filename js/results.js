/* =========================================================================
   results.js
   Displays the most recently analyzed image and its recognition result,
   and hands off context to the Chatbot page.
   ========================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("results");
  const session = requireAuth();
  if (!session) return;

  const emptyState = document.getElementById("empty-state");
  const resultView = document.getElementById("result-view");
  const imageEl = document.getElementById("result-image");
  const fileNameEl = document.getElementById("result-filename");
  const labelEl = document.getElementById("result-label");
  const confidenceEl = document.getElementById("result-confidence");
  const confidenceBar = document.getElementById("confidence-bar-fill");
  const suggestionEl = document.getElementById("result-suggestion");
  const askChatbotBtn = document.getElementById("ask-chatbot-btn");

  const imageId = DB.getActiveImageId();
  const record = imageId ? DB.getImageById(imageId) : null;

  if (!record) {
    emptyState.style.display = "block";
    resultView.style.display = "none";
    return;
  }

  emptyState.style.display = "none";
  resultView.style.display = "grid";

  imageEl.src = record.imageDataUrl;
  imageEl.alt = `Uploaded image: ${record.fileName}`;
  fileNameEl.textContent = record.fileName;
  labelEl.textContent = record.recognitionLabel;
  confidenceEl.textContent = `${record.confidenceScore}%`;
  confidenceBar.style.width = `${record.confidenceScore}%`;
  suggestionEl.textContent = record.suggestion;

  askChatbotBtn.addEventListener("click", () => {
    window.location.href = "chatbot.html";
  });
});
