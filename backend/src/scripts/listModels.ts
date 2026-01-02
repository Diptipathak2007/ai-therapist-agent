import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function listModels() {
  try {
    console.log("Listing models...");
    // Note: listModels might not be directly exposed on genAI instance in all versions, 
    // but let's try accessing the model manager if possible or just use the API.
    // Actually, the SDK usually has a way. 
    // If not, we can use a simple fetch.
    
    // Using fetch for direct API call to be sure
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No API Key found");
        return;
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    
    if (data.models) {
        console.log("Available models:");
        data.models.forEach((m: any) => {
            console.log(`- ${m.name} (${m.supportedGenerationMethods.join(", ")})`);
        });
    } else {
        console.log("No models found or error:", data);
    }
    
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
