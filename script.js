
/* Rose Romance Date Invitation
   Demo version: data is saved in this browser only.
*/
"use strict";

const DATA_KEY = "roseMomentsData_v1";
const PROFILE_KEY = "roseMomentsProfile_v1";

const $ = id => document.getElementById(id);

let me = null;
let activeInvite = null;
let guestName = "";
let answers = {};
let questionIndex = 0;

const screens = ["home", "dashboard", "link", "guest", "missing"];

const optionDecor = {
  "Cute Café": "☕",
  "Dinner": "🍽️",
  "Park walk": "🌿",
  "Movie night": "🎬",
  "Pizza": "🍕",
  "Pasta": "🍝",
  "Coffee & dessert": "🍰",
  "Anything together": "💕",
  "Car": "🚗",
  "Ride share": "🚕",
  "A little walk": "🚶",
  "Decide together": "♡"
};

function showScreen(id) {
  screens.forEach(screenId => {
    $(screenId).classList.toggle("active", screenId === id);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function readData() {
  try {
    const data = JSON.parse(
      localStorage.getItem(DATA_KEY) || '{"invitations":[]}'
    );

    return data && Array.isArray(data.invitations)
      ? data
      : { invitations: [] };
  } catch {
    return { invitations: [] };
  }
}

function writeData(data) {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    return true;
  } catch {
    alert(
      "Your browser storage is full. Please remove older invitations and try again."
    );
    return false;
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function makeId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID().replaceAll("-", "").slice(0, 16);
  }

  return Math.random().toString(36).slice(2) +
    Date.now().toString(36);
}

function cleanBaseURL() {
  const url = new URL(location.href);
  url.search = "";
  url.hash = "";
  return url.toString();
}

function invitationURL(invitation) {
  const url = new URL(cleanBaseURL());
  url.searchParams.set("invite", invitation.id);
  return url.toString();
}

function findInvitation(id) {
  return readData().invitations.find(invitation => invitation.id === id);
}

function setProfile(name, phone) {
  me = {
    id: makeId(),
    name: name.trim(),
    phone: (phone || "").replace(/\D/g, "")
  };

  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(me));
  } catch {
    // The profile can still be used for this page session.
  }

  renderDashboard();
}

function renderDashboard() {
  if (!me) {
    showScreen("home");
    return;
  }

  $("displayName").textContent = me.name;
  renderInvitations();
  showScreen("dashboard");
}

function renderInvitations() {
  const data = readData();

  const mine = data.invitations.filter(
    invitation => invitation.ownerId === me?.id
  );

  $("inviteCount").textContent = mine.length;

  $("replyCount").textContent = mine.reduce(
    (total, invitation) => total + (invitation.replies || []).length,
    0
  );

  const host = $("cards");

  if (!mine.length) {
    host.innerHTML = `
      <div class="empty-state">
        <span>♡</span>
        <h3>Your story starts here</h3>
        <p>Create your first invitation and it will appear here.</p>
      </div>
    `;
    return;
  }

  host.innerHTML = mine.slice().reverse().map(invitation => `
    <article class="invite-card">
      <div class="invite-card-top">
        <small>${(invitation.replies || []).length} REPLIES</small>
        <small>${escapeHTML(
          new Date(invitation.created).toLocaleDateString()
        )}</small>
      </div>

      <h3>${escapeHTML(invitation.title)}</h3>

      <p>${escapeHTML(
        invitation.message || "A little moment made personal."
      )}</p>

      <div class="card-actions">
        <button class="btn btn-primary" data-copy="${escapeHTML(invitation.id)}">
          Copy link ↗
        </button>

        <button class="btn btn-ghost" data-preview="${escapeHTML(invitation.id)}">
          Preview
        </button>

        <button class="btn btn-ghost" data-delete="${escapeHTML(invitation.id)}">
          Delete
        </button>
      </div>

      ${(invitation.replies || []).map(reply => `
        <div class="reply-card">
          <strong>♡ ${escapeHTML(reply.name)}</strong>

          <p>
            ${Object.entries(reply.answers || {}).map(([key, value]) => `
              <b>${escapeHTML(key)}:</b> ${escapeHTML(value || "—")}
            `).join("<br>")}
          </p>

          <p>${escapeHTML(new Date(reply.at).toLocaleString())}</p>
        </div>
      `).join("")}
    </article>
  `).join("");
}

function getLines(id) {
  return $(id).value
    .split(/\r?\n/)
    .map(value => value.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function buildInvitation(event) {
  event.preventDefault();

  const questions = [];

  const addChoice = (checkboxId, key, label, fieldId) => {
    if (!$(checkboxId).checked) return;

    const options = getLines(fieldId);

    if (!options.length) {
      throw new Error(
        `Please add at least one option for "${label}" or switch that question off.`
      );
    }

    questions.push({
      key,
      label,
      type: "choice",
      options
    });
  };

  try {
    addChoice(
      "usePlace",
      "Place",
      "Where would you like to go?",
      "places"
    );

    addChoice(
      "useFood",
      "Food",
      "What sounds good to eat?",
      "foods"
    );

    addChoice(
      "useTravel",
      "Transport",
      "How should we get there?",
      "travels"
    );
  } catch (error) {
    $("builderMessage").textContent = error.message;
    return;
  }

  if ($("useDate").checked) {
    questions.push({
      key: "Date",
      label: "Which date works for you?",
      type: "date"
    });
  }

  if ($("useTime").checked) {
    questions.push({
      key: "Time",
      label: "What time suits you?",
      type: "time"
    });
  }

  if ($("useNote").checked) {
    questions.push({
      key: "Note",
      label: "Anything you'd like me to know?",
      type: "text"
    });
  }

  if (!questions.length) {
    $("builderMessage").textContent =
      "Please switch on at least one question.";
    return;
  }

  const invitation = {
    id: makeId(),
    ownerId: me.id,
    ownerName: me.name,
    title: $("title").value.trim(),
    message: $("message").value.trim(),
    questions,
    replies: [],
    created: new Date().toISOString()
  };

  const data = readData();
  data.invitations.push(invitation);

  if (!writeData(data)) return;

  activeInvite = invitation;

  $("url").value = invitationURL(invitation);
  $("copyMessage").textContent = "";
  $("builderMessage").textContent = "";

  showScreen("link");
}

async function copyText(value, statusElement) {
  try {
    await navigator.clipboard.writeText(value);

    if (statusElement) {
      statusElement.textContent = "Copied! Ready to share. ♡";
    }
  } catch {
    const temporary = document.createElement("textarea");

    temporary.value = value;
    temporary.style.position = "fixed";
    temporary.style.opacity = "0";

    document.body.appendChild(temporary);
    temporary.select();

    let copied = false;

    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }

    temporary.remove();

    if (statusElement) {
      statusElement.textContent = copied
        ? "Copied! Ready to share. ♡"
        : "Please select and copy the link manually.";
    }
  }
}

function openGuest(invitation) {
  activeInvite = invitation;
  guestName = "";
  answers = {};
  questionIndex = 0;

  $("guestEnvelopeStage").hidden = false;
  $("guestEnvelope").classList.remove("open");
  $("openEnvelope").disabled = false;

  $("guestContent").hidden = true;
  $("nameForm").hidden = false;
  $("progressArea").hidden = true;
  $("question").innerHTML = "";
  $("guestActions").hidden = true;
  $("final").hidden = true;

  $("guestTitle").textContent = invitation.title;

  $("guestIntro").textContent =
    invitation.message ||
    `${invitation.ownerName} has a little question for you.`;

  showScreen("guest");
}

function startGuest(event) {
  event.preventDefault();

  guestName = $("guestName").value.trim();

  if (!guestName) return;

  $("nameForm").hidden = true;
  $("progressArea").hidden = false;

  if (!activeInvite.questions.length) {
    finishGuest();
    return;
  }

  renderQuestion();
}

function renderQuestion() {
  const question = activeInvite.questions[questionIndex];

  const percentage = Math.round(
    (questionIndex / activeInvite.questions.length) * 100
  );

  $("progressText").textContent =
    `QUESTION ${questionIndex + 1} OF ${activeInvite.questions.length}`;

  $("progressPercent").textContent = `${percentage}%`;
  $("progressBar").style.width = `${percentage}%`;

  $("question").innerHTML = `
    <h2 class="question-title">${escapeHTML(question.label)}</h2>
    <p class="question-subtitle">
      Just for you, ${escapeHTML(guestName)}. Choose what feels right.
    </p>
  `;

  if (question.type === "choice") {
    $("question").innerHTML += `
      <div class="options-grid">
        ${question.options.map(option => `
          <button
            type="button"
            class="option-card ${answers[question.key] === option ? "selected" : ""}"
            data-option="${escapeHTML(option)}"
          >
            <span class="option-emoji">
              ${escapeHTML(optionDecor[option] || "♡")}
            </span>

            <span class="option-label">${escapeHTML(option)}</span>

            <span class="option-check">♡ SELECTED</span>
          </button>
        `).join("")}
      </div>
    `;
  } else {
    const type =
      question.type === "date" || question.type === "time"
        ? question.type
        : "text";

    $("question").innerHTML += `
      <input
        id="answer"
        type="${type}"
        ${type === "text"
          ? 'maxlength="250" placeholder="Write a little note…"'
          : ""}
        value="${escapeHTML(answers[question.key] || "")}"
        aria-label="Your answer"
      >
    `;
  }

  $("guestActions").hidden = false;
  $("prev").disabled = questionIndex === 0;

  $("next").textContent =
    questionIndex === activeInvite.questions.length - 1
      ? "Confirm answers ♡"
      : "Continue →";
}

function getCurrentAnswer() {
  const question = activeInvite.questions[questionIndex];

  if (question.type === "choice") {
    if (!answers[question.key]) {
      alert("Choose an option before continuing. ♡");
      return false;
    }
  } else {
    const input = $("answer");
    const value = input ? input.value.trim() : "";

    if (!value) {
      alert("Please answer this question. ♡");
      return false;
    }

    answers[question.key] = value;
  }

  return true;
}

function finishGuest() {
  const data = readData();

  const invitation = data.invitations.find(
    item => item.id === activeInvite.id
  );

  if (invitation) {
    invitation.replies = invitation.replies || [];

    invitation.replies.push({
      name: guestName,
      answers: { ...answers },
      at: new Date().toISOString()
    });

    writeData(data);
  }

  $("progressBar").style.width = "100%";
  $("progressPercent").textContent = "100%";
  $("progressText").textContent = "ALL DONE";

  $("question").innerHTML = "";
  $("guestActions").hidden = true;
  $("final").hidden = false;

  $("final").innerHTML = `
    <div class="final-flower">💐</div>
    <h2>It's a date, ${escapeHTML(guestName)}!</h2>
    <p>Thank you for making this little moment special. ♡</p>

    <div class="reply-summary">
      ${Object.entries(answers).map(([key, value]) => `
        <p><b>${escapeHTML(key)}:</b> ${escapeHTML(value)}</p>
      `).join("")}
    </div>

    <p>
      Here's to good company, little surprises, and a memory worth keeping.
    </p>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    me = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
  } catch {
    me = null;
  }

  $("profileForm").addEventListener("submit", event => {
    event.preventDefault();

    setProfile(
      $("ownerName").value,
      $("ownerPhone").value
    );
  });

  $("builder").addEventListener("submit", buildInvitation);

  $("switchProfile").addEventListener("click", () => {
    showScreen("home");
  });

  $("back").addEventListener("click", renderDashboard);

  $("copy").addEventListener("click", () => {
    copyText($("url").value, $("copyMessage"));
  });

  $("preview").addEventListener("click", () => {
    if (activeInvite) {
      window.open(
        invitationURL(activeInvite),
        "_blank",
        "noopener,noreferrer"
      );
    }
  });

  $("cards").addEventListener("click", event => {
    const copyButton = event.target.closest("[data-copy]");
    const previewButton = event.target.closest("[data-preview]");
    const deleteButton = event.target.closest("[data-delete]");

    if (copyButton) {
      const invitation = findInvitation(copyButton.dataset.copy);

      if (invitation) {
        copyText(invitationURL(invitation), $("builderMessage"));
      }
    } else if (previewButton) {
      const invitation = findInvitation(previewButton.dataset.preview);

      if (invitation) {
        window.open(
          invitationURL(invitation),
          "_blank",
          "noopener,noreferrer"
        );
      }
    } else if (
      deleteButton &&
      confirm("Delete this invitation and its replies from this browser?")
    ) {
      const data = readData();

      data.invitations = data.invitations.filter(
        invitation => invitation.id !== deleteButton.dataset.delete
      );

      writeData(data);
      renderInvitations();
    }
  });

  $("nameForm").addEventListener("submit", startGuest);

  $("openEnvelope").addEventListener("click", () => {
    $("guestEnvelope").classList.add("open");
    $("openEnvelope").disabled = true;

    setTimeout(() => {
      $("guestEnvelopeStage").hidden = true;
      $("guestContent").hidden = false;
      $("guestName").focus();
    }, 650);
  });

  $("question").addEventListener("click", event => {
    const button = event.target.closest("[data-option]");

    if (!button) return;

    const question = activeInvite.questions[questionIndex];

    answers[question.key] = button.dataset.option;
    renderQuestion();
  });

  $("next").addEventListener("click", () => {
    if (!getCurrentAnswer()) return;

    if (questionIndex < activeInvite.questions.length - 1) {
      questionIndex++;
      renderQuestion();
    } else {
      finishGuest();
    }
  });

  $("prev").addEventListener("click", () => {
    if (questionIndex > 0) {
      questionIndex--;
      renderQuestion();
    }
  });

  $("goHome").addEventListener("click", () => {
    history.replaceState({}, "", cleanBaseURL());
    showScreen("home");
  });

  const inviteId = new URLSearchParams(location.search).get("invite");

  if (inviteId) {
    const invitation = findInvitation(inviteId);

    if (invitation) {
      openGuest(invitation);
    } else {
      showScreen("missing");
    }
  } else if (me) {
    renderDashboard();
  } else {
    showScreen("home");
  }
});

