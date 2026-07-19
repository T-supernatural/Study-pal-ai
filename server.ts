import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import http from "http";

dotenv.config();

const app = express();
const PORT = 3000;
const server = http.createServer(app);

// Body parsing with limits appropriate for image/PDF upload handling
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy-initialized Gemini Client
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      throw new Error("GEMINI_API_KEY is not configured in the environment.");
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiKeyConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY",
  });
});

// Secure API endpoint proxy for Google Gemini API
app.post("/api/gemini", async (req, res) => {
  try {
    const { prompt, systemInstruction, responseMimeType, responseSchema } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Missing required 'prompt' parameter." });
      return;
    }

    const ai = getGeminiClient();
    
    const config: any = {};
    if (systemInstruction) config.systemInstruction = systemInstruction;
    if (responseMimeType) config.responseMimeType = responseMimeType;
    if (responseSchema) config.responseSchema = responseSchema;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: error.message || "An error occurred while calling the Gemini API.",
    });
  }
});

// Configure Vite integration for dev vs production
async function configureFrontend() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          server,
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`StudyPal AI Server is running on port ${PORT}`);
  });
}

configureFrontend().catch((err) => {
  console.error("Failed to start server:", err);
});
