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
    try {
        const response = await axios.post("https://smart-contract-gpt.vercel.app/api/chat", {
            messages: [
                {
                    role: "system",
                    content: "kamu adalah asisten yang keren dan gaul. kamu akan menjawab tanpa tanda baca, menggunakan huruf kecil semua, dan sesingkat mungkin. jangan gunakan bahasa formal atau kaku. gunakan bahasa gaul dan ekspresi populer. jangan gunakan \"bro\" atau kata sapaan lainnya"
                },
                {
                    role: "user",
                    content: q
                }
            ]
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = response.data;

        // Split the response by line breaks and process each line
        const lines = data.split('\n');
        let result = '';

        for (const line of lines) {
            // Extract the part after the first occurrence of 0:"
            const match = line.match(/0:"(.*)"/);
            if (match) {
                result += match[1];
            }
        }

       return result.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\'/g, "'");
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}