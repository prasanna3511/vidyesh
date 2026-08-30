import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, IndianRupee, Ruler } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import ImagePreviewModal from './ImagePreviewModal';
import dedaultimage from '../assets/weblogo.png';
import { FALLBACK_IMAGE, getImageUrl, normalizeImageRecord } from '../utils/murti.js';

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
        loading="lazy"
        decoding="async"
        onError={(e) => {
          e.target.src = defaultImage;
        }}
      />

      {imageUrls.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-1 top-1/2 rounded-full bg-black/50 p-1 text-white transition-opacity duration-200 hover:bg-opacity-70"
            title="Previous image"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-1 top-1/2 rounded-full bg-black/50 p-1 text-white transition-opacity duration-200 hover:bg-opacity-70"
            title="Next image"
          >
            <ChevronRight className="h-3 w-3" />
          </button>

          <div className="absolute bottom-1 right-1 rounded bg-black/50 px-2 py-1 text-xs text-white">
            {currentImageIndex + 1}/{imageUrls.length}
          </div>
        </>
      )}
    </div>
  );
};

const BappaCard = ({ bappa, onBuyNow }) => {
  const [murtiImages, setMurtiImages] = useState(bappa.images || []);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const defaultImage = getImageUrl(bappa.image || FALLBACK_IMAGE || dedaultimage);
  const isAvailable = bappa.booking_status !== 'booked' && bappa.booking_status !== 'pending' && bappa.booking_status !== 'delivered';

  useEffect(() => {
    let ignore = false;

    const fetchImages = async () => {
      try {
        const response = await api.get(`/murtis/${bappa.id}/images`);
        if (!ignore) {
          setMurtiImages((response.data || []).map(normalizeImageRecord));
        }
      } catch (error) {
        if (!ignore) {
          setMurtiImages([]);
        }
      }
    };

    fetchImages();
    return () => {
      ignore = true;
    };
  }, [bappa.id]);

  const primaryImageUrl =
    murtiImages.length > 0 ? getImageUrl(murtiImages[0].image_ref || murtiImages[0].image_id) : getImageUrl(bappa.image || dedaultimage);

  return (
    <div className="overflow-hidden rounded-2xl bg-white/90 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <div className="relative overflow-hidden rounded-t-2xl shadow-lg">
        <ImageSlider images={murtiImages} defaultImage={defaultImage} altText={bappa.name} className="h-64 w-full" />

        <button
          onClick={() => setShowPreviewModal(true)}
          className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white transition-opacity duration-200 hover:bg-opacity-70"
          title="Preview Images"
        >
          <Eye className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6">
        <h3 className="mb-3 text-2xl font-bold text-gray-800">Murti No : {bappa.murti_id}</h3>

        <div className="mb-6 space-y-3">
          <div className="flex items-center space-x-3 text-gray-600">
            <Ruler className="h-5 w-5 text-orange-500" />
            <span className="font-medium">{bappa.size}</span>
          </div>

          <div className="flex items-center space-x-3 text-gray-800">
            <IndianRupee className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold">{bappa.final_price}</span>
          </div>
        </div>

        {isAuthenticated ? (
          <button
            onClick={() => onBuyNow({ ...bappa, image: primaryImageUrl, images: murtiImages })}
            disabled={!isAvailable}
            className={`flex w-full items-center justify-center space-x-2 rounded-xl px-6 py-3 text-lg font-bold transition-all duration-300 ${
              !isAvailable
                ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                : 'bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 text-white shadow-lg hover:from-orange-600 hover:via-red-600 hover:to-purple-600 hover:shadow-xl'
            }`}
          >
            <span>{isAvailable ? 'Book Now' : bappa.booking_status}</span>
          </button>
        ) : (
          <div
            className={`w-full rounded-xl px-6 py-3 text-center text-lg font-bold ${
              isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
            }`}
            role="status"
          >
            {isAvailable ? 'Available' : 'Not Available'}
          </div>
        )}
      </div>

      {showPreviewModal && (
        <ImagePreviewModal bappa={bappa} images={murtiImages} onClose={() => setShowPreviewModal(false)} />
      )}
    </div>
  );
};

export default BappaCard;
