// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (name: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  updateUser: () => {}
});

// Hook for using the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Check for existing user on initial load
  useEffect(() => {
    const savedUserData = localStorage.getItem('community-forum-user');
    if (savedUserData) {
      try {
        const userData = JSON.parse(savedUserData);
        if (userData && userData.id && userData.name) {
          setCurrentUser(userData);
        }
      } catch (e) {
        console.error('Failed to parse saved user data:', e);
        localStorage.removeItem('community-forum-user');
      }
    }
  }, []);
  
  // Login function - create a new user
  const login = (name: string) => {
    if (!name.trim()) return;
    
    const newUser: User = {
      id: crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`,
      name: name.trim()
    };
    
    // Save to state
    setCurrentUser(newUser);
    
    // Save to localStorage
    localStorage.setItem('community-forum-user', JSON.stringify(newUser));
  };
  
  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('community-forum-user');
  };
  
  // Update user information
  const updateUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('community-forum-user', JSON.stringify(user));
  };
  
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    logout,
    updateUser
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};