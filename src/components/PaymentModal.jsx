import React, { useState } from 'react';
import { Coins, IndianRupee, Mail, Phone, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { generateBookingPdf } from '../utils/bookingPdf';
import { getFirstImageFileId, loadPdfImageDataUrl } from '../utils/imageData';
import { MURTI_STORED_AT_OPTIONS } from '../constants/murtiOptions';
import { getImageUrl } from '../utils/murti.js';
import { shareBookingMessage } from '../utils/shareBookingMessage.js';

const getCurrentDbDate = () => new Date().toISOString().split('T')[0];

const PaymentModal = ({ bappa, onClose, onBookingComplete }) => {
  const deliveryOption = 'घरपोच सेवा (शुल्क लागू)';
  const bookingSuggestionOptions = [
    'गणोबा',
    'जानवे काढणे',
    "हातावर 'श्री' काढणे",
    'कलर टचअप',
    deliveryOption,
  ];
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    discountPrice: bappa?.discount_price || bappa?.final_price || '',
    amount: '',
    paymentMode: 'Online',
    stored_at: bappa?.stored_at || '',
    address: '',
    suggestions: [],
  });
  const { isAuthenticated, user } = useAuth();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [savedBookingDetails, setSavedBookingDetails] = useState(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSuggestionToggle = (option) => {
    setFormData((prev) => {
      const exists = prev.suggestions.includes(option);
      const suggestions = exists ? prev.suggestions.filter((item) => item !== option) : [...prev.suggestions, option];
      return {
        ...prev,
        suggestions,
        address: suggestions.includes(deliveryOption) ? prev.address : '',
      };
    });
  };

  const getLatestMessageTemplate = async () => {
    try {
      const response = await api.get("/advertisements/latest");
      return response.data || null;
    } catch (error) {
      console.error('Failed to load advertisement message:', error);
      return null;
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

      const imageFileId = getFirstImageFileId(bappa);
      const imageDataUrl = await loadPdfImageDataUrl({ fileId: imageFileId, url: bappa.image });

      const { blob, fileName } = await generateBookingPdf(
        {
          ...bappa,
          name: bappa.murti_id || bappa.name,
          booking_status: bappa.booking_status || 'booked',
          price: bappa.final_price,
          fullName: savedBookingDetails.fullName,
          phoneNumber: savedBookingDetails.phoneNumber,
          customer_email: savedBookingDetails.email,
          paid_amount: savedBookingDetails.amount,
          discount_price: savedBookingDetails.discountPrice,
          payment_mode: savedBookingDetails.paymentMode,
          stored_at: savedBookingDetails.stored_at,
          address: savedBookingDetails.address,
          suggestions: savedBookingDetails.suggestions?.join(', '),
          booked_by: user?.email,
          imageUrl: getImageUrl(bappa.image),
          imageDataUrl,
        },
        { autoSave: false }
      );

      const message = [
        selectedTemplate?.title ? `*${selectedTemplate.title}*` : null,
        selectedTemplate?.message || null,
        [
          'Customer Details',
          `Name: ${savedBookingDetails.fullName || '-'}`,
          `Phone: ${savedBookingDetails.phoneNumber || '-'}`,
          `Booked by: ${user?.email || '-'}`,
          savedBookingDetails.address ? `Address: ${savedBookingDetails.address}` : null,
          `Murti: ${bappa.murti_id || bappa.name || '-'}`,
          `Size: ${bappa.size || '-'}`,
        ].filter(Boolean).join('\n'),
        '– *Vidyesh Ganeshmurti*',
        `Message Sent By :- ${user?.name || user?.email || 'Admin'}`,
        'This is an automated message.',
      ]
        .filter(Boolean)
        .join('\n\n');

      await shareBookingMessage({
        blob,
        fileName,
        message,
        whatsappNumber,
      });
    } catch (error) {
      console.error('Failed to prepare booking message:', error);
      alert('Could not prepare the booking message. Please try again.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleBookingCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phoneNumber || !formData.discountPrice || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }
    if (formData.suggestions.includes(deliveryOption) && !formData.address.trim()) {
      alert('Please enter the address for home delivery.');
      return;
    }
    if (!isAuthenticated || !user?.email) {
      onClose();
      return;
    }

    try {
      await api.patch(`/murtis/${bappa.id}/booking`, {
        booked_by: user.email,
        booking_status: 'booked',
        address: formData.address.trim() || null,
        customer_email: formData.email.trim() || null,
        customer_name: formData.fullName,
        customer_phone: formData.phoneNumber,
        booking_date: getCurrentDbDate(),
        discount_price: Number(formData.discountPrice),
        paid_amount: Number(formData.amount),
        payment_mode: formData.paymentMode,
        suggestions: formData.suggestions.length > 0 ? formData.suggestions.join(', ') : null,
        stored_at: formData.stored_at || null,
      });

      setSavedBookingDetails({ ...formData, bappaName: bappa.name });
      setBookingSuccess(true);
      await onBookingComplete();
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white">
        <div className="sticky top-0 flex items-center justify-between bg-gradient-to-r from-orange-500 to-red-500 p-4">
          <h3 className="text-xl font-bold text-white">Booking Details</h3>
          <button onClick={onClose} className="rounded-full p-2 text-white hover:bg-white hover:bg-opacity-20">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 p-4">
            <div className="flex items-center space-x-4">
              <img src={getImageUrl(bappa.image)} alt={bappa.name} className="h-16 w-16 rounded-lg object-contain" />
              <div>
                <h4 className="text-lg font-bold text-gray-600">{bappa.murti_id}</h4>
                <p className="text-gray-600">{bappa.size}</p>
                <p className="font-bold text-green-600">₹{bappa.final_price}</p>
              </div>
            </div>
          </div>

          {bookingSuccess ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
                <h4 className="text-xl font-bold text-green-700">Booking Successful</h4>
                <p className="mt-2 text-sm text-green-800">Your murti has been booked successfully. You can send the booking message now.</p>
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
            <form onSubmit={handleBookingCompleteSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700"><User className="mr-2 inline h-4 w-4" />Full Name *</label>
                <input name="fullName" value={formData.fullName} onChange={handleInputChange} required className="w-full rounded-xl border px-4 py-3 text-gray-800" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700"><Phone className="mr-2 inline h-4 w-4" />Phone Number *</label>
                <input name="phoneNumber" type="tel" inputMode="numeric" pattern="[0-9]*" value={formData.phoneNumber} onChange={handleInputChange} required className="w-full rounded-xl border px-4 py-3 text-gray-800" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700"><Mail className="mr-2 inline h-4 w-4" />Email (optional)</label>
                <input name="email" value={formData.email} onChange={handleInputChange} className="w-full rounded-xl border px-4 py-3 text-gray-800" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700"><IndianRupee className="mr-2 inline h-4 w-4" />Discounted Price *</label>
                <input name="discountPrice" type="text" inputMode="decimal" value={formData.discountPrice} onChange={handleInputChange} required className="w-full rounded-xl border px-4 py-3 text-gray-800" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700"><Coins className="mr-2 inline h-4 w-4" />Amount Paid</label>
                <input name="amount" type="text" inputMode="decimal" value={formData.amount} onChange={handleInputChange} required className="w-full rounded-xl border px-4 py-3 text-gray-800" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Payment Mode</label>
                <select name="paymentMode" value={formData.paymentMode} onChange={handleInputChange} className="w-full rounded-xl border bg-white px-4 py-3 text-gray-800">
                  <option value="Online">Online</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Murti will be stored at</label>
                <select name="stored_at" value={formData.stored_at} onChange={handleInputChange} className="w-full rounded-xl border bg-white px-4 py-3 text-gray-800">
                  <option value="">Select Storage Location</option>
                  {MURTI_STORED_AT_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="mt-4 border-t pt-4">
                <span className="text-sm font-medium text-gray-700">Give Your Suggestions</span>
                <div className="mt-2 space-y-2">
                  {bookingSuggestionOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input type="checkbox" checked={formData.suggestions.includes(option)} onChange={() => handleSuggestionToggle(option)} className="form-checkbox text-orange-600" />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {formData.suggestions.includes(deliveryOption) && (
                  <div className="mt-3">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Delivery Address *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      required
                      className="w-full rounded-xl border px-4 py-3 text-gray-800"
                      placeholder="Enter delivery address"
                    />
                  </div>
                )}
              </div>
              <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-500 py-3 font-bold text-white">Submit Booking Details</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
