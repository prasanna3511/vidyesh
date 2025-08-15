import React, { useEffect, useState } from 'react';
import nhost from '../nhost';
import { gql, useMutation, useQuery } from '@apollo/client';

const round_up = gql`
mutation MyMutation5($_eq: Int = 10, $booking_status: String = "", $roundup_amount: numeric = "") {
  update_murti_history(where: {id: {_eq: $_eq}}, _set: {booking_status: $booking_status, roundup_amount: $roundup_amount}) {
    affected_rows
  }
}

`;
const RoundUpModal = ({ bappa, onClose  , refetch}) => {
  if (!bappa) return null;
  const [imageUrl, setImageUrl] = useState("");
  const [roundupAmount, setRoundupAmount] = useState(
    bappa.roundup_amount ? Number(bappa.roundup_amount) : 0
  );
  const [roundUp] = useMutation(round_up);
  

  useEffect(() => {
    if (bappa?.images?.length > 0) {
      const urls = nhost.storage.getPublicUrl({ fileId: bappa.images[0].image_id });
      setImageUrl(urls);
    }
  }, [bappa]);

  const markAsDelivered = async () => {
    console.log("bapppppsppspspspsppsp : ")
 
    try {
      await roundUp({
        variables: {
          _eq:Number(bappa.id),
          booking_status: "delivered",roundup_amount:roundupAmount,
        }
      });

      await refetch(); // Refresh data
      onClose()
    } catch (err) {
      console.error("Failed to approve Bappa:", err);
      alert("Something went wrong while approving!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto p-6 relative animate-fadeIn">
        
        {/* Close Button */}
        <button
          className="absolute top-3 right-5 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          title="Close"
        >
          &times;
        </button>

        {/* Murti Image */}
        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden shadow mb-4 border-4 border-gray-100 bg-gray-200 flex items-center justify-center">
          <img
            src={imageUrl}
            alt={bappa.name}
            className="object-contain w-full h-full"
          />
        </div>

        {/* Murti Details */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-blue-800 mb-2">{bappa.name}</h3>
          <p className="text-sm text-gray-600">Size: <span className="font-bold">{bappa.size}</span></p>
          <p className="text-sm text-gray-600">ID: <span className="font-bold">#{bappa.id}</span></p>
          <p className="text-green-600 font-bold text-lg">Price: ₹{bappa.price}</p>
          <p className="text-blue-700 text-lg">
            Discount Price: {bappa.discount_price ? `₹${bappa.discount_price}` : '-'}
          </p>
            <p className="text-blue-700 text-lg">
            paid Amount: {bappa.paid_amount ? `₹${bappa.paid_amount}` : '-'}
          </p>
          <div className="flex flex-col items-center mt-2">
  <label htmlFor="roundup-amount" className="text-sm text-gray-600 mb-1 font-semibold">Roundup Amount</label>
  <input
    id="roundup-amount"
    type="number"
    value={roundupAmount}
    min={0}
    onChange={(e) => {
      const value = e.target.value;
      setRoundupAmount(value === "" ? "" : Number(value));
    }}
    className="px-3 py-1 rounded border border-gray-300 w-36 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center text-lg font-bold"
    placeholder="Enter Amount"
  />
</div>

          {bappa.fullName && (
            <p className="text-gray-700 font-medium mt-2">{bappa.fullName} ({bappa.phoneNumber})</p>
          )}
        </div>

        {/* Suggestions / Additional Details */}
        {bappa.suggestions && (
          <div className="mt-4 p-2 bg-gray-100 rounded-md text-gray-700">
            <strong>Suggestions:</strong> {bappa.suggestions}
          </div>
        )}

        {/* ===== Mark as Delivered Button ===== */}
        <div className="mt-6 text-center">
          <button
            onClick={markAsDelivered}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-200"
          >
            Mark as Delivered
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoundUpModal;
