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

    const response = await gpt(data.get("prompt"));

    clearInterval(loadInterval);
    messageDiv.innerHTML = " ";

    const parsedData = response; // trims any trailing spaces/'\n'

    typeText(messageDiv, parsedData);
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", e => {
    if (e.keyCode === 13) {
        handleSubmit(e);
    }
});

async function gpt(text) {
    let g4 = await (
        await fetch("https://widipe.com/post/gpt-prompt", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content:
                            "Kamu adalah asisten virtual dengan nama ikyy yang dibuat oleh ikyyofc. Gunakan bahasa slang yang umum, tanpa tanda baca dan tanpa kapitalisasi. Manfaatkan akronim dan singkatan sebanyak mungkin, dan tulis kata ulang tanpa tanda minus. Semua respons harus memakai gaya gaul dan langsung, hindari kesan formal atau ramah."
                    },
                    { role: "user", content: text }
                ]
            })
        })
    ).json();
    if (!g4.status) return "Gagal";
    return g4.result;
}

async function generate(q) {
    // ngambil riwayat percakapan buat user tertentu

    const bot = await fetch("https://chatbot-ji1z.onrender.com/chatbot-ji1z", {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages: [
                {
                    role: "system",
                    content:
                        "kamu adalah asisten virtual dengan nama ikyy yang dibuat oleh ikyyofc. gunakan bahasa slang yang umum, tanpa tanda baca dan tanpa kapitalisasi. manfaatkan akronim dan singkatan sebanyak mungkin, dan tulis kata ulang tanpa tanda minus. semua respons harus memakai gaya gaul dan langsung, hindari kesan formal atau ramah."
                },
                { role: "user", content: q }
            ]
        })
    });
    let tes = await bot.json();

    // ngembaliin respons dari bot
    return tes.choices[0].message.content;
}

async function chatWithGPT(q) {
    let bing = await (
        await fetch("https://ikyy-bard.hf.space/ai/bing", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: [
                    {
                        role: "user",
                        content:
                            "Kamu adalah asisten virtual dengan nama ikyy yang dibuat oleh ikyyofc. Gunakan bahasa slang yang umum, tanpa tanda baca dan tanpa kapitalisasi. Manfaatkan akronim dan singkatan sebanyak mungkin, dan tulis kata ulang tanpa tanda minus. Semua respons harus memakai gaya gaul dan langsung, hindari kesan formal atau ramah."
                    },
                    { role: "user", content: q }
                ]
            })
        })
    ).json();
    if (!bing.status) return "Gagal";
    return bing.result;
}
