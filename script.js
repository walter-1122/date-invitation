
 // Date Invitation — Main Website Script
"use strict";

const datePlan = {
    place: "",
    food: "",
    travel: "",
    date: "",
    time: ""
};

// Read the invitation creator's WhatsApp number from the link.
function getOwnerPhone() {
    const params = new URLSearchParams(window.location.search);
    return (params.get("owner") || "").replace(/\D/g, "");
}

// Generate a shareable invitation link for the creator.
function generateInvitationLink(phoneNumber) {
    const phone = String(phoneNumber || "").replace(/\D/g, "");

    if (phone.length < 8 || phone.length > 15) {
        alert("Please enter a valid WhatsApp number with country code ❤️");
        return;
    }

    const link = new URL(window.location.href);
    link.search = "";
    link.hash = "";
    link.searchParams.set("owner", phone);

    return link.toString();
}

// Copy a generated invitation link.
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
        alert("Your invitation link is ready and copied! ❤️\n\n" + link);
    } catch (error) {
        window.prompt("Copy your invitation link:", link);
    }
}

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

// Open invitation without requiring the recipient to log in.
function openInvitation() {
    showScreen("screen1");
}

// Save place, food, and travel choices.
function selectOption(type, value) {
    if (!["place", "food", "travel"].includes(type)) return;

    datePlan[type] = value;

    if (type === "place") nextScreen(6);
    else if (type === "food") nextScreen(7);
    else if (type === "travel") nextScreen(8);
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

// Format date.
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

// Format time.
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
        alert("This invitation link is missing a valid creator WhatsApp number. Please ask them for a new link ❤️");
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
    const activeScreen = document.querySelector(".screen.active");

    if (!activeScreen) {
        const startScreen = document.getElementById("screen1") ||
                            document.getElementById("loginScreen");

        if (startScreen) startScreen.classList.add("active");
    }
});

