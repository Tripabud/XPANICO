
import React, { useState, useCallback } from 'react';
import { FilmStyle } from './types';
import { applyLocalFilter } from './services/localFilterService';
import FileUploader from './components/FileUploader';
import ImageCanvas from './components/ImageCanvas';
import Loader from './components/Loader';
import { DownloadIcon, SparklesIcon } from './components/Icon';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<FilmStyle>(FilmStyle.KODAK_GOLD);
  const [isCropping, setIsCropping] = useState<boolean>(false);

  const resetState = useCallback(() => {
    setOriginalImage(null);
    setCroppedImage(null);
    setFinalImage(null);
    setError(null);
    setIsCropping(false);
  }, []);

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setCroppedImage(null);
      setFinalImage(null);
      setError(null);
      setIsCropping(true);
    };
    reader.onerror = () => {
        setError('Failed to read the selected file.');
        setOriginalImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = useCallback((croppedDataUrl: string) => {
    setCroppedImage(croppedDataUrl);
    setIsCropping(false);
  }, []);

  const handleCropCancel = useCallback(() => {
    resetState();
  }, [resetState]);

  const handleApplyFilter = async () => {
    if (!croppedImage) {
      setError('Please upload and crop an image first.');
      return;
    }

    setIsLoading(true);
    setFinalImage(null);
    setError(null);

    try {
      // The local filter function is fast, but we keep the async structure for a fluid UX
      const newImage = await applyLocalFilter(croppedImage, selectedStyle);
      setFinalImage(newImage);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while applying the filter.');
    } finally {
      setIsLoading(false);
    }
  };

  const StyleButton: React.FC<{style: FilmStyle, label: string}> = ({ style, label }) => (
      <button
          onClick={() => setSelectedStyle(style)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-200 focus:ring-brand-primary ${
          selectedStyle === style
              ? 'bg-brand-primary text-white shadow-lg'
              : 'bg-base-300 text-text-secondary hover:bg-base-200 hover:text-text-primary'
          }`}
      >
          {label}
      </button>
  );

  return (
    <div className="min-h-screen font-sans antialiased">
        <header className="py-4 bg-base-200/50 backdrop-blur-sm border-b border-base-300">
            <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                Cinematic Crop & Filter
            </h1>
            <p className="text-sm text-text-secondary">Transform your photos with a 65:24 aspect ratio and classic film styles.</p>
            </div>
        </header>

        <main className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                {!originalImage || isCropping ? (
                    <FileUploader onFileSelect={handleFileSelect} />
                ) : (
                    <div className="p-6 bg-base-200 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold mb-4 text-text-primary">Controls</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Film Style</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <StyleButton style={FilmStyle.KODAK_GOLD} label="Kodak Gold" />
                                    <StyleButton style={FilmStyle.KODAK_PORTRA} label="Kodak Portra" />
                                    <StyleButton style={FilmStyle.FUJI_SUPERIA} label="Fuji Superia" />
                                    <StyleButton style={FilmStyle.CINESTILL_800T} label="Cinestill 800T" />
                                    <StyleButton style={FilmStyle.BLACK_AND_WHITE} label="High Contrast B&W" />
                                    <StyleButton style={FilmStyle.HP5} label="HP5" />
                                </div>
                            </div>
                            
                            <button
                                onClick={handleApplyFilter}
                                disabled={isLoading || !croppedImage}
                                className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                            >
                                {isLoading ? 'Applying Style...' : <><SparklesIcon /> Apply Filter</>}
                            </button>
                            
                            {finalImage && (
                                <a
                                    href={finalImage}
                                    download={`cinematic-edit-${Date.now()}.jpg`}
                                    className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ease-in-out hover:bg-green-700 hover:shadow-lg"
                                >
                                    <DownloadIcon /> Download Image
                                </a>
                            )}
                             <button
                                onClick={resetState}
                                className="w-full bg-base-300 text-text-secondary font-medium py-2 px-4 rounded-lg transition-colors hover:bg-red-500 hover:text-white"
                            >
                                Start Over
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="lg:col-span-2 space-y-6">
                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {isLoading && <Loader isLocal={true} />}

                {!isLoading && !isCropping && (finalImage || croppedImage) && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-text-primary">
                            {finalImage ? 'Final Result' : 'Cinematic Crop Preview'}
                        </h3>
                        <div className="bg-base-200 p-2 rounded-lg shadow-inner aspect-cinematic">
                            <img 
                                src={finalImage || croppedImage || ''} 
                                alt={finalImage ? 'Final filtered image' : 'Cropped image preview'}
                                className="w-full h-full object-contain rounded"
                            />
                        </div>
                    </div>
                 )}
            </div>
            </div>
        </main>
        
        {isCropping && originalImage && (
            <ImageCanvas 
                src={originalImage} 
                onCrop={handleCropComplete}
                onCancel={handleCropCancel} 
            />
        )}
    </div>
  );
};

export default App;
