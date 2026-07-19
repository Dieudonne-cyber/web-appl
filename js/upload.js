/* =========================================================================
   upload.js
   Handles the Image Upload page: file selection (browse or drag-and-drop),
   client-side preview, and submission to the AI recognition module.
   ========================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar("upload");
  const session = requireAuth();
  if (!session) return;

  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const browseBtn = document.getElementById("browse-btn");
  const preview = document.getElementById("upload-preview");
  const previewImg = document.getElementById("preview-img");
  const previewName = document.getElementById("preview-name");
  const analyzeBtn = document.getElementById("analyze-btn");
  const statusMsg = document.getElementById("upload-status");

  let selectedFile = null;

  function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      statusMsg.textContent = "Please choose an image file (JPG, PNG, GIF, etc.).";
      statusMsg.classList.add("show", "error");
      return;
    }
    statusMsg.classList.remove("show", "error");
    selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewName.textContent = file.name;
      preview.style.display = "block";
      analyzeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  // Browse button / click-to-select
  browseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.click();
  });
  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });
  fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));

  // Drag-and-drop support (HTML5 Drag and Drop API)
  ["dragenter", "dragover"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("dragover");
    })
  );

  ["dragleave", "drop"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("dragover");
    })
  );

  dropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(file);
  });

  // Submit for recognition
  analyzeBtn.addEventListener("click", async () => {
    if (!selectedFile) return;
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing…";
    statusMsg.classList.remove("show", "error");

    try {
      const result = await AI.recognizeImage(selectedFile);

      const record = DB.saveImage({
        userId: session.userId,
        fileName: selectedFile.name,
        imageDataUrl: previewImg.src,
        recognitionLabel: result.label,
        confidenceScore: result.confidence,
        suggestion: result.suggestion,
      });

      DB.setActiveImageId(record.imageId);
      window.location.href = "results.html";
    } catch (err) {
      console.error(err);
      statusMsg.textContent = "Something went wrong while analyzing the image. Please try again.";
      statusMsg.classList.add("show", "error");
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = "Upload & Analyze";
    }
  });
});
