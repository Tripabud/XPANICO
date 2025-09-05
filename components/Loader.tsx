
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-base-200 rounded-lg shadow-inner text-center space-y-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div>
      <p className="text-lg font-semibold text-text-primary">AI is working its magic...</p>
      <p className="text-sm text-text-secondary">Applying cinematic style. This may take a moment.</p>
    </div>
  );
};

export default Loader;
