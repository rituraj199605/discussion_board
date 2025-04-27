// src/components/posts/PostCard.tsx
import React, { useState } from 'react';
import { MessageCircle, Trash2, Reply, User, Clock, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { Post } from '../../types';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import ReplyItem from './ReplyItem';

interface PostCardProps {
  post: Post;
  onDelete: (id: string) => void;
  onReply: (post: Post) => void;
  onViewDetail: (post: Post) => void;
  onLike: (id: string, userId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onDelete,
  onReply,
  onViewDetail,
  onLike
}) => {
  const { currentUser } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Security: Check if the current post or any of its content is potentially unsafe
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  
  // Display truncated post for the card view
  const displayText = post.text.length > 240 
    ? post.text.substring(0, 240) + '...'
    : post.text;
  
  const hasMedia = post.media && post.media.length > 0;
  const hasReplies = post.replies && post.replies.length > 0;
  const isLikedByCurrentUser = currentUser && post.likedBy.includes(currentUser.id);
  
  // Check for security issues in the post
  React.useEffect(() => {
    // Example security check: Look for potential script content in the post text
    if (post.text.includes('<script') || post.text.includes('javascript:')) {
      setSecurityWarning('This post may contain unsafe content');
    }
    
    // Check media files for suspicious content (in a real app, you'd do more thorough checks)
    if (post.media && post.media.some(m => !m.contentHash)) {
      setSecurityWarning('Media content could not be verified');
    }
  }, [post]);
  
  const handleLike = () => {
    if (currentUser) {
      onLike(post.id, currentUser.id);
    }
  };
  
  return (
    <div className="border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      {/* Security warning banner */}
      {securityWarning && (
        <div className="bg-yellow-50 px-4 py-2 text-yellow-800 text-xs flex items-center">
          <span className="mr-2">⚠️</span>
          {securityWarning}
        </div>
      )}
      
      <div className="p-4 bg-white">
        <div className="flex justify-between">
          <div className="flex-1 cursor-pointer" onClick={() => onViewDetail(post)}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-mint-100 rounded-full flex items-center justify-center text-mint-600">
                <User size={14} />
              </div>
              <div>
                <h3 className="font-medium text-slate-800">{post.author.name}</h3>
                <div className="flex items-center text-xs text-slate-400">
                  <Clock size={12} className="mr-1" />
                  {new Date(post.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            
            <p className="text-slate-700 mb-3 whitespace-pre-line">{displayText}</p>
            
            {/* Media previews */}
            {hasMedia && (
              <div className={`mb-3 grid ${post.media!.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                {post.media!.slice(0, 2).map(file => (
                  <div key={file.id} className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video">
                    {file.type === 'image' ? (
                      <img src={file.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <video src={file.url} controls className="max-h-full max-w-full" />
                      </div>
                    )}
                    
                    {post.media!.length > 2 && file === post.media![1] && (
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white font-medium">
                        +{post.media!.length - 2} more
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            {/* Only show delete button if the current user is the author */}
            {currentUser && currentUser.id === post.author.id && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(post.id);
                }}
                className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Delete post"
              >
                <Trash2 size={16} />
              </button>
            )}
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onReply(post);
              }}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Reply to post"
              disabled={!currentUser}
            >
              <Reply size={16} />
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className={`p-2 rounded-full ${
                isLikedByCurrentUser 
                  ? 'text-peach-300' 
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
              aria-label={isLikedByCurrentUser ? 'Liked' : 'Like post'}
              disabled={!currentUser}
            >
              <Heart 
                size={16} 
                className={isLikedByCurrentUser ? 'fill-peach-300' : ''} 
              />
              {post.likes > 0 && (
                <span className="text-xs ml-1">{post.likes}</span>
              )}
            </button>
          </div>
        </div>
        
        {/* Action bar */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center text-sm text-slate-500">
            <MessageCircle size={14} className="mr-1" />
            {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
          </div>
          
          {hasReplies && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-mint-600 flex items-center hover:underline"
            >
              {isExpanded ? (
                <>Hide replies <ChevronUp size={14} className="ml-1" /></>
              ) : (
                <>Show replies <ChevronDown size={14} className="ml-1" /></>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Replies section - only shown when expanded */}
      {isExpanded && hasReplies && (
        <div className="bg-gray-50 pl-8 pr-4 py-4 border-t border-gray-100">
          <div className="space-y-4">
            {post.replies.map(reply => (
              <ReplyItem 
                key={reply.id}
                reply={reply}
                onDelete={onDelete}
                onLike={onLike}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;