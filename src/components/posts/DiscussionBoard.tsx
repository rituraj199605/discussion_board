// src/components/posts/DiscussionBoard.tsx
import React, { useState } from 'react';
import { MessageCircle, MessageSquare, AlertTriangle, RefreshCw } from 'lucide-react';
import { Post, MediaFile } from '../../types';
import { usePosts } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import PostComposer from './PostComposer';
import PostCard from './PostCard';
import PostDetailView from './PostDetailView';
import Button from '../common/Button';

const DiscussionBoard: React.FC = () => {
  const { posts, loading, error, addPost, deletePost, likePost, addReply, refreshPosts } = usePosts();
  const { currentUser } = useAuth();
  
  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [replyingTo, setReplyingTo] = useState<Post | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Handle refreshing posts
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshPosts();
    setTimeout(() => setRefreshing(false), 500); // Add minimum delay for visual feedback
  };
  
  // Handle post submission
  const handlePostSubmit = async (text: string, media: MediaFile[]) => {
    if (!currentUser) return;
    
    try {
      await addPost(text, currentUser, media);
    } catch (err) {
      console.error('Failed to add post:', err);
      // In a real app, you would show a toast or error message
    }
  };
  
  // Handle reply submission
  const handleReplySubmit = async (text: string, media: MediaFile[]) => {
    if (!currentUser || !replyingTo) return;
    
    try {
      await addReply(replyingTo.id, text, currentUser, media);
      setReplyingTo(null);
    } catch (err) {
      console.error('Failed to add reply:', err);
      // In a real app, you would show a toast or error message
    }
  };
  
  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      
      // Close detail view if the deleted post is currently selected
      if (selectedPost && selectedPost.id === postId) {
        setIsDetailView(false);
        setSelectedPost(null);
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      // In a real app, you would show a toast or error message
    }
  };
  
  // Handle post liking
  const handleLikePost = async (postId: string, userId: string) => {
    try {
      await likePost(postId, userId);
    } catch (err) {
      console.error('Failed to like post:', err);
      // In a real app, you would show a toast or error message
    }
  };
  
  // View post details
  const handleViewPostDetail = (post: Post) => {
    setSelectedPost(post);
    setIsDetailView(true);
  };
  
  // Reply to a post
  const handleReplyToPost = (post: Post) => {
    setReplyingTo(post);
    // Scroll to the composer
    document.getElementById('post-composer')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-light text-slate-800 mb-2">Discussion Board</h1>
        <p className="text-slate-500 mx-auto max-w-2xl">
          Share your thoughts and engage in meaningful conversations with the community
        </p>
      </header>
      
      {isDetailView && selectedPost ? (
        <PostDetailView 
          post={selectedPost} 
          onBack={() => setIsDetailView(false)} 
          onDelete={handleDeletePost}
          onReply={handleReplyToPost}
          onLike={handleLikePost}
        />
      ) : (
        <>
          {/* Post composer */}
          <PostComposer 
            onSubmit={replyingTo ? handleReplySubmit : handlePostSubmit}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
            isLoading={loading}
          />
          
          {/* Error display */}
          {error && (
            <div className="bg-red-50 rounded-lg p-4 flex gap-3 text-red-800 mb-6">
              <AlertTriangle size={20} className="flex-shrink-0" />
              <div>
                <h3 className="font-medium">Error loading posts</h3>
                <p className="text-sm">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={handleRefresh}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
          
          {/* Discussions list */}
          <div className="bg-white rounded-xl p-6 shadow-sm relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-slate-700 flex items-center gap-2">
                <MessageSquare size={20} className="text-mint-600" />
                Discussions
              </h2>
              
              {/* Refresh button */}
              <Button
                variant="ghost"
                size="sm"
                icon={RefreshCw}
                onClick={handleRefresh}
                className={refreshing ? 'animate-spin' : ''}
                disabled={loading || refreshing}
              >
                Refresh
              </Button>
            </div>
            
            {/* Loading state */}
            {loading && !refreshing && (
              <div className="py-10 text-center">
                <div className="w-12 h-12 mx-auto border-4 border-mint-200 border-t-mint-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400">Loading discussions...</p>
              </div>
            )}
            
            {/* Empty state */}
            {!loading && posts.length === 0 && (
              <div className="py-10 text-center">
                <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <MessageCircle size={24} className="text-slate-300" />
                </div>
                <p className="text-slate-400">No discussions yet</p>
                <p className="text-sm text-slate-300 mt-1">Be the first to start a conversation</p>
              </div>
            )}
            
            {/* Post list */}
            {!loading && posts.length > 0 && (
              <div className="space-y-6">
                {posts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onDelete={handleDeletePost}
                    onReply={handleReplyToPost}
                    onViewDetail={handleViewPostDetail}
                    onLike={handleLikePost}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DiscussionBoard;