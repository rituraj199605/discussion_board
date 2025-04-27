// src/components/common/MediaUploader.tsx
import React, { useRef, useState } from 'react';
import { Image, Video, X, File, AlertTriangle } from 'lucide-react';
import { MediaFile } from '../../types';
import { useMediaUpload } from '../../hooks/useMediaUpload';

interface MediaUploaderProps {
  onMediaChange: (media: MediaFile[]) => void;
  initialMedia?: MediaFile[];
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onMediaChange,
  initialMedia = [],
  maxFiles = 4,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime']
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const {
    mediaFiles,
    isLoading,
    error,
    addMedia,
    removeMedia,
    clearMedia
  } = useMediaUpload({
    maxFiles,
    maxFileSize,
    allowedTypes
  });
  
  // Initialize with initial media if provided
  React.useEffect(() => {
    if (initialMedia.length > 0) {
      // In a real implementation, we'd need to properly handle initializing
      // the mediaFiles state with the initial media, while still using
      // the useMediaUpload hook functionality
      onMediaChange(initialMedia);
    }
  }, [initialMedia, onMediaChange]);
  
  // Update parent component when media changes
  React.useEffect(() => {
    onMediaChange(mediaFiles);
  }, [mediaFiles, onMediaChange]);
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const success = await addMedia(file);
      
      // Reset the input so the same file can be selected again
      e.target.value = '';
      
      if (!success) {
        // Could show an error toast or message here
      }
    }
  };
  
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await addMedia(file);
    }
  };
  
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  return (
    <div className="w-full">
      {/* File Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          dragActive 
            ? 'border-mint-500 bg-mint-50' 
            : 'border-slate-300 hover:border-mint-400'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {isLoading ? (
          <div className="py-6">
            <div className="animate-spin w-8 h-8 border-4 border-mint-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-sm text-slate-500">Uploading file...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-mint-100 rounded-full">
                <Image size={24} className="text-mint-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-700">
              {mediaFiles.length >= maxFiles 
                ? 'Maximum files reached' 
                : 'Drag & drop or click to upload'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {allowedTypes.includes('image/') && allowedTypes.includes('video/') 
                ? 'Images & videos' 
                : allowedTypes.includes('image/') 
                  ? 'Images only' 
                  : 'Videos only'}
              {` (max ${formatFileSize(maxFileSize)})`}
            </p>
          </>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={allowedTypes.join(',')}
          className="hidden"
          disabled={isLoading || mediaFiles.length >= maxFiles}
        />
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="mt-2 flex items-start gap-2 text-red-600 text-sm">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {/* Media Preview */}
      {mediaFiles.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-slate-700">
              Uploaded Media ({mediaFiles.length}/{maxFiles})
            </h4>
            {mediaFiles.length > 0 && (
              <button
                type="button"
                onClick={() => clearMedia()}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Clear all
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {mediaFiles.map((file) => (
              <div 
                key={file.id} 
                className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
              >
                {file.type === 'image' ? (
                  // Image preview
                  <div className="aspect-video">
                    <img 
                      src={file.url} 
                      alt={file.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  // Video preview
                  <div className="aspect-video bg-slate-100 flex items-center justify-center">
                    <video 
                      src={file.url} 
                      className="w-full h-full object-contain" 
                      controls
                    />
                  </div>
                )}
                
                {/* File info overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-end">
                  <div className="p-2 w-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs truncate">{file.name}</p>
                    {file.size && (
                      <p className="text-xs text-slate-300">{formatFileSize(file.size)}</p>
                    )}
                  </div>
                </div>
                
                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMedia(file.id);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
                  aria-label="Remove file"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;