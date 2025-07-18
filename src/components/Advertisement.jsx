import React from 'react'
import advertise from '../assets/advertise.jpeg'

export default function Advertisement({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative  rounded-lg shadow-lg w-full max-w-md h-[90vh] mt-[5vh] mb-[5vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-8 text-gray-500 hover:text-red-600 text-xl font-bold z-10"
        >
          &times;
        </button>

        {/* Image */}
        <img
          src={advertise}
          alt="Ad"
          className="h-full w-full object-contain rounded"
        />
      </div>
    </div>
  );
}
