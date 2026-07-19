/* =========================================================================
   ai-services.js

   This project is built with client-side HTML5, CSS3 and JavaScript only.
   In a full deployment, the two functions below would call real external
   AI services over HTTPS (see Chapter 2 of the technical report):

     - recognizeImage(file)  -> POST the image to an image recognition API
     - getChatbotReply(text) -> POST the message to a chatbot / NLP API

   To keep this project runnable without any paid API key, both functions
   currently return a realistic simulated response after a short delay.
   Swap the body of each function for a fetch() call to your chosen
   provider — the rest of the application (upload.js, results.js,
   chatbot.js) does not need to change, since it only depends on the
   function signatures below.
   ========================================================================= */

const AI = (() => {
  // Small demo dataset covering the sectors mentioned in the report
  // (agriculture, healthcare, security, business, education).
  const DEMO_LABELS = [
    {
      label: "Tomato Leaf – Early Blight",
      suggestion:
        "Early blight is a fungal disease that spreads in warm, humid conditions. Remove and destroy affected leaves, avoid overhead watering, and apply a suitable fungicide.",
    },
    {
      label: "Maize Leaf – Healthy",
      suggestion:
        "No visible signs of disease were detected. Continue routine monitoring and maintain balanced fertilisation and spacing.",
    },
    {
      label: "Skin Surface – Mild Irritation",
      suggestion:
        "This is a preliminary, non-diagnostic observation only. Please consult a qualified healthcare provider for an accurate assessment.",
    },
    {
      label: "Unattended Bag – Public Space",
      suggestion:
        "The object was classified as a bag left unattended. Standard procedure is to alert on-site security personnel before approaching it.",
    },
    {
      label: "Retail Product – Footwear",
      suggestion:
        "The image was catalogued under the Footwear category. You can edit the auto-generated product tags before publishing your listing.",
    },
    {
      label: "Classroom Diagram – Plant Cell",
      suggestion:
        "This looks like an educational diagram of a plant cell. Ask the chatbot if you would like a labelled explanation of its parts.",
    },
  ];

  /**
   * Simulates sending an uploaded image to an AI image-recognition API.
   * @param {File} file
   * @returns {Promise<{label: string, confidence: number, suggestion: string}>}
   */
  function recognizeImage(file) {
    return new Promise((resolve) => {
      // Deterministic-but-varied pick, based on the file name/size, so the
      // same file tends to return the same demo result during a session.
      const seed = (file.name.length + file.size) % DEMO_LABELS.length;
      const pick = DEMO_LABELS[seed];
      const confidence = 84 + Math.floor(Math.random() * 14); // 84–97 %

      setTimeout(() => {
        resolve({
          label: pick.label,
          confidence,
          suggestion: pick.suggestion,
        });
      }, 900); // simulated network delay
    });

    /* ---- Real API example (replace the block above with this) ----------
    const formData = new FormData();
    formData.append("image", file);
    return fetch("https://your-recognition-api.example.com/v1/classify", {
      method: "POST",
      body: formData,
    }).then((res) => res.json());
    ------------------------------------------------------------------- */
  }

  /**
   * Simulates sending a user message to a chatbot / NLP API. When a
   * recognition result is supplied as context, the reply references it,
   * matching the behaviour described in the technical report.
   * @param {string} message
   * @param {{label:string, confidence:number, suggestion:string}|null} context
   * @returns {Promise<string>}
   */
  function getChatbotReply(message, context) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(buildReply(message.trim().toLowerCase(), context));
      }, 700);
    });

    /* ---- Real API example (replace the block above with this) ----------
    return fetch("https://your-chatbot-api.example.com/v1/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, context }),
    })
      .then((res) => res.json())
      .then((data) => data.reply);
    ------------------------------------------------------------------- */
  }

  function buildReply(message, context) {
    if (!message) {
      return "Could you type a question? For example: \"what does this result mean?\"";
    }
    if (/hello|hi there|^hi$|good (morning|afternoon|evening)/.test(message)) {
      return "Hello! Ask me anything about your most recent image recognition result, or how to use this system.";
    }
    if (/what.*mean|explain|why/.test(message) && context) {
      return `The result "${context.label}" was returned with ${context.confidence}% confidence. ${context.suggestion}`;
    }
    if (/what.*do|next step|recommend|advice|suggest/.test(message) && context) {
      return context.suggestion;
    }
    if (/confidence|sure|accurate/.test(message) && context) {
      return `The model reported ${context.confidence}% confidence for "${context.label}". Higher confidence generally means a clearer, well-lit image was provided.`;
    }
    if (/cause|why does|reason/.test(message)) {
      return context
        ? `"${context.label}" is typically identified from visual patterns in the image, such as colour, texture and shape. ${context.suggestion}`
        : "Upload an image first, and I can explain the likely cause behind whatever the recognition module detects.";
    }
    if (/thank/.test(message)) {
      return "You're welcome! Feel free to upload another image or ask a follow-up question.";
    }
    if (context) {
      return `I don't have a specific answer for that yet, but based on your last result ("${context.label}"), you may want to ask me "what should I do next?" or "why did this happen?".`;
    }
    return "I don't have a specific answer for that yet. Try uploading an image first so I can give you a more relevant response.";
  }

  return { recognizeImage, getChatbotReply };
})();
