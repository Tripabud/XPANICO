
import React from 'react';

interface LoaderProps {
  isLocal?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ isLocal = false }) => {
  const primaryText = isLocal ? 'Applying Style...' : 'AI is working its magic...';
  const secondaryText = isLocal ? 'Just a moment.' : 'Applying cinematic style. This may take a moment.';

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-base-200 rounded-lg shadow-inner text-center space-y-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div>
      <p className="text-lg font-semibold text-text-primary">{primaryText}</p>
      <p className="text-sm text-text-secondary">{secondaryText}</p>
    </div>
  );
};

export default Loader;
