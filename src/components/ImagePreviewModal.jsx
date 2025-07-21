// ImagePreviewModal.js
import React from 'react';
import { X } from 'lucide-react'; // Import the close icon
import nhost from '../nhost'; // Import nhost for getPublicUrl
import { useState, useEffect } from 'react'; // For ImageSlider's internal state
import { ChevronLeft, ChevronRight } from 'lucide-react'; // For ImageSlider's arrows

// Image Slider Component (ensure consistency with the one in BappaCard)
const ImageSlider = ({ images, defaultImage, altText, className }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      
      if (!images || images.length === 0) {
        setImageUrls([defaultImage]);
        setIsLoading(false);
        return;
      }

      try {
        const urls = images.map(img => 
          nhost.storage.getPublicUrl({ fileId: img.image_id })
        ).filter(url => url); 

        if (urls.length > 0) {
          setImageUrls(urls);
        } else {
          setImageUrls([defaultImage]);
        }
      } catch (error) {
        console.error('Error loading images for slider:', error);
        setImageUrls([defaultImage]);
      }
      
      setIsLoading(false);
    };

    loadImages();
  }, [images, defaultImage]);

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? imageUrls.length - 1 : prev - 1
    );
  };

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <span className="text-gray-500 text-xs">Loading...</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className} group`}>
      <img
        src={imageUrls[currentImageIndex] || defaultImage}
        alt={altText}
        className="w-full h-full rounded-lg object-contain"
        onError={(e) => {
          e.target.src = defaultImage;
        }}
      />
      
      {imageUrls.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
            title="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
            title="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {currentImageIndex + 1}/{imageUrls.length}
          </div>
        </>
      )}
    </div>
  );
};


const ImagePreviewModal = ({ bappa, images, onClose }) => {
  if (!bappa) return null; // Don't render if no bappa is passed

  const defaultImage = 'https://images.pexels.com/photos/8636095/pexels-photo-8636095.jpeg?auto=compress&cs=tinysrgb&w=500';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 relative max-w-3xl w-full max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 z-10"
          title="Close"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Image Preview: {bappa.murti_id}
        </h2>

        <div className="flex-grow flex items-center justify-center min-h-0">
          <ImageSlider
            images={images}
            defaultImage={defaultImage}
            altText={`Images for ${bappa.murti_id}`}
            className="w-full h-full max-h-[calc(90vh-120px)] rounded-lg" // Adjust height for modal
          />
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;