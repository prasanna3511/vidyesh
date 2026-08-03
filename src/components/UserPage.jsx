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
  "Feta",
  "Single Load",
  "Double Load",
  "Veling",
  "Lalbaug"
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
  const ITEMS_PER_PAGE = 9;
  const MAX_AUTO_RETRIES = 6;
  const RETRY_DELAY_MS = 5000;
  const isAuthenticated = useAuthenticated();
  const [selectedBappa, setSelectedBappa] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [sizeFilter, setSizeFilter] = useState("");
  const [designFilter, setDesignFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [retryAttempt, setRetryAttempt] = useState(0);


  const { loading, error, data, refetch } = useQuery(GET_MURTI_HISTORY);

  const handleBuyNow = (bappa) => {
    if (!isAuthenticated) return;
    setSelectedBappa(bappa);
    setShowPaymentModal(true);
  };

  const handleBookingComplete = async (bookingDetails) => {
    onBookBappa(selectedBappa.id, bookingDetails);
    await refetch();
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!error) {
      setRetryAttempt(0);
      return;
    }

    if (retryAttempt >= MAX_AUTO_RETRIES) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        await refetch();
      } finally {
        setRetryAttempt((prev) => prev + 1);
      }
    }, RETRY_DELAY_MS);

    return () => clearTimeout(timer);
  }, [error, refetch, retryAttempt]);

  const bappas = (data?.murti_history || []).filter(
    (bappa) => bappa.booking_status === "available"
  );

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

  const totalPages = Math.max(1, Math.ceil(filteredBappas.length / ITEMS_PER_PAGE));
  const paginatedBappas = filteredBappas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [sizeFilter, designFilter, searchText]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
      <div className="text-center py-16 text-lg text-red-600 space-y-4">
        <p>Error loading data: {error.message}</p>
        <p className="text-sm text-gray-200">
          Retrying automatically {retryAttempt < MAX_AUTO_RETRIES ? `(${retryAttempt + 1}/${MAX_AUTO_RETRIES})` : "stopped"}.
        </p>
        <button
          type="button"
          onClick={() => {
            setRetryAttempt(0);
            refetch();
          }}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-800"
        >
          Retry now
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      // style={{ backgroundImage: `url(${backgroundImg})` }}
    >
      <div className="min-h-screen bg-black/60">
        <div className="container mx-auto px-4 py-8 text-white">
          <div className="text-center mb-12">
            <div className="mx-auto mb-8 max-w-3xl rounded-3xl border border-white/15 bg-black/45 px-4 py-5 text-center shadow-2xl backdrop-blur-sm md:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-300">
                Online Ganesh Murti Booking
              </p>
              <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">
                Simple booking in a few quick steps
              </h2>
              <div className="mt-4 space-y-2 text-sm leading-6 text-gray-200 md:text-base">
                <p>
                  <span className="font-semibold text-white">Step 1:</span> Visit{" "}
                  <a
                    href="https://vidyeshganeshmurti.netlify.app/"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-orange-300 underline underline-offset-4"
                  >
                    vidyeshganeshmurti.netlify.app
                  </a>
                  .
                </p>
                <p>
                  <span className="font-semibold text-white">Step 2:</span> Select your preferred size.
                </p>
                <p>
                  <span className="font-semibold text-white">Step 3:</span> Choose your favourite Murti.
                </p>
                <p>
                  <span className="font-semibold text-white">Step 4:</span> Send the Murti No. or screenshot on WhatsApp.
                </p>
                <p>
                  <span className="font-semibold text-white">Step 5:</span> Pay the booking advance via any UPI app.
                </p>
              </div>
              <p className="mt-3 text-sm font-semibold text-emerald-300 md:text-base">
                Booking is confirmed after advance payment.
              </p>
            </div>

            <div className="mx-auto mb-10 grid max-w-5xl grid-cols-3 gap-2 items-end md:gap-4">
              <div className="min-w-0">
                <label className="mb-2 block text-center text-[11px] font-medium uppercase tracking-wide text-gray-200 md:text-sm">
                  Size
                </label>
                <select
                  name="size"
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-2 py-2 text-xs text-gray-800 transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-orange-500 md:px-4 md:py-3 md:text-base"
                >
                  <option value="">All Sizes</option>
                  {[6, 9, 11, 12, 13, 14, 15, 18].map((value) => (
                    <option key={value} value={`${value} inches`}>
                      {value} inches
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-center text-[11px] font-medium uppercase tracking-wide text-gray-200 md:text-sm">
                  Design
                </label>
                <select
                  name="design"
                  value={designFilter}
                  onChange={(e) => setDesignFilter(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-2 py-2 text-xs text-gray-800 transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-orange-500 md:px-4 md:py-3 md:text-base"
                >
                  <option value="">All Designs</option>
                  {MURTI_DESIGN_OPTIONS.map((design) => (
                    <option key={design} value={design}>
                      {design}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-center text-[11px] font-medium uppercase tracking-wide text-gray-200 md:text-sm">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Murti no."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-2 py-2 text-xs text-gray-800 transition-all duration-300 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-orange-500 md:px-4 md:py-3 md:text-base"
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
            {paginatedBappas.map((bappa) => (
  <BappaCard key={bappa.id} bappa={bappa} onBuyNow={handleBuyNow} />
))}
          </div>
  
          {filteredBappas.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-gray-300">No Bappas available at the moment</p>
            </div>
          )}

          {filteredBappas.length > 0 && totalPages > 1 && (
            <div className="mt-10 flex flex-col items-center gap-4">
              <p className="text-sm text-gray-300">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredBappas.length)} of {filteredBappas.length} murtis
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg bg-white px-4 py-2 text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-white font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg bg-white px-4 py-2 text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
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
