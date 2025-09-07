import { GoogleGenAI, Type } from "@google/genai";
import { DrawnCard, TarotInterpretation } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function getTarotReading(cards: DrawnCard[]): Promise<TarotInterpretation> {
  const [pastCard, presentCard, futureCard] = cards;

  const prompt = `
    You are an expert tarot reader with a mystical, wise, and insightful tone.
    A user has drawn three cards for a 'Past, Present, Future' reading. The cards are:
    - Past: ${pastCard.name}
    - Present: ${presentCard.name}
    - Future: ${futureCard.name}

    Provide a concise, connected reading. Make it in Mongolian language.
    First, interpret each card in its position, reflecting on how they connect.
    Then, provide a short, overall summary of the reading's message. 
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            past: {
              type: Type.STRING,
              description: 'The interpretation for the Past card.',
            },
            present: {
              type: Type.STRING,
              description: 'The interpretation for the Present card.',
            },
            future: {
              type: Type.STRING,
              description: 'The interpretation for the Future card.',
            },
            summary: {
              type: Type.STRING,
              description: 'A brief summary that synthesizes the message of the three cards.',
            },
          },
          required: ["past", "present", "future", "summary"],
        },
      },
    });

    const jsonText = response.text.trim();
    const interpretation = JSON.parse(jsonText) as TarotInterpretation;
    return interpretation;
  } catch (error) {
    console.error("Error fetching tarot reading from Gemini:", error);
    throw new Error("The celestial energies are clouded. Please try again later.");
  }
}
