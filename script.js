
// Date Invitation — Main Website Script

"use strict";

const datePlan = {
    place: "",
    food: "",
    travel: "",
    date: "",
    time: ""
};

// Change this to your WhatsApp number with country code.
// Do not include +, spaces, or dashes.
const yourWhatsAppNumber = "923214825245";

// Show one screen and hide all others.
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

// Show the response when NO is selected.
function noThanks() {
    showScreen("noScreen");
}

// Show the login screen.
function showLogin() {
    showScreen("loginScreen");
}

// Show the signup screen.
function showSignup() {
    showScreen("signupScreen");
}

// Open the invitation after a successful authentication flow.
// NOTE: This function does not verify a real account.
function openInvitation() {
    showScreen("screen1");
}

// Save place, food, and travel choices.
function selectOption(type, value) {
    const allowedTypes = ["place", "food", "travel"];

    if (!allowedTypes.includes(type)) {
        return;
    }

    datePlan[type] = value;

    if (type === "place") {
        nextScreen(6);
    } else if (type === "food") {
        nextScreen(7);
    } else if (type === "travel") {
        nextScreen(8);
    }
}

// Save selected date.
function saveDate() {
    const dateInput = document.getElementById("date");

    if (!dateInput || !dateInput.value) {
        alert("Please choose a date ❤️");
        return;
    }

    const selectedDate = new Date(dateInput.value + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        alert("Please choose today or a future date ❤️");
        return;
    }

    datePlan.date = dateInput.value;
    nextScreen(9);
}

// Save selected time.
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
    const requiredChoices = [
        datePlan.place,
        datePlan.food,
        datePlan.travel,
        datePlan.date,
        datePlan.time
    ];

    if (requiredChoices.some(value => !value)) {
        alert("Please complete all the date details first ❤️");
        return;
    }

    const summaryFields = {
        summaryPlace: datePlan.place,
        summaryFood: datePlan.food,
        summaryTravel: datePlan.travel,
        summaryDate: formatDate(datePlan.date),
        summaryTime: formatTime(datePlan.time)
    };

    Object.entries(summaryFields).forEach(([id, value]) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    });

    nextScreen(10);
}

// Format date nicely.
function formatDate(dateValue) {
    if (!dateValue) return "Not selected";

    const selectedDate = new Date(dateValue + "T00:00:00");

    if (Number.isNaN(selectedDate.getTime())) {
        return "Not selected";
    }

    return selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}

// Format time nicely.
function formatTime(timeValue) {
    if (!timeValue || !timeValue.includes(":")) {
        return "Not selected";
    }

    const [hours, minutes] = timeValue.split(":").map(Number);
    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
}

// Confirm the date and prepare the WhatsApp message.
function confirmDate() {
    if (
        !datePlan.place ||
        !datePlan.food ||
        !datePlan.travel ||
        !datePlan.date ||
        !datePlan.time
    ) {
        alert("Please complete your date plan first ❤️");
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
        "https://wa.me/" +
        yourWhatsAppNumber +
        "?text=" +
        encodeURIComponent(message);

    window.open(whatsappURL, "_blank", "noopener,noreferrer");

    nextScreen(11);
}

// Keep all screens and choices initialized on page load.
document.addEventListener("DOMContentLoaded", () => {
    const activeScreen = document.querySelector(".screen.active");

    // If no screen is active, start at the login screen.
    if (!activeScreen) {
        const loginScreen = document.getElementById("loginScreen");

        if (loginScreen) {
            loginScreen.classList.add("active");
        } else {
            const firstScreen = document.getElementById("screen1");

            if (firstScreen) {
                firstScreen.classList.add("active");
            }
        }
    }
});
