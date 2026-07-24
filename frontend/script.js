(function () {
  "use strict";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------------- Theme toggle ---------------- */
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const sunPath =
    '<path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/><circle cx="12" cy="12" r="4.2"/>';
  const moonPath =
    '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeToggle.setAttribute("aria-pressed", theme === "daylight");
    themeIcon.innerHTML = theme === "daylight" ? sunPath : moonPath;
  }
  applyTheme("evening");
  themeToggle.addEventListener("click", () => {
    const isDaylight =
      document.documentElement.getAttribute("data-theme") === "daylight";
    applyTheme(isDaylight ? "evening" : "daylight");
  });

  /* ---------------- Star rating builder ---------------- */
  const STAR_PATH =
    "M12 2.5l2.98 6.29 6.95.72-5.1 4.77 1.4 6.86L12 17.9l-6.23 3.24 1.4-6.86-5.1-4.77 6.95-.72L12 2.5z";
  const RATING_LABELS = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
  const ratingState = {}; // name -> value (0-5)

  function buildStars(container, name, label) {
    container.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "star-btn";
      btn.setAttribute("data-value", i);
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", "false");
      btn.setAttribute("aria-pressed", "false");
      btn.setAttribute(
        "aria-label",
        `${i} star${i > 1 ? "s" : ""} — ${RATING_LABELS[i - 1]}`,
      );
      btn.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24"><path d="${STAR_PATH}" fill="var(--surface-border)" stroke="var(--gold)" stroke-width="1" /></svg>`;
      btn.addEventListener("click", () => setRating(name, i, container));
      btn.addEventListener("mouseenter", () => previewRating(container, i));
      btn.addEventListener("mouseleave", () =>
        previewRating(container, ratingState[name] || 0),
      );
      container.appendChild(btn);
    }
    ratingState[name] = 0;
  }

  function previewRating(container, value) {
    [...container.children].forEach((btn, idx) => {
      const path = btn.querySelector("path");
      path.setAttribute(
        "fill",
        idx < value ? "var(--gold)" : "var(--surface-border)",
      );
    });
  }

  function setRating(name, value, container) {
    ratingState[name] = value;
    [...container.children].forEach((btn, idx) => {
      const active = idx < value;
      btn.setAttribute("aria-checked", active);
      btn.setAttribute("aria-pressed", active);
    });
    previewRating(container, value);
    clearFieldError(container.closest("section"));
    updateProgress();
  }

  buildStars(document.getElementById("overallStars"), "overall");

  const CATEGORIES = [
    "Food Quality",
    "Taste",
    "Service",
    "Staff Behaviour",
    "Cleanliness",
    "Ambience",
    "Waiting Time",
    "Value for Money",
  ];
  const catWrap = document.getElementById("ratingCategories");
  CATEGORIES.forEach((cat) => {
    const key = cat.toLowerCase().replace(/\s+/g, "_");
    const row = document.createElement("div");
    row.className = "flex items-center justify-between gap-4 flex-wrap";
    row.innerHTML = `
      <span class="text-sm" style="color:var(--text-muted); min-width:150px;">${cat}</span>
      <div class="star-group flex items-center gap-1.5" data-name="${key}" role="radiogroup" aria-label="${cat} rating"></div>
    `;
    catWrap.appendChild(row);
    buildStars(row.querySelector(".star-group"), key);
  });

  /* ---------------- Emoji reaction ---------------- */
  let emojiValue = null;
  document.querySelectorAll(".emoji-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".emoji-btn")
        .forEach((b) => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      emojiValue = btn.dataset.emoji;
    });
  });

  /* ---------------- Chip inputs (radio/checkbox) reflect on change ---------------- */
  document.querySelectorAll(".chip").forEach((chip) => {
    const input = chip.previousElementSibling;
    input.addEventListener("change", () => {
      if (input.type === "radio") {
        const group = document.getElementsByName(input.name);
        group.forEach((i) =>
          i.nextElementSibling.classList.remove("is-checked"),
        );
      }
      clearFieldError(chip.closest("section"));
      updateProgress();
    });
  });

  /* ---------------- Character counter ---------------- */
  const experience = document.getElementById("experience");
  const charCount = document.getElementById("charCount");
  experience.addEventListener("input", () => {
    const len = experience.value.length;
    charCount.textContent = len;
    charCount.parentElement.classList.toggle("warn", len >= 480);
    updateProgress();
  });

  /* ---------------- Validation helpers ---------------- */
  const form = document.getElementById("feedbackForm");
  const fields = {
    fullName: document.getElementById("fullName"),
    phone: document.getElementById("phone"),
    email: document.getElementById("email"),
  };

  fields.phone.addEventListener("input", () => {
    fields.phone.value = fields.phone.value.replace(/\D/g, "").slice(0, 10);
    updateProgress();
  });
  fields.fullName.addEventListener("input", updateProgress);
  fields.email.addEventListener("input", updateProgress);

  function showFieldError(input, show) {
    if (!input) return;
    const wrap = input.closest("div");
    input.classList.toggle("invalid", show);
    input.setAttribute("aria-invalid", show);
    if (wrap) {
      const msg = wrap.querySelector(".err-msg");
      if (msg) msg.classList.toggle("hidden", !show);
    }
  }

  function clearFieldError(section) {
    if (!section) return;
    const msg = section.querySelector(".err-msg");
    if (msg) msg.classList.add("hidden");
  }

  function validate() {
    let valid = true;

    // Full name
    if (fields.fullName) {
      const nameOk = fields.fullName.value.trim().length > 1;
      showFieldError(fields.fullName, !nameOk);
      valid = valid && nameOk;
    }

    // Phone
    if (fields.phone) {
      const phoneOk = /^\d{10}$/.test(fields.phone.value.trim());
      showFieldError(fields.phone, !phoneOk);
      valid = valid && phoneOk;
    }

    // Email
    if (fields.email) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        fields.email.value.trim(),
      );
      showFieldError(fields.email, !emailOk);
      valid = valid && emailOk;
    }

    // Overall rating
    const overallGroup = document.getElementById("overallStars");
    const overallOk = ratingState.overall > 0;
    if (overallGroup) {
      const msg = overallGroup.closest("section")?.querySelector(".err-msg");
      if (msg) msg.classList.toggle("hidden", overallOk);
    }
    valid = valid && overallOk;

    // Visit again
    const visitAgainOk = !!form.querySelector(
      'input[name="visitAgain"]:checked',
    );
    const visitAgainGroup = document.getElementById("visitAgainGroup");
    if (visitAgainGroup) {
      const msg = visitAgainGroup.parentElement?.querySelector(".err-msg");
      if (msg) msg.classList.toggle("hidden", visitAgainOk);
    }
    valid = valid && visitAgainOk;

    // Recommend
    const recommendOk = !!form.querySelector('input[name="recommend"]:checked');
    const recommendGroup = document.getElementById("recommendGroup");
    if (recommendGroup) {
      const msg = recommendGroup.parentElement?.querySelector(".err-msg");
      if (msg) msg.classList.toggle("hidden", recommendOk);
    }
    valid = valid && recommendOk;

    return valid;
  }

  /* ---------------- Progress bar ---------------- */
  function updateProgress() {
    const totalWeight = 5; // name, phone, email, overall rating, (visit+recommend combined)
    let done = 0;
    if (fields.fullName.value.trim().length > 1) done++;
    if (/^\d{10}$/.test(fields.phone.value.trim())) done++;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value.trim())) done++;
    if (ratingState.overall > 0) done++;
    if (
      form.querySelector('input[name="visitAgain"]:checked') &&
      form.querySelector('input[name="recommend"]:checked')
    )
      done++;
    const pct = Math.round((done / totalWeight) * 100);
    const bar = document.getElementById("progressBar");
    bar.style.width = pct + "%";
    document.getElementById("progressWrap").setAttribute("aria-valuenow", pct);
  }
  updateProgress();

  /* ---------------- Submit handling ---------------- */
  const submitBtn = document.getElementById("submitBtn");
  const submitSpinner = document.getElementById("submitSpinner");
  const submitLabel = document.getElementById("submitLabel");
  const formError = document.getElementById("formError");

  // Backend API endpoint
  const API_URL = "http://localhost:5000/api/feedback";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = validate();
    if (!ok) {
      formError.textContent =
        "Please complete the required fields highlighted above.";
      formError.classList.remove("hidden");
      const firstInvalid = form.querySelector(
        ".invalid, .err-msg:not(.hidden)",
      );
      if (firstInvalid)
        firstInvalid
          .closest("section, div")
          .scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    formError.classList.add("hidden");

    submitBtn.disabled = true;
    submitSpinner.classList.remove("hidden");
    submitLabel.textContent = "Sending...";

    const payload = collectPayload();
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Unable to submit feedback.");
        }

        openSuccess();
      })
      .catch((error) => {
        console.error(error);

        formError.textContent =
          "Cannot connect to the ARVEO Feedback Server. Please contact the administrator.";
        formError.classList.remove("hidden");
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitSpinner.classList.add("hidden");
        submitLabel.textContent = "Submit Feedback";
      });
  });

  function collectPayload() {
    return {
      fullName: fields.fullName.value.trim(),
      phone: fields.phone.value.trim(),
      email: fields.email.value.trim(),
      overall: ratingState.overall,
      ratings: Object.fromEntries(
        CATEGORIES.map((c) => {
          const key = c.toLowerCase().replace(/\s+/g, "_");
          return [c, ratingState[key] || 0];
        }),
      ),
      emojiReaction: emojiValue,
      visitAgain:
        form.querySelector('input[name="visitAgain"]:checked')?.value || null,
      recommend:
        form.querySelector('input[name="recommend"]:checked')?.value || null,
      menuItems: [
        ...form.querySelectorAll('input[name="menuItems"]:checked'),
      ].map((i) => i.value),
      experience: experience.value.trim(),
      suggestions: document.getElementById("suggestions").value.trim(),
    };
  }

  document.getElementById("resetBtn").addEventListener("click", () => {
    setTimeout(() => {
      Object.values(fields).forEach((f) => showFieldError(f, false));
      document
        .querySelectorAll(".err-msg")
        .forEach((m) => m.classList.add("hidden"));
      formError.classList.add("hidden");
      Object.keys(ratingState).forEach((k) => (ratingState[k] = 0));
      document
        .querySelectorAll(".star-group")
        .forEach((g) => previewRating(g, 0));
      document
        .querySelectorAll(".emoji-btn")
        .forEach((b) => b.setAttribute("aria-pressed", "false"));
      emojiValue = null;
      charCount.textContent = "0";
      updateProgress();
    }, 0);
  });

  /* ---------------- Success modal + confetti ---------------- */
  const successModal = document.getElementById("successModal");
  function openSuccess() {
    successModal.classList.remove("hidden");
    successModal.classList.add("flex");
    launchConfetti();
    document.getElementById("closeModalBtn").focus();
  }
  function closeSuccess() {
    successModal.classList.add("hidden");
    successModal.classList.remove("flex");
    form.reset();
    document.getElementById("resetBtn").click();
  }
  document
    .getElementById("closeModalBtn")
    .addEventListener("click", closeSuccess);
  document
    .getElementById("successOverlay")
    .addEventListener("click", closeSuccess);

  /* ---------------- QR Modal ---------------- */
  const qrModal = document.getElementById("qrModal");
  const qrBox = document.getElementById("qrCodeBox");
  let qrRendered = false;
  document.getElementById("qrBtn").addEventListener("click", () => {
    qrModal.classList.remove("hidden");
    qrModal.classList.add("flex");
    if (!qrRendered && window.QRCode) {
      new QRCode(qrBox, {
        text: window.location.href,
        width: 176,
        height: 176,
        colorDark: "#2B1B12",
        colorLight: "#ffffff",
      });
      qrRendered = true;
    } else if (!window.QRCode) {
      qrBox.innerHTML =
        '<p class="text-xs text-[#2B1B12] p-6">QR library unavailable offline.</p>';
    }
  });
  function closeQr() {
    qrModal.classList.add("hidden");
    qrModal.classList.remove("flex");
  }
  document.getElementById("closeQrBtn").addEventListener("click", closeQr);
  document.getElementById("qrOverlay").addEventListener("click", closeQr);

  /* ---------------- Confetti ---------------- */
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function launchConfetti() {
    const colors = ["#C9A227", "#E9CE79", "#F3E8D6", "#9C7A1D"];
    const particles = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.3,
      r: 4 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: 2 + Math.random() * 3,
      vx: -1.5 + Math.random() * 3,
      rot: Math.random() * 360,
      vr: -6 + Math.random() * 12,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }));
    let frame = 0;
    const maxFrames = 150;
    function draw() {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      if (frame < maxFrames) {
        requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    draw();
  }

  /* Escape key closes modals */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!successModal.classList.contains("hidden")) closeSuccess();
      if (!qrModal.classList.contains("hidden")) closeQr();
    }
  });
})();
