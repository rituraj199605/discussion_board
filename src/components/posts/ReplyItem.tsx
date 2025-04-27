// src/components/posts/ReplyItem.tsx
import React from 'react';
import { User, Clock, Trash2, Heart } from 'lucide-react';
import { Post } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ReplyItemProps {
  reply: Post;
  onDelete: (id: string) => void;
  onLike: (id: string, userId: string) => void;
}

const ReplyItem: React.FC<ReplyItemProps> = ({ reply, onDelete, onLike }) => {
  const { currentUser } = useAuth();
  const isLikedByCurrentUser = currentUser && reply.likedBy.includes(currentUser.id);
  
  const handleLike = () => {
    if (currentUser) {
      onLike(reply.id, currentUser.id);
    }
  };
  
  return (
    <div className="p-3 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-mint-100 rounded-full flex items-center justify-center text-mint-600">
              <User size={12} />
            </div>
            <div>
              <h4 className="font-medium text-slate-800 text-sm">{reply.author.name}</h4>
              <div className="flex items-center text-xs text-slate-400">
                <Clock size={10} className="mr-1" />
                {new Date(reply.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
          
          <p className="text-slate-700 text-sm whitespace-pre-line">{reply.text}</p>
          
          {/* Media in replies */}
          {reply.media && reply.media.length > 0 && (
            <div className="mt-2 grid grid-cols-1 gap-2">
              {reply.media.slice(0, 1).map(file => (
                <div key={file.id} className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video">
                  {file.type === 'image' ? (
                    <img src={file.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                      <video src={file.url} controls className="max-h-full max-w-full" />
                    </div>
                  )}
                </div>
              ))}
              {reply.media.length > 1 && (
                <span className="text-xs text-slate-400">+{reply.media.length - 1} more attachment(s)</span>
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center gap-4 mt-2">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs ${
                isLikedByCurrentUser 
                  ? 'text-peach-300' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              disabled={!currentUser}
            >
              <Heart 
                size={12} 
                className={isLikedByCurrentUser ? 'fill-peach-300' : ''} 
              />
              <span>{reply.likes > 0 ? reply.likes : 'Like'}</span>
            </button>
          </div>
        </div>
        
        {/* Only show delete if current user is the author */}
        {currentUser && currentUser.id === reply.author.id && (
          <button 
            onClick={() => onDelete(reply.id)}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 self-start"
            aria-label="Delete reply"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ReplyItem;