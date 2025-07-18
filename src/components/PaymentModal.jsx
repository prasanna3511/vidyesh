// import React, { useState } from 'react';
// import { X, QrCode, Check, Download, Upload, User, Phone, Mail ,Coins} from 'lucide-react';
// import jsPDF from 'jspdf';
// import qrImage from '../assets/qr.jpeg';
// import { gql, useMutation } from '@apollo/client';


// const UPDATE_MURTI_HISTORY = gql`
//   mutation UpdateMurtiHistory(
//     $_eq: Int!,
//     $booked_by: String!,
//     $booking_status: String!,
//     $customer_email: String!,
//     $customer_name: String!,
//     $customer_phone: numeric!,
//     $paid_amount: numeric!,
//     $paid_amount_sc: String!,
//     $suggestions: String!
//   ) {
//     update_murti_history(
//       where: { id: { _eq: $_eq } },
//       _set: {
//         booked_by: $booked_by,
//         booking_status: $booking_status,
//         customer_email: $customer_email,
//         customer_name: $customer_name,
//         customer_phone: $customer_phone,
//         paid_amount: $paid_amount,
//         paid_amount_sc: $paid_amount_sc,
//         suggestions: $suggestions
//       }
//     ) {
//       affected_rows
//     }
//   }
// `;

// const PaymentModal = ({ bappa, onClose, onBookingComplete }) => {
//   const [step, setStep] = useState('qr'); // 'qr', 'form', 'receipt'
//   const [formData, setFormData] = useState({
//     fullName: '',
//     phoneNumber: '',
//     email: '',
//     paymentScreenshot: null,
//     amount:'',
//     suggestions: [],
//     suggestionsEnabled: false  
//   });
//   const [updateMurtiHistory] = useMutation(UPDATE_MURTI_HISTORY);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData(prev => ({
//         ...prev,
//         paymentScreenshot: file
//       }));
//     }
//   };

//   const handleCheckboxChange = (e) => {
//     const { checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       suggestionsEnabled: checked,
//       suggestions: checked ? prev.suggestions : [] // reset if unchecked
//     }));
//   };
  
//   const handleSuggestionToggle = (option) => {
//     setFormData(prev => {
//       const alreadySelected = prev.suggestions.includes(option);
//       return {
//         ...prev,
//         suggestions: alreadySelected
//           ? prev.suggestions.filter(item => item !== option)
//           : [...prev.suggestions, option]
//       };
//     });
//   };
  

//   const generateReceiptId = () => {
//     return 'RCP' + Date.now().toString().slice(-8);
//   };

//   const downloadReceipt = () => {
//     const receiptId = generateReceiptId();
//     const doc = new jsPDF();
    
//     // Header
//     doc.setFillColor(255, 107, 53);
//     doc.rect(0, 0, 210, 40, 'F');
    
//     doc.setTextColor(255, 255, 255);
//     doc.setFontSize(24);
//     doc.text('🙏 Ganpati Bappa Booking Receipt 🙏', 105, 25, { align: 'center' });
    
//     // Content
//     doc.setTextColor(0, 0, 0);
//     doc.setFontSize(16);
    
//     let y = 60;
//     doc.text('Booking Details:', 20, y);
//     y += 15;
    
//     doc.setFontSize(12);
//     doc.text(`Receipt ID: ${receiptId}`, 20, y);
//     y += 10;
//     doc.text(`Ganpati Bappa ID: #${bappa.id}`, 20, y);
//     y += 10;
//     doc.text(`Bappa Name: ${bappa.name}`, 20, y);
//     y += 10;
//     doc.text(`Size: ${bappa.size}`, 20, y);
//     y += 10;
//     doc.text(`Amount: ₹${bappa.final_price}`, 20, y);
//     y += 20;
    
//     doc.text('Customer Details:', 20, y);
//     y += 15;
//     doc.text(`Name: ${formData.fullName}`, 20, y);
//     y += 10;
//     doc.text(`Phone: ${formData.phoneNumber}`, 20, y);
//     y += 10;
//     if (formData.email) {
//       doc.text(`Email: ${formData.email}`, 20, y);
//       y += 10;
//     }
//     doc.text(`Booking Date: ${new Date().toLocaleDateString()}`, 20, y);
    
//     // Footer
//     y += 30;
//     doc.setFontSize(10);
//     doc.text('Thank you for your booking! May Ganpati Bappa bless you with prosperity.', 105, y, { align: 'center' });
    
//     doc.save(`Ganpati-Booking-${receiptId}.pdf`);
//   };

//   const handleFormSubmit = (e) => {
//     e.preventDefault();
//     if (!formData.fullName || !formData.phoneNumber || !formData.amount ) {
//       alert('Please fill in all required fields');
//       return;
//     }
//     setStep('receipt');
//   };

//   const handleBookingComplete = () => {
//     const receiptId = generateReceiptId();
//     onBookingComplete({
//       ...formData,
//       receiptId,
//       bappaName: bappa.name
//     });
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//         <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-4 flex items-center justify-between">
//           <h3 className="text-xl font-bold text-white">
//             {step === 'qr' && 'Payment QR Code'}
//             {step === 'form' && 'Booking Details'}
//             {step === 'receipt' && 'Download Receipt'}
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         <div className="p-6">
//           {/* Bappa Info */}
//           <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-6">
//             <div className="flex items-center space-x-4">
//               <img
//                 src={bappa.image}
//                 alt={bappa.name}
//                 className="w-16 h-16 rounded-lg object-contain"
//               />
//               <div>
//                 <h4 className="font-bold text-lg">{bappa.name}</h4>
//                 <p className="text-gray-600">{bappa.size}</p>
//                 <p className="font-bold text-green-600">₹{bappa.final_price}</p>
//                 <p className="text-sm font-medium text-orange-600">Bappa ID: #{bappa.id}</p>
//               </div>
//             </div>
//           </div>

//           {/* QR Code Step */}
//           {step === 'qr' && (
//             <div className="text-center space-y-6">
//               <div className="bg-gray-100 rounded-xl p-8 mx-auto inline-block">
//                 {/* <QrCode className="h-32 w-32 text-gray-400 mx-auto" /> */}
//                 {/* <img source='../assets/qr.jpeg' /> */}
//                 <img src={qrImage} alt="QR Code" className="w-40 h-40 object-cover mx-auto" />

//                 <p className="text-sm text-gray-500 mt-2">Scan to pay</p>
//               </div>
//               <p className="text-gray-600">
//                 Scan the QR code to make payment and proceed to the next step
//               </p>
//               <button
//                 onClick={() => setStep('form')}
//                 className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center space-x-2"
//               >
//                 {/* <Check className="h-5 w-5" /> */}
//                 <span>Payment Completed ?</span>
//               </button>
//             </div>
//           )}

//           {/* Form Step */}
//           {step === 'form' && (
//             <form onSubmit={handleFormSubmit} className="space-y-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <User className="h-4 w-4 inline mr-2" />
//                   Full Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={formData.fullName}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-gray-800"
//                   placeholder="Enter your full name"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <Phone className="h-4 w-4 inline mr-2" />
//                   Phone Number *
//                 </label>
//                 <input
//                   type="tel"
//                   name="phoneNumber"
//                   value={formData.phoneNumber}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full text-gray-800 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
//                   placeholder="Enter your phone number"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <Mail className="h-4 w-4 inline mr-2" />
//                   Email Address (Optional)
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   className="w-full text-gray-800 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
//                   placeholder="Enter your email"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   {/* <Phone className="h-4 w-4 inline mr-2" /> */}
//                   {/* <BanknoteArrowUp /> */}
//                   <Coins className="h-4 w-4 inline mr-2" />
//                   Amount Paid
//                 </label>
//                 <input
//                   // type="tel"
//                   name="amount"
//                   value={formData.amount}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full text-gray-800 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
//                   placeholder="Enter amount paid"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <Upload className="h-4 w-4 inline mr-2" />
//                   Payment Screenshot
//                 </label>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileChange}
//                   className="w-full px-4 text-gray-800 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
//                 />
//                 {formData.paymentScreenshot && (
//                   <p className="text-sm text-green-600 mt-2">
//                     ✓ {formData.paymentScreenshot.name}
//                   </p>
//                 )}
//               </div>
//               <div className="border-t pt-4 mt-4">
//   <label className="inline-flex items-center">
//     <input
//       type="checkbox"
//       checked={formData.suggestionsEnabled}
//       onChange={handleCheckboxChange}
//       className="form-checkbox text-orange-600 mr-2"
//     />
//     <span className="text-sm text-gray-700 font-medium">Give Your Suggestions</span>
//   </label>

//   {formData.suggestionsEnabled && (
//     <div className="mt-4 space-y-2">
//       {['जानवे काढणे', "हातावर 'श्री / ॐ'  काढणे", 'घरपोच सेवा (शुल्क लागू)'].map((option) => (
//         <label key={option} className="flex items-center space-x-2">
//           <input
//             type="checkbox"
//             checked={formData.suggestions.includes(option)}
//             onChange={() => handleSuggestionToggle(option)}
//             className="form-checkbox text-orange-600"
//           />
//           <span className="text-gray-700 text-sm">{option}</span>
//         </label>
//       ))}
//     </div>
//   )}
// </div>


//               <button
//                 type="submit"
//                 className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
//               >
//                 Submit Booking Details
//               </button>
//             </form>
//           )}

//           {/* Receipt Step */}
//           {step === 'receipt' && (
//             <div className="text-center space-y-6">
//               <div className="bg-green-50 border border-green-200 rounded-xl p-6">
//                 <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
//                 <h4 className="text-xl font-bold text-green-700 mb-2">Booking Confirmed!</h4>
//                 <p className="text-green-600">Your Ganpati Bappa has been successfully booked.</p>
//               </div>

//               <button
//                 onClick={downloadReceipt}
//                 className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 mb-4"
//               >
//                 <Download className="h-5 w-5" />
//                 <span>Download Receipt</span>
//               </button>

//               <button
//                 onClick={handleBookingComplete}
//                 className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300"
//               >
//                 Complete Booking
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentModal;


import React, { useState } from 'react';
import { X, Check, Download, Upload, User, Phone, Mail, Coins, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import qrImage from '../assets/qr.jpeg';
import { gql, useMutation } from '@apollo/client';
import { saveAs } from 'file-saver';
import { useAuthenticated } from '@nhost/react';


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
          paid_amount_sc: isAuthenticated ?"" :(formData.paymentScreenshot?.name || ''),
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
                <img src={qrImage} alt="QR Code" className="w-40 h-40 object-cover mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Scan to pay</p>
              {/* <button onClick={() => setStep('form')} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold"> */}
              <a
  href="upi://pay?pa=9420342516-1@okbizaxis&pn=SARVESH%20PANDURANG%20JOSHI%20U%2FG%20PANDURANG%20GURURAJ%20JOSHI&mc=5970&aid=uGICAgKDLx9zzOw&ver=01&mode=01&tr=BCR2DN7T6PW74XI"
  target="_blank"
  rel="noopener noreferrer"
  className="w-full block bg-green-600 text-white py-3 rounded-xl font-bold text-center mt-4"
>
  Pay via UPI App
</a>

{isAuthenticated && (
  <button
    onClick={() => setStep('form')}
    className="mt-3 mb-1 w-full py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow"
  >
    Cash Payment
  </button>
)}
              {/* </button> */}
              </div>
              {/* <p className="text-gray-600">Scan the QR code to make payment or Pay Via</p> */}
              <button onClick={() => setStep('form')} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">
                Have you Completed with Payment ?
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
                    {['जानवे काढणे', "हातावर 'श्री / ॐ'  काढणे", 'घरपोच सेवा (शुल्क लागू)'].map(option => (
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
        Thank you!
      </p>
    </div>

    {/* <button
      onClick={downloadReceipt}
      className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
    >
      Download Receipt
    </button> */}
<button
  onClick={handleDownloadImage}
  className="mt-2 text-sm text-blue-600 underline hover:text-blue-800"
>
  Download Image
</button>

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
