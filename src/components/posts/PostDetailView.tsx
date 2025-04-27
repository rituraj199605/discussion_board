// src/components/posts/PostDetailView.tsx
import React, { useState } from 'react';
import { User, MessageCircle, Heart, Reply, Trash2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Post } from '../../types';
import Button from '../common/Button';
import ReplyItem from './ReplyItem';
import PostComposer from './PostComposer';
import { useAuth } from '../../context/AuthContext';

interface PostDetailViewProps {
  post: Post;
  onBack: () => void;
  onDelete: (id: string) => void;
  onReply: (post: Post) => void;
  onLike: (id: string, userId: string) => void;
}

const PostDetailView: React.FC<PostDetailViewProps> = ({
  post,
  onBack,
  onDelete,
  onReply,
  onLike
}) => {
  const { currentUser } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  
  // Check for security issues in post content
  React.useEffect(() => {
    // Example security checks
    if (post.text.includes('<script') || post.text.includes('javascript:')) {
      setSecurityWarning('This post may contain unsafe content');
    }
    
    if (post.media && post.media.some(m => !m.contentHash)) {
      setSecurityWarning('Media content could not be verified');
    }
  }, [post]);
  
  const hasMedia = post.media && post.media.length > 0;
  const hasReplies = post.replies && post.replies.length > 0;
  const isLikedByCurrentUser = currentUser && post.likedBy.includes(currentUser.id);
  
  const handleLike = () => {
    if (currentUser) {
      onLike(post.id, currentUser.id);
    }
  };
  
  const handleDelete = () => {
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete(post.id);
    }
  };
  
  const toggleReplyForm = () => {
    setIsReplying(!isReplying);
  };
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm relative">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-slate-500 hover:bg-gray-200"
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
      </button>
      
      {/* Security warning */}
      {securityWarning && (
        <div className="mb-4 mt-6 p-3 bg-yellow-50 rounded-lg text-yellow-800 text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          {securityWarning}
        </div>
      )}
      
      <div className="pt-10 pb-4">
        {/* Author info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center text-mint-600">
            <User size={24} />
          </div>
          <div>
            <h3 className="font-medium text-xl text-slate-800">{post.author.name}</h3>
            <p className="text-sm text-slate-400">{new Date(post.timestamp).toLocaleString()}</p>
          </div>
        </div>
        
        {/* Post content */}
        <div className="p-4 bg-gray-50 rounded-xl mb-4">
          <p className="text-slate-700 whitespace-pre-wrap">{post.text}</p>
        </div>
        
        {/* Media display */}
        {hasMedia && (
          <div className={`mb-6 grid ${post.media!.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
            {post.media!.map(file => (
              <div key={file.id} className="relative rounded-xl overflow-hidden bg-gray-100">
                {file.type === 'image' ? (
                  <div className="aspect-video">
                    <img src={file.url} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video flex flex-col items-center justify-center p-4 bg-slate-100">
                    <video src={file.url} controls className="max-h-full max-w-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Action bar */}
        <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
                isLikedByCurrentUser 
                  ? 'text-peach-300' 
                  : 'text-slate-500 hover:bg-gray-100'
              }`}
              disabled={!currentUser}
            >
              <Heart 
                size={18} 
                className={isLikedByCurrentUser ? 'fill-peach-300' : ''} 
              />
              <span className="text-sm">{post.likes || 0}</span>
            </button>
            
            <div className="flex items-center gap-1 text-slate-500">
              <MessageCircle size={18} />
              <span className="text-sm">{post.replies.length}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {currentUser && currentUser.id === post.author.id && (
              <Button
                variant="ghost"
                icon={Trash2}
                onClick={handleDelete}
                className="text-slate-500"
              >
                Delete
              </Button>
            )}
            
            <Button
              variant={isReplying ? 'primary' : 'outline'}
              icon={Reply}
              onClick={toggleReplyForm}
              disabled={!currentUser}
            >
              Reply
            </Button>
          </div>
        </div>
        
        {/* Reply form */}
        {isReplying && (
          <div className="mb-6">
            <PostComposer 
              onSubmit={(text, media) => {
                if (currentUser) {
                  onReply(post);
                  setIsReplying(false);
                }
              }}
              replyingTo={post}
              onCancelReply={() => setIsReplying(false)}
            />
          </div>
        )}
        
        {/* Replies section */}
        <div>
          <h4 className="font-medium text-slate-700 mb-4">
            {hasReplies 
              ? `Replies (${post.replies.length})` 
              : 'No replies yet'
            }
          </h4>
          
          {hasReplies ? (
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
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <MessageCircle size={24} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-400">No replies yet</p>
              <p className="text-sm text-slate-300">Be the first to reply to this post</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailView;