
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Goal, PlanResult } from "../types";

// Schema for enforced JSON output from Gemini
const planResponseSchema = {
  type: Type.OBJECT,
  properties: {
    riskScore: { 
      type: Type.INTEGER,
      description: "A calculated risk tolerance score from 0 to 100."
    },
    taxEstimate: { 
      type: Type.NUMBER, 
      description: "Estimated annual tax liability in dollars based on location and salary." 
    },
    totalInvestable: { 
      type: Type.NUMBER,
      description: "The total annual capital available for deployment."
    },
    warnings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Crucial financial warnings (emergency fund, high debt, etc)."
    },
    allocations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          assetClass: { type: Type.STRING },
          percentage: { type: Type.NUMBER },
          amount: { type: Type.NUMBER },
          suggestedInstruments: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["assetClass", "percentage", "amount", "suggestedInstruments"]
      }
    }
  },
  required: ["riskScore", "taxEstimate", "totalInvestable", "warnings", "allocations"]
};

export const generateAIPlan = async (profile: UserProfile, goals: Goal[]): Promise<PlanResult | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a sophisticated AI Financial Investment Engine.
    User Profile: Age ${profile.age}, Salary $${profile.salary}, Country ${profile.country}, State ${profile.state}, Savings $${profile.savings}, Monthly Investable $${profile.monthlyInvestable}, Monthly Debt $${profile.debtPayments}, Emergency Fund $${profile.emergencyFund}.
    User Goals: ${goals.map(g => `${g.name} (Target $${g.targetAmount}, Horizon: ${g.horizon}, Priority: ${g.priority}/5)`).join(', ')}.

    TASKS:
    1. Calculate a Risk Score (0-100) based on age, time horizons of goals, and stability (income vs debt).
    2. Estimate annual Tax (Federal + State if USA, fallback otherwise).
    3. Calculate total annualized investable capital: Savings + (Monthly Investable * 12).
    4. Provide specific Asset Allocations (Percentages must sum exactly to 100).
    5. List 2-3 specific ETF/Ticker examples per asset class.
    6. Generate 2-3 specific strategic warnings.

    Return the result as JSON strictly adhering to the requested schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: planResponseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text) as PlanResult;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return null;
  }
};

export const getFinancialAdvice = async (profile: UserProfile, goals: Goal[], plan: PlanResult) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Review this AI-generated financial plan:
    Profile: Age ${profile.age}, Salary $${profile.salary}.
    Allocations: ${plan.allocations.map(a => `${a.assetClass}: ${a.percentage}%`).join(', ')}.
    Risk Score: ${plan.riskScore}.

    Provide a professional, encouraging coaching note (2 paragraphs). 
    Explain WHY this specific allocation was chosen based on their goals.
    End with a disclaimer that this is automated educational content.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Your financial plan is ready for review. Focus on consistency and building your core savings first.";
  }
};
