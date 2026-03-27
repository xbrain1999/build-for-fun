
import { GoogleGenAI, Type } from "@google/genai";
import { FormData, ItineraryResponse, Language } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateItinerary = async (
  data: FormData, 
  language: Language, 
  rejectedPlaces: string[] = []
): Promise<ItineraryResponse> => {
  
  const isChinese = language === 'zh';
  const toneInstruction = isChinese 
    ? "Tone: Witty, understanding, slightly humorous (using internet slang like '神兽' for kids, '废妈' for tired moms). The content MUST be in Chinese (Simplified)."
    : "Tone: Encouraging, practical, and fun. The content MUST be in English.";

  const indoorConstraint = data.indoorOnly 
    ? "CONSTRAINT: User selected 'Indoor Only'. You MUST strictly filter out any outdoor activities (parks, hiking, zoos, outdoor farms). Suggest alternatives like Science Centers, Indoor Climbing, Libraries, Malls, Museums, or Aquariums. If a selected category implies outdoors (e.g., 'Nature'), suggest an indoor alternative like a Botanical Garden Greenhouse or Nature Museum."
    : "";

  const prompt = `
    Generate a parenting weekend itinerary.
    
    User Inputs:
    - Child Age: ${data.childAge} years old
    - Energy Level: ${data.energyLevel}
    - Location: ${data.location}
    - Weather: ${data.weather}
    - Duration: ${data.duration}
    - Indoor Only: ${data.indoorOnly}
    - Selected Categories: ${data.interests.join(", ")}
    - Excluded Places (Do NOT suggest these): ${rejectedPlaces.join(", ")}
    
    ${indoorConstraint}

    Category Interpretation Guide:
    - If "Nature & Parks" selected -> Suggest Zoos, Parks, Farms, Botanical Gardens (Unless Indoor Only).
    - If "Indoor Play" selected -> Suggest Soft play areas, Trampoline parks, Kid-friendly Arcades.
    - If "Culture & Edu" selected -> Suggest Museums, Aquariums, Science Centers, Art Galleries.
    - If "Sports & Action" selected -> Suggest Hiking, Biking (Outdoors) OR Climbing, Adventure parks (Indoors).
    - If "Relaxation & Food" selected -> Suggest Family Cafes, Bookstores with reading corners, Scenic picnic spots.

    Interests & Coherence Strategy:
    The user has selected these interests: ${data.interests.join(" + ")}.
    Create a coherent itinerary that blends these specific vibes. 
    Do NOT simply list one place for interest A and one for interest B if they are too far apart. 
    Try to find a SINGLE location or area that satisfies BOTH if possible (e.g., A Science Museum inside a Park, or a Mall with an Indoor Play area).
    If distinct locations are needed, ensure they are logically connected and close to each other.

    TRUST & ACCURACY RULES:
    1. PRIORITIZE REAL, well-known landmarks or category-leaders in the user's city (${data.location}).
    2. If you do not know a specific local spot (because the city is obscure), suggest a **Generic High-Quality Category** but label it clearly (e.g., "Nearest Public Library").
    3. DO NOT invent opening hours or ticket prices.
    
    PINPOINT ACCURACY FOR 'locationName':
    When generating the 'locationName' field:
    1. Do NOT just give the generic place name.
    2. Append the most specific **Entry Point** or **Sub-Location** relevant to the activity.
    3. Append the **City Name** to ensure the map search doesn't jump to another city.
    
    Examples of 'Bad' vs 'Good' locationName:
    - Bad: 'Century Park' -> Good: 'Shanghai Century Park Gate 7 (Near Children Area)'
    - Bad: 'Natural History Museum' -> Good: 'Beijing Natural History Museum Ticketing Entrance'
    - Bad: 'Wanda Plaza' -> Good: 'Wanda Plaza 3rd Floor Kids Zone, [City Name]'

    Instruction:
    Act as a local expert guide. Suggest ONE perfect main activity, ONE dining option, and ONE backup plan.
    Explain WHY the main activity fits the user's inputs (Age: ${data.childAge}, Energy: ${data.energyLevel}, Interests).
    ${toneInstruction}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "You are a helpful, empathetic, and knowledgeable parenting assistant. You plan trips that minimize tantrums and maximize fun. You value accuracy and trust.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mainActivity: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING, description: "Suggested start time (e.g., 09:00 AM)" },
              name: { type: Type.STRING, description: "Creative display title for the activity" },
              locationName: { type: Type.STRING, description: "Exact real-world location name for Maps search. Must include City + Specific Landmark/Entrance." },
              description: { type: Type.STRING, description: "Short, exciting description" },
              matchReason: { type: Type.STRING, description: "Explain why this specifically fits the user's Age/Energy/Interest inputs." }
            },
            required: ["time", "name", "locationName", "description", "matchReason"]
          },
          dining: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING, description: "Suggested time (e.g., 12:00 PM)" },
              name: { type: Type.STRING, description: "Display name of the restaurant or picnic spot" },
              locationName: { type: Type.STRING, description: "Exact real-world location name for Maps search. Must include City + Specific Landmark/Entrance." },
              description: { type: Type.STRING, description: "What to eat or expect" },
              matchReason: { type: Type.STRING, description: "Why is this kid-friendly? (e.g. High chairs, Fast service)" }
            },
            required: ["time", "name", "locationName", "description", "matchReason"]
          },
          backupPlan: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Alternative activity name" },
              description: { type: Type.STRING, description: "Why this saves the day if plans change" }
            },
            required: ["name", "description"]
          },
          proTip: {
            type: Type.STRING,
            description: "One crucial, specific piece of advice for parents for the MAIN activity (e.g. 'Parking fills up by 10 AM', 'Bring extra socks')."
          }
        },
        required: ["mainActivity", "dining", "backupPlan", "proTip"]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as ItineraryResponse;
  }
  
  throw new Error("Failed to generate itinerary");
};
