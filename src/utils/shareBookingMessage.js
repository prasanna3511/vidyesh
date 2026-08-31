export const shareBookingMessage = async ({ blob, fileName, message, whatsappNumber }) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappAppUrl = `whatsapp://send?phone=${whatsappNumber}&text=${encodedMessage}`;
  const whatsappWebUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;

  if (typeof window !== 'undefined') {
    const fallbackTimer = window.setTimeout(() => {
      window.open(whatsappWebUrl, '_blank', 'noopener,noreferrer');
    }, 800);

    const clearFallback = () => {
      window.clearTimeout(fallbackTimer);
      document.removeEventListener('visibilitychange', clearOnHidden);
      window.removeEventListener('pagehide', clearFallback);
      window.removeEventListener('blur', clearFallback);
    };

    const clearOnHidden = () => {
      if (document.visibilityState === 'hidden') {
        clearFallback();
      }
    };

    document.addEventListener('visibilitychange', clearOnHidden);
    window.addEventListener('pagehide', clearFallback, { once: true });
    window.addEventListener('blur', clearFallback, { once: true });
    window.location.href = whatsappAppUrl;
  }

  return 'whatsapp';
};
