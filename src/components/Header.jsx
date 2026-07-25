import React from 'react';
import { LogOut, Settings } from 'lucide-react';
import { useAuthenticated, useUserEmail, useUserDisplayName } from '@nhost/react';
import logo from '../assets/logo.png';
import nhost from '../nhost';


const Header = ({ currentPage, setCurrentPage }) => {
  const isAuthenticated = useAuthenticated();
  const userEmail = useUserDisplayName();

  const handleLogout = async () => {
    await nhost.auth.signOut();
    setCurrentPage('user');
  };

  return (
    <header className="bg-transparent/60 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-3">
          <img src={logo} alt="QR Code" className="w-20 h-10  mx-auto" />
            {/* <Crown className="h-8 w-8 text-yellow-300" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              🙏 Ganpati Bappa Collection 🙏
            </h1> */}
          </div>
          
          <div className="flex flex-wrap items-center justify-end gap-3">
            {currentPage === 'admin' && isAuthenticated && (
              <span className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white">
                {userEmail || 'Admin'}
              </span>
            )}

            <nav className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setCurrentPage('user')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  currentPage === 'user'
                    ? 'bg-white text-orange-600 shadow-md'
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                Collection
              </button>
              <button
                onClick={() => setCurrentPage('admin')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                  currentPage === 'admin'
                    ? 'bg-white text-orange-600 shadow-md'
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </button>

              {currentPage === 'admin' && isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
