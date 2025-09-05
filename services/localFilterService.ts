
import { FilmStyle } from "../types";

const filterRecipes: Record<FilmStyle, string> = {
    [FilmStyle.BLACK_AND_WHITE]: 'grayscale(1) contrast(1.4) brightness(1.05)',
    [FilmStyle.KODAK_GOLD]: 'sepia(0.25) saturate(1.2) contrast(1.05) brightness(1.05)',
    [FilmStyle.HP5]: 'grayscale(1) contrast(0.85) brightness(1.1)',
    [FilmStyle.KODAK_PORTRA]: 'saturate(1.15) contrast(0.9) brightness(1.05)',
    [FilmStyle.CINESTILL_800T]: 'contrast(1.1) saturate(1.3) hue-rotate(-10deg) brightness(1.05)',
    [FilmStyle.FUJI_SUPERIA]: 'saturate(1.2) contrast(1.1) brightness(1.05) hue-rotate(5deg)',
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    // Setting crossorigin is important if the image source is not from the same origin,
    // though in this case it's a data URL.
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });


export const applyLocalFilter = async (imageDataUrl: string, style: FilmStyle): Promise<string> => {
    try {
        const image = await createImage(imageDataUrl);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error("Could not get canvas context");
        }

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        
        // Apply the filter recipe
        ctx.filter = filterRecipes[style] || 'none';

        // Draw the image to the canvas
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        // Return the new image as a data URL
        return canvas.toDataURL('image/jpeg', 0.9); // Use JPEG format with 90% quality
    } catch (error) {
        console.error("Failed to apply local filter:", error);
        throw new Error("Could not apply the selected image filter.");
    }
};
