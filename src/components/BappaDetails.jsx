import React, { useEffect, useState } from 'react';
import nhost from '../nhost';
import { generateBookingPdf } from '../utils/bookingPdf';

export default function BappaDetailsModal({ bappa, onClose }) {
  const [imageurl, setImageUrl] = useState('');

  console.log("oooooooo : ", bappa)

  if (!bappa) return null;

  const getImageDataUrl = async () => {
    if (!imageurl) return null;

    try {
      const response = await fetch(imageurl);
      const blob = await response.blob();

      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to prepare image for PDF:', error);
      return null;
    }
  };

  const downloadPDF = async () => {
    const imageDataUrl = await getImageDataUrl();
    await generateBookingPdf({ ...bappa, imageUrl: imageurl, imageDataUrl });
  };
  const actualPrice = bappa.discount_price !== null ? Number(bappa.discount_price) : Number(bappa.price);
  const remainingAmount = actualPrice - Number(bappa.paid_amount);

  useEffect(() => {
    const publicUrl = nhost.storage.getPublicUrl({ fileId: bappa?.images[0]?.image_id });
    setImageUrl(publicUrl);
  }, [bappa]);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] shadow-2xl relative transform transition-all duration-300 scale-100 hover:scale-[1.02] overflow-hidden flex flex-col">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
            >
              ×
            </button>

            <div className="text-center">
              <div className="w-32 h-32 mx-auto  bg-white shadow-lg rounded-2xl overflow-hidden">
                <img
                  src={imageurl}
                  alt={bappa.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">{bappa.name}</h2>
              <p className="text-orange-100 text-sm font-medium">Size: {bappa.size}</p>
            </div>
          </div>
          <div className="text-center mt-6">
            <button
              onClick={downloadPDF}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-sm font-semibold tracking-wide"
            >
              📄 Download Booking PDF
            </button>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 overflow-y-auto">
            {/* Price Summary Card */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Final Price</span>
                <span className={`text-lg font-bold ${bappa.discount_price ? 'line-through text-red-500' : 'text-gray-900'}`}>
                  ₹{bappa.price}
                </span>
              </div>

              {bappa.discount_price !== null && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-indigo-600">Discounted Price</span>
                  <span className="text-lg font-bold text-indigo-800">₹{bappa.discount_price}</span>
                </div>
              )}

              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Advance Paid</span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-green-600">₹{bappa.paid_amount}</span>
                </div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Payment Mode</span>
                <span className="text-sm font-semibold text-indigo-700">{bappa.payment_mode || 'Online'}</span>
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
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm font-semibold">💬</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Suggestions</p>
                    <p className="font-semibold text-gray-900 whitespace-pre-line">{bappa?.suggestions || "—"}</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Address</p>
                  <p className="font-semibold text-gray-900 whitespace-pre-line">{bappa?.address || "—"}</p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

    </>
  );
}
