import React from 'react';
import { ShoppingCart, Ruler, IndianRupee } from 'lucide-react';

const BappaCard = ({ bappa, onBuyNow }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <div className="relative">
        <img
          src={bappa.image}
          alt={bappa.name}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          #{bappa.id}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">{bappa.name}</h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3 text-gray-600">
            <Ruler className="h-5 w-5 text-orange-500" />
            <span className="font-medium">{bappa.size}</span>
          </div>
          
          <div className="flex items-center space-x-3 text-gray-800">
            <IndianRupee className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold">₹{bappa.price.toLocaleString()}</span>
          </div>
        </div>
        
        <button
          onClick={() => onBuyNow(bappa)}
          disabled={bappa.booked}
          className={`w-full py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
            bappa.booked
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 text-white hover:from-orange-600 hover:via-red-600 hover:to-purple-600 transform hover:scale-105 shadow-lg hover:shadow-xl'
          }`}
        >
          {bappa.booked ? (
            <span>Already Booked</span>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              <span>Buy Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BappaCard;