import { GoogleGenAI } from "@google/genai";

export const ai = {
    ask: async message => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: message,
                language: "en",
                stopSequences: ["\n\n"],
            })
            return response
        } catch (_error) {
            return null
        }
    }
}