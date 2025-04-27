// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { currentUser, isAuthenticated, login, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      login(nameInput);
      setNameInput('');
      setShowLoginModal(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-mint-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo and App Name */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8">
              <svg viewBox="0 0 24 24" className="text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C16.8734 22 21 17.8734 21 13C21 8.12665 12 2 12 2C12 2 3 8.12665 3 13C3 17.8734 7.12665 22 12 22Z" fill="currentColor" fillOpacity="0.2" />
                <path d="M12 22C12 22 12 11 12 7C12 3 12 2 12 2C12 2 3 8.127 3 13C3 17.873 7.127 22 12 22Z" fill="currentColor" fillOpacity="0.3" />
              </svg>
            </div>
            <h1 className="text-xl font-medium">Community Forum</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="hover:text-mint-100 transition-colors">Home</a>
            <a href="#" className="hover:text-mint-100 transition-colors">Topics</a>
            <a href="#" className="hover:text-mint-100 transition-colors">About</a>
          </nav>

          {/* User Section - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-mint-700 px-3 py-1 rounded-full">
                  <User size={16} />
                  <span className="text-sm font-medium">{currentUser?.name}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 rounded-full hover:bg-mint-700 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 bg-white text-mint-600 rounded-full text-sm font-medium hover:bg-mint-100 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-mint-700 transition-colors"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-mint-700 px-4 py-4">
          <nav className="flex flex-col gap-4">
            <a href="#" className="hover:text-mint-100 transition-colors py-2">Home</a>
            <a href="#" className="hover:text-mint-100 transition-colors py-2">Topics</a>
            <a href="#" className="hover:text-mint-100 transition-colors py-2">About</a>
            
            {isAuthenticated ? (
              <div className="flex flex-col gap-3 pt-3 border-t border-mint-600">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span className="text-sm font-medium">{currentUser?.name}</span>
                </div>
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 text-mint-100 hover:text-white transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setShowLoginModal(true);
                  setIsMenuOpen(false);
                }}
                className="w-full mt-3 px-4 py-2 bg-white text-mint-600 rounded-md text-sm font-medium hover:bg-mint-100 transition-colors"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Sign In</h2>
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mint-500 text-slate-800"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-mint-600 text-white rounded-md hover:bg-mint-700 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;