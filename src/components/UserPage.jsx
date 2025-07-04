import React, { useEffect, useState } from "react";
import BappaCard from "./BappaCard";
import PaymentModal from "./PaymentModal";
import { gql, useQuery } from "@apollo/client";
import backgroundImg from "/home/master7/Documents/programming/project/src/assets/dagdusheth.jpg";

const GET_MURTI_HISTORY = gql`
  query MyQuery {
    murti_history {
      id
      murti_id
      size
      final_price
      booking_status
      image
      customer_name
      customer_phone
      customer_email
      paid_amount
      discount_price
      paid_amount_sc
      suggestions
      booked_by
    }
  }
`;

const UserPage = ({ onBookBappa }) => {
  const [selectedBappa, setSelectedBappa] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [sizeFilter, setSizeFilter] = useState("");

  const { loading, error, data, refetch } = useQuery(GET_MURTI_HISTORY);

  const handleBuyNow = (bappa) => {
    setSelectedBappa(bappa);
    setShowPaymentModal(true);
  };

  const handleBookingComplete = async (bookingDetails) => {
    onBookBappa(selectedBappa.id, bookingDetails);
    setShowPaymentModal(false);
    setSelectedBappa(null);
    await refetch();
  };
  // useEffect(async()=>{
  //   await refetch();
  // },[])
  if (loading) {
    return (
      <div className="text-center py-16 text-lg text-gray-600">
        Loading Bappas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-lg text-red-600">
        Error loading data: {error.message}
      </div>
    );
  }

  const bappas = data?.murti_history || [];

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      // style={{ backgroundImage: `url(${backgroundImg})` }}
    >
      <div className="min-h-screen bg-black/60">
        <div className="container mx-auto px-4 py-8 text-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 leading-snug md:leading-tight text-orange-400">
              जय गणेश श्री गणेश
            </h2>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            या पवित्र सणासाठी आपल्या लाडक्या गणपती बाप्पाची निवड करा. प्रत्येक मूर्ती भक्तीभावाने आणि प्रेमपूर्वक साकारलेली आहे.
                        </p>
          </div>
          <div className="flex justify-center mb-10">
  <div className="w-64">
    <label className="block text-sm font-medium text-gray-200 mb-2 text-center">
      Filter by Size
    </label>
    <select
      name="size"
      value={sizeFilter}
      onChange={(e) => setSizeFilter(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white text-gray-800"
    >
      <option value="">All Sizes</option>
      {[9, 11, 12, 13, 14, 15, 18].map((value) => (
        <option key={value} value={`${value} inches`}>
          {value} inches
        </option>
      ))}
    </select>
  </div>
</div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bappas.filter((bappa) => !sizeFilter || bappa.size === sizeFilter).map((bappa) => (
              <BappaCard key={bappa.id} bappa={bappa} onBuyNow={handleBuyNow} />
            ))}
          </div>
  
          {bappas.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-gray-300">No Bappas available at the moment</p>
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
      </div>
    </div>
  );
  
};

export default UserPage;
