import React, { useState } from 'react';
import { X, Check, Download, Upload, User, Phone, Mail, Coins, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import qrImage from '../assets/qr.jpeg';
import { gql, useMutation } from '@apollo/client';
import { saveAs } from 'file-saver';
import { useAuthenticated } from '@nhost/react';
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
  const [step, setStep] = useState('qr');
  const [copied, setCopied] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

console.log("ohhhshhshshss : ",bappa)
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
  const handleDownloadImage = async () => {
    try {
      const response = await fetch(bappa.image, {
        mode: 'no-cors'
      });
      // Note: no-cors mode gives you an opaque response, so you can't access the blob
      // This approach won't work for file-saver
      
      // Fallback to direct download
      const link = document.createElement('a');
      link.href = bappa.image;
      link.download = `${bappa.name?.replace(/\s+/g, '_') || 'Ganpati_Bappa'}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(bappa.image, '_blank');
    }
  };
  
  
  
  
  
  const handleCheckboxChange = (e) => {
    const { checked } = e.target;
    setFormData(prev => ({
      ...prev,
      suggestionsEnabled: checked,
      suggestions: checked ? prev.suggestions : []
    }));
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

  const downloadReceipt = () => {
    const receiptId = generateReceiptId();
    const doc = new jsPDF();
    doc.setFillColor(255, 107, 53);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('🙏 Ganpati Bappa Booking Receipt 🙏', 105, 25, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    let y = 60;
    doc.text('Booking Details:', 20, y); y += 15;
    doc.setFontSize(12);
    doc.text(`Receipt ID: ${receiptId}`, 20, y); y += 10;
    doc.text(`Ganpati Bappa ID: #${bappa.id}`, 20, y); y += 10;
    doc.text(`Bappa Name: ${bappa.name}`, 20, y); y += 10;
    doc.text(`Size: ${bappa.size}`, 20, y); y += 10;
    doc.text(`Amount: ₹${bappa.final_price}`, 20, y); y += 20;
    doc.text('Customer Details:', 20, y); y += 15;
    doc.text(`Name: ${formData.fullName}`, 20, y); y += 10;
    doc.text(`Phone: ${formData.phoneNumber}`, 20, y); y += 10;
    if (formData.email) {
      doc.text(`Email: ${formData.email}`, 20, y); y += 10;
    }
    doc.text(`Booking Date: ${new Date().toLocaleDateString()}`, 20, y); y += 30;
    doc.setFontSize(10);
    doc.text('Thank you for your booking! May Ganpati Bappa bless you with prosperity.', 105, y, { align: 'center' });
    doc.save(`Ganpati-Booking-${receiptId}.pdf`);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phoneNumber || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }
    setStep('receipt');
  };

  const handleBookingComplete = async () => {
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
          booked_by: 'Customer',
          booking_status: isAuthenticated? 'booked':'pending',
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
            {step === 'qr' && 'Payment QR Code'}
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

          {/* QR Step */}
          {step === 'qr' && (
            <div className="text-center space-y-6">
              <div className="bg-gray-100 rounded-xl p-8 mx-auto inline-block">
              <p className="text-md text-gray-900 mt-2 mb-2">Please take screenshot after payment</p>
              <p className="text-sm text-gray-900 mt-2 mb-2">Min Advance payment amount : ₹ 200</p>

                <img src={qrImage} alt="QR Code" className="w-40 h-40 object-cover mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Scan to pay</p>
              {/* <button onClick={() => setStep('form')} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold"> */}
              {/* <a
  href="https://razorpay.me/@vidyeshganeshmurti"
  target="_blank"
  rel="noopener noreferrer"
  className="w-full block bg-green-600 text-white py-3 rounded-xl font-bold text-center mt-4"
>
  Pay via UPI App
</a> */}
<p className="text-sm text-gray-600 mt-2">UPI ID: <span className="font-mono">9420342516-1@okbizaxis</span></p>

<button
  onClick={() => {
    navigator.clipboard.writeText("9420342516-1@okbizaxis");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }}
  className="w-full block bg-green-600 text-white py-3 rounded-xl font-bold text-center mt-4"
>
  {copied ? "UPI ID Copied ✅" : "Click to copy upi id"}
</button>

{isAuthenticated && (
  <button
    onClick={() => setStep('form')}
    className="mt-3 mb-1 w-full py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow"
  >
    Cash Payment
  </button>
)}
<div className="mt-4 flex items-start space-x-2">
  <input
    type="checkbox"
    id="terms"
    checked={termsAccepted}
    onChange={(e) => setTermsAccepted(e.target.checked)}
    className="mt-1"
  />
  <label htmlFor="terms" className="text-sm text-gray-700">
    I accept the{' '}
    {/* <button
      type="button"
      // terms_conditions
      onClick={() => window.open('../../public/terms_conditions.pdf', '_blank')}
      className="text-blue-600 underline"
    >
      Terms & Conditions
    </button> */}
    <button
  type="button"
  onClick={() => setShowTermsModal(true)}
  className="text-blue-600 underline"
>
  Terms & Conditions
</button>

  </label>
</div>

              {/* </button> */}
              </div>
              {/* <p className="text-gray-600">Scan the QR code to make payment or Pay Via</p> */}
              <button onClick={() => setStep('form')}
                className={`w-full py-3 rounded-xl font-bold transition-colors duration-200
                ${termsAccepted ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500'}
              `}
               disabled={!termsAccepted}
               >
              Click here if Payment is done ?
              </button>
            </div>
          )}

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
      {showTermsModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
    <div className="bg-white max-w-4xl w-full max-h-[90vh] rounded-2xl p-6 overflow-y-auto relative shadow-xl">
      <button
        onClick={() => setShowTermsModal(false)}
        className="absolute top-3 right-3 text-gray-600 hover:text-black"
      >
        <X className="w-5 h-5" />
      </button>

      <h2 className="text-2xl font-bold mb-4 text-center">
        Terms & Conditions – Vidyesh Ganeshmurti, Sangli (English)
      </h2>

      <div className="text-sm text-gray-800 space-y-4">
        <div>
          <h3 className="font-semibold">1. Booking Procedure</h3>
          <ul className="list-disc ml-6">
            <li>Bookings are accepted only through our official website or physically at our shop.</li>
            <li>The booking process includes: selecting idol by height, advance payment, and customer details.</li>
            <li>Online bookings require advance payment via UPI.</li>
            <li>Cash payments are accepted only at the shop.</li>
            <li>Customers must verify idol size fits their space before booking.</li>
            <li>Minimum advance is ₹200 for online bookings.</li>
            <li>Booking is “Approval Pending” until manually verified.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">2. Booking Confirmation & Idol Availability</h3>
          <ul className="list-disc ml-6">
            <li>Booking is not confirmed immediately after payment.</li>
            <li>Displayed idols are subject to availability.</li>
            <li>Physical bookings take priority over online bookings.</li>
            <li>If the idol becomes unavailable, alternatives or refund will be offered.</li>
            <li>Confirmation will be communicated after verification via SMS, WhatsApp, or call.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">3. Payment Terms</h3>
          <ul className="list-disc ml-6">
            <li>Online: UPI, Net Banking, Debit/Credit Cards (others on request).</li>
            <li>In-shop: Cash and UPI.</li>
            <li>Payment gateway charges are borne by the customer.</li>
            <li>Partial payments allowed; full payment before pickup required.</li>
            <li>No refund for personal change of mind.</li>
            <li>Retain receipts for confirmation in case of failed payment.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">4. GST Exemption</h3>
          <ul className="list-disc ml-6">
            <li>All idols are handmade from Shadu Mati.</li>
            <li>No GST is charged as per GST Notification No. 2/2017.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">5. Change of Booked Idol</h3>
          <ul className="list-disc ml-6">
            <li>Idol can be changed only once before 21st August 2025, 8 PM.</li>
            <li>No changes allowed after this deadline.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">6. Pickup & Delivery</h3>
          <ul className="list-disc ml-6">
            <li>Pickup or home delivery (charges apply) available.</li>
            <li>Delivery Date: 26th August 2025.</li>
            <li>Regular Pickup: 26th or 27th August 2025.</li>
            <li>Early pickup must be requested 2 days prior.</li>
            <li>Last pickup date: 28th August 2025.</li>
            <li>No show or communication = forfeiture without refund.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">7. Idol Specifications</h3>
          <ul className="list-disc ml-6">
            <li>Handmade using Shadu Mati; minor variations possible.</li>
            <li>Photos are real but colors may vary due to lighting/cameras.</li>
            <li>Inspect idol personally before pickup.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">8. Packaging Responsibility</h3>
          <ul className="list-disc ml-6">
            <li>Basic plastic cover provided.</li>
            <li>Bring your own baskets/thali/support for safe transport.</li>
            <li>We are not responsible for post-handover damage.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">9. Damage Policy</h3>
          <ul className="list-disc ml-6">
            <li>Only major damage by us before delivery qualifies for refund/replacement.</li>
            <li>Minor chips/scratches are normal and non-refundable.</li>
            <li>Inspect idol during pickup/delivery. No later complaints accepted.</li>
            <li>If major damage: choose alternate idol or full refund if none available.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">10. Cancellations & Refunds</h3>
          <ul className="list-disc ml-6">
            <li>No cancellations after confirmation.</li>
            <li>Advance is non-refundable except if we fail to provide idol or if damaged by us and you reject replacement.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">11. Use of Customer Information</h3>
          <ul className="list-disc ml-6">
            <li>Customer info used only for communication and delivery.</li>
            <li>No third-party sharing.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">12. Force Majeure</h3>
          <p>We are not responsible for delays or cancellations due to events beyond our control.</p>
        </div>

        <div>
          <h3 className="font-semibold">13. Jurisdiction</h3>
          <p>All disputes fall under Sangli, Maharashtra jurisdiction.</p>
        </div>
      </div>

      <div className="text-right mt-6">
        <button
          onClick={() => setShowTermsModal(false)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default PaymentModal;
