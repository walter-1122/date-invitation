/* =========================================
   DATE INVITATION — JAVASCRIPT
   ========================================= */

const datePlan = {
    place: "",
    food: "",
    travel: "",
    date: "",
    time: ""
};

let ownerPhone = "";

/* Clean WhatsApp number */
function cleanPhone(value) {
    return String(value || "").replace(/\D/g, "");
}

/* Show one screen at a time */
function showOnlyScreen(id) {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const target = document.getElementById(id);

    if (target) {
        target.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* Navigate between invitation screens */
function showScreen(number) {
    if (number === "no") {
        showOnlyScreen("noScreen");
    } else {
        showOnlyScreen(`screen${number}`);
    }
}

function nextScreen(number) {
    showScreen(number);
}

/* Create invitation link */
function createInvitationLink() {
    const input = document.getElementById("ownerPhone");
    const phone = cleanPhone(input ? input.value : "");

    if (phone.length < 8 || phone.length > 15) {
        alert("Please enter a valid WhatsApp number including country code.");
        return;
    }

    ownerPhone = phone;

    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("owner", phone);

    const linkField = document.getElementById("invitationLink");

    if (linkField) {
        linkField.value = url.toString();
    }

    showOnlyScreen("linkScreen");
}

/* Generate an invitation URL */
function generateInvitationLink(phoneNumber) {
    const phone = cleanPhone(phoneNumber);

    if (phone.length < 8 || phone.length > 15) {
        return "";
    }

    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("owner", phone);

    return url.toString();
}

/* Copy invitation link */
async function copyInvitationLink() {
    const field = document.getElementById("invitationLink");
    const message = document.getElementById("copyMessage");

    if (!field) return;

    try {
        await navigator.clipboard.writeText(field.value);

        if (message) {
            message.textContent =
                "Copied! Now send it to your special person ❤️";
        }
    } catch (error) {
        field.focus();
        field.select();

        const copied = document.execCommand("copy");

        if (message) {
            message.textContent = copied
                ? "Copied! Now send it to your special person ❤️"
                : "Select the link above and copy it manually.";
        }
    }
}

/* Save selected place, food and transport */
function selectOption(category, value) {
    if (!Object.prototype.hasOwnProperty.call(datePlan, category)) {
        return;
    }

    datePlan[category] = value;

    const nextScreens = {
        place: 6,
        food: 7,
        travel: 8
    };

    if (nextScreens[category]) {
        nextScreen(nextScreens[category]);
    }
}

/* Save selected date */
function saveDate() {
    const input = document.getElementById("date");

    if (!input || !input.value) {
        alert("Please choose a date first ❤️");
        return;
    }

    datePlan.date = input.value;
    nextScreen(9);
}

/* Save selected time */
function saveTime() {
    const input = document.getElementById("time");

    if (!input || !input.value) {
        alert("Please choose a time first ❤️");
        return;
    }

    datePlan.time = input.value;
    showSummary();
}

/* Format date */
function formatDate(value) {
    if (!value) return "Not selected";

    const date = new Date(`${value}T12:00:00`);

    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

/* Format time */
function formatTime(value) {
    if (!value) return "Not selected";

    const [hours, minutes] = value.split(":").map(Number);
    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit"
    });
}

/* Display the complete date plan */
function showSummary() {
    const values = {
        summaryPlace: datePlan.place || "Not selected",
        summaryFood: datePlan.food || "Not selected",
        summaryTravel: datePlan.travel || "Not selected",
        summaryDate: formatDate(datePlan.date),
        summaryTime: formatTime(datePlan.time)
    };

    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    });

    nextScreen(10);
}

/* Get guest's name */
function getGuestName() {
    const input = document.getElementById("guestName");

    return (input && input.value.trim()) || "My love";
}

/* Confirm the date */
function confirmDate() {
    const name = getGuestName();

    const greeting = document.getElementById("finalGreeting");

    if (greeting) {
        greeting.textContent =
            `It's a date, ${name}! I can't wait to spend this time with you. ❤️`;
    }

    /*
      DEMO ONLY:
      This stores the response in this browser.
      Appwrite integration is still needed to sync responses
      across different phones and show them in your dashboard.
    */

    const response = {
        guestName: name,
        ownerPhone: ownerPhone,
        plan: { ...datePlan },
        confirmedAt: new Date().toISOString(),
        status: "Confirmed"
    };

    try {
        const previous = JSON.parse(
            localStorage.getItem("dateInvitationDemoResponses") || "[]"
        );

        previous.push(response);

        localStorage.setItem(
            "dateInvitationDemoResponses",
            JSON.stringify(previous)
        );
    } catch (error) {
        console.warn("Browser storage is unavailable.");
    }

    nextScreen(11);
}

/* Respect a no response */
function noThanks() {
    nextScreen("no");
}

/* Start website */
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("createInvitationForm");

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            createInvitationLink();
        });
    }

    const copyButton = document.getElementById("copyInvitationLink");

    if (copyButton) {
        copyButton.addEventListener("click", copyInvitationLink);
    }

    const backButton = document.getElementById("editInvitationPhone");

    if (backButton) {
        backButton.addEventListener("click", function () {
            showOnlyScreen("loginScreen");
        });
    }

    /* Open invitation when a shared link contains an owner number */
    const params = new URLSearchParams(window.location.search);
    const sharedOwner = cleanPhone(params.get("owner"));

    if (sharedOwner.length >= 8 && sharedOwner.length <= 15) {
        ownerPhone = sharedOwner;
        showOnlyScreen("screen1");
    } else {
        showOnlyScreen("loginScreen");
    }
});
