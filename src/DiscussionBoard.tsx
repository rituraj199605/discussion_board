// src/DiscussionBoard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Trash2, 
  Reply, 
  User, 
  Clock, 
  MessageSquare, 
  Heart, 
  ChevronDown, 
  ChevronUp,
  Image, 
  X 
} from 'lucide-react';

// Type for Post (previously Tweet)
interface Post {
  id: string; // Changed from number to string
  text: string;
  author: string;
  timestamp: string;
  likes: number;
  replies: Post[];
  parentId?: string; // Changed from number to string
  media?: MediaFile[];
}

// Type for Media File (unchanged from tweet version)
interface MediaFile {
  id: number;
  type: string;
  url: string;
  name: string;
}

export default function DiscussionBoard() {
  const [postText, setPostText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [replyingTo, setReplyingTo] = useState<Post | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const MAX_CHARS = 500; // Increased from tweet's 280
  const MAX_MEDIA_FILES = 4;
  const charsRemaining = MAX_CHARS - postText.length;
  const isLimitReached = charsRemaining < 0;
  const canAddMoreMedia = mediaFiles.length < MAX_MEDIA_FILES;

  // Check if we're running in Electron
  const isElectron = typeof window !== 'undefined' && window.electron !== undefined;

  // Load saved posts on component mount
  useEffect(() => {
    const loadSavedPosts = async () => {
      if (isElectron) {
        try {
          // Renamed from getTweets to reflect new functionality
          const posts = await window.electron.tweetStorage.getTweets();
          setSavedPosts(posts || []);
        } catch (error) {
          console.error('Failed to load posts from storage:', error);
        }
      } else {
        // For web version, could load from localStorage
        const savedPostsString = localStorage.getItem('discussionPosts');
        if (savedPostsString) {
          try {
            setSavedPosts(JSON.parse(savedPostsString));
          } catch (e) {
            console.error('Failed to parse saved posts:', e);
          }
        }
      }
    };

    loadSavedPosts();
  }, []);

  // Save posts to localStorage when they change (for web version)
  useEffect(() => {
    if (!isElectron && savedPosts.length > 0) {
      localStorage.setItem('discussionPosts', JSON.stringify(savedPosts));
    }
  }, [savedPosts, isElectron]);

  const handleSavePost = () => {
    if ((postText.trim() === '' || authorName.trim() === '') || isLimitReached) return;
    
    setIsSaving(true);
    
    // Create the new post
    const newPost: Post = {
      id: Date.now().toString(), // Convert to string
      text: postText,
      author: authorName,
      timestamp: new Date().toLocaleString(),
      likes: 0,
      replies: [],
      parentId: replyingTo?.id,
      media: [...mediaFiles]
    };
    
    // Update the posts structure
    let updatedPosts: Post[];
    if (replyingTo) {
      // This is a reply, add it to the parent post's replies
      updatedPosts = savedPosts.map(post => {
        if (post.id === replyingTo.id) {
          return { ...post, replies: [...post.replies, newPost] };
        }
        return post;
      });
    } else {
      // This is a top-level post
      updatedPosts = [newPost, ...savedPosts];
    }
    
    setSavedPosts(updatedPosts);
    
    // Save to Electron storage if available
    if (isElectron) {
      window.electron.tweetStorage.saveTweets(updatedPosts)
        .catch(err => console.error('Failed to save posts to Electron storage:', err));
    }
    
    // Reset the form
    setPostText('');
    setMediaFiles([]);
    setIsSaving(false);
    setReplyingTo(null);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canAddMoreMedia) return;
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create a preview URL
    const fileUrl = URL.createObjectURL(file);
    
    setMediaFiles([...mediaFiles, {
      id: Date.now(),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      url: fileUrl,
      name: file.name
    }]);
    
    // Reset the input
    e.target.value = '';
  };
  
  const removeMedia = (id: number) => {
    setMediaFiles(mediaFiles.filter(file => file.id !== id));
  };
  
  const handleDeletePost = (id: string) => {
    // Find if this is a top-level post or a reply
    const isTopLevel = savedPosts.some(post => post.id === id);
    
    if (isTopLevel) {
      // Delete a top-level post
      const updatedPosts = savedPosts.filter(post => post.id !== id);
      setSavedPosts(updatedPosts);
      
      // Delete from Electron storage if available
      if (isElectron) {
        window.electron.tweetStorage.deleteTweet(id)
          .catch(err => console.error('Failed to delete post from Electron storage:', err));
      }
    } else {
      // Delete a reply (find the parent and remove this reply)
      const updatedPosts = savedPosts.map(post => {
        return {
          ...post,
          replies: post.replies.filter(reply => reply.id !== id)
        };
      });
      setSavedPosts(updatedPosts);
    }
    
    if (selectedPost && selectedPost.id === id) {
      setIsDetailView(false);
      setSelectedPost(null);
    }
  };
  
  const viewPostDetail = (post: Post) => {
    setSelectedPost(post);
    setIsDetailView(true);
  };

  const handleReplyToPost = (post: Post) => {
    setReplyingTo(post);
    // Optionally scroll to the composer
    document.getElementById('post-composer')?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleReplies = (postId: string) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleLikePost = (postId: string) => {
    const updatedPosts = savedPosts.map(post => {
      if (post.id === postId) {
        return { ...post, likes: post.likes + 1 };
      }
      // Also check in replies
      if (post.replies.some(reply => reply.id === postId)) {
        return {
          ...post,
          replies: post.replies.map(reply => 
            reply.id === postId ? { ...reply, likes: reply.likes + 1 } : reply
          )
        };
      }
      return post;
    });
    
    setSavedPosts(updatedPosts);
  };
  
  return (
    <div className="bg-gray-100 min-h-screen w-full font-sans">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <header className="mb-8 text-center relative p-6">
          <h1 className="text-4xl font-light text-slate-800 mb-2">Discussion Board</h1>
          <p className="text-slate-500 mx-auto">
            Share your thoughts and engage in meaningful conversations
          </p>
        </header>
        
        {isDetailView ? (
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
            <div id="post-composer" className="bg-white rounded-xl p-6 shadow-sm mb-8 relative">
              {replyingTo && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">
                      Replying to <span className="font-medium text-slate-700">{replyingTo.author}</span>
                    </span>
                    <button 
                      onClick={() => setReplyingTo(null)} 
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="mt-1 text-slate-700 line-clamp-2">{replyingTo.text}</div>
                </div>
              )}
              
              <div className="mb-4">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your name"
                  className="w-full p-3 rounded-lg bg-gray-50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] 
                    text-slate-700 text-lg mb-3 focus:outline-none focus:ring-2 focus:ring-mint-200"
                />
              </div>
              
              <div className="relative">
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder={replyingTo ? "Write your reply..." : "What's on your mind?"}
                  className={`w-full p-4 h-32 rounded-xl bg-gray-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] 
                    text-slate-700 text-lg resize-none focus:outline-none focus:ring-2 
                    ${isLimitReached ? 'focus:ring-red-200 border-red-200' : 'focus:ring-mint-200 border-transparent'}`}
                />
                
                {/* Media preview area */}
                {mediaFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {mediaFiles.map(file => (
                      <div key={file.id} className="relative rounded-xl overflow-hidden bg-gray-50 aspect-video">
                        {file.type === 'image' ? (
                          <img src={file.url} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100">
                            <video src={file.url} controls className="max-h-full max-w-full" />
                          </div>
                        )}
                        <button 
                          onClick={() => removeMedia(file.id)}
                          className="absolute top-2 right-2 bg-slate-800 bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => imageInputRef.current?.click()}
                      disabled={!canAddMoreMedia}
                      className={`p-2 rounded-full ${!canAddMoreMedia ? 'text-slate-300' : 'text-slate-500 hover:bg-mint-100'}`}
                    >
                      <Image size={18} />
                      <input 
                        type="file" 
                        ref={imageInputRef}
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </button>
                    
                    <button 
                      onClick={() => {
                        setPostText('');
                        setMediaFiles([]);
                        setReplyingTo(null);
                      }}
                      disabled={postText === '' && mediaFiles.length === 0}
                      className={`p-2 rounded-full ${postText === '' && mediaFiles.length === 0 ? 'text-slate-300' : 'text-slate-400 hover:bg-slate-100'}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`text-sm font-medium ${isLimitReached ? 'text-red-500' : charsRemaining <= 20 ? 'text-orange-500' : 'text-slate-400'}`}>
                      {charsRemaining}
                    </div>
                    
                    <button
                      onClick={handleSavePost}
                      disabled={postText.trim() === '' || authorName.trim() === '' || isLimitReached || isSaving}
                      className={`px-5 py-2 rounded-full flex items-center gap-2 transition-all ${
                        postText.trim() === '' || authorName.trim() === '' || isLimitReached
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-mint-600 text-white hover:bg-mint-600/90'
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                          <span>Posting...</span>
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          <span>{replyingTo ? 'Reply' : 'Post'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Discussion threads */}
            <div className="bg-white rounded-xl p-6 shadow-sm relative">
              <h2 className="text-xl font-medium text-slate-700 mb-6 flex items-center gap-2">
                <MessageSquare size={20} className="text-mint-600" />
                Discussions
              </h2>
              
              {savedPosts.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <MessageCircle size={24} className="text-slate-300" />
                  </div>
                  <p className="text-slate-400">No discussions yet</p>
                  <p className="text-sm text-slate-300 mt-1">Be the first to start a conversation</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {savedPosts.map(post => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      onDelete={handleDeletePost}
                      onReply={handleReplyToPost}
                      onViewDetail={viewPostDetail}
                      onLike={handleLikePost}
                      isExpanded={!!expandedPosts[post.id]}
                      onToggleExpand={() => toggleReplies(post.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface PostCardProps {
  post: Post;
  onDelete: (id: string) => void;
  onReply: (post: Post) => void;
  onViewDetail: (post: Post) => void;
  onLike: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function PostCard({ post, onDelete, onReply, onViewDetail, onLike, isExpanded, onToggleExpand }: PostCardProps) {
  // Display truncated post for the card view
  const displayText = post.text.length > 240 
    ? post.text.substring(0, 240) + '...'
    : post.text;
  
  const hasMedia = post.media && post.media.length > 0;
  const hasReplies = post.replies && post.replies.length > 0;
  
  return (
    <div className="border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 bg-white">
        <div className="flex justify-between">
          <div className="flex-1 cursor-pointer" onClick={() => onViewDetail(post)}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-mint-100 rounded-full flex items-center justify-center text-mint-600">
                <User size={14} />
              </div>
              <div>
                <h3 className="font-medium text-slate-800">{post.author}</h3>
                <div className="flex items-center text-xs text-slate-400">
                  <Clock size={12} className="mr-1" />
                  {post.timestamp}
                </div>
              </div>
            </div>
            
            <p className="text-slate-700 mb-3">{displayText}</p>
            
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
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(post.id);
              }}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <Trash2 size={16} />
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onReply(post);
              }}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <Reply size={16} />
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onLike(post.id);
              }}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <Heart size={16} className={post.likes > 0 ? 'fill-peach-300 text-peach-300' : ''} />
              {post.likes > 0 && <span className="text-xs ml-1">{post.likes}</span>}
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
              onClick={onToggleExpand}
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
              <div key={reply.id} className="p-3 bg-white rounded-lg shadow-sm">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-mint-100 rounded-full flex items-center justify-center text-mint-600">
                        <User size={12} />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800 text-sm">{reply.author}</h4>
                        <div className="flex items-center text-xs text-slate-400">
                          <Clock size={10} className="mr-1" />
                          {reply.timestamp}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-slate-700 text-sm">{reply.text}</p>
                    
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
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onDelete(reply.id)}
                      className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <Trash2 size={14} />
                    </button>
                    
                    <button 
                      onClick={() => onLike(reply.id)}
                      className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <Heart size={14} className={reply.likes > 0 ? 'fill-peach-300 text-peach-300' : ''} />
                      {reply.likes > 0 && <span className="text-xs ml-1">{reply.likes}</span>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface PostDetailViewProps {
  post: Post | null;
  onBack: () => void;
  onDelete: (id: string) => void;
  onReply: (post: Post) => void;
  onLike: (id: string) => void;
}

function PostDetailView({ post, onBack, onDelete, onReply, onLike }: PostDetailViewProps) {
  if (!post) return null;
  
  const hasMedia = post.media && post.media.length > 0;
  const hasReplies = post.replies && post.replies.length > 0;
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm relative">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-slate-500 hover:bg-gray-200"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <div className="pt-8 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center text-mint-600">
            <User size={24} />
          </div>
          <div>
            <h3 className="font-medium text-xl text-slate-800">{post.author}</h3>
            <p className="text-sm text-slate-400">{post.timestamp}</p>
          </div>
        </div>
        
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
        
        <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLike(post.id)}
              className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100"
            >
              <Heart size={18} className={post.likes > 0 ? 'fill-peach-300 text-peach-300' : 'text-slate-500'} />
              <span className="text-sm">{post.likes}</span>
            </button>
            
            <div className="flex items-center gap-1 text-slate-500">
              <MessageCircle size={18} />
              <span className="text-sm">{post.replies.length}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onDelete(post.id)}
              className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 text-slate-500"
            >
              <Trash2 size={18} />
              <span className="text-sm">Delete</span>
            </button>
            
            <button
              onClick={() => onReply(post)}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-mint-100 text-mint-600 hover:bg-mint-200"
            >
              <Reply size={18} />
              <span className="text-sm">Reply</span>
            </button>
          </div>
        </div>
        
        {/* Replies section */}
        {hasReplies ? (
          <div>
            <h4 className="font-medium text-slate-700 mb-4">Replies</h4>
            <div className="space-y-4">
              {post.replies.map(reply => (
                <div key={reply.id} className="p-4 border border-gray-100 rounded-lg shadow-sm mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-mint-100 rounded-full flex items-center justify-center text-mint-600">
                      <User size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">{reply.author}</h4>
                      <p className="text-xs text-slate-400">{reply.timestamp}</p>
                    </div>
                  </div>
                  
                  <div className="pl-10">
                    <p className="text-slate-700 mb-3">{reply.text}</p>
                    
                    {/* Media in replies */}
                    {reply.media && reply.media.length > 0 && (
                      <div className="mb-3 grid grid-cols-1 gap-2">
                        {reply.media.map(file => (
                          <div key={file.id} className="relative rounded-lg overflow-hidden bg-gray-100">
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
                    
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() => onLike(reply.id)}
                        className="flex items-center gap-1 mr-4 text-slate-500 hover:text-peach-400"
                      >
                        <Heart size={16} className={reply.likes > 0 ? 'fill-peach-300 text-peach-300' : ''} />
                        <span className="text-xs">{reply.likes > 0 ? reply.likes : 'Like'}</span>
                      </button>
                      
                      <button
                        onClick={() => onDelete(reply.id)}
                        className="flex items-center gap-1 text-slate-500 hover:text-slate-700"
                      >
                        <Trash2 size={16} />
                        <span className="text-xs">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-xl">
            <MessageCircle size={24} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-400">No replies yet</p>
            <p className="text-sm text-slate-300">Be the first to reply to this post</p>
          </div>
        )}
      </div>
    </div>
  );
}