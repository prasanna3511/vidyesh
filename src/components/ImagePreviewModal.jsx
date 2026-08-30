import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { FALLBACK_IMAGE, getImageUrl } from '../utils/murti.js';

const ImageSlider = ({ images, defaultImage, altText, className }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageUrls = images.length ? images.map((image) => getImageUrl(image.image_ref || image.image_id)) : [defaultImage];

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  return (
    <div className={`relative ${className} group`}>
      <img
        src={imageUrls[currentImageIndex] || defaultImage}
        alt={altText}
        className="h-full w-full rounded-lg object-contain"
        onError={(e) => {
          e.target.src = defaultImage;
        }}
      />

      {imageUrls.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-1 top-1/2 rounded-full bg-black/50 p-2 text-white transition-opacity duration-200 hover:bg-opacity-70"
            title="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-1 top-1/2 rounded-full bg-black/50 p-2 text-white transition-opacity duration-200 hover:bg-opacity-70"
            title="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-2 right-2 rounded bg-black/50 px-3 py-1 text-sm text-white">
            {currentImageIndex + 1}/{imageUrls.length}
          </div>
        </>
      )}
    </div>
  );
};

const ImagePreviewModal = ({ bappa, images, onClose }) => {
  if (!bappa) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl bg-white p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-3 top-3 z-10 text-gray-600 hover:text-gray-900" title="Close">
          <X className="h-6 w-6" />
        </button>

        <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">Image Preview: {bappa.murti_id}</h2>

        <div className="flex min-h-0 flex-grow items-center justify-center">
          <ImageSlider
            images={images}
            defaultImage={getImageUrl(bappa.image || FALLBACK_IMAGE)}
            altText={`Images for ${bappa.murti_id}`}
            className="h-full max-h-[calc(90vh-120px)] w-full rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
