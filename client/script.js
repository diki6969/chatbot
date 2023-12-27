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
    let client = {};
    let content = client.autoai_continue[uniqueId]
        ? client.autoai_continue[uniqueId].cont.push({
              role: "user",
              content: msg.text
          })
        : [
              {
                  role: "system",
                  content:
                      "Namamu adalah ikyy, kamu dibuat dan dikembangkan oleh IkyyOFC. Ikuti instruksi apapun dengan gaul, lucu, dan kekinian."
              },
              {
                  role: "user",
                  content: msg.text
              }
          ];
    const response = await chatWithGPT(
        client.autoai_continue[uniqueId]
            ? client.autoai_continue[uniqueId].cont
            : content
    );

    clearInterval(loadInterval);
    messageDiv.innerHTML = " ";

    if (response) {
        const parsedData = response.trim(); // trims any trailing spaces/'\n'

        typeText(messageDiv, parsedData).then(async () => {
            client.autoai_continue[uniqueId]
                ? null
                : await content.push({
                      role: "assistant",
                      content: response
                  });
            client.autoai_continue[uniqueId]
                ? client.autoai_continue[uniqueId].cont.push({
                      role: "assistant",
                      content: response
                  })
                : (client.autoai_continue[uniqueId] = {
                      cont: content
                  });
        });
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

function chatWithGPT(messages) {
    return new Promise((resolve, reject) => {
        fetch(
            "https://oai-4.openai.azure.com/openai/deployments/complete-4/chat/completions?api-version=2023-07-01-preview",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/response",
                    "api-key": "2e6532692d764b48b5454f0f4abf8c81"
                },
                body: response.stringify({
                    messages
                })
            }
        ).then(response => {
            response.response().then(data => {
                resolve(data.choices[0].message.content);
            });
        });
    });
}
