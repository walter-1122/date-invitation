
/* =========================================
   DATE INVITATION — GOLDEN ELEGANCE
   Invitation Builder + Guest Responses
   Note: This version uses browser storage.
   Cloud syncing is not enabled yet.
========================================= */

"use strict";

const STORAGE_KEY = "goldenInviteData_v1";
const PROFILE_KEY = "goldenInviteProfile_v1";

const $ = (id) => document.getElementById(id);

let currentProfile = null;
let activeInvitation = null;
let guestName = "";
let guestAnswers = {};
let questionIndex = 0;

const screenIds = ["home", "dashboard", "link", "guest", "missing"];

/* ---------- Basic helpers ---------- */

function showScreen(id) {
    screenIds.forEach((screenId) => {
        const element = $(screenId);
        if (element) {
            element.classList.toggle("active", screenId === id);
        }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    }

    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function readStorage() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

        return {
            invitations: Array.isArray(saved.invitations)
                ? saved.invitations
                : []
        };
    } catch (error) {
        return { invitations: [] };
    }
}

function saveStorage(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        alert("Unable to save. Please check your browser storage.");
        return false;
    }
}

function getBaseURL() {
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    return url.toString();
}

function makeInvitationURL(invitation) {
    const url = new URL(getBaseURL());
    url.searchParams.set("invite", invitation.id);
    return url.toString();
}

function findInvitation(invitationId) {
    return readStorage().invitations.find(
        (invitation) => invitation.id === invitationId
    );
}

/* ---------- Profile and dashboard ---------- */

function saveProfile(name, phone) {
    currentProfile = {
        id: createId(),
        name: name.trim(),
        phone: String(phone || "").replace(/\D/g, "")
    };

    try {
        localStorage.setItem(
            PROFILE_KEY,
            JSON.stringify(currentProfile)
        );
    } catch (error) {
        alert("Your browser could not save the profile.");
        return;
    }

    openDashboard();
}

function openDashboard() {
    if (!currentProfile) {
        showScreen("home");
        return;
    }

    $("displayName").textContent = currentProfile.name;
    renderDashboard();
    showScreen("dashboard");
}

function renderDashboard() {
    const data = readStorage();

    const myInvitations = data.invitations.filter(
        (invitation) => invitation.ownerId === currentProfile?.id
    );

    $("inviteCount").textContent = myInvitations.length;

    $("replyCount").textContent = myInvitations.reduce(
        (total, invitation) =>
            total + (invitation.replies || []).length,
        0
    );

    if (!myInvitations.length) {
        $("cards").innerHTML =
            '<p class="empty">Your invitations will appear here.</p>';
        return;
    }

    $("cards").innerHTML = myInvitations
        .slice()
        .reverse()
        .map((invitation) => {
            const replies = invitation.replies || [];

            return `
                <article class="invitecard">
                    <small>
                        ${replies.length} REPLIES ·
                        ${escapeHTML(new Date(invitation.created).toLocaleDateString())}
                    </small>

                    <h3>${escapeHTML(invitation.title)}</h3>

                    <p>${escapeHTML(
                        invitation.message || "A little moment made personal."
                    )}</p>

                    <div class="cardactions">
                        <button class="gold"
                            data-copy="${escapeHTML(invitation.id)}">
                            Copy link ↗
                        </button>

                        <button class="outline"
                            data-preview="${escapeHTML(invitation.id)}">
                            Preview
                        </button>

                        <button class="outline"
                            data-delete="${escapeHTML(invitation.id)}">
                            Delete
                        </button>
                    </div>

                    ${replies.map((reply) => `
                        <div class="reply">
                            <strong>♡ ${escapeHTML(reply.name)}</strong>

                            <p>
                                ${Object.entries(reply.answers || {})
                                    .map(([question, answer]) =>
                                        `<b>${escapeHTML(question)}:</b>
                                        ${escapeHTML(answer || "—")}`
                                    )
                                    .join("<br>")}
                            </p>

                            <p>${escapeHTML(
                                new Date(reply.at).toLocaleString()
                            )}</p>
                        </div>
                    `).join("")}
                </article>
            `;
        })
        .join("");
}

/* ---------- Invitation builder ---------- */

function getOptions(fieldId) {
    return $(fieldId).value
        .split(/\r?\n/)
        .map((option) => option.trim())
        .filter(Boolean)
        .slice(0, 12);
}

function createInvitation(event) {
    event.preventDefault();

    const questions = [];

    function addChoiceQuestion(checkId, key, label, optionsId) {
        if (!$(checkId).checked) return;

        const options = getOptions(optionsId);

        if (!options.length) {
            throw new Error(
                "Please add at least one option or turn that question off."
            );
        }

        questions.push({
            key,
            label,
            type: "choice",
            options
        });
    }

    try {
        addChoiceQuestion(
            "usePlace",
            "Place",
            "Where would you like to go?",
            "places"
        );

        addChoiceQuestion(
            "useFood",
            "Food",
            "What sounds good to eat?",
            "foods"
        );

        addChoiceQuestion(
            "useTravel",
            "Transport",
            "How should we get there?",
            "travels"
        );
    } catch (error) {
        alert(error.message);
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
        alert("Please enable at least one question.");
        return;
    }

    const invitation = {
        id: createId(),
        ownerId: currentProfile.id,
        ownerName: currentProfile.name,
        title: $("title").value.trim(),
        message: $("message").value.trim(),
        questions,
        replies: [],
        created: new Date().toISOString()
    };

    const data = readStorage();
    data.invitations.push(invitation);

    if (!saveStorage(data)) return;

    activeInvitation = invitation;
    $("url").value = makeInvitationURL(invitation);
    $("copyMessage").textContent = "";

    showScreen("link");
}

/* ---------- Copy and share ---------- */

async function copyText(text, messageElement) {
    try {
        await navigator.clipboard.writeText(text);

        if (messageElement) {
            messageElement.textContent = "Copied! Ready to share. ♡";
        }
    } catch (error) {
        const temporaryInput = document.createElement("textarea");

        temporaryInput.value = text;
        temporaryInput.style.position = "fixed";
        temporaryInput.style.opacity = "0";

        document.body.appendChild(temporaryInput);
        temporaryInput.select();

        const copied = document.execCommand("copy");
        temporaryInput.remove();

        if (messageElement) {
            messageElement.textContent = copied
                ? "Copied! Ready to share. ♡"
                : "Please select and copy the link manually.";
        }
    }
}

/* ---------- Guest invitation ---------- */

function openGuestInvitation(invitation) {
    activeInvitation = invitation;
    guestName = "";
    guestAnswers = {};
    questionIndex = 0;

    $("nameForm").hidden = false;
    $("question").innerHTML = "";
    $("guestActions").hidden = true;
    $("final").hidden = true;

    $("guestTitle").innerHTML =
        `${escapeHTML(invitation.title)}<br><i>♡</i>`;

    $("guestIntro").textContent =
        invitation.message ||
        `${invitation.ownerName} has a little question for you.`;

    $("progress").textContent = "A LITTLE QUESTION";

    showScreen("guest");
}

function startGuestQuestions(event) {
    event.preventDefault();

    guestName = $("guestName").value.trim();

    if (!guestName) {
        alert("Please enter your name first. ♡");
        return;
    }

    $("nameForm").hidden = true;

    if (!activeInvitation.questions.length) {
        finishInvitation();
        return;
    }

    renderQuestion();
}

function renderQuestion() {
    const question = activeInvitation.questions[questionIndex];

    $("progress").textContent =
        `QUESTION ${questionIndex + 1} OF ${activeInvitation.questions.length}`;

    $("guestIntro").textContent =
        `Just for you, ${guestName}. Choose what feels right.`;

    $("question").innerHTML = `
        <div class="qtitle">${escapeHTML(question.label)}</div>
    `;

    if (question.type === "choice") {
        $("question").innerHTML += `
            <div class="options">
                ${question.options.map((option) => `
                    <button type="button"
                        class="option ${
                            guestAnswers[question.key] === option
                                ? "selected"
                                : ""
                        }"
                        data-option="${escapeHTML(option)}">
                        ${escapeHTML(option)}
                    </button>
                `).join("")}
            </div>
        `;
    } else {
        const type = ["date", "time"].includes(question.type)
            ? question.type
            : "text";

        $("question").innerHTML += `
            <input
                id="answer"
                type="${type}"
                maxlength="250"
                placeholder="Your answer"
                value="${escapeHTML(guestAnswers[question.key] || "")}"
            >
        `;
    }

    $("guestActions").hidden = false;
    $("prev").disabled = questionIndex === 0;

    $("next").textContent =
        questionIndex === activeInvitation.questions.length - 1
            ? "Confirm answers ♡"
            : "Continue →";
}

function readCurrentAnswer() {
    const question = activeInvitation.questions[questionIndex];

    if (question.type === "choice") {
        if (!guestAnswers[question.key]) {
            alert("Please choose an option. ♡");
            return false;
        }
    } else {
        const input = $("answer");
        const answer = input ? input.value.trim() : "";

        if (!answer) {
            alert("Please answer this question. ♡");
            return false;
        }

        guestAnswers[question.key] = answer;
    }

    return true;
}

function finishInvitation() {
    const data = readStorage();

    const invitation = data.invitations.find(
        (item) => item.id === activeInvitation.id
    );

    if (invitation) {
        invitation.replies = invitation.replies || [];

        invitation.replies.push({
            name: guestName,
            answers: { ...guestAnswers },
            at: new Date().toISOString()
        });

        saveStorage(data);
    }

    $("question").innerHTML = "";
    $("guestActions").hidden = true;

    $("progress").textContent = "ALL DONE";

    $("guestTitle").innerHTML =
        `It's a date, <i>${escapeHTML(guestName || "my love")}!</i>`;

    $("guestIntro").textContent =
        "Thank you for making this little moment special.";

    $("final").hidden = false;

    $("final").innerHTML = `
        <h2>Looking forward to it ♡</h2>
        <p>${escapeHTML(activeInvitation.ownerName)} is going to be smiling about this.</p>
        <p>
            Here's to good company, little surprises,
            and a memory worth keeping.
        </p>
    `;
}

/* ---------- Event listeners ---------- */

document.addEventListener("DOMContentLoaded", function () {
    try {
        currentProfile = JSON.parse(
            localStorage.getItem(PROFILE_KEY) || "null"
        );
    } catch (error) {
        currentProfile = null;
    }

    $("profileForm").addEventListener("submit", (event) => {
        event.preventDefault();

        saveProfile(
            $("ownerName").value,
            $("ownerPhone").value
        );
    });

    $("builder").addEventListener("submit", createInvitation);

    $("switchProfile").addEventListener("click", () => {
        showScreen("home");
    });

    $("back").addEventListener("click", openDashboard);

    $("copy").addEventListener("click", () => {
        copyText($("url").value, $("copyMessage"));
    });

    $("preview").addEventListener("click", () => {
        if (activeInvitation) {
            window.open(
                makeInvitationURL(activeInvitation),
                "_blank",
                "noopener,noreferrer"
            );
        }
    });

    $("cards").addEventListener("click", (event) => {
        const copyButton = event.target.closest("[data-copy]");
        const previewButton = event.target.closest("[data-preview]");
        const deleteButton = event.target.closest("[data-delete]");

        if (copyButton) {
            const invitation = findInvitation(copyButton.dataset.copy);

            if (invitation) {
                copyText(
                    makeInvitationURL(invitation),
                    $("builderMessage")
                );
            }
        } else if (previewButton) {
            const invitation = findInvitation(
                previewButton.dataset.preview
            );

            if (invitation) {
                window.open(
                    makeInvitationURL(invitation),
                    "_blank",
                    "noopener,noreferrer"
                );
            }
        } else if (
            deleteButton &&
            window.confirm(
                "Delete this invitation and its replies from this browser?"
            )
        ) {
            const data = readStorage();

            data.invitations = data.invitations.filter(
                (invitation) =>
                    invitation.id !== deleteButton.dataset.delete
            );

            if (saveStorage(data)) {
                renderDashboard();
            }
        }
    });

    $("nameForm").addEventListener("submit", startGuestQuestions);

    $("question").addEventListener("click", (event) => {
        const optionButton = event.target.closest("[data-option]");

        if (!optionButton) return;

        const question = activeInvitation.questions[questionIndex];

        guestAnswers[question.key] = optionButton.dataset.option;

        renderQuestion();
    });

    $("next").addEventListener("click", () => {
        if (!readCurrentAnswer()) return;

        if (questionIndex < activeInvitation.questions.length - 1) {
            questionIndex++;
            renderQuestion();
        } else {
            finishInvitation();
        }
    });

    $("prev").addEventListener("click", () => {
        if (questionIndex > 0) {
            questionIndex--;
            renderQuestion();
        }
    });

    $("goHome").addEventListener("click", () => {
        window.history.replaceState({}, "", getBaseURL());
        showScreen("home");
    });

    /* Load shared invitation link */
    const invitationId =
        new URLSearchParams(window.location.search).get("invite");

    if (invitationId) {
        const invitation = findInvitation(invitationId);

        if (invitation) {
            openGuestInvitation(invitation);
        } else {
            showScreen("missing");
        }
    } else if (currentProfile) {
        openDashboard();
    } else {
        showScreen("home");
    }
});

