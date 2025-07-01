import React from 'react';
import { Crown, Settings } from 'lucide-react';
import logo from '../assets/logo.png';


const Header = ({ currentPage, setCurrentPage }) => {
  return (
    <header className="bg-transparent/60 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
          <img src={logo} alt="QR Code" className="w-20 h-10  mx-auto" />
            {/* <Crown className="h-8 w-8 text-yellow-300" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              🙏 Ganpati Bappa Collection 🙏
            </h1> */}
          </div>
          
          <nav className="flex space-x-4">
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
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;