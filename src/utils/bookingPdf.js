import jsPDF from 'jspdf';
import logo from '../assets/logo.png';

const MM_TO_PX = 3.7795275591;
const DEVANAGARI_REGEX = /[\u0900-\u097F]/;
const PDF_EXCLUDED_SUGGESTIONS = new Set(['कलर टचअप']);

// JPEG has no alpha channel, so a transparent source would render black.
const fillWhite = (canvas) => {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return ctx;
};

const loadImageFromElement = (source) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;
      fillWhite(canvas).drawImage(image, 0, 0);

      resolve({
        dataUrl: canvas.toDataURL('image/jpeg', 0.95),
        width: canvas.width,
        height: canvas.height,
      });
    };

    image.onerror = () => reject(new Error('Image element failed to load.'));
    image.src = source;
  });

const loadImage = async (url) => {
  if (String(url || '').startsWith('data:image/')) {
    return loadImageFromElement(url);
  }

  try {
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) {
      throw new Error(`Image fetch failed with status ${res.status}`);
    }

    const blob = await res.blob();
    // A missing route on a static host answers with index.html and status 200.
    if (!blob.type.startsWith('image/')) {
      throw new Error(`Expected an image but received "${blob.type || 'unknown'}"`);
    }

    try {
      let bitmap;
      try {
        bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
      } catch {
        bitmap = await createImageBitmap(blob);
      }

      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      fillWhite(canvas).drawImage(bitmap, 0, 0);

      return {
        dataUrl: canvas.toDataURL('image/jpeg', 0.95),
        width: bitmap.width,
        height: bitmap.height,
      };
    } catch (bitmapError) {
      const objectUrl = URL.createObjectURL(blob);

      try {
        return await loadImageFromElement(objectUrl);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    }
  } catch (fetchError) {
    return loadImageFromElement(url);
  }
};

const imageElementToData = (imageElement) => {
  const canvas = document.createElement('canvas');
  canvas.width = imageElement.naturalWidth || imageElement.width;
  canvas.height = imageElement.naturalHeight || imageElement.height;
  fillWhite(canvas).drawImage(imageElement, 0, 0);

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.95),
    width: canvas.width,
    height: canvas.height,
  };
};

const wrapCanvasText = (ctx, text, maxWidth) => {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return ['-'];

  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
      currentLine = '';
    }

    if (ctx.measureText(word).width <= maxWidth) {
      currentLine = word;
      continue;
    }

    let chunk = '';
    for (const char of word) {
      const testChunk = `${chunk}${char}`;
      if (ctx.measureText(testChunk).width <= maxWidth) {
        chunk = testChunk;
      } else {
        if (chunk) lines.push(chunk);
        chunk = char;
      }
    }
    currentLine = chunk;
  }

  if (currentLine) lines.push(currentLine);
  return lines;
};

const createTextImage = (text, widthMm, fontSizePx = 18) => {
  const scale = 2;
  const paddingPx = 8;
  const widthPx = Math.max(1, Math.round(widthMm * MM_TO_PX * scale));
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  const fontFamily = '"Noto Sans Devanagari", "Mangal", "Arial Unicode MS", sans-serif';
  measureCtx.font = `600 ${fontSizePx}px ${fontFamily}`;
  const lines = wrapCanvasText(measureCtx, text, widthPx - paddingPx * 2);
  const lineHeightPx = Math.round(fontSizePx * 1.35);
  const heightPx = lineHeightPx * lines.length + paddingPx * 2;

  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, widthPx, heightPx);
  ctx.font = `600 ${fontSizePx}px ${fontFamily}`;
  ctx.fillStyle = '#0f172a';
  ctx.textBaseline = 'top';

  lines.forEach((line, index) => {
    ctx.fillText(line, paddingPx, paddingPx + index * lineHeightPx);
  });

  return {
    dataUrl: canvas.toDataURL('image/png'),
    heightMm: heightPx / (MM_TO_PX * scale),
  };
};

export async function generateBookingPdf(bappa, options = {}) {
  const { autoSave = true } = options;
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
      900: { r: 15, g: 23, b: 42 },
    },
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
  const filteredSuggestions = String(bappa.suggestions || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !PDF_EXCLUDED_SUGGESTIONS.has(item));
  const suggestionsText = filteredSuggestions.length > 0 ? filteredSuggestions.join(', ') : 'None';
  const hasDevanagariSuggestions = DEVANAGARI_REGEX.test(suggestionsText);
  const suggestionTextImage = hasDevanagariSuggestions ? createTextImage(suggestionsText, 74) : null;

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

  if (bappa.imageElement || bappa.imageDataUrl || bappa.imageUrl || bappa.image) {
    try {
      const { dataUrl, width, height } = bappa.imageElement
        ? imageElementToData(bappa.imageElement)
        : await loadImage(bappa.imageDataUrl || bappa.imageUrl || bappa.image);
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
  const financeHeight = 42;
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
  drawLabelValue('Payment Mode', bappa.payment_mode || 'Online', margin + 5, financeY + 28, 40, colors.primary, 9);

  const customerY = financeY + financeHeight + 8;
  const customerHeight = suggestionTextImage ? Math.max(34, 26 + suggestionTextImage.heightMm) : 34;
  drawCard(margin, customerY, contentWidth, customerHeight, { r: 255, g: 255, b: 255 });
  doc.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Customer Details', margin + 5, customerY + 8);
  doc.line(margin + 5, customerY + 11, pageWidth - margin - 5, customerY + 11);

  drawLabelValue('Full Name', fitTextToWidth(bappa.fullName, 54), margin + 5, customerY + 18, 54, colors.gray[900], 9);
  drawLabelValue('Phone Number', fitTextToWidth(bappa.phoneNumber, 34), margin + 65, customerY + 18, 34, colors.gray[900], 9);
  if (suggestionTextImage) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colors.gray[500].r, colors.gray[500].g, colors.gray[500].b);
    doc.text('Special Instructions', margin + 105, customerY + 18);
    doc.addImage(suggestionTextImage.dataUrl, 'PNG', margin + 105, customerY + 20, 74, suggestionTextImage.heightMm);
  } else {
    drawLabelValue('Special Instructions', fitTextToWidth(suggestionsText, 74), margin + 105, customerY + 18, 74, colors.gray[900], 9);
  }

  const statusY = customerY + customerHeight + 8;
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

  const fileName = `${String(bappa.name || 'Bappa')}_BookingConfirmation.pdf`;
  const blob = doc.output('blob');
  if (autoSave) {
    doc.save(fileName);
  }

  return { doc, fileName, blob };
}
