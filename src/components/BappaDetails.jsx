import React, { useEffect, useRef, useState } from 'react';
import { gql } from '@apollo/client';
import nhost, { getDirectStorageUrl, getSafeStorageUrl } from '../nhost';
import { generateBookingPdf } from '../utils/bookingPdf';
import { getFirstImageFileId, loadPdfImageDataUrl } from '../utils/imageData';

const GET_MURTI_IMAGES = gql`
  query GetMurtiImages($murti_id: Int!) {
    murti_images(where: { murti_id: { _eq: $murti_id } }) {
      id
      image_id
      murti_id
    }
  }
`;

export default function BappaDetailsModal({ bappa, onClose }) {
  const [imageUrl, setImageUrl] = useState('');
  const [imageFileId, setImageFileId] = useState('');
  const [pdfImageDataUrl, setPdfImageDataUrl] = useState('');
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const imageRef = useRef(null);

  if (!bappa) return null;

  const actualPrice = bappa.discount_price !== null ? Number(bappa.discount_price) : Number(bappa.price);
  const remainingAmount = actualPrice - Number(bappa.paid_amount);

  useEffect(() => {
    let isMounted = true;

    const showImage = async (fileId) => {
      // Same-origin proxy URL, so the preview and the PDF read the same origin.
      if (isMounted) {
        setImageUrl(getSafeStorageUrl(fileId) || '');
      }

      // Prepared up front so the button never has to wait on the network.
      const dataUrl = await loadPdfImageDataUrl({ fileId });
      if (isMounted) {
        setPdfImageDataUrl(dataUrl || '');
      }
    };

    const loadImageUrl = async () => {
      setIsImageLoaded(false);
      setPdfImageDataUrl('');

      const existingImageId = getFirstImageFileId(bappa);
      if (existingImageId) {
        setImageFileId(existingImageId);
        await showImage(existingImageId);
        return;
      }

      try {
        const { data } = await nhost.graphql.request(GET_MURTI_IMAGES, {
          murti_id: Number(bappa.id),
        });
        const latestImageId = data?.murti_images?.[0]?.image_id;

        if (!isMounted) return;

        if (latestImageId) {
          setImageFileId(latestImageId);
          await showImage(latestImageId);
          return;
        }

        setImageFileId('');
        setImageUrl(bappa.image || '');
      } catch (error) {
        console.error('Failed to load murti image for details modal:', error);
        if (isMounted) {
          setImageFileId('');
          setImageUrl(bappa.image || '');
        }
      }
    };

    loadImageUrl();

    return () => {
      isMounted = false;
    };
  }, [bappa]);

  // The proxy path only exists on hosts that define it, so fall back to the
  // direct storage URL if the preview cannot load it.
  const handleImageError = async () => {
    setIsImageLoaded(false);

    const existingImageId = getFirstImageFileId(bappa) || imageFileId;
    const fallbackUrl = existingImageId ? getDirectStorageUrl(existingImageId) : bappa.image || '';

    if (fallbackUrl && fallbackUrl !== imageUrl) {
      setImageUrl(fallbackUrl);
    }
  };

  const downloadPDF = async () => {
    try {
      setIsDownloadingPdf(true);

      const imageDataUrl =
        pdfImageDataUrl || (await loadPdfImageDataUrl({ fileId: imageFileId, url: imageUrl || bappa.image }));

      await generateBookingPdf({
        ...bappa,
        imageUrl: imageUrl || bappa.image,
        imageDataUrl,
        // Only usable when the rendered <img> is same-origin/CORS-clean, so it stays last.
        imageElement: imageDataUrl || !isImageLoaded ? null : imageRef.current,
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="relative bg-gradient-to-r from-orange-500 to-red-500 p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-2xl text-white transition-all duration-200 hover:bg-white hover:bg-opacity-20 hover:text-gray-200"
          >
            ×
          </button>

          <div className="text-center">
            <div className="mx-auto h-32 w-32 overflow-hidden rounded-2xl bg-white shadow-lg">
              <img
                ref={imageRef}
                src={imageUrl}
                alt={bappa.name}
                className="h-full w-full object-contain"
                onLoad={() => setIsImageLoaded(true)}
                onError={handleImageError}
              />
            </div>
            <h2 className="mb-1 text-2xl font-bold text-white">{bappa.name}</h2>
            <p className="text-sm font-medium text-orange-100">Size: {bappa.size}</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={downloadPDF}
            disabled={isDownloadingPdf}
            className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2 text-sm font-semibold tracking-wide text-white shadow-md transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDownloadingPdf ? 'Preparing PDF...' : '📄 Download Booking PDF'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Final Price</span>
              <span className={`text-lg font-bold ${bappa.discount_price ? 'text-red-500 line-through' : 'text-gray-900'}`}>
                ₹{bappa.price}
              </span>
            </div>

            {bappa.discount_price !== null && (
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-indigo-600">Discounted Price</span>
                <span className="text-lg font-bold text-indigo-800">₹{bappa.discount_price}</span>
              </div>
            )}

            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Advance Paid</span>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-green-600">₹{bappa.paid_amount}</span>
              </div>
            </div>

            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Payment Mode</span>
              <span className="text-sm font-semibold text-indigo-700">{bappa.payment_mode || 'Online'}</span>
            </div>

            <hr className="my-2 border-gray-300" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Remaining</span>
              <span className={`text-lg font-bold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{remainingAmount}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-800">
              Customer Details
            </h3>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-3 rounded-xl bg-gray-50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-sm font-semibold text-blue-600">👤</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Name</p>
                  <p className="font-semibold text-gray-900">{bappa.fullName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 rounded-xl bg-gray-50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <span className="text-sm font-semibold text-green-600">📞</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-900">{bappa.phoneNumber}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 rounded-xl bg-gray-50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                  <span className="text-sm font-semibold text-yellow-600">💬</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Suggestions</p>
                  <p className="whitespace-pre-line font-semibold text-gray-900">{bappa?.suggestions || '—'}</p>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Address</p>
                <p className="whitespace-pre-line font-semibold text-gray-900">{bappa?.address || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
