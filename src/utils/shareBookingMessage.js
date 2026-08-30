export const shareBookingMessage = async ({ blob, fileName, message, whatsappNumber }) => {
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof File !== 'undefined'
  ) {
    const file = new File([blob], fileName, { type: 'application/pdf' });
    const shareData = {
      files: [file],
      title: fileName,
      text: message,
    };

    if (typeof navigator.canShare !== 'function' || navigator.canShare(shareData)) {
      await navigator.share(shareData);
      return 'share';
    }
  }

  window.open(
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
    '_blank',
    'noopener,noreferrer'
  );

  return 'whatsapp';
};
