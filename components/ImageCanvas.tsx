import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import { RotateCwIcon, ZoomInIcon } from './Icon';

interface ImageCanvasProps {
  src: string;
  onCrop: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

const CROP_ASPECT_RATIO = 65 / 24;

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(data, 0, 0);

  return new Promise((resolve) => {
    resolve(canvas.toDataURL('image/jpeg'));
  });
}

const rotateSize = (width: number, height: number, rotation: number) => {
  const rotRad = getRadianAngle(rotation);
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};


const ImageCanvas: React.FC<ImageCanvasProps> = ({ src, onCrop, onCancel }) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleConfirmCrop = async () => {
        if (!croppedAreaPixels) return;
        try {
            const croppedImage = await getCroppedImg(
                src,
                croppedAreaPixels,
                rotation
            );
            if (croppedImage) {
                onCrop(croppedImage);
            }
        } catch (e) {
            console.error(e);
        }
    };
  
    return (
        <div className="fixed inset-0 z-50 bg-base-100/90 backdrop-blur-sm flex flex-col p-4">
            <div className="relative flex-grow w-full h-full">
                <Cropper
                    image={src}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={CROP_ASPECT_RATIO}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    onCropComplete={onCropComplete}
                />
            </div>
            <div className="flex-shrink-0 pt-6 px-4 bg-base-200/50 rounded-b-lg">
                <div className="space-y-4 mb-4">
                    <div className="flex items-center gap-4">
                        <ZoomInIcon />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.01}
                            aria-labelledby="zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer range-lg accent-brand-primary"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <RotateCwIcon />
                        <input
                            type="range"
                            value={rotation}
                            min={-20}
                            max={20}
                            step={0.1}
                            aria-labelledby="rotation"
                            onChange={(e) => setRotation(Number(e.target.value))}
                            className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer range-lg accent-brand-primary"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={onCancel} className="w-full bg-base-300 text-text-secondary font-medium py-3 px-4 rounded-lg transition-colors hover:bg-red-500 hover:text-white">
                        Cancel
                    </button>
                    <button onClick={handleConfirmCrop} className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg transition-colors hover:bg-brand-secondary">
                        Confirm Crop
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageCanvas;