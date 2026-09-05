export const shareBookingMessage = async ({ blob, fileName, message, whatsappNumber }) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappChatUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  if (typeof window !== 'undefined') {
    window.open(whatsappChatUrl, '_blank', 'noopener,noreferrer');
  }

  return 'whatsapp';
};
