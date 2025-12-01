import { GoogleGenAI } from "@google/genai";

// Initialize the API client
// Note: In a real environment, ensure process.env.API_KEY is set.
// The user provided key AIzaSyAREHUX9TQza6L7SE6uJKWtKmXVtrtFRdw should be in env vars.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const translateSubtitle = async (subtitleContent: string): Promise<string> => {
  const prompt = `
    You are a professional subtitle translator. 
    Translate the following SRT subtitle content from its original language (likely English) to Vietnamese.
    
    CRITICAL RULES:
    1. Do NOT change the timecodes (e.g., 00:00:01,000 --> 00:00:04,000) under any circumstances.
    2. Do NOT change the sequence numbers.
    3. Only translate the text dialogue.
    4. Keep the output format strictly as a valid SRT file.
    5. Do not add any markdown formatting (like \`\`\`) or conversational text. Just return the raw SRT content.

    Input SRT:
    ${subtitleContent}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    // Clean up potential markdown code blocks if the model adds them despite instructions
    const cleanText = text.replace(/^```(srt|)?\n/, '').replace(/\n```$/, '');
    return cleanText.trim();
  } catch (error) {
    console.error("Translation failed:", error);
    throw error;
  }
};
