// src/App.tsx
import DiscussionBoard from './DiscussionBoard'

function App() {
  return (
    <div className="w-screen min-h-screen bg-gray-100">
      <nav className="bg-mint-600 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" className="text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C16.8734 22 21 17.8734 21 13C21 8.12665 12 2 12 2C12 2 3 8.12665 3 13C3 17.8734 7.12665 22 12 22Z" fill="currentColor" fillOpacity="0.2" />
              <path d="M12 22C12 22 12 11 12 7C12 3 12 2 12 2C12 2 3 8.127 3 13C3 17.873 7.127 22 12 22Z" fill="currentColor" fillOpacity="0.3" />
            </svg>
            <h1 className="text-xl font-medium">Community Forum</h1>
          </div>
          <div>
            <button className="px-4 py-2 bg-white text-mint-600 rounded-full text-sm font-medium hover:bg-mint-100 transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </nav>
      <DiscussionBoard />
      <footer className="bg-slate-800 text-white p-6 mt-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-medium text-lg mb-3">Community Forum</h3>
              <p className="text-slate-300 text-sm">
                A place for meaningful discussions and sharing ideas with the community.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><a href="#" className="hover:text-white">Home</a></li>
                <li><a href="#" className="hover:text-white">Topics</a></li>
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Stay Connected</h4>
              <p className="text-slate-300 text-sm mb-3">
                Subscribe to our newsletter for updates.
              </p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-3 py-2 rounded-l-md text-slate-800 text-sm focus:outline-none w-full"
                />
                <button className="bg-mint-600 text-white px-3 py-2 rounded-r-md text-sm hover:bg-mint-600/90">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-6 pt-6 text-center text-sm text-slate-400">
            © {new Date().getFullYear()} Community Forum. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App