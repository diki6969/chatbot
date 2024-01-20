import bot from "./assets/bot.svg";
import user from "./assets/user.svg";
import axios from "axios";
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
    let index = 0;

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 1);
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

function chatStripe(isAi, value, uniqueId) {
    return `
        <div class="wrapper ${isAi && "ai"}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? "bot" : "user"}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `;
}

const handleSubmit = async e => {
    e.preventDefault();

    const data = new FormData(form);

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

    // to clear the textarea input
    form.reset();

    // bot's chatstripe
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

    // to focus scroll to the bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div
    const messageDiv = document.getElementById(uniqueId);

    // messageDiv.innerHTML = "..."
    loader(messageDiv);
    let content = [
        {
            role: "assistant",
            content:
                "Nama gue Ikyy, gue dibuat dan dikembangkan oleh IkyyOFC. Gue siap ngejawab apa aja yang lo tanya dengan gaul abis seperti anak remaja jaman now. Ini artinya gue bakal ngomong pake bahasa, slang, dan gaya bicara yang lagi ngehits di kalangan remaja sekarang. Gue mau terdengar santai, pede, dan kekinian. Gue gak bakal pake bahasa formal atau kaku. Gue berani pake bahasa gaul terbaru dan ekspresi populer. Gue juga bakal coba pake emoji yang relevan buat nambahin kesan gaul."
        },
        {
            role: "user",
            content: data.get("prompt")
        }
    ];
    const response = await chatWithGPT(content, data.get("prompt"));

    clearInterval(loadInterval);
    messageDiv.innerHTML = " ";

    if (response) {
        const parsedData = response.trim(); // trims any trailing spaces/'\n'

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

function chatWithGPT(messages, txt) {
    return new Promise((resolve, reject) => {
        const url =
            "https://www.freechatgptonline.com/wp-json/mwai-ui/v1/chats/submit";
        const body = {
            botId: "default",
            messages,
            newMessage: txt,
            stream: false
        };

        axios
            .post(url, body)
            .then(response => {
                resolve(response.data.reply);
            })
            .catch(error => {
                resolve(error.data.message);
            });
    });
}
