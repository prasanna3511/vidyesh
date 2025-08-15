import React, { useState } from 'react';
import { X, User, Phone, Mail, Image } from 'lucide-react';
import nhost from '../nhost';

const ApproveBappaModal = ({ bappa, onApprove, onClose }) => {
    const [discountedAmount, setDiscountedAmount] = useState(bappa.price || 0);

  if (!bappa) return null;
  const getImageUrl = (fileId) => {
    return nhost.storage.getPublicUrl({ fileId });
  };
  const DetailItem = ({ icon, label, value, valueClass = "text-gray-800 font-medium" }) => (
    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
      <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
      <div className="text-sm text-gray-500 font-medium w-32">{label}:</div>
      <div className={`text-base ${valueClass}`}>{value}</div>
    </div>
  );
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 animate-fadeIn overflow-hidden">
      
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-2xl font-bold tracking-tight">Approve Booking</h2>
          <button
            onClick={onClose}
            title="Close"
            className="text-white/80 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
  
      {/* Details Section */}
      <div className="p-6 space-y-5">
        <DetailItem icon={<User className="text-indigo-500" />} label="Name" value={bappa.fullName} />
        <DetailItem icon={<Phone className="text-green-500" />} label="Phone" value={bappa.phoneNumber} />
        <DetailItem icon={<Mail className="text-rose-500" />} label="Email" value={bappa.customer_email} />
        <DetailItem
          icon={<span className="text-red-500 font-bold text-lg">₹</span>}
          label="Actual Amount"
          value={`₹${bappa.price || 0}`}
          valueClass="text-green-700 font-semibold text-lg"
        />
        <DetailItem
          icon={<span className="text-yellow-500 font-bold text-lg">₹</span>}
          label="Paid Amount"
          value={`₹${bappa.paid_amount || 0}`}
          valueClass="text-green-700 font-semibold text-lg"
        />
        <div className="flex items-start gap-3 bg-green-50 p-4 rounded-xl border border-green-100">
  <span className="text-green-500 font-bold text-lg mt-1">₹</span>
  <div className="w-full">
    <div className="text-sm text-gray-500 font-medium mb-1">Discounted Price:</div>
    <div className="flex items-center gap-3">
      <input
        type="number"
        value={discountedAmount}
        min="0"
        onChange={(e) => setDiscountedAmount(e.target.value)}
        className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none w-40 text-gray-800 font-semibold"
      />
      {/* <span className="text-sm text-gray-500">
        Original: <span className="line-through text-red-500">₹{bappa.paid_amount || 0}</span>
      </span> */}
    </div>
  </div>
</div>

        
        <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
          <Image className="text-pink-500 w-5 h-5 mt-1" />
          <div>
            <span className="block text-sm text-gray-500 font-medium mb-1">Payment Screenshot:</span>
            {bappa.paid_amount_sc ? (
              <img
                src={getImageUrl(bappa.paid_amount_sc)}
                alt="Payment Screenshot"
                className="h-24 w-20 object-cover rounded-lg shadow-sm transition-transform hover:scale-105 duration-200 border"
              />
            ) : (
              <span className="italic text-gray-400">Not Provided</span>
            )}
          </div>
        </div>
  
        {bappa.suggestions && (
          <div className="flex items-start gap-3 bg-purple-50 p-3 rounded-xl border border-purple-100">
            <span className="text-purple-600 font-bold w-6 text-center">💡</span>
            <div>
              <span className="block text-sm text-gray-500 font-medium mb-1">Suggestions:</span>
              <p className="text-gray-700">{bappa.suggestions}</p>
            </div>
          </div>
        )}
      </div>
  
      {/* Buttons */}
      <div className="flex justify-end gap-4 p-6 bg-gray-50 border-t">
        <button
          className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium transition-all"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold hover:from-green-600 hover:to-teal-600 shadow-md active:scale-95 transition-all flex items-center gap-1"
          onClick={() => onApprove(bappa.id,discountedAmount)}
        >
          <span>Final Approve</span>
          <span className="animate-pulse">✅</span>
        </button>
      </div>
    </div>
  
    <style>
      {`
      .animate-fadeIn {
        animation: fadeInUp 0.4s ease-out forwards;
      }
      @keyframes fadeInUp {
        0% {
          opacity: 0;
          transform: translateY(40px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      `}
    </style>
  </div>
  
  
  );
};

export default ApproveBappaModal;
