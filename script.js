// Simple client-side validation + send data to n8n + preview prediction

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("astro-form");
  const formMessages = document.getElementById("form-messages");
  const previewSection = document.getElementById("preview-section");
  const previewText = document.getElementById("preview-text");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();
    formMessages.textContent = "";
    formMessages.className = "form-messages";

    const data = getFormData();
    const validationErrors = validate(data);

    if (Object.keys(validationErrors).length > 0) {
      showErrors(validationErrors);
      formMessages.textContent = "Please correct the highlighted fields.";
      formMessages.classList.add("error");
      return;
    }

    // ⭐ SEND DATA TO n8n WEBHOOK
    try {
      const webhookUrl = "https://ramsankar.app.n8n.cloud/webhook/astro-form"; // <-- Replace this
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Webhook error");
      }

      formMessages.textContent =
        "Success! Your details have been sent. You will receive your astrology prediction by email shortly.";
      formMessages.classList.add("success");

    } catch (error) {
      console.error(error);
      formMessages.textContent =
        "Something went wrong while sending your details. Please try again later.";
      formMessages.classList.add("error");
    }

    // ⭐ Optional: Show preview prediction on page
    const prediction = buildMockPrediction(data);
    previewText.textContent = prediction;
    previewSection.classList.remove("hidden");
  });

  // 🟦 Collect Form Data
  function getFormData() {
    return {
      fullName: form.fullName.value.trim(),
      dob: form.dob.value,
      tob: form.tob.value,
      pob: form.pob.value.trim(),
      gender: form.gender.value,
      focus: form.focus.value,
      email: form.email.value.trim(),
      notes: form.notes.value.trim(),
    };
  }

  // 🟥 Validation Logic
  function validate(data) {
    const errors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.fullName || data.fullName.length < 3) {
      errors.fullName = "Please enter your full name (at least 3 characters).";
    }

    if (!data.dob) {
      errors.dob = "Please select your date of birth.";
    } else {
      const dobDate = new Date(data.dob);
      const today = new Date();
      if (dobDate > today) {
        errors.dob = "Date of birth cannot be in the future.";
      }
    }

    if (data.tob && !/^\d{2}:\d{2}$/.test(data.tob)) {
      errors.tob = "Please enter a valid time in HH:MM format.";
    }

    if (!data.pob) {
      errors.pob = "Please enter your place of birth.";
    }

    if (!data.focus) {
      errors.focus = "Please select an area of focus.";
    }

    if (!data.email || !emailPattern.test(data.email)) {
      errors.email = "Please enter a valid email address.";
    }

    return errors;
  }

  // 🟧 Show validation errors
  function showErrors(errors) {
    Object.entries(errors).forEach(([field, message]) => {
      const input =
        form[field] instanceof RadioNodeList ? form[field][0] : form[field];
      if (input && input.classList) {
        input.classList.add("error");
      }
      const errorEl = document.querySelector(
        `.error-message[data-error-for="${field}"]`
      );
      if (errorEl) {
        errorEl.textContent = message;
      }
    });
  }

  // 🟩 Clear validation errors
  function clearErrors() {
    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach((el) => el.classList.remove("error"));
    const errorEls = form.querySelectorAll(".error-message");
    errorEls.forEach((el) => (el.textContent = ""));
  }

  // 🟨 Mock preview prediction (local only)
  function buildMockPrediction(data) {
    const firstName = data.fullName.split(" ")[0] || "Seeker";
    const focusMap = {
      career:
        "Your birth pattern suggests a phase of steady professional growth. Opportunities linked to learning and networking are highlighted.",
      health:
        "Your chart suggests a beneficial period for strengthening routines around rest, nutrition, and movement.",
      relationships:
        "This cycle encourages clarity in emotional connections and building more aligned relationships.",
      finance:
        "This phase supports sustainable financial growth through planning and disciplined choices.",
      "personal-growth":
        "A powerful cycle for inner development, new habits, and redefining your long-term vision.",
      general:
        "A balanced cycle encouraging realignment with your authentic path and inner values.",
    };

    const coreFocusText = focusMap[data.focus] || focusMap.general;

    return `${firstName}, based on your birth details from ${data.pob}, your current astrological cycle highlights the theme of ${
      readableFocus(data.focus)
    }. ${coreFocusText}

Remember, astrology offers symbolic guidance — it works best when you stay conscious, reflective, and intentional about the decisions you make.`;
  }

  function readableFocus(focusValue) {
    switch (focusValue) {
      case "career":
        return "career and life direction";
      case "health":
        return "health and energy";
      case "relationships":
        return "relationships and emotional bonds";
      case "finance":
        return "money, stability, and resources";
      case "personal-growth":
        return "personal growth and self-development";
      default:
        return "life balance and clarity";
    }
  }
});

