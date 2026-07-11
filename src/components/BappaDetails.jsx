
import React, { useEffect, useState } from 'react';
import nhost from '../nhost';
import jsPDF from 'jspdf';

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
    let y = 0;

    // Add fonts for better text rendering
    doc.setFont('helvetica');

    // Ensures the next block fits on the current page; starts a new page otherwise
    const ensureSpace = (requiredHeight) => {
      if (y + requiredHeight > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
    };

    // Define professional color palette
    const colors = {
      primary: { r: 37, g: 99, b: 235 },     // Blue
      secondary: { r: 79, g: 70, b: 229 },   // Indigo
      accent: { r: 249, g: 115, b: 22 },     // Orange
      success: { r: 16, g: 185, b: 129 },    // Green
      error: { r: 239, g: 68, b: 68 },       // Red
      warning: { r: 245, g: 158, b: 11 },    // Amber
      gray: {
        50: { r: 249, g: 250, b: 251 },
        100: { r: 243, g: 244, b: 246 },
        200: { r: 229, g: 231, b: 235 },
        300: { r: 209, g: 213, b: 219 },
        600: { r: 75, g: 85, b: 99 },
        800: { r: 31, g: 41, b: 55 },
        900: { r: 17, g: 24, b: 39 }
      }
    };

    // Helper function to create smooth gradients
    const createGradient = (x, y, width, height, color1, color2, steps = 20) => {
      const stepHeight = height / steps;
      for (let i = 0; i < steps; i++) {
        const ratio = i / (steps - 1);
        const r = Math.round(color1.r + (color2.r - color1.r) * ratio);
        const g = Math.round(color1.g + (color2.g - color1.g) * ratio);
        const b = Math.round(color1.b + (color2.b - color1.b) * ratio);
        
        doc.setFillColor(r, g, b);
        doc.rect(x, y + i * stepHeight, width, stepHeight + 0.1, 'F');
      }
    };

    // Helper function for rounded rectangles with shadows
    const drawCard = (x, y, width, height, bgColor, borderColor = null, shadow = true) => {
      if (shadow) {
        // Shadow
        doc.setFillColor(0, 0, 0, 0.1);
        doc.roundedRect(x + 1, y + 1, width, height, 3, 3, 'F');
      }
      
      // Background
      doc.setFillColor(bgColor.r, bgColor.g, bgColor.b);
      doc.roundedRect(x, y, width, height, 3, 3, 'F');
      
      if (borderColor) {
        doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b);
        doc.setLineWidth(0.5);
        doc.roundedRect(x, y, width, height, 3, 3, 'S');
      }
    };

    // Draws a checkmark from vector strokes — the standard PDF font has no
    // glyph for the ✓ character, so drawing text with it prints garbage.
    const drawCheckmark = (cx, cy, size, color) => {
      doc.setDrawColor(color.r, color.g, color.b);
      doc.setLineWidth(size / 5);
      doc.setLineCap('round');
      doc.setLineJoin('round');
      doc.lines(
        [
          [size * 0.35, size * 0.35],
          [size * 0.65, -size * 0.75],
        ],
        cx - size * 0.5,
        cy + size * 0.05
      );
      doc.setLineCap(0);
      doc.setLineJoin(0);
    };

    // Draws a small circle with a bold monogram letter centered inside it
    const drawIconBadge = (cx, cy, radius, letter, color) => {
      doc.setFillColor(color.r, color.g, color.b);
      doc.circle(cx, cy, radius, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(radius * 1.3);
      doc.setFont('helvetica', 'bold');
      const textWidth = doc.getTextWidth(letter);
      doc.text(letter, cx - textWidth / 2, cy + radius * 0.45);
    };

    // Professional header with company branding
    createGradient(0, 0, pageWidth, 80, colors.primary, colors.secondary);

    // Header content box
    drawCard(15, 10, pageWidth - 30, 60, { r: 255, g: 255, b: 255, a: 0.95 }, null, false);

    // Company logo/icon area
    doc.setFillColor(colors.accent.r, colors.accent.g, colors.accent.b);
    doc.circle(35, 40, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('B', 32, 44);

    // Header text
    doc.setTextColor(colors.gray[900].r, colors.gray[900].g, colors.gray[900].b);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('BOOKING CONFIRMATION', 55, 32);
    
    doc.setTextColor(colors.gray[600].r, colors.gray[600].g, colors.gray[600].b);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })}`, 55, 42);

    // Booking ID
    doc.setFontSize(8);
    doc.text(`Booking ID: #${Date.now().toString().slice(-6)}`, 55, 50);

    y = 85;

    // Bappa Details Section
    const bappaCardHeight = 120;
    drawCard(15, y, pageWidth - 30, bappaCardHeight, colors.gray[50], colors.gray[200]);

    // Bappa image
    const imgX = 25;
    const imgY = y + 15;
    const imgSize = 80;
    
    // Image container with better styling
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(imgX, imgY, imgSize, imgSize, 8, 8, 'F');
    doc.setDrawColor(colors.gray[300].r, colors.gray[300].g, colors.gray[300].b);
    doc.setLineWidth(1);
    doc.roundedRect(imgX, imgY, imgSize, imgSize, 8, 8, 'S');
    
    if (imageurl) {
      try {
        const { dataUrl, width, height } = await loadImage(imageurl);
        // Contain-fit within the box (preserving aspect ratio) instead of
        // stretching into a square, which distorted portrait photos
        const innerSize = imgSize - 8;
        const scale = Math.min(innerSize / width, innerSize / height);
        const drawW = width * scale;
        const drawH = height * scale;
        const drawX = imgX + 4 + (innerSize - drawW) / 2;
        const drawY = imgY + 4 + (innerSize - drawH) / 2;
        doc.addImage(dataUrl, 'JPEG', drawX, drawY, drawW, drawH);
      } catch (err) {
        console.error('Image loading failed:', err);
        // Better placeholder
        doc.setFillColor(colors.gray[100].r, colors.gray[100].g, colors.gray[100].b);
        doc.roundedRect(imgX + 4, imgY + 4, imgSize - 8, imgSize - 8, 4, 4, 'F');
        doc.setTextColor(colors.gray[600].r, colors.gray[600].g, colors.gray[600].b);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('No Image', imgX + imgSize/2 - 12, imgY + imgSize/2);
      }
    } else {
      // Placeholder when no image URL
      doc.setFillColor(colors.gray[100].r, colors.gray[100].g, colors.gray[100].b);
      doc.roundedRect(imgX + 4, imgY + 4, imgSize - 8, imgSize - 8, 4, 4, 'F');
      doc.setTextColor(colors.gray[600].r, colors.gray[600].g, colors.gray[600].b);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('No Image', imgX + imgSize/2 - 12, imgY + imgSize/2);
    }

    // Bappa details text
    const detailsX = imgX + imgSize + 15;
    let detailsY = imgY + 20;

    doc.setTextColor(colors.gray[900].r, colors.gray[900].g, colors.gray[900].b);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(String(bappa.name || ""), detailsX, detailsY);

    detailsY += 12;
    doc.setTextColor(colors.gray[600].r, colors.gray[600].g, colors.gray[600].b);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Size: ${String(bappa.size || "")}`, detailsX, detailsY);

    // Status badge
    detailsY += 15;
    const statusBadgeWidth = 50;
    const statusBadgeHeight = 10;
    doc.setFillColor(colors.success.r, colors.success.g, colors.success.b);
    doc.roundedRect(detailsX, detailsY, statusBadgeWidth, statusBadgeHeight, 5, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIRMED', detailsX + 8, detailsY + 7);

    y += bappaCardHeight + 20;

    // Price Breakdown Section
    const priceCardHeight = bappa.discount_price !== null ? 80 : 60;
    ensureSpace(30 + priceCardHeight);

    doc.setTextColor(colors.gray[900].r, colors.gray[900].g, colors.gray[900].b);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PRICE BREAKDOWN', 15, y);

    // Decorative line
    doc.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.setLineWidth(2);
    doc.line(15, y + 3, 80, y + 3);

    y += 15;

    drawCard(15, y, pageWidth - 30, priceCardHeight, { r: 255, g: 255, b: 255 }, colors.gray[200]);

    let priceY = y + 15;
    const leftMargin = 25;
    const rightMargin = pageWidth - 25;

    // Original Price
    doc.setTextColor(colors.gray[600].r, colors.gray[600].g, colors.gray[600].b);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Original Price', leftMargin, priceY);

    if (bappa.discount_price !== null) {
      doc.setTextColor(colors.error.r, colors.error.g, colors.error.b);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const originalPriceText = `Rs ${String(bappa.price || 0)}`;
      const originalPriceWidth = doc.getTextWidth(originalPriceText);
      doc.text(originalPriceText, rightMargin - originalPriceWidth, priceY);
      
      // Strike-through
      doc.setDrawColor(colors.error.r, colors.error.g, colors.error.b);
      doc.setLineWidth(1);
      doc.line(rightMargin - originalPriceWidth, priceY - 3, rightMargin, priceY - 3);
      
      priceY += 18;
      
      // Discounted Price
      doc.setTextColor(colors.gray[600].r, colors.gray[600].g, colors.gray[600].b);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Discounted Price', leftMargin, priceY);
      
      doc.setTextColor(colors.success.r, colors.success.g, colors.success.b);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const discountPriceText = `Rs ${String(bappa.discount_price || 0)}`;
      doc.text(discountPriceText, rightMargin - doc.getTextWidth(discountPriceText), priceY);
    } else {
      doc.setTextColor(colors.gray[900].r, colors.gray[900].g, colors.gray[900].b);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const priceText = `Rs ${String(bappa.price || 0)}`;
      doc.text(priceText, rightMargin - doc.getTextWidth(priceText), priceY);
    }

    priceY += 18;

    // Separator line
    doc.setDrawColor(colors.gray[200].r, colors.gray[200].g, colors.gray[200].b);
    doc.setLineWidth(0.5);
    doc.line(leftMargin, priceY - 5, rightMargin, priceY - 5);

    // Advance Paid
    doc.setTextColor(colors.gray[600].r, colors.gray[600].g, colors.gray[600].b);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Advance Paid', leftMargin, priceY);
    
    doc.setTextColor(colors.success.r, colors.success.g, colors.success.b);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const advanceText = `Rs ${String(bappa.paid_amount || 0)}`;
    doc.text(advanceText, rightMargin - doc.getTextWidth(advanceText), priceY);

    priceY += 18;

    // Remaining Amount
    const actualPrice = bappa.discount_price !== null ? Number(bappa.discount_price) : Number(bappa.price);
    const remainingAmount = actualPrice - Number(bappa.paid_amount || 0);
    
    doc.setTextColor(colors.gray[900].r, colors.gray[900].g, colors.gray[900].b);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('REMAINING AMOUNT', leftMargin, priceY);
    
    const remainingColor = remainingAmount > 0 ? colors.error : colors.success;
    doc.setTextColor(remainingColor.r, remainingColor.g, remainingColor.b);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const remainingText = `Rs ${String(remainingAmount)}`;
    doc.text(remainingText, rightMargin - doc.getTextWidth(remainingText), priceY);

    y += priceCardHeight + 25;

    // Customer Information Section
    ensureSpace(40);

    doc.setTextColor(colors.gray[900].r, colors.gray[900].g, colors.gray[900].b);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER INFORMATION', 15, y);
    
    doc.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.setLineWidth(2);
    doc.line(15, y + 3, 110, y + 3);

    y += 15;

    const customerDetails = [
      {
        label: "Full Name",
        value: String(bappa.fullName || ""),
        icon: "N",
        color: colors.primary
      },
      {
        label: "Phone Number",
        value: String(bappa.phoneNumber || ""),
        icon: "P",
        color: colors.success
      },
      {
        label: "Special Instructions",
        value: String(bappa?.suggestions || "None"),
        icon: "S",
        color: colors.warning,
        multiline: true
      }
    ];

    customerDetails.forEach((detail, index) => {
      const isMultiline = detail.multiline && detail.value !== "None" && detail.value.length > 50;
      const cardHeight = isMultiline ? Math.max(35, Math.ceil(detail.value.length / 60) * 8 + 25) : 35;

      ensureSpace(cardHeight + 10);

      drawCard(15, y, pageWidth - 30, cardHeight, colors.gray[50], colors.gray[200]);

      // Icon circle
      drawIconBadge(30, y + 17, 8, detail.icon, detail.color);

      // Label
      doc.setTextColor(colors.gray[600].r, colors.gray[600].g, colors.gray[600].b);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(detail.label.toUpperCase(), 45, y + 12);
      
      // Value
      doc.setTextColor(colors.gray[900].r, colors.gray[900].g, colors.gray[900].b);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      
      if (isMultiline) {
        const lines = doc.splitTextToSize(String(detail.value), pageWidth - 70);
        let textY = y + 20;
        lines.forEach(line => {
          doc.text(String(line), 45, textY);
          textY += 8;
        });
      } else {
        doc.text(String(detail.value), 45, y + 22);
      }
      
      y += cardHeight + 10;
    });

    // Payment Screenshot Section
    if (paymentSc) {
      y += 10;
      ensureSpace(65);

      doc.setTextColor(colors.gray[900].r, colors.gray[900].g, colors.gray[900].b);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT VERIFICATION', 15, y);
      
      doc.setDrawColor(colors.success.r, colors.success.g, colors.success.b);
      doc.setLineWidth(2);
      doc.line(15, y + 3, 105, y + 3);

      y += 15;

      // Payment status card
      drawCard(15, y, pageWidth - 30, 40, colors.gray[50], colors.success);

      // Verified badge
      doc.setFillColor(colors.success.r, colors.success.g, colors.success.b);
      doc.circle(35, y + 20, 10, 'F');
      drawCheckmark(35, y + 20, 10, { r: 255, g: 255, b: 255 });

      doc.setTextColor(colors.success.r, colors.success.g, colors.success.b);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT VERIFIED', 50, y + 18);
      
      doc.setTextColor(colors.gray[600].r, colors.gray[600].g, colors.gray[600].b);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Screenshot and transaction details confirmed', 50, y + 26);

      y += 50;

      try {
        const { dataUrl, width, height } = await loadImage(paymentSc);

        // Contain-fit the screenshot (phone screenshots are usually tall
        // portrait images) instead of stretching it into a fixed wide box
        const maxWidth = pageWidth - 50;
        const maxHeight = 180;
        const scale = Math.min(maxWidth / width, maxHeight / height);
        const drawW = width * scale;
        const drawH = height * scale;

        ensureSpace(drawH + 40);

        const cardWidth = pageWidth - 30;
        drawCard(15, y, cardWidth, drawH + 20, { r: 255, g: 255, b: 255 }, colors.gray[300]);
        doc.addImage(dataUrl, 'JPEG', 15 + (cardWidth - drawW) / 2, y + 10, drawW, drawH);

        y += drawH + 30;

        // Payment caption
        doc.setTextColor(colors.gray[600].r, colors.gray[600].g, colors.gray[600].b);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const captionText = `Payment screenshot - Amount: Rs ${String(bappa.paid_amount || 0)}`;
        const captionWidth = doc.getTextWidth(captionText);
        doc.text(captionText, (pageWidth - captionWidth) / 2, y);

      } catch (err) {
        console.error('Payment screenshot loading failed:', err);
        ensureSpace(20);
        doc.setTextColor(colors.error.r, colors.error.g, colors.error.b);
        doc.setFontSize(11);
        doc.text('Payment screenshot could not be loaded', 20, y);
        y += 15;
      }
    }

    // Professional Footer
    ensureSpace(45);
    const footerY = pageHeight - 35;

    // Footer background
    doc.setFillColor(colors.gray[800].r, colors.gray[800].g, colors.gray[800].b);
    doc.rect(0, footerY - 10, pageWidth, 35, 'F');
    
    // Footer content
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const thankYouText = "Thank you for your booking!";
    const thankYouWidth = doc.getTextWidth(thankYouText);
    doc.text(thankYouText, (pageWidth - thankYouWidth) / 2, footerY + 5);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const blessingsText = "Ganpati Bappa Morya!";
    const blessingsWidth = doc.getTextWidth(blessingsText);
    doc.text(blessingsText, (pageWidth - blessingsWidth) / 2, footerY + 15);
    
    doc.setFontSize(8);
    const contactText = "For any queries, please contact us | Generated automatically";
    const contactWidth = doc.getTextWidth(contactText);
    doc.text(contactText, (pageWidth - contactWidth) / 2, footerY + 22);

    // Save the PDF
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