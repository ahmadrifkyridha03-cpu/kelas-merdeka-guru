import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
}

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY belum dikonfigurasi di environment.");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

export const GEMINI_MODEL_DEFAULT = "gemini-2.5-flash";
export const GEMINI_MODEL_PRO = "gemini-2.5-pro";

