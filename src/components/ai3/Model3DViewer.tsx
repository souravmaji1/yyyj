import React from 'react';

interface Model3DViewerProps {
  modelUrl: string;
  className?: string;
}

const Model3DViewer: React.FC<Model3DViewerProps> = ({ modelUrl, className = '' }) => {
  console.log('🎲 Model3DViewer: Received modelUrl:', modelUrl);

  if (!modelUrl) {
    return (
      <div className={`glass w-full h-full flex items-center justify-center bg-gray-800 rounded-xl ${className}`}>
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🎲</div>
          <p className="text-white text-sm mb-2">No 3D Model URL</p>
          <p className="text-gray-400 text-xs">Please provide a valid 3D model URL</p>
        </div>
      </div>
    );
  }

  // Validate URL format
  const isValid3DModelUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    
    const hasDirectExtension = /\.(glb|gltf|obj|fbx|ply|stl)$/i.test(url);
    const isApiEndpoint = url.includes('/api/') || url.includes('/temp/');
    const looksLikeModelUrl = url.includes('model') || url.includes('3d') || url.includes('glb');
    
    return hasDirectExtension || isApiEndpoint || looksLikeModelUrl;
  };

  if (!isValid3DModelUrl(modelUrl)) {
    return (
      <div className={`glass w-full h-full flex items-center justify-center bg-gray-800 rounded-xl ${className}`}>
        <div className="text-center p-4">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-red-400 text-sm mb-2">Invalid 3D Model URL</p>
          <div className="text-gray-400 text-xs mb-3">
            <p>URL: {modelUrl}</p>
            <p>Expected formats: .glb, .gltf, .obj, .fbx</p>
          </div>
        </div>
      </div>
    );
  }

  // Show direct access buttons for 3D model
  return (
    <div className={`glass w-full h-full flex items-center justify-center bg-gray-800 rounded-xl ${className}`}>
      <div className="text-center p-4">
        <div className="text-4xl mb-2">🎲</div>
        <p className="text-white text-sm mb-2">3D Model Ready</p>
        <div className="text-gray-400 text-xs mb-3">
          <p>Format: {modelUrl.split('.').pop()?.toUpperCase() || 'Unknown'}</p>
        </div>
        <div className="space-y-2">
          <button 
            onClick={() => window.open(modelUrl, '_blank')}
            className="block w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium"
          >
            View 3D Model
          </button>
          <a 
            href={modelUrl} 
            download
            className="block w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium text-center"
          >
            Download GLB File
          </a>
        </div>
      </div>
    </div>
  );
};

export default Model3DViewer;