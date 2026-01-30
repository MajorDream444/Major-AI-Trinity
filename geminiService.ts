
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AGENTS } from "./constants";
import { AgentId, Message } from "./types";

export const getGeminiResponse = async (
  agentId: AgentId,
  userMessage: string,
  history: Message[] = [],
  pillarContext?: string
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is not configured in environment.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const agent = AGENTS[agentId];
  
  if (!agent) {
    throw new Error("Invalid Agent selected.");
  }

  const systemInstruction = agent.systemPrompt + (pillarContext ? `\n\nCONTEXT FOR CURRENT SESSION: ${pillarContext}` : "");

  // Format history for Gemini
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  // Add current message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents as any,
      config: {
        systemInstruction,
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
      },
    });

    return response.text || "I am reflecting on your words. Please try again in a moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The Trinity frequency is currently oscillating. Let's try that again shortly.";
  }
};
