import React, { useState, useEffect } from 'react';
import UserPage from './components/UserPage';
import AdminPage from './components/AdminPage';
import Header from './components/Header';
import backgroundImg from "/home/master7/Documents/programming/project/src/assets/dagdusheth.jpg";
import Contact from './components/contact';
import Advertisement from './components/Advertisement';


function App() {
  const [currentPage, setCurrentPage] = useState('user');
  const [bappas, setBappas] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAd, setShowAd] = useState(true);

  // Initialize with some default Bappas
  useEffect(() => {
    const defaultBappas = [
      {
        id: 1,
        name: "Vakratunda Maharaj",
        size: "Medium (12 inches)",
        price: 2500,
        image: "https://images.pexels.com/photos/8636095/pexels-photo-8636095.jpeg?auto=compress&cs=tinysrgb&w=500",
        booked: false
      },
      {
        id: 2,
        name: "Lambodara Swami",
        size: "Large (18 inches)",
        price: 4500,
        image: "https://images.pexels.com/photos/7249432/pexels-photo-7249432.jpeg?auto=compress&cs=tinysrgb&w=500",
        booked: false
      },
      {
        id: 3,
        name: "Gajanana Maharaj",
        size: "Small (8 inches)",
        price: 1500,
        image: "https://images.pexels.com/photos/12498417/pexels-photo-12498417.jpeg?auto=compress&cs=tinysrgb&w=500",
        booked: false
      }
    ];
    setBappas(defaultBappas);
  }, []);

  const addBappa = (newBappa) => {
    const bappa = {
      ...newBappa,
      id: Date.now(),
      booked: false
    };
    setBappas(prev => [...prev, bappa]);
  };

  const bookBappa = (bappaId, bookingDetails) => {
    setBappas(prev => 
      prev.map(bappa => 
        bappa.id === bappaId ? { ...bappa, booked: true } : bappa
      )
    );
    
    const booking = {
      id: Date.now(),
      bappaId,
      ...bookingDetails,
      bookedAt: new Date().toISOString()
    };
    setBookings(prev => [...prev, booking]);
  };

  return (
    <div>
 {/* {showAd && <Advertisement onClose={() => setShowAd(false)} />} */}
    <div className="min-h-screen bg-no-repeat bg-cover bg-center"
    style={{ backgroundImage: `url(${backgroundImg})` }}
    >
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {currentPage === 'user' ? (
        <UserPage bappas={bappas} onBookBappa={bookBappa} />
      ) : (
        <AdminPage 
          bappas={bappas} 
          bookings={bookings} 
          onAddBappa={addBappa} 
        />
      )}

    </div>
          <Contact />
    </div>

  );
}

export default App;