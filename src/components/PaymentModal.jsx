import React, { useState } from 'react';
import { X, User, Phone, Mail, Coins, IndianRupee } from 'lucide-react';
import { gql, useMutation } from '@apollo/client';
import { useAuthenticated, useUserDisplayName, useUserEmail } from '@nhost/react';
import nhost from '../nhost';
import { generateBookingPdf } from '../utils/bookingPdf';

const getCurrentDbDate = () => new Date().toISOString().split('T')[0];

const GET_AD_MESSAGES_UPPER = gql`
  query GetAdvertisementMessagesUpper {
    advertisement_message(order_by: { id: desc }) {
      id
      message
      title: Title
    }
  }
`;

const GET_AD_MESSAGES_LOWER = gql`
  query GetAdvertisementMessagesLower {
    advertisement_message(order_by: { id: desc }) {
      id
      message
      title
    }
  }
`;

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
  const bookingSuggestionOptions = [
    'गणोबा',
    'जानवे काढणे',
    "हातावर 'श्री' काढणे",
    colorTouchupOption,
    deliveryOption,
  ];
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
  const authenticatedDisplayName = useUserDisplayName();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [savedBookingDetails, setSavedBookingDetails] = useState(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);


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

  const getLatestMessageTemplate = async () => {
    try {
      const upperResult = await nhost.graphql.request(GET_AD_MESSAGES_UPPER);
      const records = upperResult?.data?.advertisement_message || upperResult?.advertisement_message || [];
      return records[0] || null;
    } catch (upperError) {
      try {
        const lowerResult = await nhost.graphql.request(GET_AD_MESSAGES_LOWER);
        const records = lowerResult?.data?.advertisement_message || lowerResult?.advertisement_message || [];
        return records[0] || null;
      } catch (lowerError) {
        console.error('Failed to load advertisement message:', lowerError);
        return null;
      }
    }
  };

  const handleSendMessage = async () => {
    if (!savedBookingDetails?.phoneNumber) {
      alert('Phone number not available for this booking.');
      return;
    }

    setIsSendingMessage(true);

    try {
      const selectedTemplate = await getLatestMessageTemplate();
      const digits = String(savedBookingDetails.phoneNumber || '').replace(/\D/g, '');
      const whatsappNumber =
        digits.length === 10 ? `91${digits}` : digits.length === 12 && digits.startsWith('91') ? digits : digits;

      const pdfBappa = {
        ...bappa,
        name: bappa.murti_id || bappa.name,
        price: bappa.final_price,
        fullName: savedBookingDetails.fullName,
        phoneNumber: savedBookingDetails.phoneNumber,
        customer_email: savedBookingDetails.email,
        paid_amount: savedBookingDetails.amount,
        discount_price: savedBookingDetails.discountPrice,
        payment_mode: savedBookingDetails.paymentMode,
        address: savedBookingDetails.address,
        suggestions: savedBookingDetails.suggestions?.join(', '),
        booked_by: authenticatedUserEmail,
        imageUrl: bappa.image,
      };

      let pdfLink = '';

      try {
        const { fileName, blob } = await generateBookingPdf(pdfBappa, { autoSave: false });
        const pdfFile = new File([blob], fileName, { type: 'application/pdf' });
        const { fileMetadata, error } = await nhost.storage.upload({
          file: pdfFile,
          bucketId: 'default',
          name: `booking-pdfs/${Date.now()}_${fileName}`,
        });

        if (error) {
          throw error;
        }

        pdfLink = nhost.storage.getPublicUrl({ fileId: fileMetadata.id });
      } catch (error) {
        console.error('Failed to prepare PDF link:', error);
      }

      const message = [
        selectedTemplate?.title ? `*${selectedTemplate.title}*` : null,
        selectedTemplate?.message || null,
        [
          'Customer Details',
          `Name: ${savedBookingDetails.fullName || '-'}`,
          `Phone: ${savedBookingDetails.phoneNumber || '-'}`,
          `Booked by: ${authenticatedUserEmail || '-'}`,
          savedBookingDetails.address ? `Address: ${savedBookingDetails.address}` : null,
          `Murti: ${bappa.murti_id || bappa.name || '-'}`,
          `Size: ${bappa.size || '-'}`,
        ].filter(Boolean).join('\n'),
        pdfLink ? `PDF Link: ${pdfLink}` : 'PDF link could not be generated automatically.',
        '– *Vidyesh Ganeshmurti*',
        `Message Sent By :- ${authenticatedDisplayName || authenticatedUserEmail || 'Admin'}`,
        'This is an automated message.',
      ]
        .filter(Boolean)
        .join('\n\n');

      window.open(
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
        '_blank',
        'noopener,noreferrer'
      );
    } finally {
      setIsSendingMessage(false);
    }
  };

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
      setSavedBookingDetails({
        ...formData,
        receiptId,
        bappaName: bappa.name,
      });
      setBookingSuccess(true);

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

          {bookingSuccess ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
                <h4 className="text-xl font-bold text-green-700">Booking Successful</h4>
                <p className="mt-2 text-sm text-green-800">
                  Your murti has been booked successfully. You can send the booking message now.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
                <p><span className="font-semibold">Customer:</span> {savedBookingDetails?.fullName || '-'}</p>
                <p><span className="font-semibold">Phone:</span> {savedBookingDetails?.phoneNumber || '-'}</p>
                <p><span className="font-semibold">Murti:</span> {bappa.murti_id || bappa.name || '-'}</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={isSendingMessage}
                  className="w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 py-3 font-bold text-white transition hover:from-green-600 hover:to-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSendingMessage ? 'Preparing Message...' : 'Send Message'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
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
                {bookingSuggestionOptions.map(option => (
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
          )}

        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
