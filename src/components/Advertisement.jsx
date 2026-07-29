import React from 'react'
import advertise from '../assets/1000373663.png'

export default function Advertisement({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="w-full max-w-md h-[90vh] mt-[5vh] mb-[5vh] flex items-center justify-center">
        <div className="relative inline-block">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold z-10"
          >
            &times;
          </button>

          {/* Image */}
          <img
            src={advertise}
            alt="Ad"
            className="max-h-[90vh] w-full object-contain rounded shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
