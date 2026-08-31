import React, { useState } from 'react';
import UserPage from './components/UserPage';
import AdminPage from './components/AdminPage';
import Header from './components/Header';
import backgroundImg from "./assets/dagdusheth.jpg";
import Contact from './components/contact';
import Advertisement from './components/Advertisement';


function App() {
  const [currentPage, setCurrentPage] = useState('user');
  const [showAd, setShowAd] = useState(true);

  return (
    <div>
 {/* {showAd && <Advertisement onClose={() => setShowAd(false)} />} */}
    <div className="min-h-screen bg-no-repeat bg-cover bg-center"
    style={{ backgroundImage: `url(${backgroundImg})` }}
    >
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {currentPage === 'user' ? (
        <UserPage />
      ) : (
        <AdminPage />
      )}

    </div>
          <Contact />
    </div>

  );
}

export default App;
