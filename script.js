
"use strict";

// ========================================
// DATE INVITATION — MAIN WEBSITE SCRIPT
// ========================================

const datePlan = {
    place: "",
    food: "",
    travel: "",
    date: "",
    time: ""
};

// Get the creator's WhatsApp number from the invitation URL.
function getOwnerPhone() {
    const params = new URLSearchParams(window.location.search);
    return (params.get("owner") || "").replace(/\D/g, "");
}

// Check whether this page is an invitation link for a recipient.
function isRecipientInvitation() {
    const phone = getOwnerPhone();
    return phone.length >= 8 && phone.length <= 15;
}

// Generate the shareable invitation link.
function generateInvitationLink(phoneNumber) {
    const phone = String(phoneNumber || "").replace(/\D/g, "");

    if (phone.length < 8 || phone.length > 15) {
        alert("Please enter a valid WhatsApp number with country code ❤️");
        return null;
    }

    const link = new URL(window.location.href);
    link.search = "";
    link.hash = "";
    link.searchParams.set("owner", phone);

    return link.toString();
}

// Create and copy the invitation link.
async function createInvitationLink() {
    const input =
        document.getElementById("ownerPhone") ||
        document.getElementById("whatsappNumber") ||
        document.getElementById("phoneNumber");

    if (!input || !input.value.trim()) {
        alert("Please enter your WhatsApp number with country code ❤️");
        return;
    }

    const link = generateInvitationLink(input.value);

    if (!link) return;

    try {
        await navigator.clipboard.writeText(link);
        alert(
            "Your invitation link is ready and copied! ❤️\n\n" +
            link +
            "\n\nSend this link to your special person."
        );
    } catch (error) {
        window.prompt("Copy your invitation link:", link);
    }
}

// Show one screen and hide the others.
function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const target = document.getElementById(screenId);

    if (target) {
        target.classList.add("active");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

// Move between invitation screens.
function nextScreen(screenNumber) {
    showScreen("screen" + screenNumber);
}

// Start the invitation.
function openInvitation() {
    showScreen("screen1");
}

// Show the response when NO is selected.
function noThanks() {
    showScreen("noScreen");
}

// Keep these functions available if older HTML calls them.
function showLogin() {
    if (isRecipientInvitation()) {
        openInvitation();
    } else {
        showScreen("loginScreen");
    }
}

function showSignup() {
    if (isRecipientInvitation()) {
        openInvitation();
    } else {
        showScreen("signupScreen");
    }
}

// Save place, food, and travel choices.
function selectOption(type, value) {
    if (!["place", "food", "travel"].includes(type)) return;

    datePlan[type] = value;

    if (type === "place") {
        nextScreen(6);
    } else if (type === "food") {
        nextScreen(7);
    } else if (type === "travel") {
        nextScreen(8);
    }
}

// Save the selected date.
function saveDate() {
    const dateInput = document.getElementById("date");

    if (!dateInput || !dateInput.value) {
        alert("Please choose a date ❤️");
        return;
    }

    const selectedDate = new Date(dateInput.value + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
        alert("Please choose today or a future date ❤️");
        return;
    }

    datePlan.date = dateInput.value;
    nextScreen(9);
}

// Save the selected time.
function saveTime() {
    const timeInput = document.getElementById("time");

    if (!timeInput || !timeInput.value) {
        alert("Please choose a time ❤️");
        return;
    }

    datePlan.time = timeInput.value;
    showSummary();
}

// Display the date summary.
function showSummary() {
    const choices = [
        datePlan.place,
        datePlan.food,
        datePlan.travel,
        datePlan.date,
        datePlan.time
    ];

    if (choices.some(value => !value)) {
        alert("Please complete all the date details first ❤️");
        return;
    }

    const fields = {
        summaryPlace: datePlan.place,
        summaryFood: datePlan.food,
        summaryTravel: datePlan.travel,
        summaryDate: formatDate(datePlan.date),
        summaryTime: formatTime(datePlan.time)
    };

    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });

    nextScreen(10);
}

// Format a date for display.
function formatDate(value) {
    if (!value) return "Not selected";

    const date = new Date(value + "T00:00:00");

    if (Number.isNaN(date.getTime())) return "Not selected";

    return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}

// Format a time for display.
function formatTime(value) {
    if (!value || !value.includes(":")) return "Not selected";

    const [hours, minutes] = value.split(":").map(Number);
    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
}

// Confirm the date and open the creator's WhatsApp chat.
function confirmDate() {
    const choices = [
        datePlan.place,
        datePlan.food,
        datePlan.travel,
        datePlan.date,
        datePlan.time
    ];

    if (choices.some(value => !value)) {
        alert("Please complete your date plan first ❤️");
        return;
    }

    const ownerPhone = getOwnerPhone();

    if (!ownerPhone || ownerPhone.length < 8 || ownerPhone.length > 15) {
        alert(
            "This invitation link is missing a valid creator WhatsApp number. " +
            "Please ask them for a new link ❤️"
        );
        return;
    }

    const message =
        "❤️ Date Invitation Response\n\n" +
        "She said YES! 💕\n\n" +
        "📍 Place: " + datePlan.place + "\n" +
        "🍕 Food: " + datePlan.food + "\n" +
        "🚗 Travel: " + datePlan.travel + "\n" +
        "📅 Date: " + formatDate(datePlan.date) + "\n" +
        "⏰ Time: " + formatTime(datePlan.time) + "\n\n" +
        "Can't wait! ❤️";

    const whatsappURL =
        "https://wa.me/" + ownerPhone +
        "?text=" + encodeURIComponent(message);

    window.location.href = whatsappURL;
}

// Initialize the page.
document.addEventListener("DOMContentLoaded", () => {
    const recipientLink = isRecipientInvitation();

    if (recipientLink) {
        // A recipient opening a shared invitation should see screen 1.
        document.querySelectorAll(".screen").forEach(screen => {
            screen.classList.remove("active");
        });

        const firstScreen = document.getElementById("screen1");

        if (firstScreen) {
            firstScreen.classList.add("active");
        }
    } else {
        // The creator should see the invitation creation form.
        const loginScreen = document.getElementById("loginScreen");

        if (loginScreen) {
            document.querySelectorAll(".screen").forEach(screen => {
                screen.classList.remove("active");
            });

            loginScreen.classList.add("active");
        } else {
            const firstScreen = document.getElementById("screen1");

            if (firstScreen) firstScreen.classList.add("active");
        }
    }

    // Stop old demo login/signup forms from showing the old alert.
    const loginForm = document.querySelector("#loginScreen form");
    const signupForm = document.querySelector("#signupScreen form");

    if (loginForm && !loginForm.querySelector("#ownerPhone")) {
        loginForm.addEventListener("submit", event => {
            event.preventDefault();
            alert("Please use the WhatsApp invitation form to create your link ❤️");
        });
    }

    if (signupForm) {
        signupForm.addEventListener("submit", event => {
            event.preventDefault();
            alert("Account creation is not needed to use this invitation ❤️");
        });
    }
});
