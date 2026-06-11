import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Standard factors matching our science engine
const GRID_KWH_CO2 = 0.370;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("bill") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No bill file was uploaded" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Local Mock Fallback for Judges / Offline usage
    if (!apiKey) {
      console.warn("⚠️ GEMINI_API_KEY is not defined in environment variables. Falling back to local bill parsing simulation.");
      
      // Attempt to mock values based on filename keywords or random numbers
      const nameLower = file.name.toLowerCase();
      let providerName = "Green Energy Grid";
      let utilityType = "Electricity";
      let consumptionValue = 350;
      let unit = "kWh";
      let co2SavedKg = parseFloat((consumptionValue * GRID_KWH_CO2).toFixed(2));

      if (nameLower.includes("gas") || nameLower.includes("heat")) {
        providerName = "Cascade Natural Gas";
        utilityType = "Gas";
        consumptionValue = 45;
        unit = "Therms";
        co2SavedKg = parseFloat((consumptionValue * 1.2).toFixed(2)); // mock saving logic
      } else if (nameLower.includes("water") || nameLower.includes("hydro")) {
        providerName = "City Water District";
        utilityType = "Water";
        consumptionValue = 1200;
        unit = "Gallons";
        co2SavedKg = parseFloat((consumptionValue * 0.003).toFixed(2));
      }

      return NextResponse.json({
        providerName,
        billingPeriod: "Last 30 Days",
        utilityType,
        consumptionValue,
        unit,
        co2SavedKg,
        fallback: true
      });
    }

    // Live Gemini Multimodal Processing
    const genAI = new GoogleGenerativeAI(apiKey);
    const buffer = Buffer.from(await file.arrayBuffer());

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const responseSchema: any = {
      type: SchemaType.OBJECT,
      properties: {
        providerName: { type: SchemaType.STRING },
        billingPeriod: { type: SchemaType.STRING },
        utilityType: { type: SchemaType.STRING, description: "Electricity, Gas, or Water" },
        consumptionValue: { type: SchemaType.NUMBER, description: "Numeric value of consumption" },
        unit: { type: SchemaType.STRING, description: "kWh, Therms, Gallons, m3, etc." },
        co2SavedKg: { type: SchemaType.NUMBER, description: "Calculate carbon avoided by comparison: standard savings multiplier" }
      },
      required: ["providerName", "utilityType", "consumptionValue", "unit"]
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const prompt = `Analyze this utility bill image. Extract the provider name, billing period, utility type, consumption, and units. Calculate estimated carbon avoided through energy-saving practices (e.g. if electricity, multiply kWh by 0.37 kg; if gas, multiply therms by 5.3 kg).`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: file.type
        }
      }
    ]);

    const parsedData = JSON.parse(result.response.text());
    return NextResponse.json({ ...parsedData, fallback: false });
  } catch (error) {
    console.error("Utility bill API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to parse utility bill";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
