import React, { useState } from 'react';
import BappaCard from './BappaCard';
import PaymentModal from './PaymentModal';

const UserPage = ({ bappas, onBookBappa }) => {
  const [selectedBappa, setSelectedBappa] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleBuyNow = (bappa) => {
    setSelectedBappa(bappa);
    setShowPaymentModal(true);
  };

  const handleBookingComplete = (bookingDetails) => {
    onBookBappa(selectedBappa.id, bookingDetails);
    setShowPaymentModal(false);
    setSelectedBappa(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gradient bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
          Sacred Ganpati Collection
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose your beloved Ganpati Bappa for the auspicious festival. Each murti is crafted with devotion and care.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bappas.map((bappa) => (
          <BappaCard
            key={bappa.id}
            bappa={bappa}
            onBuyNow={handleBuyNow}
          />
        ))}
      </div>

      {bappas.length === 0 && (
        <div className="text-center py-16">
          <p className="text-xl text-gray-500">No Bappas available at the moment</p>
        </div>
      )}

      {showPaymentModal && (
        <PaymentModal
          bappa={selectedBappa}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBappa(null);
          }}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </div>
  );
};

export default UserPage;