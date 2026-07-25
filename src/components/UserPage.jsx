import React, { useEffect, useState } from "react";
import BappaCard from "./BappaCard";
import PaymentModal from "./PaymentModal";
import { gql, useQuery } from "@apollo/client";
import backgroundImg from "../assets/dagdusheth.jpg";
import Contact from "./contact";
import { useAuthenticated } from "@nhost/react";

const MURTI_DESIGN_OPTIONS = [
  "Dagdusheth",
  "Bal Ganesh",
  "Asan Mandi",
  "Shivrekar",
  "Mhaisuri",
  "Kamal Asan",
  "Peshavai",
  "Raja",
  "Savkar",
  "Varad HAst",
  "Phillips",
  "Chaurang",
  "Furniture",
];

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
      payment_mode
      murti_design
      suggestions
      booked_by
    }
  }
`;

const UserPage = ({ onBookBappa }) => {
  const isAuthenticated = useAuthenticated();
  const [selectedBappa, setSelectedBappa] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [sizeFilter, setSizeFilter] = useState("");
  const [designFilter, setDesignFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showSplash, setShowSplash] = useState(true);


  const { loading, error, data, refetch } = useQuery(GET_MURTI_HISTORY);

  const handleBuyNow = (bappa) => {
    if (!isAuthenticated) return;
    setSelectedBappa(bappa);
    setShowPaymentModal(true);
  };

  const handleBookingComplete = async (bookingDetails) => {
    onBookBappa(selectedBappa.id, bookingDetails);
    setShowPaymentModal(false);
    setSelectedBappa(null);
    await refetch();
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16 text-lg text-gray-600">
        Loading Bappas...
      </div>
    );
  }
  if (showSplash) {
    return (
      // <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50 animate-fadeOut">

        <img
          src="src/assets/dagdusheth.jpg" // 👉 replace with actual image path
          alt="Ganpati Splash"
          className="w-full h-full object-cover"
        />
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

  const bappas = (data?.murti_history || []).filter(
    (bappa) => bappa.booking_status === "available"
  );

// First apply size filter, then search filter
const filteredBappas = bappas
  .filter((bappa) => !sizeFilter || bappa.size === sizeFilter)
  .filter((bappa) => !designFilter || bappa.murti_design === designFilter)
  .filter((bappa) =>
    searchText.trim() === ""
      ? true
      : (bappa.murti_id || "")
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        (bappa.customer_email || "")
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        (bappa.size || "")
          .toLowerCase()
          .includes(searchText.toLowerCase())
  );
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      // style={{ backgroundImage: `url(${backgroundImg})` }}
    >
      <div className="min-h-screen bg-black/60">
        <div className="container mx-auto px-4 py-8 text-white">
          <div className="text-center mb-12">
            <div className="flex flex-col md:flex-row justify-center gap-6 mb-10 items-center">
  {/* Size Filter */}
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
      {[6, 9, 11, 12, 13, 14, 15, 18].map((value) => (
        <option key={value} value={`${value} inches`}>
          {value} inches
        </option>
      ))}
    </select>
  </div>

  <div className="w-64">
    <label className="block text-sm font-medium text-gray-200 mb-2 text-center">
      Filter by Design
    </label>
    <select
      name="design"
      value={designFilter}
      onChange={(e) => setDesignFilter(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white text-gray-800"
    >
      <option value="">All Designs</option>
      {MURTI_DESIGN_OPTIONS.map((design) => (
        <option key={design} value={design}>
          {design}
        </option>
      ))}
    </select>
  </div>

  {/* Search Bar */}
  <div className="w-64">
    <label className="block text-sm font-medium text-gray-200 mb-2 text-center">
      Search Murti
    </label>
    <input
      type="text"
      placeholder="Search by murti number,size....."
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white text-gray-800"
    />
  </div>
  </div>
            {/* <h2 className="text-3xl md:text-5xl font-bold mb-3 leading-snug md:leading-tight text-orange-400">
              जय गणेश श्री गणेश
            </h2> */}
            {/* <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            या पवित्र सणासाठी आपल्या लाडक्या गणपती बाप्पाची निवड करा. प्रत्येक मूर्ती भक्तीभावाने आणि प्रेमपूर्वक साकारलेली आहे.
                        </p> */}
          </div>
       


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* {bappas.filter((bappa) => !sizeFilter || bappa.size === sizeFilter).map((bappa) => (
              <BappaCard key={bappa.id} bappa={bappa} onBuyNow={handleBuyNow} />
            ))} */}
            {filteredBappas.map((bappa) => (
  <BappaCard key={bappa.id} bappa={bappa} onBuyNow={handleBuyNow} />
))}
          </div>
  
          {filteredBappas.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-gray-300">No Bappas available at the moment</p>
            </div>
          )}
  
          {isAuthenticated && showPaymentModal && (
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
