const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.post("/chat", async (req, res) => {

    const message = req.body.message;

    try {
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "system",
                            content: "You are EduBot AI, a helpful school tutor. Adapt explanations to student grade."
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        res.json({
            reply: data.choices[0].message.content
        });

    } catch (err) {
        res.json({
            reply: "Error connecting to AI."
        });
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});