import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { CarbonCalculationEngine } from "../../lib/carbon-calculator";

// Local fallback parser to ensure the app works 100% offline or without API keys
export function localFallbackParser(text: string) {
  const textLower = text.toLowerCase();
  
  if (textLower.includes("walk") || textLower.includes("bike") || (textLower.includes("cycle") && !textLower.includes("recycle")) || textLower.includes("run") || textLower.includes("bus") || textLower.includes("train") || textLower.includes("metro") || textLower.includes("transit") || textLower.includes("scooty") || textLower.includes("scooter") || textLower.includes("motorcycle") || textLower.includes("hybrid") || textLower.includes("electric car") || textLower.includes("ev ") || textLower.endsWith("ev") || textLower.includes("electric vehicle")) {
    const numMatch = textLower.match(/\b\d+(\.\d+)?\b/);
    const dist = numMatch ? parseFloat(numMatch[0]) : 2;
    const isKm = textLower.includes("km") || textLower.includes("kilometer");
    const miles = isKm ? dist * 0.621 : dist;
    
    let mode: "walking" | "cycling" | "bus" | "train" | "scooter" | "electric_scooter" | "hybrid" | "ev" = "walking";
    if (textLower.includes("bus")) mode = "bus";
    else if (textLower.includes("train") || textLower.includes("metro") || textLower.includes("transit")) mode = "train";
    else if (textLower.includes("bike") || textLower.includes("cycle")) mode = "cycling";
    else if (textLower.includes("scooty") || textLower.includes("scooter") || textLower.includes("motorcycle")) {
      mode = textLower.includes("electric") ? "electric_scooter" : "scooter";
    } else if (textLower.includes("hybrid")) mode = "hybrid";
    else if (textLower.includes("ev") || textLower.includes("electric car") || textLower.includes("electric vehicle")) mode = "ev";

    const saved = CarbonCalculationEngine.calculateTransportAvoided(miles, mode);
    const points = Math.max(1, Math.round(saved * 10));

    if (saved <= 0) {
      return {
        category: "None",
        co2SavedKg: 0,
        carbonPoints: 0,
        explanation: `[Local Fallback Mode] Commute using ${mode} did not result in carbon savings compared to standard passenger vehicle baseline.`
      };
    }

    return {
      category: "Transport",
      co2SavedKg: saved,
      carbonPoints: points,
      explanation: `[Local Fallback Mode] Logged active/transit commute of ${dist} ${isKm ? "km" : "miles"} using ${mode}. Saved ${saved}kg CO2 compared to standard passenger car.`
    };
  }

  if (textLower.includes("vegan") || textLower.includes("veg") || textLower.includes("plant-based") || textLower.includes("meatless") || textLower.includes("salad") || textLower.includes("burrito") || textLower.includes("oat") || textLower.includes("tofu")) {
    const saved = CarbonCalculationEngine.calculateDietSwap();
    return {
      category: "Food",
      co2SavedKg: saved,
      carbonPoints: 15,
      explanation: `[Local Fallback Mode] Logged a plant-based meal swap. Saved ${saved}kg CO2 compared to standard meat diet.`
    };
  }

  if (textLower.includes("unplug") || textLower.includes("appliance") || textLower.includes("power") || textLower.includes("electricity") || textLower.includes("light") || textLower.includes("bulb") || textLower.includes("standby") || textLower.includes("heater") || /\bac\b/.test(textLower)) {
    const saved = CarbonCalculationEngine.calculateElectricitySaved(1.0); // assume 1 kWh saved
    return {
      category: "Energy",
      co2SavedKg: saved,
      carbonPoints: 2,
      explanation: `[Local Fallback Mode] Logged appliance shutdown. Saved ${saved}kg CO2.`
    };
  }

  if (textLower.includes("recycle") || textLower.includes("compost") || textLower.includes("bottle") || textLower.includes("can") || textLower.includes("waste")) {
    const saved = CarbonCalculationEngine.calculateWasteRecycled(1); // assume 1 bag recycled
    return {
      category: "Waste",
      co2SavedKg: saved,
      carbonPoints: 1,
      explanation: `[Local Fallback Mode] Logged solid waste recycle sort. Saved ${saved}kg CO2 by keeping waste out of landfills.`
    };
  }

  return {
    category: "None",
    co2SavedKg: 0,
    carbonPoints: 0,
    explanation: "[Local Fallback Mode] This activity does not represent a recognized carbon-saving action."
  };
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message field is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("⚠️ GEMINI_API_KEY is not defined in environment variables. Falling back to local calculator.");
      const result = localFallbackParser(message);
      return NextResponse.json({ ...result, fallback: true });
    }

    // Initialize the Gemini AI SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Strict schema structure to guarantee API parsing safety using strings for type fields
    const geminiSchema = {
      type: SchemaType.OBJECT,
      properties: {
        category: {
          type: SchemaType.STRING,
          enum: ["Transport", "Food", "Energy", "Waste", "None"]
        },
        co2SavedKg: { type: SchemaType.NUMBER, description: "Carbon footprint reduction in kilograms" },
        carbonPoints: { type: SchemaType.INTEGER, description: "Points earned: 10 * co2SavedKg (minimum 1)" },
        explanation: { type: SchemaType.STRING, description: "Scientific explanation of calculations and factors used" }
      },
      required: ["category", "co2SavedKg", "carbonPoints", "explanation"]
    };

    const systemInstruction = `
      You are the EcoBuddy Carbon Log Extractor. Your task is to analyze user logs, determine if they represent a carbon-saving activity, identify the correct category, calculate estimated CO2 saved (in kg) compared to average US baselines, and assign Carbon Points (10 pts per kg of CO2 saved, minimum 1). 
      
      Categories: "Transport", "Food", "Energy", "Waste", or "None"
      
      Distances and Units:
      - Convert kilometers (km) to miles (1 km = 0.62 miles) if using mile-based factors, or calculate directly: car baseline is 0.228 kg CO2 per km.
      
      Default Baselines:
      - Passenger car commute baseline: 0.368 kg CO2 per mile (0.228 kg/km). 
      - If user walked, biked, took public transit, or rode a scooter/scooty/motorcycle, calculate avoided CO2: (car_baseline - mode_factor) * distance.
      - Mode factors (per mile): walking/cycling=0, train/subway=0.041, bus=0.089, electric scooter/scooty=0.015, fuel/gas scooter/scooty=0.096, motorcycle=0.115.
      - Mode factors (per km): walking/cycling=0, train/subway=0.025, bus=0.055, electric scooter/scooty=0.009, fuel/gas scooter/scooty=0.060, motorcycle=0.071.
      - If the user specifies "scooty" or "scooter" without indicating electric or petrol, assume an average mode factor of 0.05 kg/km (0.08 kg/mile) to calculate savings.
      - Hybrid car: emissions factor is 0.200 kg CO2/mile (0.124 kg/km). By choosing a hybrid instead of a conventional car, user avoids: (0.368 - 0.200) = 0.168 kg per mile (0.104 kg/km).
      - Electric car (EV): emissions factor is 0.100 kg CO2/mile (0.062 kg/km). By choosing an EV instead of a conventional car, user avoids: (0.368 - 0.100) = 0.268 kg per mile (0.166 kg/km).
      - Plant-based meal swap: saves 1.50 kg CO2.
      - LED bulb swap or turning off appliances: saves 0.20 kg CO2.
      - Recycling packaging or composting: saves 0.10 kg CO2.

      IMPORTANT SAFETY FILTER:
      - If the user inputs a non-carbon-saving activity (e.g. driving a standard gasoline car, riding a helicopter, or completely irrelevant/nonsense text like "riding on tea" or "flying on a table"), you MUST categorize it as "None" and set co2SavedKg to 0, carbonPoints to 0, and provide a clear explanation. Only reward positive carbon-saving actions.
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        responseSchema: geminiSchema as any,
      },
      systemInstruction: systemInstruction
    });

    const response = await model.generateContent(message);
    const responseText = response.response.text();
    
    try {
      const parsedJson = JSON.parse(responseText);
      return NextResponse.json({ ...parsedJson, fallback: false });
    } catch {
      console.error("Failed to parse Gemini output as JSON, raw text was:", responseText);
      const fallbackResult = localFallbackParser(message);
      return NextResponse.json({ ...fallbackResult, fallback: true, parseError: true });
    }

  } catch (error) {
    console.error("API Error in /api/chat route handler:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
