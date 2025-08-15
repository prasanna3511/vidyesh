// // import React from 'react';
// // import { ShoppingCart, Ruler, IndianRupee } from 'lucide-react';
// // import { useAuthenticated } from '@nhost/react';


// // const BappaCard = ({ bappa, onBuyNow }) => {
// //   return (
// //     <div className="bg-white/90 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
// //       <div className="relative shadow-lg rounded-t-2xl overflow-hidden">
// //         <img
// //           src={bappa.image}
// //           alt={bappa.name}
// //           className="w-full h-64 object-contain"
// //         />
// //         {/* <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
// //           #{bappa.id}
// //         </div> */}
// //       </div>
      
// //       <div className="p-6">
// //         <h3 className="text-2xl font-bold text-gray-800 mb-3">{bappa.murti_id}</h3>
        
// //         <div className="space-y-3 mb-6">
// //           <div className="flex items-center space-x-3 text-gray-600">
// //             <Ruler className="h-5 w-5 text-orange-500" />
// //             <span className="font-medium">{bappa.size}</span>
// //           </div>
          
// //           <div className="flex items-center space-x-3 text-gray-800">
// //             <IndianRupee className="h-5 w-5 text-green-600" />
// //             <span className="text-2xl font-bold">{bappa.final_price}</span>
// //           </div>
// //         </div>
       

// //      <button
// //           onClick={() => onBuyNow(bappa)}
// //           disabled={(bappa.booking_status === 'booked' || bappa.booking_status === 'pending' )}
// //           className={`w-full py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
// //             (bappa.booking_status === 'booked' || bappa.booking_status === 'pending' )
// //               ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
// //               : 'bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 text-white hover:from-orange-600 hover:via-red-600 hover:to-purple-600 transform hover:scale-105 shadow-lg hover:shadow-xl'
// //           }`}
// //         >
          
// //           {(bappa.booking_status === 'booked' || bappa.booking_status === 'pending' ) ? (
// //             <span>{bappa.booking_status}</span>
// //           ) : (
// //             <>
// //               {/* <ShoppingCart className="h-5 w-5" /> */}
// //               <span>Book Now</span>
// //             </>
// //           )}
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default BappaCard;

// import React, { useEffect, useState } from 'react';
// import { ShoppingCart, Ruler, IndianRupee, ChevronLeft, ChevronRight } from 'lucide-react'; // Import ChevronLeft, ChevronRight
// import { useAuthenticated } from '@nhost/react';
// import { gql } from '@apollo/client'; // Import gql
// import nhost from '../nhost'; // Assuming nhost is correctly configured and imported

// // GraphQL Query to get Murti images
// const GET_MURTI_IMAGES = gql`
//   query GetMurtiImages($murti_id: Int!) {
//     murti_images(where: {murti_id: {_eq: $murti_id}}) {
//       id
//       image_id
//       murti_id
//     }
//   }
// `;

// // Image Slider Component (copied from AdminPage, ensure consistency)
// const ImageSlider = ({ images, defaultImage, altText, className }) => {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [imageUrls, setImageUrls] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const loadImages = async () => {
//       setIsLoading(true);
      
//       if (!images || images.length === 0) {
//         setImageUrls([defaultImage]);
//         setIsLoading(false);
//         return;
//       }

//       try {
//         const urls = images.map(img => 
//           nhost.storage.getPublicUrl({ fileId: img.image_id })
//         ).filter(url => url); // Filter out any null/undefined URLs

//         if (urls.length > 0) {
//           setImageUrls(urls);
//         } else {
//           setImageUrls([defaultImage]);
//         }
//       } catch (error) {
//         console.error('Error loading images:', error);
//         setImageUrls([defaultImage]);
//       }
      
//       setIsLoading(false);
//     };

//     loadImages();
//   }, [images, defaultImage]);

//   const nextImage = (e) => {
//     e.stopPropagation();
//     setCurrentImageIndex((prev) => 
//       prev === imageUrls.length - 1 ? 0 : prev + 1
//     );
//   };

//   const prevImage = (e) => {
//     e.stopPropagation();
//     setCurrentImageIndex((prev) => 
//       prev === 0 ? imageUrls.length - 1 : prev - 1
//     );
//   };

//   if (isLoading) {
//     return (
//       <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
//         <span className="text-gray-500 text-xs">Loading...</span>
//       </div>
//     );
//   }

//   return (
//     <div className={`relative ${className} group`}>
//       <img
//         src={imageUrls[currentImageIndex] || defaultImage}
//         alt={altText}
//         className="w-full h-full rounded-lg object-contain"
//         onError={(e) => {
//           e.target.src = defaultImage;
//         }}
//       />
      
//       {imageUrls.length > 1 && (
//         <>
//           {/* Left Arrow */}
//           <button
//             onClick={prevImage}
//             className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
//             title="Previous image"
//           >
//             <ChevronLeft className="w-3 h-3" />
//           </button>
          
//           {/* Right Arrow */}
//           <button
//             onClick={nextImage}
//             className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
//             title="Next image"
//           >
//             <ChevronRight className="w-3 h-3" />
//           </button>
          
//           {/* Image Counter */}
//           <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//             {currentImageIndex + 1}/{imageUrls.length}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };


// const BappaCard = ({ bappa, onBuyNow }) => {
//   const [murtiImages, setMurtiImages] = useState([]);
//   const defaultImage = 'https://images.pexels.com/photos/8636095/pexels-photo-8636095.jpeg?auto=compress&cs=tinysrgb&w=500';

//   useEffect(() => {
//     const fetchImages = async () => {
//       if (bappa.id) {
//         try {
//           const { data, error } = await nhost.graphql.request(
//             GET_MURTI_IMAGES,
//             { murti_id: parseInt(bappa.id) }
//           );
//           if (data?.murti_images) {
//             setMurtiImages(data.murti_images);
//           } else if (error) {
//             console.error("Error fetching murti images:", error);
//           }
//         } catch (err) {
//           console.error("Network error fetching murti images:", err);
//         }
//       }
//     };

//     fetchImages();
//   }, [bappa.id]);


//   return (
//     <div className="bg-white/90 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
//       <div className="relative shadow-lg rounded-t-2xl overflow-hidden">
//         <ImageSlider 
//           images={murtiImages}
//           defaultImage={defaultImage}
//           altText={bappa.name}
//           className="w-full h-64" // Adjust size as needed
//         />
//       </div>
      
//       <div className="p-6">
//         <h3 className="text-2xl font-bold text-gray-800 mb-3">{bappa.murti_id}</h3>
        
//         <div className="space-y-3 mb-6">
//           <div className="flex items-center space-x-3 text-gray-600">
//             <Ruler className="h-5 w-5 text-orange-500" />
//             <span className="font-medium">{bappa.size}</span>
//           </div>
          
//           <div className="flex items-center space-x-3 text-gray-800">
//             <IndianRupee className="h-5 w-5 text-green-600" />
//             <span className="text-2xl font-bold">{bappa.final_price}</span>
//           </div>
//         </div>
       

//      <button
//           onClick={() => onBuyNow(bappa)}
//           disabled={(bappa.booking_status === 'booked' || bappa.booking_status === 'pending' )}
//           className={`w-full py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
//             (bappa.booking_status === 'booked' || bappa.booking_status === 'pending' )
//               ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//               : 'bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 text-white hover:from-orange-600 hover:via-red-600 hover:to-purple-600 transform hover:scale-105 shadow-lg hover:shadow-xl'
//           }`}
//         >
          
//           {(bappa.booking_status === 'booked' || bappa.booking_status === 'pending' ) ? (
//             <span>{bappa.booking_status}</span>
//           ) : (
//             <>
//               <span>Book Now</span>
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default BappaCard;
import React, { useEffect, useState } from 'react';
import { ShoppingCart, Ruler, IndianRupee, ChevronLeft, ChevronRight, Eye } from 'lucide-react'; // Import Eye icon
import { useAuthenticated } from '@nhost/react';
import { gql } from '@apollo/client';
import nhost from '../nhost';
import ImagePreviewModal from './ImagePreviewModal'; // Import the new modal component
import dedaultimage from '../assets/weblogo.png'

// GraphQL Query to get Murti images
const GET_MURTI_IMAGES = gql`
  query GetMurtiImages($murti_id: Int!) {
    murti_images(where: {murti_id: {_eq: $murti_id}}) {
      id
      image_id
      murti_id
    }
  }
`;

// Image Slider Component (keep this consistent with ImagePreviewModal and AdminPage)
const ImageSlider = ({ images, defaultImage, altText, className }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      
      if (!images || images.length === 0) {
        setImageUrls([dedaultimage]);
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
        setImageUrls([dedaultimage]);
      }
      
      setIsLoading(false);
    };

    loadImages();
  }, [images, dedaultimage]);

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
        src={imageUrls[currentImageIndex] || dedaultimage}
        alt={altText}
        className="w-full h-full rounded-lg object-contain"
        onError={(e) => {
          e.target.src = dedaultimage;
        }}
      />
      
      {imageUrls.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1  transition-opacity duration-200 hover:bg-opacity-70"
            title="Previous image"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1  transition-opacity duration-200 hover:bg-opacity-70"
            title="Next image"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
          
          <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded transition-opacity duration-200">
            {currentImageIndex + 1}/{imageUrls.length}
          </div>
        </>
      )}
    </div>
  );
};


const BappaCard = ({ bappa, onBuyNow }) => {
  const [murtiImages, setMurtiImages] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false); // New state for modal
  const defaultImage = 'https://images.pexels.com/photos/8636095/pexels-photo-8636095.jpeg?auto=compress&cs=tinysrgb&w=500';

  useEffect(() => {
    const fetchImages = async () => {
      if (bappa.id) {
        try {
          const { data, error } = await nhost.graphql.request(
            GET_MURTI_IMAGES,
            { murti_id: parseInt(bappa.id) }
          );
          if (data?.murti_images) {
            setMurtiImages(data.murti_images);
          } else if (error) {
            console.error("Error fetching murti images:", error);
          }
        } catch (err) {
          console.error("Network error fetching murti images:", err);
        }
      }
    };

    fetchImages();
  }, [bappa.id]);

  const handlePreviewClick = () => {
    setShowPreviewModal(true);
  };

  const handleClosePreviewModal = () => {
    setShowPreviewModal(false);
  };

  return (
    <div className="bg-white/90 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <div className="relative shadow-lg rounded-t-2xl overflow-hidden">
        <ImageSlider 
          images={murtiImages}
          defaultImage={defaultImage}
          altText={bappa.name}
          className="w-full h-64"
        />
        
        {/* Preview Button */}
        <button
          onClick={handlePreviewClick}
          className="absolute top-3 right-3 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-opacity duration-200"
          title="Preview Images"
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Murti No : {bappa.murti_id}</h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3 text-gray-600">
            <Ruler className="h-5 w-5 text-orange-500" />
            <span className="font-medium">{bappa.size}</span>
          </div>
          
          <div className="flex items-center space-x-3 text-gray-800">
            <IndianRupee className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold">{bappa.final_price}</span>
          </div>
        </div>
       

     <button
          onClick={() => onBuyNow(bappa)}
          disabled={(bappa.booking_status === 'booked' || bappa.booking_status === 'pending' )}
          className={`w-full py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
            (bappa.booking_status === 'booked' || bappa.booking_status === 'pending' )
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 text-white hover:from-orange-600 hover:via-red-600 hover:to-purple-600 transform hover:scale-105 shadow-lg hover:shadow-xl'
          }`}
        >
          
          {(bappa.booking_status === 'booked' || bappa.booking_status === 'pending' ) ? (
            <span>{bappa.booking_status}</span>
          ) : (
            <>
              <span>Book Now</span>
            </>
          )}
        </button>
      </div>

      {showPreviewModal && (
        <ImagePreviewModal
          bappa={bappa}
          images={murtiImages}
          onClose={handleClosePreviewModal}
        />
      )}
    </div>
  );
};

export default BappaCard;