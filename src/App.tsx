// src/App.tsx
import { AuthProvider } from './context/AuthContext';
import { PostProvider } from './context/PostContext';
import AppLayout from './components/layout/AppLayout';
import DiscussionBoard from './components/posts/DiscussionBoard'; // Using the component from the posts folder

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