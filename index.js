// --- Imports ---
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { Anthropic } = require("@anthropic-ai/sdk");

// --- App Initialization ---
const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Anthropic API Client ---
const anthropic = new Anthropic({
    apiKey: process.env['ANTHROPIC_API_KEY'],
});

// --- Basic Test Route ---
app.get("/", async (req, res) => {
    res.send("Hello World.");
});

// --- API Key Test Route ---
app.get("/test", async (req, res) => {
    const keyLoaded = process.env.ANTHROPIC_API_KEY 
        ? "YES - key is present" 
        : "NO - key is missing";
    res.json({
        status: "server is running",
        apiKey: keyLoaded
    });
});

// --- Main Chat Route ---
app.post("/letschat", async (req, res) => {
    try {
        const { system, messages } = req.body;

        console.log("Incoming request received");
        console.log("System prompt length:", system ? system.length : "MISSING");
        console.log("Messages count:", messages ? messages.length : "MISSING");

        if (!system || !messages) {
            return res.status(400).json({
                success: false,
                error: "Request body must contain 'system' and 'messages' properties."
            });
        }

        const response = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            system: system,
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7,
        });

        return res.status(200).json({
            success: true,
            data: response.content,
        });

    } catch (error) {
        console.error("Full error object:", error);
        console.error("Error status:", error.status);
        console.error("Error message:", error.message);
        console.error("Error body:", JSON.stringify(error.body));
        return res.status(400).json({
            success: false,
            error: error.message || "There was a problem on the server",
            status: error.status || null,
            detail: error.body || null
        });
    }
});

// --- Server Startup ---
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
