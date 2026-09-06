import React, { useState } from 'react';
import { getImageUrl } from '../utils/murti.js';

const RoundUpModal = ({ bappa, onClose, onSubmit }) => {
  const discountOrPrice = Number(bappa?.discount_price ?? bappa?.price ?? 0);
  const paidAmount = Number(bappa?.paid_amount ?? 0);
  const remainingAmount = Math.max(discountOrPrice - paidAmount, 0);
  const [roundupAmount, setRoundupAmount] = useState(
    bappa?.roundup_amount !== null && bappa?.roundup_amount !== undefined
      ? Number(bappa.roundup_amount)
      : remainingAmount
  );

  if (!bappa) return null;

  const markAsDelivered = async () => {
    await onSubmit(Number(bappa.id), roundupAmount === "" ? null : Number(roundupAmount));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button className="absolute right-5 top-3 text-gray-400 hover:text-gray-700" onClick={onClose} title="Close">
          &times;
        </button>

        <div className="mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-gray-100 bg-gray-200 shadow">
          <img src={getImageUrl(bappa.image)} alt={bappa.name} className="h-full w-full object-contain" />
        </div>

        <div className="space-y-2 text-center">
          <h3 className="mb-2 text-2xl font-bold text-blue-800">{bappa.name}</h3>
          <p className="text-sm text-gray-600">Size: <span className="font-bold">{bappa.size}</span></p>
          <p className="text-sm text-gray-600">ID: <span className="font-bold">#{bappa.id}</span></p>
          <p className="text-lg font-bold text-green-600">Price: ₹{bappa.price}</p>
          <p className="text-lg text-blue-700">Discount Price: {bappa.discount_price ? `₹${bappa.discount_price}` : '-'}</p>
          <p className="text-lg text-blue-700">Paid Amount: {bappa.paid_amount ? `₹${bappa.paid_amount}` : '-'}</p>

          <div className="mt-2 flex flex-col items-center">
            <label htmlFor="roundup-amount" className="mb-1 text-sm font-semibold text-gray-600">Roundup Amount</label>
            <input
              id="roundup-amount"
              type="number"
              value={roundupAmount}
              min={0}
              onChange={(e) => {
                const value = e.target.value;
                setRoundupAmount(value === "" ? "" : Number(value));
              }}
              className="w-36 rounded border border-gray-300 px-3 py-1 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter Amount"
            />
          </div>

          {bappa.fullName && (
            <p className="mt-2 font-medium text-gray-700">{bappa.fullName} ({bappa.phoneNumber})</p>
          )}
        </div>

        {bappa.suggestions && (
          <div className="mt-4 rounded-md bg-gray-100 p-2 text-gray-700">
            <strong>Suggestions:</strong> {bappa.suggestions}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={markAsDelivered}
            className="rounded-full bg-green-600 px-6 py-2 font-bold text-white shadow-lg transition-all duration-200 hover:bg-green-700"
          >
            Mark as Delivered
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoundUpModal;
