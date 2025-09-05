import { GoogleGenAI, Modality } from "@google/genai";
import { FilmStyle } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const applyFilmStyle = async (base64ImageData: string, mimeType: string, style: FilmStyle): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: `Apply the following artistic style to this image: ${style}. Do not add any text, watermarks, or logos to the image. Only return the edited image.`,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        // The response might be blocked, in which case candidates will be empty.
        if (!response.candidates || response.candidates.length === 0) {
            const blockReason = response.promptFeedback?.blockReason;
            if (blockReason) {
                throw new Error(`Request was blocked due to ${blockReason}. Please try a different image or style.`);
            }
            throw new Error("The AI model did not return a response. It might have been blocked for safety reasons.");
        }

        const candidate = response.candidates[0];

        // The API can return multiple parts, we need to find the image part.
        if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return part.inlineData.data;
                }
            }
        }
        
        // Check for other reasons for no image output
        const finishReason = candidate.finishReason;
        if(finishReason && finishReason !== 'STOP') {
            throw new Error(`Image generation failed due to: ${finishReason}.`);
        }

        throw new Error("The AI model did not return an image. Please try a different image or style.");

    } catch (error) {
        console.error("Error calling Gemini API:", error);
         if (error instanceof Error && (error.message.startsWith('Request was blocked') || error.message.startsWith('Image generation failed'))) {
            throw error;
        }
        throw new Error("Failed to process the image with AI. Please check the console for more details.");
    }
};
