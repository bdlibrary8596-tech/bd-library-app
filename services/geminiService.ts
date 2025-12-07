
import { GoogleGenAI } from "@google/genai";

export const generatePaymentReminder = async (studentName: string, daysOverdue: number): Promise<string> => {
    if (!process.env.API_KEY) {
        return "API_KEY environment variable is not set. Please configure it to use the AI features.";
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `Generate a friendly and professional reminder message for a student named ${studentName} whose fee payment is overdue by ${daysOverdue} days. The tone should be polite but firm. Mention that prompt payment is appreciated to ensure continued services. Keep it concise, around 2-3 sentences.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        if (response.text) {
            return response.text;
        } else {
            return "Could not generate a reminder at this time. Please try again.";
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "An error occurred while generating the reminder. Check the console for details.";
    }
};
