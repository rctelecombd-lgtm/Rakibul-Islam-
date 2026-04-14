
import { GoogleGenAI, Type } from "@google/genai";
import { SiteSettings } from "../types";

export const analyzeSettings = async (settings: SiteSettings): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze the following website settings and provide 3 quick optimization tips:
    Site Name: ${settings.siteName}
    Maintenance Mode: ${settings.maintenanceMode ? 'ON' : 'OFF'}
    Registration: ${settings.registrationEnabled ? 'ENABLED' : 'DISABLED'}
    Currency: ${settings.currencySymbol}
    Minimum Recharge: ${settings.minRechargeAmount}
    
    Format the response as clear, actionable advice.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 200,
      }
    });
    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to AI assistant.";
  }
};
