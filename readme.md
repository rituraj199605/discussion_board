# Community Forum Application

## Overview

The Community Forum is a discussion platform that allows users to create posts, engage in conversations through replies, and interact with content through likes. This application can be used for community discussions, sharing ideas, and creating meaningful conversations.

## Features

- **Post Creation**: Users can create posts with text content and attach media files
- **Replies**: Users can reply to existing posts, creating threaded conversations
- **Media Support**: Support for images and videos in both posts and replies
- **Likes**: Users can like posts and replies
- **Thread Management**: Expanding and collapsing reply threads
- **User Identification**: Simple username-based posting
- **Persistence**: Posts and replies are saved locally

## Technical Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Desktop App**: Electron (optional)
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Storage**: Local browser storage or Electron Store

## Project Structure

```
community-forum/
├── public/
├── src/
│   ├── App.tsx                 # Main application component
│   ├── DiscussionBoard.tsx     # Main discussion board component
│   ├── index.css               # Global styles
│   └── main.tsx                # Application entry point
├── electron/
│   ├── main.js                 # Electron main process
│   └── preload.js              # Electron preload script
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.ts
```

## Key Components

### DiscussionBoard

The central component that manages the state and interactions for the discussion forum. It handles:
- Post composition
- Displaying posts and their replies
- Managing likes
- Expanding/collapsing replies
- Post and reply deletion

### PostCard

Displays an individual post with a summary of its content and provides options for:
- Viewing the full post
- Replying to the post
- Liking the post
- Deleting the post (by the author)
- Expanding/collapsing replies

### PostDetailView

Provides a detailed view of a single post, including:
- Full post content
- All media attachments
- All replies
- Actions to reply, like, or delete

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/community-forum.git
   cd community-forum
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Electron App

To run as an Electron desktop application:

1. Start the development version:
   ```bash
   npm run electron:dev
   ```

2. Build for production:
   ```bash
   npm run electron:build
   ```

## Data Persistence

- **Web Version**: Uses localStorage to save posts and replies
- **Electron Version**: Uses electron-store for persistent storage

## Customization

The application uses Tailwind CSS for styling, making it easy to customize:
- The color palette can be adjusted in `tailwind.config.js`
- Component styling can be modified directly in the component files

## Future Enhancements

- User authentication
- Server-side storage
- Notifications
- Search functionality
- Rich text formatting
- Moderation tools
- Categories and tags
- User profiles
- Analytics

---

## Migration from Tweet App

This application was refactored from a tweet-saving application to a community discussion board. The main changes include:

1. **Data Model**: 
   - Changed from tweets to posts with nested replies
   - Added likes functionality
   - Added author field

2. **UI Components**:
   - Redesigned the interface for threaded conversations
   - Added reply functionality
   - Implemented thread expansion/collapse
   - Added like counters and buttons

3. **Storage**:
   - Modified the storage structure to support hierarchical data
   - Maintained backward compatibility with the original electron-store API

4. **User Experience**:
   - Increased character limits for longer discussions
   - Added user identification field
   - Reorganized layout for better conversation flow

---

Created: April 27, 2025