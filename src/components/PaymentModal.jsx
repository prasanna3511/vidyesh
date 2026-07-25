import React, { useState } from 'react';
import { X, User, Phone, Mail, Coins, IndianRupee } from 'lucide-react';
import { gql, useMutation } from '@apollo/client';
import { useAuthenticated, useUserEmail } from '@nhost/react';

const getCurrentDbDate = () => new Date().toISOString().split('T')[0];

const UPDATE_MURTI_HISTORY = gql`
  mutation UpdateMurtiHistory(
    $_eq: Int!,
    $booked_by: String!,
    $booking_status: String!,
    $address: String,
    $customer_email: String!,
    $customer_name: String!,
    $customer_phone: numeric!,
    $date: date!,
    $discount_price: numeric,
    $paid_amount: numeric!,
    $payment_mode: String!,
    $suggestions: String!
  ) {
    update_murti_history(
      where: { id: { _eq: $_eq } },
      _set: {
        booked_by: $booked_by,
        booking_status: $booking_status,
        address: $address,
        customer_email: $customer_email,
        customer_name: $customer_name,
        customer_phone: $customer_phone,
        date: $date,
        discount_price: $discount_price,
        paid_amount: $paid_amount,
        payment_mode: $payment_mode,
        suggestions: $suggestions
      }
    ) {
      affected_rows
    }
  }
`;

const PaymentModal = ({ bappa, onClose, onBookingComplete }) => {
  const deliveryOption = 'घरपोच सेवा (शुल्क लागू)';
  const colorTouchupOption = 'कलर टचअप';
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    discountPrice: bappa?.discount_price || '',
    amount: '',
    paymentMode: 'Online',
    address: '',
    suggestions: [],
    suggestionsEnabled: false
  });
  const isAuthenticated = useAuthenticated();
  const authenticatedUserEmail = useUserEmail();


  const [updateMurtiHistory] = useMutation(UPDATE_MURTI_HISTORY);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSuggestionToggle = (option) => {
    setFormData(prev => {
      const exists = prev.suggestions.includes(option);
      const suggestions = exists
        ? prev.suggestions.filter(item => item !== option)
        : [...prev.suggestions, option];

      return {
        ...prev,
        suggestions,
        address: suggestions.includes(deliveryOption) ? prev.address : ''
      };
    });
  };

  const generateReceiptId = () => 'RCP' + Date.now().toString().slice(-8);

  const handleBookingComplete = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phoneNumber || !formData.discountPrice || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }
    if (formData.suggestions.includes(deliveryOption) && !formData.address.trim()) {
      alert('Please enter the address for home delivery.');
      return;
    }
    if (!isAuthenticated || !authenticatedUserEmail) {
      onClose();
      return;
    }

    const receiptId = generateReceiptId();
    try {
      await updateMurtiHistory({
        variables: {
          _eq: parseInt(bappa.id),
          booked_by: authenticatedUserEmail,
          booking_status: 'booked',
          address: formData.address.trim() || null,
          customer_email: formData.email || '',
          customer_name: formData.fullName,
          customer_phone: parseFloat(formData.phoneNumber),
          date: getCurrentDbDate(),
          discount_price: Number(formData.discountPrice),
          paid_amount: parseFloat(formData.amount),
          payment_mode: formData.paymentMode,
          suggestions: formData.suggestions.join(', ')
        }
      });

      onBookingComplete({
        ...formData,
        receiptId,
        bappaName: bappa.name
      });

    } catch (error) {
      console.error('Mutation failed:', error);
      alert('Booking failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Booking Details</h3>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Bappa Info */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-4">
              <img src={bappa.image} alt={bappa.name} className="w-16 h-16 rounded-lg object-contain" />
              <div>
                <h4 className="font-bold text-lg text-gray-600">{bappa.murti_id}</h4>
                <p className="text-gray-600">{bappa.size}</p>
                <p className="font-bold text-green-600">₹{bappa.final_price}</p>
                {/* <p className="text-sm font-medium text-orange-600">Bappa ID: #{bappa.id}</p> */}
              </div>
            </div>
          </div>

          <form onSubmit={handleBookingComplete} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2"><User className="inline w-4 h-4 mr-2" />Full Name *</label>
              <input name="fullName" value={formData.fullName} onChange={handleInputChange} required className="w-full px-4 py-3 border rounded-xl text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2"><Phone className="inline w-4 h-4 mr-2" />Phone Number *</label>
              <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required className="w-full px-4 py-3 border rounded-xl text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2"><Mail className="inline w-4 h-4 mr-2" />Email (optional)</label>
              <input name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-xl text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2"><IndianRupee className="inline w-4 h-4 mr-2" />Discounted Price *</label>
              <input name="discountPrice" value={formData.discountPrice} onChange={handleInputChange} required className="w-full px-4 py-3 border rounded-xl text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2"><Coins className="inline w-4 h-4 mr-2" />Amount Paid</label>
              <input name="amount" value={formData.amount} onChange={handleInputChange} required className="w-full px-4 py-3 border rounded-xl text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-xl text-gray-800 bg-white"
              >
                <option value="Online">Online</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div className="border-t pt-4 mt-4">
              <label className="inline-flex items-center">
                <span className="text-sm text-gray-700 font-medium">Give Your Suggestions</span>
              </label>
              <div className="mt-2 space-y-2">
                {['जानवे काढणे', "हातावर 'श्री' काढणे", colorTouchupOption, deliveryOption].map(option => (
                  <label key={option} className="flex items-center space-x-2">
                    <input type="checkbox" checked={formData.suggestions.includes(option)} onChange={() => handleSuggestionToggle(option)} className="form-checkbox text-orange-600" />
                    <span className="text-gray-700 text-sm">{option}</span>
                  </label>
                ))}
              </div>
              {formData.suggestions.includes(deliveryOption) && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    required
                    className="w-full px-4 py-3 border rounded-xl text-gray-800"
                    placeholder="Enter delivery address"
                  />
                </div>
              )}
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold">Submit Booking Details</button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
