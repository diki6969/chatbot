import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(element) {
    element.textContent = "";

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += ".";

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === "....") {
            element.textContent = "";
        }
    }, 300);
}

function typeText(element, text) {
    // element.innerHTML += text
    let index = 0;

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 5);
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, imag = false, value, uniqueId) {
    return `
        <div class="wrapper ${isAi && "ai"}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? "bot" : "user"}" 
                    />
                </div>
                ${
                    !imag
                        ? `<div class="message" id=${uniqueId}>${value}</div>`
                        : `<div class="message"> <img src="https://telegra.ph/file/4e0785cc2bc2f5855a00e.jpg"/></div>`
                }
            </div>
        </div>
    `;
}

const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData(form);
    const imgvalid = data.get("prompt").startsWith("/img");
    if (!imgvalid) {
        // user's chatstripe
        chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
    } else {
        chatContainer.innerHTML += chatStripe(false, true, data.get("prompt"));
    }

    // to clear the textarea input
    form.reset();

    // bot's chatstripe
    const uniqueId = generateUniqueId();
    if (!imgvalid) {
        chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
    } else {
        chatContainer.innerHTML += chatStripe(true, true, " ", uniqueId);
    }

    // to focus scroll to the bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div
    const messageDiv = document.getElementById(uniqueId);

    // messageDiv.innerHTML = "..."
    loader(messageDiv);

    const response = await fetch(
        "https://aemt.me/prompt/gpt?prompt=" +
            encodeURIComponent(
                "Namamu adalah Ikyy. Kamu diciptakan oleh IkyyOFC, yang lebih dikenal dengan nama Diki Pandu Winata. Tugasmu adalah menjawab pertanyaan apa pun secara rinci dan detail."
            ) +
            "&text=" +
            encodeURIComponent(data.get("prompt")),
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    clearInterval(loadInterval);
    messageDiv.innerHTML = " ";

    if (response.status) {
        const data = await response.json();
        const parsedData = data.result.trim(); // trims any trailing spaces/'\n'

        typeText(messageDiv, parsedData);
    } else {
        const err = await response.text();

        messageDiv.innerHTML = "Something went wrong";
        alert(err);
    }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", e => {
    if (e.keyCode === 13) {
        handleSubmit(e);
    }
});
