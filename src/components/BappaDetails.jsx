import React from 'react';

export default function BappaDetailsModal({ bappa, onClose }) {
  if (!bappa) return null;
  
  const remainingAmount = Number(bappa.price) - Number(bappa.paid_amount);
  console.log("payment screen shot : ",bappa)
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl relative transform transition-all duration-300 scale-100 hover:scale-[1.02] overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
          >
            ×
          </button>
          
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 bg-white shadow-lg">
              <img
                src={bappa.image}
                alt={bappa.name}
                className="w-full h-full object-contain "
              />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{bappa.name}</h2>
            <p className="text-orange-100 text-sm font-medium">Size: {bappa.size}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Price Summary Card */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Final Price</span>
              <span className="text-lg font-bold text-gray-900">₹{bappa.price}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Advance Paid</span>
              <span className="text-lg font-semibold text-green-600">₹{bappa.paid_amount}</span>
            </div>
            <hr className="my-2 border-gray-300" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Remaining</span>
              <span className={`text-lg font-bold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{remainingAmount}
              </span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Customer Details
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">👤</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                  <p className="font-semibold text-gray-900">{bappa.fullName}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-semibold">📞</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                  <p className="font-semibold text-gray-900">{bappa.phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-xs text-gray-500 font-medium">Order Details</span>
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}