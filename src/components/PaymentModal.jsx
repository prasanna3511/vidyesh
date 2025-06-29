import React, { useState } from 'react';
import { X, QrCode, Check, Download, Upload, User, Phone, Mail } from 'lucide-react';
import jsPDF from 'jspdf';

const PaymentModal = ({ bappa, onClose, onBookingComplete }) => {
  const [step, setStep] = useState('qr'); // 'qr', 'form', 'receipt'
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    paymentScreenshot: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        paymentScreenshot: file
      }));
    }
  };

  const generateReceiptId = () => {
    return 'RCP' + Date.now().toString().slice(-8);
  };

  const downloadReceipt = () => {
    const receiptId = generateReceiptId();
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(255, 107, 53);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('🙏 Ganpati Bappa Booking Receipt 🙏', 105, 25, { align: 'center' });
    
    // Content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    
    let y = 60;
    doc.text('Booking Details:', 20, y);
    y += 15;
    
    doc.setFontSize(12);
    doc.text(`Receipt ID: ${receiptId}`, 20, y);
    y += 10;
    doc.text(`Ganpati Bappa ID: #${bappa.id}`, 20, y);
    y += 10;
    doc.text(`Bappa Name: ${bappa.name}`, 20, y);
    y += 10;
    doc.text(`Size: ${bappa.size}`, 20, y);
    y += 10;
    doc.text(`Amount: ₹${bappa.price.toLocaleString()}`, 20, y);
    y += 20;
    
    doc.text('Customer Details:', 20, y);
    y += 15;
    doc.text(`Name: ${formData.fullName}`, 20, y);
    y += 10;
    doc.text(`Phone: ${formData.phoneNumber}`, 20, y);
    y += 10;
    if (formData.email) {
      doc.text(`Email: ${formData.email}`, 20, y);
      y += 10;
    }
    doc.text(`Booking Date: ${new Date().toLocaleDateString()}`, 20, y);
    
    // Footer
    y += 30;
    doc.setFontSize(10);
    doc.text('Thank you for your booking! May Ganpati Bappa bless you with prosperity.', 105, y, { align: 'center' });
    
    doc.save(`Ganpati-Booking-${receiptId}.pdf`);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phoneNumber) {
      alert('Please fill in all required fields');
      return;
    }
    setStep('receipt');
  };

  const handleBookingComplete = () => {
    const receiptId = generateReceiptId();
    onBookingComplete({
      ...formData,
      receiptId,
      bappaName: bappa.name
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">
            {step === 'qr' && 'Payment QR Code'}
            {step === 'form' && 'Booking Details'}
            {step === 'receipt' && 'Download Receipt'}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Bappa Info */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-4">
              <img
                src={bappa.image}
                alt={bappa.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h4 className="font-bold text-lg">{bappa.name}</h4>
                <p className="text-gray-600">{bappa.size}</p>
                <p className="font-bold text-green-600">₹{bappa.price.toLocaleString()}</p>
                <p className="text-sm font-medium text-orange-600">Bappa ID: #{bappa.id}</p>
              </div>
            </div>
          </div>

          {/* QR Code Step */}
          {step === 'qr' && (
            <div className="text-center space-y-6">
              <div className="bg-gray-100 rounded-xl p-8 mx-auto inline-block">
                <QrCode className="h-32 w-32 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Scan to pay ₹{bappa.price.toLocaleString()}</p>
              </div>
              <p className="text-gray-600">
                Scan the QR code to make payment and proceed to the next step
              </p>
              <button
                onClick={() => setStep('form')}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Check className="h-5 w-5" />
                <span>Payment Done</span>
              </button>
            </div>
          )}

          {/* Form Step */}
          {step === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="h-4 w-4 inline mr-2" />
                  Payment Screenshot
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                />
                {formData.paymentScreenshot && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {formData.paymentScreenshot.name}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
              >
                Submit Booking Details
              </button>
            </form>
          )}

          {/* Receipt Step */}
          {step === 'receipt' && (
            <div className="text-center space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-green-700 mb-2">Booking Confirmed!</h4>
                <p className="text-green-600">Your Ganpati Bappa has been successfully booked.</p>
              </div>

              <button
                onClick={downloadReceipt}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 mb-4"
              >
                <Download className="h-5 w-5" />
                <span>Download Receipt</span>
              </button>

              <button
                onClick={handleBookingComplete}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300"
              >
                Complete Booking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;