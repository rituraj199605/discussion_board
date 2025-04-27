// src/components/layout/Footer.tsx
import React, { useState } from 'react';
import { Mail, Github, Shield } from 'lucide-react';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email && email.includes('@')) {
      // In a real app, you'd call an API here
      setSubscribeStatus('success');
      setEmail('');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSubscribeStatus('idle');
      }, 3000);
    } else {
      setSubscribeStatus('error');
    }
  };

  return (
    <footer className="bg-slate-800 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="font-medium text-lg mb-3">Community Forum</h3>
            <p className="text-slate-300 text-sm">
              A place for meaningful discussions and sharing ideas with the community.
              Built with security and privacy in mind.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Shield size={18} className="text-mint-300" />
              <span className="text-xs text-mint-300">End-to-end encrypted storage</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Topics</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h4 className="font-medium mb-3">Stay Connected</h4>
            <p className="text-slate-300 text-sm mb-3">
              Subscribe to our newsletter for updates.
            </p>
            <form onSubmit={handleSubscribe}>
              <div className="flex">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email" 
                  className={`px-3 py-2 rounded-l-md text-slate-800 text-sm focus:outline-none w-full ${
                    subscribeStatus === 'error' ? 'border-red-500' : ''
                  }`}
                />
                <button 
                  type="submit"
                  className="bg-mint-600 text-white px-3 py-2 rounded-r-md text-sm hover:bg-mint-700 transition-colors flex items-center"
                >
                  <Mail size={16} className="mr-1" />
                  <span>Subscribe</span>
                </button>
              </div>
            </form>
            
            {subscribeStatus === 'success' && (
              <p className="text-mint-300 text-xs mt-2">
                Thanks for subscribing!
              </p>
            )}
            
            {subscribeStatus === 'error' && (
              <p className="text-red-400 text-xs mt-2">
                Please enter a valid email address.
              </p>
            )}

            {/* Social Links */}
            <div className="mt-4 flex items-center gap-4">
              <a 
                href="#" 
                className="text-slate-300 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a 
                href="#" 
                className="text-slate-300 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-700 mt-8 pt-6 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Community Forum. All rights reserved.</p>
          <p className="mt-1 text-xs">
            Built with security and privacy as top priorities.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;