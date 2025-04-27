// src/components/posts/PostComposer.tsx
import React, { useState, useRef } from 'react';
import { Send, Trash2, X } from 'lucide-react';
import { Post, MediaFile } from '../../types';
import Button from '../common/Button';
import MediaUploader from '../common/MediaUploader';
import { useAuth } from '../../context/AuthContext';

interface PostComposerProps {
  onSubmit: (text: string, media: MediaFile[]) => void;
  replyingTo?: Post | null;
  onCancelReply?: () => void;
  isLoading?: boolean;
}

const PostComposer: React.FC<PostComposerProps> = ({
  onSubmit,
  replyingTo = null,
  onCancelReply,
  isLoading = false
}) => {
  const [postText, setPostText] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { currentUser, isAuthenticated } = useAuth();
  
  const MAX_CHARS = 500;
  const charsRemaining = MAX_CHARS - postText.length;
  const isLimitReached = charsRemaining < 0;
  const isSubmitDisabled = postText.trim() === '' || isLimitReached || isLoading || !isAuthenticated;
  
  const handleSubmit = () => {
    if (isSubmitDisabled) return;
    
    onSubmit(postText, mediaFiles);
    
    // Reset the form
    setPostText('');
    setMediaFiles([]);
  };
  
  // Handle textarea auto-resize
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostText(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  // Clear the form
  const handleClear = () => {
    setPostText('');
    setMediaFiles([]);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
  
  return (
    <div id="post-composer" className="bg-white rounded-xl p-6 shadow-sm mb-8 relative">
      {/* Replying indicator */}
      {replyingTo && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">
              Replying to <span className="font-medium text-slate-700">{replyingTo.author.name}</span>
            </span>
            <button 
              onClick={onCancelReply} 
              className="text-slate-400 hover:text-slate-600"
              aria-label="Cancel reply"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-1 text-slate-700 line-clamp-2">{replyingTo.text}</div>
        </div>
      )}
      
      {/* Not logged in warning */}
      {!isAuthenticated && (
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
          You need to sign in to post or reply to discussions.
        </div>
      )}
      
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={postText}
          onChange={handleTextareaChange}
          placeholder={replyingTo ? "Write your reply..." : "What's on your mind?"}
          className={`w-full p-4 min-h-[8rem] rounded-xl bg-gray-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] 
            text-slate-700 text-lg resize-none focus:outline-none focus:ring-2 
            ${isLimitReached ? 'focus:ring-red-200 border-red-200' : 'focus:ring-mint-200 border-transparent'}
            ${!isAuthenticated ? 'bg-gray-100 text-gray-500' : ''}`}
          disabled={!isAuthenticated}
        />
        
        {/* Character count */}
        <div className={`absolute bottom-3 right-3 text-sm font-medium ${
          isLimitReached 
            ? 'text-red-500' 
            : charsRemaining <= 20 
              ? 'text-orange-500' 
              : 'text-slate-400'
        }`}>
          {charsRemaining}
        </div>
      </div>
      
      {/* Media uploader */}
      <div className="mt-4">
        <MediaUploader 
          onMediaChange={setMediaFiles}
          initialMedia={mediaFiles}
          maxFiles={4}
        />
      </div>
      
      {/* Action buttons */}
      <div className="mt-6 flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={handleClear}
          disabled={postText === '' && mediaFiles.length === 0}
          icon={Trash2}
        >
          Clear
        </Button>
        
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          icon={Send}
          isLoading={isLoading}
        >
          {replyingTo ? 'Reply' : 'Post'}
        </Button>
      </div>
    </div>
  );
};

export default PostComposer;