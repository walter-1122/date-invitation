// Date invitation website

let datePlan = {
    place: "",
    food: "",
    travel: "",
    date: "",
    time: ""
};


// Move between screens
function nextScreen(screenNumber) {

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const next = document.getElementById("screen" + screenNumber);

    if (next) {
        next.classList.add("active");
    }
}


// NO response
function noThanks() {

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    document.getElementById("noScreen").classList.add("active");
}


// Save place, food and travel choices
function selectOption(type, value) {

    datePlan[type] = value;

    if (type === "place") {
        nextScreen(6);
    }

    if (type === "food") {
        nextScreen(7);
    }

    if (type === "travel") {
        nextScreen(8);
    }
}


// Save selected date
function saveDate() {

    const dateInput = document.getElementById("date");

    if (!dateInput.value) {
        alert("Please choose a date ❤️");
        return;
    }

    datePlan.date = dateInput.value;

    nextScreen(9);
}


// Save selected time
function saveTime() {

    const timeInput = document.getElementById("time");

    if (!timeInput.value) {
        alert("Please choose a time ❤️");
        return;
    }

    datePlan.time = timeInput.value;

    showSummary();
}


// Show final date summary
function showSummary() {

    document.getElementById("summaryPlace").textContent =
        datePlan.place;

    document.getElementById("summaryFood").textContent =
        datePlan.food;

    document.getElementById("summaryTravel").textContent =
        datePlan.travel;

    document.getElementById("summaryDate").textContent =
        formatDate(datePlan.date);

    document.getElementById("summaryTime").textContent =
        formatTime(datePlan.time);

    nextScreen(10);
}


// Format date nicely
function formatDate(date) {

    const selectedDate = new Date(date + "T00:00:00");

    return selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}


// Format time nicely
function formatTime(time) {

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(hours, minutes);

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
}


// Final confirmation + WhatsApp
function confirmDate() {

    const message =
        "❤️ Date Invitation Response\n\n" +
        "She said YES! 💕\n\n" +
        "📍 Place: " + datePlan.place + "\n" +
        "🍕 Food: " + datePlan.food + "\n" +
        "🚗 Travel: " + datePlan.travel + "\n" +
        "📅 Date: " + formatDate(datePlan.date) + "\n" +
        "⏰ Time: " + formatTime(datePlan.time) + "\n\n" +
        "Can't wait! ❤️";

    const yourWhatsAppNumber = "923007414145";

    const whatsappURL =
        "https://wa.me/" +
        yourWhatsAppNumber +
        "?text=" +
        encodeURIComponent(message);

    window.open(whatsappURL, "_blank");

    nextScreen(11);
}
