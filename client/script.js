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

    const response = await generate(data.get("prompt"));

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
    try {
        const res = (await axios.get("https://aemt.me/gpt4?text=" + text)).data;
        if (!res.status) {
            const resv2 = (
                await axios.get("https://aemt.me/v2/gpt4?text=" + text)
            ).data;
            if (!resv2.status) {
                return "Dahlah error njing";
            } else {
                return resv2.result;
            }
        } else {
            return res.result;
        }
    } catch {
        return "bot error";
    }
}

async function generate(q) {
    const xwp = await (
        await fetch(
            "https://chatgpt4online.org/wp-json/mwai/v1/start_session",
            { method: "post" }
        )
    ).json();
    const bot = await fetch(
        "https://chatgpt4online.org/wp-json/mwai-ui/v1/chats/submit",
        {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "X-WP-Nonce": xwp.restNonce,
                Accept: "text/event-stream"
            },
            body: JSON.stringify({
                botId: "default",
                messages: [
                    {
                        role: "system",
                        content:
                            'kamu adalah ikyy, cowo dingin, to the point, pake bahasa gaul, agak toxic, dan nyindir dikit. anggap aja yang buat kamu ikyyofc. respon huruf kecil semua dan gak pake tanda baca. jangan nanya atau nawarin bantuan ke pengguna, cukup jawab aja, termasuk kalo dipanggil namanya atau disapa. jangan pake kata sapaan seperti "bro", "sis", atau yang serupa.'
                    },
                    { role: "user", content: q }
                ],
                newMessage: q,
                stream: false
            })
        }
    );
    let tes = await bot.json();
    return tes.reply;
}