import React, { useEffect, useState } from "react";
import BappaCard from "./BappaCard";
import PaymentModal from "./PaymentModal";
import backgroundImg from "../assets/dagdusheth.jpg";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";
import { normalizeMurti } from "../utils/murti.js";

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

const UserPage = () => {
  const ITEMS_PER_PAGE = 9;
  const MAX_AUTO_RETRIES = 6;
  const RETRY_DELAY_MS = 5000;
  const { isAuthenticated } = useAuth();
  const [selectedBappa, setSelectedBappa] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [sizeFilter, setSizeFilter] = useState("");
  const [designFilter, setDesignFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [murtis, setMurtis] = useState([]);

  const loadMurtis = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const response = await api.get("/murtis");
      const nextMurtis = (response.data || []).map(normalizeMurti);
      setMurtis(nextMurtis);
      setError("");
      return nextMurtis;
    } catch (loadError) {
      setError(loadError.message || "Failed to load murtis");
      return [];
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleBuyNow = (bappa) => {
    if (!isAuthenticated) return;
    setSelectedBappa(bappa);
    setShowPaymentModal(true);
  };

  const handleBookingComplete = async () => {
    const nextMurtis = await loadMurtis({ silent: true });
    setSelectedBappa((currentSelectedBappa) =>
      nextMurtis.find((item) => item.id === currentSelectedBappa?.id) || currentSelectedBappa
    );
  };

  useEffect(() => {
    loadMurtis();
  }, []);

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
        await loadMurtis();
      } finally {
        setRetryAttempt((prev) => prev + 1);
      }
    }, RETRY_DELAY_MS);

    return () => clearTimeout(timer);
  }, [error, retryAttempt]);

  const bappas = murtis.filter((bappa) => bappa.booking_status === "available");

  const filteredBappas = bappas
    .filter((bappa) => !sizeFilter || bappa.size === sizeFilter)
    .filter((bappa) => !designFilter || bappa.murti_design === designFilter)
    .filter((bappa) =>
      searchText.trim() === ""
        ? true
        : (bappa.murti_id || "").toLowerCase().includes(searchText.toLowerCase()) ||
          (bappa.customer_email || "").toLowerCase().includes(searchText.toLowerCase()) ||
          (bappa.size || "").toLowerCase().includes(searchText.toLowerCase())
    );

  const totalPages = Math.max(1, Math.ceil(filteredBappas.length / ITEMS_PER_PAGE));
  const paginatedBappas = filteredBappas.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [sizeFilter, designFilter, searchText]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (loading) {
    return <div className="py-16 text-center text-lg text-gray-600">Loading Bappas...</div>;
  }

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black animate-fadeOut">
        <img src={backgroundImg} alt="Ganpati Splash" className="h-full w-full object-cover" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 py-16 text-center text-lg text-red-600">
        <p>Error loading data: {error}</p>
        <p className="text-sm text-gray-200">
          Retrying automatically {retryAttempt < MAX_AUTO_RETRIES ? `(${retryAttempt + 1}/${MAX_AUTO_RETRIES})` : "stopped"}.
        </p>
        <button
          type="button"
          onClick={() => {
            setRetryAttempt(0);
            loadMurtis();
          }}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-800"
        >
          Retry now
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat">
      <div className="min-h-screen bg-black/60">
        <div className="container mx-auto px-4 py-8 text-white">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-8 max-w-3xl rounded-3xl border border-white/15 bg-black/45 px-4 py-5 text-center shadow-2xl backdrop-blur-sm md:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-300">Online Ganesh Murti Booking</p>
              <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">Simple booking in a few quick steps</h2>
              <div className="mt-6 space-y-4 text-md font-medium text-white md:text-sm">
                <p>
                  <span className="font-bold">Step 1:</span>{' '}
                  Visit{' '}
                  <a
                    href="https://vidyeshganeshmurti.netlify.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-orange-300 underline underline-offset-4"
                  >
                    vidyeshganeshmurti.netlify.app
                  </a>
                  .
                </p>
                <p><span className="font-bold">Step 2:</span> Select your preferred size.</p>
                <p><span className="font-bold">Step 3:</span> Choose your favourite Murti.</p>
                <p><span className="font-bold">Step 4:</span> Send the Murti No. or screenshot on WhatsApp.</p>
                <p><span className="font-bold">Step 5:</span> Pay the booking advance via any UPI app.</p>
                <p className="pt-2 font-bold text-emerald-300">Booking is confirmed after advance payment.</p>
              </div>
            </div>

            <div className="mx-auto mb-10 grid max-w-5xl grid-cols-3 items-end gap-2 md:gap-4">
              <div className="min-w-0">
                <label className="mb-2 block text-center text-[11px] font-medium uppercase tracking-wide text-gray-200 md:text-sm">
                  Size
                </label>
                <select
                  name="size"
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-center text-sm text-white backdrop-blur-md focus:outline-none"
                >
                  <option value="">All</option>
                  {[...new Set(bappas.map((bappa) => bappa.size).filter(Boolean))].sort((a, b) => parseInt(a) - parseInt(b)).map((size) => (
                    <option key={size} value={size} className="text-black">
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-center text-[11px] font-medium uppercase tracking-wide text-gray-200 md:text-sm">
                  Design
                </label>
                <select
                  value={designFilter}
                  onChange={(e) => setDesignFilter(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-center text-sm text-white backdrop-blur-md focus:outline-none"
                >
                  <option value="">All</option>
                  {MURTI_DESIGN_OPTIONS.map((design) => (
                    <option key={design} value={design} className="text-black">
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
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Murti no or size"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-center text-sm text-white placeholder:text-gray-300 backdrop-blur-md focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {paginatedBappas.map((bappa) => (
              <BappaCard key={bappa.id} bappa={bappa} onBuyNow={handleBuyNow} />
            ))}
          </div>

          {paginatedBappas.length === 0 && <p className="py-12 text-center text-white">No murtis found.</p>}

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="rounded-lg bg-white/10 px-4 py-2 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="rounded-lg bg-white/10 px-4 py-2 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showPaymentModal && selectedBappa && (
        <PaymentModal bappa={selectedBappa} onClose={() => setShowPaymentModal(false)} onBookingComplete={handleBookingComplete} />
      )}
    </div>
  );
};

export default UserPage;
