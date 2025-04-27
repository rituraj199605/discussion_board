// src/App.tsx
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { PostProvider } from './context/PostContext';
import AppLayout from './components/layout/AppLayout';
import DiscussionBoard from './components/posts/DiscussionBoard';

function App() {
  return (
    <AuthProvider>
      <PostProvider>
        <AppLayout>
          <DiscussionBoard />
        </AppLayout>
      </PostProvider>
    </AuthProvider>
  );
}

export default App;