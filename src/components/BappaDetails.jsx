
import React, { useEffect, useState } from 'react';
import nhost from '../nhost';
import jsPDF from 'jspdf';
import logo from '../assets/logo.png';

export default function BappaDetailsModal({ bappa, onClose }) {
  const [imageurl, setImageUrl] = useState('');
  const [paymentSc, setPaymentSc] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  console.log("oooooooo : ", bappa)

  // Fetches an image and re-encodes it through a canvas so that (a) EXIF
  // orientation is baked into the pixels instead of being ignored by jsPDF,
  // which otherwise renders portrait phone photos sideways, and (b) the
  // output is always a plain decodable JPEG, regardless of the source
  // format (some stored screenshots fail to embed as-is and render blank).
  const loadImage = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();

    let bitmap;
    try {
      bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
    } catch {
      bitmap = await createImageBitmap(blob);
    }

    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0);

    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.95),
      width: bitmap.width,
      height: bitmap.height,
    };
  };

  if (!bappa) return null;


  const downloadPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;

    const colors = {
      primary: { r: 30, g: 64, b: 175 },
      secondary: { r: 15, g: 23, b: 42 },
      accent: { r: 194, g: 65, b: 12 },
      success: { r: 22, g: 163, b: 74 },
      warning: { r: 180, g: 83, b: 9 },
      gray: {
        50: { r: 248, g: 250, b: 252 },
        100: { r: 241, g: 245, b: 249 },
        200: { r: 226, g: 232, b: 240 },
        500: { r: 100, g: 116, b: 139 },
        700: { r: 51, g: 65, b: 85 },
        900: { r: 15, g: 23, b: 42 }
      }
    };

    const formatCurrency = (value) => {
      const amount = Number(value || 0);
      return `Rs ${amount.toLocaleString('en-IN')}`;
    };

    const formatStatus = (value) => {
      const safeValue = String(value || 'pending').replace(/_/g, ' ').trim();
      return safeValue.charAt(0).toUpperCase() + safeValue.slice(1);
    };

    const drawCard = (x, y, width, height, fill, border = colors.gray[200]) => {
      doc.setFillColor(fill.r, fill.g, fill.b);
      doc.setDrawColor(border.r, border.g, border.b);
      doc.setLineWidth(0.4);
      doc.roundedRect(x, y, width, height, 3, 3, 'FD');
    };

    const drawLabelValue = (label, value, x, y, width, valueColor = colors.gray[900], valueSize = 10) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(colors.gray[500].r, colors.gray[500].g, colors.gray[500].b);
      doc.text(label, x, y);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(valueSize);
      doc.setTextColor(valueColor.r, valueColor.g, valueColor.b);
      const safeValue = value || '-';
      const lines = doc.splitTextToSize(String(safeValue), width);
      doc.text(lines, x, y + 5);
      return lines.length;
    };

    const fitTextToWidth = (value, width, fontSize = 9) => {
      const safeValue = String(value || '-');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fontSize);

      if (doc.getTextWidth(safeValue) <= width) return safeValue;

      let trimmed = safeValue;
      while (trimmed.length > 1 && doc.getTextWidth(`${trimmed}...`) > width) {
        trimmed = trimmed.slice(0, -1);
      }
      return `${trimmed}...`;
    };

    const actualPrice = bappa.discount_price !== null ? Number(bappa.discount_price) : Number(bappa.price);
    const remainingAmount = actualPrice - Number(bappa.paid_amount || 0);

    doc.setFillColor(colors.gray[50].r, colors.gray[50].g, colors.gray[50].b);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    const headerY = 8;
    const headerHeight = 36;
    drawCard(margin, headerY, contentWidth, headerHeight, { r: 255, g: 255, b: 255 });
    doc.setFillColor(245, 158, 11);
    doc.rect(margin, headerY, contentWidth, 5, 'F');

    try {
      const { dataUrl, width, height } = await loadImage(logo);
      const maxWidth = 38;
      const maxHeight = 14;
      const scale = Math.min(maxWidth / width, maxHeight / height);
      const drawW = width * scale;
      const drawH = height * scale;
      const logoX = margin + 6;
      const logoY = headerY + 9 + (maxHeight - drawH) / 2;
      doc.addImage(dataUrl, 'JPEG', logoX, logoY, drawW, drawH);
    } catch (err) {
      console.error('Header logo loading failed:', err);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.text('Booking Confirmation', margin + 6, headerY + 27);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colors.gray[700].r, colors.gray[700].g, colors.gray[700].b);
    doc.text(`Booking ID: #${String(bappa.id || Date.now()).padStart(6, '0')}`, margin + 6, headerY + 31);

    const rightHeaderX = pageWidth - margin - 6;
    doc.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Vidyesh Ganeshmurti', rightHeaderX, headerY + 12, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colors.gray[700].r, colors.gray[700].g, colors.gray[700].b);
    doc.text('14, Vidyesh, State Bank Colony,', rightHeaderX, headerY + 18, { align: 'right' });
    doc.text('Abhaynagar, Sangli, 416416.', rightHeaderX, headerY + 22.5, { align: 'right' });
    doc.text('Mob: 9420342516', rightHeaderX, headerY + 27, { align: 'right' });
    

    const topY = 48;
    const imageCardWidth = 54;
    const imageCardHeight = 52;
    drawCard(margin, topY, imageCardWidth, imageCardHeight, { r: 255, g: 255, b: 255 });

    if (imageurl) {
      try {
        const { dataUrl, width, height } = await loadImage(imageurl);
        const innerWidth = imageCardWidth - 8;
        const innerHeight = imageCardHeight - 8;
        const scale = Math.min(innerWidth / width, innerHeight / height);
        const drawW = width * scale;
        const drawH = height * scale;
        doc.addImage(
          dataUrl,
          'JPEG',
          margin + 4 + (innerWidth - drawW) / 2,
          topY + 4 + (innerHeight - drawH) / 2,
          drawW,
          drawH
        );
      } catch (err) {
        console.error('Image loading failed:', err);
        doc.setTextColor(colors.gray[500].r, colors.gray[500].g, colors.gray[500].b);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('Image unavailable', margin + 11, topY + 28);
      }
    } else {
      doc.setTextColor(colors.gray[500].r, colors.gray[500].g, colors.gray[500].b);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Image unavailable', margin + 11, topY + 28);
    }

    const summaryX = margin + imageCardWidth + 8;
    const summaryWidth = contentWidth - imageCardWidth - 8;
    drawCard(summaryX, topY, summaryWidth, imageCardHeight, { r: 255, g: 255, b: 255 });

    doc.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(String(bappa.name || '-'), summaryX + 5, topY + 12);

    drawLabelValue('Murti ID', bappa.name, summaryX + 5, topY + 20, 46);
    drawLabelValue('Size', bappa.size, summaryX + 58, topY + 20, 32);
    drawLabelValue('Booked By', bappa.booked_by, summaryX + 5, topY + 33, 46);

    const financeY = topY + imageCardHeight + 8;
    const financeHeight = 34;
    drawCard(margin, financeY, contentWidth, financeHeight, { r: 255, g: 255, b: 255 });
    doc.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Payment Summary', margin + 5, financeY + 8);
    doc.setDrawColor(colors.gray[200].r, colors.gray[200].g, colors.gray[200].b);
    doc.line(margin + 5, financeY + 11, pageWidth - margin - 5, financeY + 11);

    drawLabelValue('Original Price', formatCurrency(bappa.price), margin + 5, financeY + 17, 40, colors.secondary, 10);
    drawLabelValue('Discounted Price', bappa.discount_price !== null ? formatCurrency(bappa.discount_price) : 'Not applied', margin + 55, financeY + 17, 44, colors.accent, 9);
    drawLabelValue('Advance Paid', formatCurrency(bappa.paid_amount), margin + 109, financeY + 17, 34, colors.success, 10);
    drawLabelValue('Remaining', formatCurrency(remainingAmount), margin + 149, financeY + 17, 34, remainingAmount > 0 ? colors.warning : colors.success, 10);

    const customerY = financeY + financeHeight + 8;
    drawCard(margin, customerY, contentWidth, 34, { r: 255, g: 255, b: 255 });
    doc.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Customer Details', margin + 5, customerY + 8);
    doc.line(margin + 5, customerY + 11, pageWidth - margin - 5, customerY + 11);

    drawLabelValue('Full Name', fitTextToWidth(bappa.fullName, 54), margin + 5, customerY + 18, 54, colors.gray[900], 9);
    drawLabelValue('Phone Number', fitTextToWidth(bappa.phoneNumber, 34), margin + 65, customerY + 18, 34, colors.gray[900], 9);
    drawLabelValue('Special Instructions', fitTextToWidth(bappa.suggestions || 'None', 74), margin + 105, customerY + 18, 74, colors.gray[900], 9);

    const statusY = customerY + 42;
    drawCard(margin, statusY, contentWidth, 34, { r: 255, g: 255, b: 255 });
    doc.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Current Status', margin + 5, statusY + 8);
    doc.line(margin + 5, statusY + 11, pageWidth - margin - 5, statusY + 11);
    drawLabelValue('Booking Status', formatStatus(bappa.booking_status), margin + 5, statusY + 18, 54, colors.success, 10);
    drawLabelValue('Payment Status', Number(bappa.paid_amount || 0) > 0 ? 'Advance Paid' : 'Pending', margin + 65, statusY + 18, 34, colors.warning, 9);
    drawLabelValue('Updated By', fitTextToWidth(bappa.booked_by || 'Customer', 74), margin + 105, statusY + 18, 74, colors.gray[900], 9);

    const footerY = pageHeight - 18;
    doc.setDrawColor(colors.gray[200].r, colors.gray[200].g, colors.gray[200].b);
    doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);
    doc.setTextColor(colors.gray[700].r, colors.gray[700].g, colors.gray[700].b);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(
      'For any assistance or queries, feel free to contact us at +91 9420342516.',
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );
    doc.text(
      'Thank you for choosing eco-friendly celebrations with Vidyesh Ganeshmurti !',
      pageWidth / 2,
      footerY + 7,
      { align: 'center' }
    );

    doc.save(`${String(bappa.name || 'Bappa')}_BookingConfirmation.pdf`);
  };
  const actualPrice = bappa.discount_price !== null ? Number(bappa.discount_price) : Number(bappa.price);
  const remainingAmount = actualPrice - Number(bappa.paid_amount);

  useEffect(() => {
    const publicUrl = nhost.storage.getPublicUrl({ fileId: bappa?.images[0]?.image_id });
    const paymentPublicUrl = nhost.storage.getPublicUrl({ fileId: bappa?.paid_amount_sc });
    setImageUrl(publicUrl);
    setPaymentSc(paymentPublicUrl);
  }, [bappa]);

  const PaymentScreenshotModal = () => (
    <div className="fixed inset-0 z-[70] bg-black bg-opacity-80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Payment Screenshot</h3>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="text-white hover:text-gray-200 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-300">
            <img
              src={paymentSc}
              alt="Payment Screenshot"
              className="w-full h-auto max-h-96 object-contain mx-auto rounded-lg shadow-md"
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Advance payment of <span className="font-semibold text-green-600">₹{bappa.paid_amount}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] shadow-2xl relative transform transition-all duration-300 scale-100 hover:scale-[1.02] overflow-hidden flex flex-col">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
            >
              ×
            </button>

            <div className="text-center">
              <div className="w-32 h-32 mx-auto  bg-white shadow-lg rounded-2xl overflow-hidden">
                <img
                  src={imageurl}
                  alt={bappa.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">{bappa.name}</h2>
              <p className="text-orange-100 text-sm font-medium">Size: {bappa.size}</p>
            </div>
          </div>
          <div className="text-center mt-6">
            <button
              onClick={downloadPDF}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-sm font-semibold tracking-wide"
            >
              📄 Download Booking PDF
            </button>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 overflow-y-auto">
            {/* Price Summary Card */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Final Price</span>
                <span className={`text-lg font-bold ${bappa.discount_price ? 'line-through text-red-500' : 'text-gray-900'}`}>
                  ₹{bappa.price}
                </span>
              </div>

              {bappa.discount_price !== null && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-indigo-600">Discounted Price</span>
                  <span className="text-lg font-bold text-indigo-800">₹{bappa.discount_price}</span>
                </div>
              )}

              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Advance Paid</span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-green-600">₹{bappa.paid_amount}</span>
                </div>
              </div>
              <hr className="my-2 border-gray-300" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Remaining</span>
                <span className={`text-lg font-bold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₹{remainingAmount}
                </span>
              </div>
            </div>

            {/* Payment Status Card */}
            {paymentSc && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-lg">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800">Payment Verified</h4>
                      <p className="text-sm text-green-600">Screenshot available</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    View Receipt
                  </button>
                </div>
              </div>
            )}

            {/* Customer Details */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Customer Details
              </h3>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-semibold">👤</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                    <p className="font-semibold text-gray-900">{bappa.fullName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-semibold">📞</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                    <p className="font-semibold text-gray-900">{bappa.phoneNumber}</p>
                  </div>

                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm font-semibold">💬</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Suggestions</p>
                    <p className="font-semibold text-gray-900 whitespace-pre-line">{bappa?.suggestions || "—"}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Payment Screenshot Modal */}
      {showPaymentModal && <PaymentScreenshotModal />}
    </>
  );
}
