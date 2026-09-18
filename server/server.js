import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing from .env");
} else {
  console.log("✅ Gemini API key loaded");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.json({
    message: "FinWise AI server is running",
  });
});

app.post("/api/chat", async (req, res) => {
  console.log("📩 Incoming message:", req.body.message);

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `
You are FinWise AI, a helpful personal financial assistant.

Give simple, practical and easy-to-understand financial guidance.
Do not make risky investment promises.
Do not claim to be a professional financial advisor.

User's question:
${message}
      `,
    });

    const reply = response.text;

    console.log("✅ Gemini response received");

    res.json({
      reply,
    });
  } catch (error) {
    console.error("❌ Gemini API error:");
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch response from Gemini API.",
      details: error.message || String(error),
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 FinWise AI server running on http://localhost:${PORT}`);
});