import React, { useState } from 'react';
import { X, Upload, User, Phone, Mail, Coins, Clock } from 'lucide-react';
import { gql, useMutation } from '@apollo/client';
import { useAuthenticated, useUserEmail } from '@nhost/react';
// const { storage } = await import('@nhost/nhost');
import  nhost from '../nhost';
// import pdf from '../../public/'

const UPDATE_MURTI_HISTORY = gql`
  mutation UpdateMurtiHistory(
    $_eq: Int!,
    $booked_by: String!,
    $booking_status: String!,
    $customer_email: String!,
    $customer_name: String!,
    $customer_phone: numeric!,
    $paid_amount: numeric!,
    $paid_amount_sc: String!,
    $suggestions: String!
  ) {
    update_murti_history(
      where: { id: { _eq: $_eq } },
      _set: {
        booked_by: $booked_by,
        booking_status: $booking_status,
        customer_email: $customer_email,
        customer_name: $customer_name,
        customer_phone: $customer_phone,
        paid_amount: $paid_amount,
        paid_amount_sc: $paid_amount_sc,
        suggestions: $suggestions
      }
    ) {
      affected_rows
    }
  }
`;

const PaymentModal = ({ bappa, onClose, onBookingComplete }) => {
  const [step, setStep] = useState('form');

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    paymentScreenshot: null,
    amount: '',
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, paymentScreenshot: file }));
    }
  };

  const handleSuggestionToggle = (option) => {
    setFormData(prev => {
      const exists = prev.suggestions.includes(option);
      return {
        ...prev,
        suggestions: exists
          ? prev.suggestions.filter(item => item !== option)
          : [...prev.suggestions, option]
      };
    });
  };

  const generateReceiptId = () => 'RCP' + Date.now().toString().slice(-8);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phoneNumber || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }
    setStep('receipt');
  };

  const handleBookingComplete = async () => {
    if (!isAuthenticated || !authenticatedUserEmail) {
      onClose();
      return;
    }

    const receiptId = generateReceiptId();
    let uploadedScreenshotUrl = "";

    // Upload screenshot if available and user is not authenticated
    if (formData.paymentScreenshot && !isAuthenticated) {
      const file = formData.paymentScreenshot;

      // // Get access to storage client

      // const nhost = storage.getNhostClient();

      const { fileMetadata, error } = await nhost.storage.upload({
        file,
        bucketId: 'default', // or use a custom bucket name if defined
        name: `screenshots/${Date.now()}_${file.name}`
      });

      if (error) {
        throw new Error("Screenshot upload failed.");
      }

      uploadedScreenshotUrl = fileMetadata?.id || ''; // or fileMetadata.url if available
    }
    try {
      await updateMurtiHistory({
        variables: {
          _eq: parseInt(bappa.id),
          booked_by: authenticatedUserEmail,
          booking_status: 'booked',
          customer_email: formData.email || '',
          customer_name: formData.fullName,
          customer_phone: parseFloat(formData.phoneNumber),
          paid_amount: parseFloat(formData.amount),
          paid_amount_sc: isAuthenticated ?"" :(uploadedScreenshotUrl || ''),
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
          <h3 className="text-xl font-bold text-white">
            {step === 'form' && 'Booking Details'}
            {step === 'receipt' && 'Download Receipt'}
          </h3>
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

          {/* Form Step */}
          {step === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-6">
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
                <label className="block text-sm font-medium text-gray-700 mb-2"><Coins className="inline w-4 h-4 mr-2" />Amount Paid</label>
                <input name="amount" value={formData.amount} onChange={handleInputChange} required className="w-full px-4 py-3 border rounded-xl text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><Upload className="inline w-4 h-4 mr-2" />Payment Screenshot</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full px-4 py-3 border rounded-xl text-gray-800" />
                {formData.paymentScreenshot && <p className="text-sm text-green-600 mt-2">✓ {formData.paymentScreenshot.name}</p>}
              </div>
              <div className="border-t pt-4 mt-4">
                <label className="inline-flex items-center">
                  {/* <input type="checkbox" checked={formData.suggestionsEnabled} onChange={handleCheckboxChange} className="form-checkbox text-orange-600 mr-2" /> */}
                  <span className="text-sm text-gray-700 font-medium">Give Your Suggestions</span>
                </label>
                {/* {formData.suggestionsEnabled && ( */}
                  <div className="mt-2 space-y-2">
                    {['जानवे काढणे', "हातावर 'श्री' काढणे", 'घरपोच सेवा (शुल्क लागू)'].map(option => (
                      <label key={option} className="flex items-center space-x-2">
                        <input type="checkbox" checked={formData.suggestions.includes(option)} onChange={() => handleSuggestionToggle(option)} className="form-checkbox text-orange-600" />
                        <span className="text-gray-700 text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                {/* )} */}
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold">Submit Booking Details</button>
            </form>
          )}

          {/* Receipt Step */}
          {/* {step === 'receipt' && (
            <div className="text-center space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-green-700 mb-2">Booking Confirmed!</h4>
                <p className="text-green-600">Your Ganpati Bappa has been successfully booked.</p>
              </div>
              <button onClick={downloadReceipt} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Download Receipt</button>
              <button onClick={handleBookingComplete} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">Complete Booking</button>
            </div>
          )} */}
          {step === 'receipt' && (
  <div className="text-center space-y-6">
    <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6">
      <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
      <h4 className="text-xl font-bold text-yellow-700 mb-2">Waiting for Approval</h4>
      <p className="text-yellow-600">
        Your booking request has been sent for approval. We will contact you on WhatsApp shortly.
      </p>
      <p className="text-yellow-600">
        Booking will be approved in next 3 working hours
      </p>
      <p className="text-yellow-600">
        Thank you!
      </p>
    </div>

    {/* <button
      onClick={downloadReceipt}
      className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
    >
      Download Receipt
    </button> */}
{/* <button
  onClick={handleDownloadImage}
  className="mt-2 text-sm text-blue-600 underline hover:text-blue-800"
>
View image of your murti
</button> */}

    <button
      onClick={handleBookingComplete}
      className="w-full bg-green-600 text-white py-3 rounded-xl font-bold"
    >
     Done
    </button>
  </div>
)}

        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
