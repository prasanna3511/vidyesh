import React, { useState } from 'react';
import { Image, Mail, Phone, User, X } from 'lucide-react';
import { getImageUrl } from '../utils/murti.js';

const ApproveBappaModal = ({ bappa, onApprove, onClose }) => {
  const [discountedAmount, setDiscountedAmount] = useState(bappa.price || 0);

  if (!bappa) return null;

  const DetailItem = ({ icon, label, value, valueClass = "text-gray-800 font-medium" }) => (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="flex h-6 w-6 items-center justify-center">{icon}</div>
      <div className="w-32 text-sm font-medium text-gray-500">{label}:</div>
      <div className={`text-base ${valueClass}`}>{value}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-white">Approve Booking</h2>
            <button onClick={onClose} title="Close" className="text-white/80 transition hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <DetailItem icon={<User className="text-indigo-500" />} label="Name" value={bappa.fullName || '-'} />
          <DetailItem icon={<Phone className="text-green-500" />} label="Phone" value={bappa.phoneNumber || '-'} />
          <DetailItem icon={<Mail className="text-rose-500" />} label="Email" value={bappa.customer_email || '-'} />
          <DetailItem
            icon={<span className="text-lg font-bold text-red-500">₹</span>}
            label="Actual Amount"
            value={`₹${bappa.price || 0}`}
            valueClass="text-lg font-semibold text-green-700"
          />
          <DetailItem
            icon={<span className="text-lg font-bold text-yellow-500">₹</span>}
            label="Paid Amount"
            value={`₹${bappa.paid_amount || 0}`}
            valueClass="text-lg font-semibold text-green-700"
          />

          <div className="flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
            <span className="mt-1 text-lg font-bold text-green-500">₹</span>
            <div className="w-full">
              <div className="mb-1 text-sm font-medium text-gray-500">Discounted Price:</div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  inputMode="decimal"
                  value={discountedAmount}
                  min="0"
                  onChange={(e) => setDiscountedAmount(e.target.value)}
                  className="w-40 rounded-lg border border-gray-300 px-3 py-2 font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
            <Image className="mt-1 h-5 w-5 text-pink-500" />
            <div>
              <span className="mb-1 block text-sm font-medium text-gray-500">Payment Screenshot:</span>
              {bappa.paid_amount_sc ? (
                <img
                  src={getImageUrl(bappa.paid_amount_sc)}
                  alt="Payment Screenshot"
                  className="h-24 w-20 rounded-lg border object-cover shadow-sm transition-transform duration-200 hover:scale-105"
                />
              ) : (
                <span className="italic text-gray-400">Not Provided</span>
              )}
            </div>
          </div>

          {bappa.suggestions && (
            <div className="flex items-start gap-3 rounded-xl border border-purple-100 bg-purple-50 p-3">
              <span className="w-6 text-center font-bold text-purple-600">💡</span>
              <div>
                <span className="mb-1 block text-sm font-medium text-gray-500">Suggestions:</span>
                <p className="text-gray-700">{bappa.suggestions}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 border-t bg-gray-50 p-6">
          <button
            className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-600 transition-all hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 px-6 py-2 font-semibold text-white shadow-md transition-all hover:from-green-600 hover:to-teal-600"
            onClick={() => onApprove(bappa.id, discountedAmount)}
          >
            <span>Final Approve</span>
            <span>✅</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveBappaModal;
