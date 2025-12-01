import { GoogleGenAI } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const extractImageFromResponse = (response: any): string => {
  const parts = response.candidates?.[0]?.content?.parts;
  
  if (!parts) {
    throw new Error("No content generated.");
  }

  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("The model did not return an image. Please try again.");
}

/**
 * Transforms an image into claymation style using Gemini.
 */
export const generateClaymationImage = async (
  base64Image: string,
  mimeType: string,
  intensity: number = 50
): Promise<string> => {
  try {
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    // Determine style description based on intensity
    let stylePrompt = "";
    
    // Scale 0-100
    // 0-30: Cute, Chibi, Round (Very simple)
    // 31-70: Classic Stop-Motion / Caricature (The Beethoven reference fits here)
    // 71-100: Abstract / Blobby / Surreal

    if (intensity <= 30) {
      stylePrompt = "STYLE: 'Cute Toy Clay'. Ultra-round shapes. Dot eyes. Tiny proportions. Look like a Fisher-Price toy or Animal Crossing character. Pastel colors. Zero detail.";
    } else if (intensity <= 70) {
      stylePrompt = "STYLE: 'Classic Stop-Motion Character'. Reference style: High-quality clay animation. FEATURES: Large expressive cartoon eyes (essential). Perfectly smooth skin (no wrinkles). Thick, chunky hair clumps. Oversized hands. Playful caricature proportions.";
    } else {
      stylePrompt = "STYLE: 'Abstract Art Clay'. Distorted, blobby shapes. Surreal proportions. Very loose, squishy sculpting. Vibrant, unexpected colors.";
    }

    const simplificationInstruction = `
      CRITICAL INSTRUCTIONS FOR CARTOON SIMPLIFICATION:
      1. IGNORE REALISM: Do not try to preserve the realistic face. Create a CARTOON CLAY version.
      2. REMOVE ALL TEXTURE: Skin must be perfectly smooth matte plasticine. Remove ALL wrinkles, pores, and age lines.
      3. SIMPLIFY HAIR: Hair must be sculpted as a solid helmet or thick clay sausages. No individual strands.
      4. SIMPLIFY CLOTHING: Clothes are solid blocks of clay. Remove all fabric folds, creases, and patterns.
      5. BACKGROUND: Replace complex backgrounds with simple, colorful, out-of-focus clay blobs or a minimal set.
      6. LIGHTING: Soft, studio lighting typical of stop-motion.
      7. OUTPUT: A generated image that looks like a photograph of a physical clay model.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: `Recreate this image as a highly simplified, VIBRANT ${stylePrompt}. ${simplificationInstruction}`,
          },
        ],
      },
      config: {
        temperature: 0.65, 
      }
    });

    return extractImageFromResponse(response);

  } catch (error) {
    console.error("Gemini API Error (Claymation):", error);
    throw error;
  }
};
