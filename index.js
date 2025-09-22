// --- Imports ---
const express = require("express"); // Imports the Express framework to create and manage the server.
const cors = require("cors"); // Imports the CORS middleware to allow cross-origin requests (from Storyline to your server).
require("dotenv").config(); // Imports and runs the dotenv configuration, loading variables from your .env file.
const { Anthropic } = require("@anthropic-ai/sdk"); // Imports the official Anthropic library, specifically destructuring the Anthropic class.

// --- App Initialization ---
const app = express(); // Creates an instance of an Express application.

// --- Middleware ---
app.use(cors()); // Enables CORS for all routes, allowing your Storyline project to make requests to this server.
app.use(express.json()); // Enables the express.json middleware, which parses incoming request bodies with a JSON payload.

// --- Anthropic API Client ---
const anthropic = new Anthropic({ // Creates a new instance of the Anthropic client.
    apiKey: process.env['ANTHROPIC_API_KEY'], // Configures the client with your API key from the .env file.
});

// --- Basic Test Route ---
app.get("/", async(req,res)=>{ // Defines a simple GET route for the root URL ("/").
    res.send("Hello World."); // Sends a "Hello World." response, useful for testing if the server is running.
});

// --- Main Chat Route
app.post("/letschat", async(req,res)=>{ // Defines the main POST route.
    try{ 
        // Now, we expect the frontend to send BOTH the system prompt and the messages array.
        const { system, messages } = req.body; 

        // Check if the required data was sent from the frontend.
        if (!system || !messages) {
            return res.status(400).json({ success: false, error: "Request body must contain 'system' and 'messages' properties." });
        }

        const response = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            // The system prompt is now taken directly from the request body.
            system: system, 
            // The messages are taken directly from the request body.
            messages: messages,
            max_tokens: 450,
            temperature: 0.7,
        });
        
        return res.status(200).json({
            success: true,
            data: response.content, // This is correct for Anthropic.
        });

    } catch (error) { 
        console.error("Error in /letschat route:", error); 
        return res.status(400).json({
            success: false,
            error: error.response ? error.response.data: "There was a problem on the server",
        });
    }
});

// --- Server Startup ---
const port = process.env.PORT || 5000; // Sets the port for the server, using an environment variable or defaulting to 5000.

// Starts the server and makes it listen for incoming requests on the specified port.
app.listen(port, () => console.log(`Server listening on port ${port}`));