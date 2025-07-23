// import React, { useEffect, useState } from 'react';
// import { Plus, List, Calendar, User, Phone, IndianRupee, Trash2 } from 'lucide-react';
// import AddBappaModal from './AddBappaModal';
// import { useAuthenticated } from '@nhost/react';
// import LoginModal from './LoginModal';
// import { gql, useQuery } from '@apollo/client';
// import { useMutation } from '@apollo/client';
// import BappaDetailsModal from '../components/BappaDetails';


// const DELETE_BAPPA = gql`
//   mutation DeleteBappa($id: Int!) {
//     delete_murti_history(where: { id: { _eq: $id } }) {
//       affected_rows
//     }
//   }
// `;

// const APPROVE_BAPPA = gql`
//   mutation ApproveBappa($id: Int!, $booking_status: String!) {
//     update_murti_history(
//       where: { id: { _eq: $id } }
//       _set: { booking_status: $booking_status }
//     ) {
//       returning {
//         id
//         booking_status
//         booked_by
//       }
//     }
//   }
// `;

// const UPDATE_BAPPA = gql`
// mutation UpdateBappa($id: Int!, $murti_id: String!, $final_price: String!) {
//     update_murti_history(
//       where: { id: { _eq: $id } },
//       _set: { murti_id: $murti_id, final_price: $final_price }
//     ) {
//       affected_rows
//     }
//   }
// `;

// const GET_MURTI_HISTORY = gql`
//   query MyQuery {
//     murti_history {
//       id
//       murti_id
//       size
//       final_price
//       booking_status
//       image
//       customer_name
//       customer_phone
//       customer_email
//       paid_amount
//       discount_price
//       paid_amount_sc
//       suggestions
//       booked_by
//     }
//   }
// `;

// const AdminPage = ({ onAddBappa }) => {
//   const [showAddModal, setShowAddModal] = useState(false);
//   const { loading, error, data, refetch } = useQuery(GET_MURTI_HISTORY);
//   const [approveBappa] = useMutation(APPROVE_BAPPA);
//   const [deleteBappa] = useMutation(DELETE_BAPPA);
//   const [editingId, setEditingId] = useState(null);
//   const [editedValues, setEditedValues] = useState({});
//   const [updateBappa] = useMutation(UPDATE_BAPPA);
//   const [selectedBappa, setSelectedBappa] = useState(null);

//   const handleEditClick = (bappa) => {
//     console.log("editingId : ", bappa.id)
//     setEditingId(bappa.id);
//     setEditedValues({
//       murti_id: bappa.name,
//       final_price: bappa.price,
//     });
//   };

//   const handleSaveClick = async (id) => {
//     try {
//       await updateBappa({
//         variables: {
//           id,
//           murti_id: editedValues.murti_id,
//           final_price: editedValues.final_price,
//         },
//       });
//       setEditingId(null);
//       await refetch(); // refresh the list
//     } catch (err) {
//       console.error("Error updating Bappa", err);
//       alert("Failed to update!");
//     }
//   };

//   const handleInputChange = (field, value) => {
//     setEditedValues(prev => ({ ...prev, [field]: value }));
//   };

//   const isAuthenticated = useAuthenticated();
//   const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated);

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this Bappa?")) {
//       try {
//         await deleteBappa({ variables: { id } });
//         await refetch(); // refresh data
//       } catch (error) {
//         console.error("Failed to delete Bappa:", error);
//         alert("Something went wrong while deleting!");
//       }
//     }
//   };

//   if (!isAuthenticated) {
//     return (
//       <>
//         {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
//       </>
//     );
//   }

//   const murtiData = data?.murti_history || [];

//   const bappas = murtiData.map(item => ({
//     id: item.id,
//     name: item.murti_id,
//     size: item.size,
//     price: item.final_price,
//     image: item.image || 'https://images.pexels.com/photos/8636095/pexels-photo-8636095.jpeg?auto=compress&cs=tinysrgb&w=500',
//     booked: item.booking_status === 'booked',
//     booking_status: item.booking_status,
//     fullName: item.customer_name,
//     phoneNumber: item.customer_phone,
//     paid_amount: item.paid_amount,
//     paid_amount_sc: item.paid_amount_sc
//   }));

//   const bookings = murtiData
//     .filter(item => item.booking_status === 'booked')
//     .map(item => ({
//       bappaId: item.id,
//       fullName: item.customer_name,
//       phoneNumber: item.customer_phone,
//       bookedAt: item.created_at || new Date().toISOString(),
//     }));

//   const bookedBappas = bappas.filter(b => b.booked);
//   console.log("booked bappas : ", bappas)
//   const availableBappas = bappas.filter(b => !b.booked);

//   const handleApprove = async (id) => {
//     try {
//       await approveBappa({
//         variables: {
//           id,
//           booking_status: "booked"
//         }
//       });

//       await refetch(); // Refresh data
//     } catch (err) {
//       console.error("Failed to approve Bappa:", err);
//       alert("Something went wrong while approving!");
//     }
//   };

//   const getBookingDetails = (bappaId) =>
//     bookings.find(booking => booking.bappaId === bappaId);

//   useEffect(() => {
//     refetch()
//   }, [showAddModal])
//   const [filterStatus, setFilterStatus] = useState("");

// // Filtered Murtis
// const filteredBappas = bappas.filter((b) => {
//   if (!filterStatus) return true;
//   return filterStatus === "available"
//     ? b.booking_status !== "booked" && b.booking_status !== "pending"
//     : b.booking_status === filterStatus;
// });

// // Totals (for booked only)
// const bookedOnly = bappas.filter(b => b.booking_status === "booked");

// const totalFinal = bookedOnly.reduce((sum, b) => sum + Number(b.price || 0), 0);
// const totalPaid = bookedOnly.reduce((sum, b) => sum + Number(b.paid_amount || 0), 0);
// const totalRemaining = totalFinal - totalPaid;


//   return (
//     <div className="container mx-auto px-4 py-8">
      
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
//         <div>
//           <h2 className="text-3xl md:text-4xl font-bold text-gray-200 mb-2">Admin Dashboard</h2>
//           <p className="text-gray-200">Manage your Ganpati Bappa collection and bookings</p>
//         </div>

//         <button
//           onClick={() => setShowAddModal(true)}
//           className="mt-4 md:mt-0 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
//         >
//           <Plus className="h-5 w-5" />
//           <span>Add New Murti</span>
//         </button>
//       </div>

//       {/* Statistics */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Total Murti</p>
//               <p className="text-3xl font-bold text-blue-600">{bappas.length}</p>
//             </div>
//             <List className="h-12 w-12 text-blue-500" />
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Booked</p>
//               <p className="text-3xl font-bold text-green-600">{bookedBappas.length}</p>
//             </div>
//             <Calendar className="h-12 w-12 text-green-500" />
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Available</p>
//               <p className="text-3xl font-bold text-orange-600">{availableBappas.length}</p>
//             </div>
//             <IndianRupee className="h-12 w-12 text-orange-500" />
//           </div>
//         </div>
//       </div>

//       {/* Booked Bappas */}
//       <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
//         <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
//           <Calendar className="h-6 w-6 text-green-500" />
//           <span>Booked Murti</span>
//         </h3>

//         {bookedBappas.length === 0 ? (
//           <p className="text-gray-500 text-center py-8">No bookings yet</p>
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {bookedBappas.map((bappa,index) => {
//               const booking = getBookingDetails(bappa.id);
//               return (
//                 <div key={bappa.id}
//                 onClick={() => setSelectedBappa(bappa)}

//                 className="border rounded-xl p-4 hover:shadow-md transition-shadow">
//                   <div className="flex space-x-4">
//                     <img
//                       src={bappa.image}
//                       alt={bappa.name}
//                       className="w-20 h-20 rounded-lg object-contain"
//                     />
//                     <div className="flex-1">
//                       <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
//                         {editingId === bappa.id ? (
//                           <input
//                             type="text"
//                             className="border px-2 py-1 rounded w-full text-sm"
//                             value={editedValues.murti_id}
//                             onChange={(e) => handleInputChange('murti_id', e.target.value)}
//                           />
//                         ) : (
//                           <h4 className="font-bold text-gray-800">{bappa.name}</h4>
//                         )}
//                         <span className={`px-2 py-1 rounded-full text-xs font-bold ${bappa.booked
//                           ? 'bg-green-100 text-green-700'
//                           : 'bg-blue-100 text-blue-700'
//                           }`}>
//                           {bappa.booking_status}
//                         </span>
//                       </div>
//                       <p className="text-sm text-gray-600 mb-2">ID: #{index+1} | {bappa.size}</p>
//                       {editingId === bappa.id ? (
//                         <input
//                           type="text"
//                           className="border px-2 py-1 rounded w-full text-sm mb-1"
//                           value={editedValues.final_price}
//                           onChange={(e) => handleInputChange('final_price', e.target.value)}
//                           placeholder="Final Price"
//                         />
//                       ) : (
//                         <p className="font-bold text-green-600">₹{bappa.price}</p>
//                       )}

//                       {booking && (
//                         <div className="mt-3 space-y-1 text-sm">
//                           <div className="flex items-center space-x-2">
//                             <User className="h-4 w-4 text-gray-500" />
//                             <span>{booking.fullName}</span>
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             <Phone className="h-4 w-4 text-gray-500" />
//                             <span>{booking.phoneNumber}</span>
//                           </div>
//                           <p className="text-xs text-gray-500">
//                             Booked: {new Date(booking.bookedAt).toLocaleDateString()}
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* All Bappas */}
//       <div className="bg-white rounded-xl shadow-lg p-6">
//         <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
//           <List className="h-6 w-6 text-blue-500" />
//           <span>All Murti</span>
//         </h3>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {bappas.map((bappa,index) => (
//             <div key={bappa.id} className={`relative border rounded-xl p-4 ${bappa.booked ? 'bg-green-50 border-green-200' : 'hover:shadow-md'} transition-all`}>

//               {editingId === bappa.id ? (
//                 <button
//                   onClick={() => handleSaveClick(bappa.id)}
//                   className="absolute top-2 right-10 text-green-600 hover:text-green-800"
//                   title="Save"
//                 >
//                   💾
//                 </button>
//               ) : (
//                 <button
//                   onClick={() => handleEditClick(bappa)}
//                   className="absolute top-2 right-10 text-blue-600 hover:text-blue-800"
//                   title="Edit"
//                 >
//                   ✏️
//                 </button>
//               )}
//               <button
//                 onClick={() => handleDelete(bappa.id)}
//                 className="absolute top-2 right-2 text-red-500 hover:text-red-700"
//                 title="Delete"
//               >
//                 <Trash2 className="w-5 h-5" />
//               </button>

//               <div className="flex space-x-4">
//                 <img
//                   src={bappa.image}
//                   alt={bappa.name}
//                   className="w-16 h-16 rounded-lg object-contain"
//                 />
//                 <div className="flex-1">
//                   <div className="flex items-center justify-between mb-2">
//                     {editingId === bappa.id ? (
//                       <input
//                         type="text"
//                         className="border px-2 py-1 rounded w-full text-sm mr-2"
//                         value={editedValues.murti_id}
//                         onChange={(e) => handleInputChange('murti_id', e.target.value)}
//                         placeholder="Murti ID"
//                       />
//                     ) : (
//                       <h4 className="font-bold text-gray-800">{bappa.name}</h4>
//                     )}
//                     <span className={`absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-bold shadow ${bappa.booked
//                       ? 'bg-green-100 text-green-700'
//                       : 'bg-blue-100 text-blue-700'
//                       }`}>
//                       {bappa.booking_status}
//                     </span>
//                   </div>
//                   <p className="text-sm text-gray-600">ID: #{index+1}</p>
//                   <p className="text-sm text-gray-600">{bappa.size}</p>
//                   {editingId === bappa.id ? (
//                     <input
//                       type="number"
//                       className="border px-2 py-1 rounded w-full text-sm mt-1"
//                       value={editedValues.final_price}
//                       onChange={(e) => handleInputChange('final_price', e.target.value)}
//                       placeholder="Final Price"
//                     />
//                   ) : (
//                     <p className="font-bold text-green-600">₹{bappa.price}</p>
//                   )}
//                   {bappa.booking_status === "pending" && <>
//                     <div className="flex items-center space-x-2">
//                       <User className="h-4 w-4 text-gray-500" />
//                       <span>{bappa.fullName}</span>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <Phone className="h-4 w-4 text-gray-500" />
//                       <span>{bappa.phoneNumber}</span>
//                     </div>
//                     <button
//                       className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
//                       onClick={() => handleApprove(bappa.id)}
//                     >
//                       Approve
//                     </button>
//                   </>
//                   }
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//       {/* Murti Tally Section */}
// <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
//   <h3 className="text-2xl font-bold text-gray-800 mb-4">Murti Tally Summary</h3>

//   {/* Filters */}
//   <div className="flex gap-4 mb-4">
//     <select
//       className="border px-3 py-2 rounded-md"
//       value={filterStatus}
//       onChange={(e) => setFilterStatus(e.target.value)}
//     >
//       <option value="">All</option>
//       <option value="available">Available</option>
//       <option value="pending">Pending</option>
//       <option value="booked">Booked</option>
//     </select>
//   </div>

//   {/* Tally Table */}
//   <div className="overflow-x-auto">
//     <table className="min-w-full border border-gray-200 rounded-xl">
//       <thead className="bg-gray-100">
//         <tr>
//           <th className="p-3 text-left">#</th>
//           <th className="p-3 text-left">Murti ID</th>
//           <th className="p-3 text-left">Status</th>
//           <th className="p-3 text-left">Final Price</th>
//           <th className="p-3 text-left">Paid Amount</th>
//           <th className="p-3 text-left">Remaining</th>
//         </tr>
//       </thead>
//       <tbody>
//         {filteredBappas.map((bappa, idx) => (
//           <tr key={bappa.id} className="border-t">
//             <td className="p-3">{idx + 1}</td>
//             <td className="p-3">{bappa.name}</td>
//             <td className="p-3 capitalize">{bappa.booking_status}</td>
//             <td className="p-3">₹{bappa.price || 0}</td>
//             <td className="p-3">₹{bappa.paid_amount || 0}</td>
//             <td className="p-3">₹{(bappa.price || 0) - (bappa.paid_amount || 0)}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>

//   {/* Totals */}
//   <div className="mt-4 text-right space-y-1 font-semibold">
//     <p>Total Final Price: ₹{totalFinal}</p>
//     <p>Total Paid: ₹{totalPaid}</p>
//     <p>Total Remaining: ₹{totalRemaining}</p>
//   </div>
// </div>


//       {showAddModal && (
//         <AddBappaModal
//           onClose={() => setShowAddModal(false)}
//           onAddBappa={onAddBappa}
//         />
//       )}
//       {selectedBappa && (
//   <BappaDetailsModal
//     bappa={selectedBappa}
//     onClose={() => setSelectedBappa(null)}
//   />
// )}

//     </div>
//   );
// };

// export default AdminPage;
import React, { useEffect, useState } from 'react';
import { Plus, List, Calendar, User, Phone, IndianRupee, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import AddBappaModal from './AddBappaModal';
import { useAuthenticated } from '@nhost/react';
import LoginModal from './LoginModal';
import { gql, useQuery } from '@apollo/client';
import { useMutation } from '@apollo/client';
import BappaDetailsModal from '../components/BappaDetails';
import nhost from '../nhost';

const DELETE_BAPPA = gql`
  mutation DeleteBappa($id: Int!) {
    delete_murti_history(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

const APPROVE_BAPPA = gql`
  mutation ApproveBappa($id: Int!, $booking_status: String!) {
    update_murti_history(
      where: { id: { _eq: $id } }
      _set: { booking_status: $booking_status }
    ) {
      returning {
        id
        booking_status
        booked_by
      }
    }
  }
`;

const UPDATE_BAPPA = gql`
mutation UpdateBappa($id: Int!, $murti_id: String!, $final_price: String!) {
    update_murti_history(
      where: { id: { _eq: $id } },
      _set: { murti_id: $murti_id, final_price: $final_price }
    ) {
      affected_rows
    }
  }
`;

const GET_MURTI_HISTORY = gql`
  query MyQuery {
    murti_history {
      id
      murti_id
      size
      final_price
      booking_status
      image
      customer_name
      customer_phone
      customer_email
      paid_amount
      discount_price
      paid_amount_sc
      suggestions
      booked_by
    }
  }
`;

const GET_MURTI_IMAGES = gql`
  query GetMurtiImages($murti_id: Int!) {
    murti_images(where: {murti_id: {_eq: $murti_id}}) {
      id
      image_id
      murti_id
    }
  }
`;

// Image Slider Component
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
        ).filter(url => url); // Filter out any null/undefined URLs

        if (urls.length > 0) {
          setImageUrls(urls);
        } else {
          setImageUrls([defaultImage]);
        }
      } catch (error) {
        console.error('Error loading images:', error);
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
          {/* Left Arrow */}
          <button
            onClick={prevImage}
            className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
            title="Previous image"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          
          {/* Right Arrow */}
          <button
            onClick={nextImage}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
            title="Next image"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
          
          {/* Image Counter */}
          <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {currentImageIndex + 1}/{imageUrls.length}
          </div>
        </>
      )}
    </div>
  );
};

const AdminPage = ({ onAddBappa }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const { loading, error, data, refetch } = useQuery(GET_MURTI_HISTORY);
  const [approveBappa] = useMutation(APPROVE_BAPPA);
  const [deleteBappa] = useMutation(DELETE_BAPPA);
  const [editingId, setEditingId] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [updateBappa] = useMutation(UPDATE_BAPPA);
  const [selectedBappa, setSelectedBappa] = useState(null);
  const [murtiImagesData, setMurtiImagesData] = useState({});
  const [sizeFilter, setSizeFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // Renamed for clarity to avoid confusion with bappa.booking_status

  // Function to fetch images for a specific murti
  const fetchMurtiImages = async (murtiId) => {
    try {
      const { data: imageData } = await nhost.graphql.request(
        GET_MURTI_IMAGES,
        { murti_id: parseInt(murtiId) }
      );
      return imageData?.murti_images || [];
    } catch (error) {
      console.error('Error fetching murti images:', error);
      return [];
    }
  };

  // Load images for all murtis when data changes
  useEffect(() => {
    const loadAllImages = async () => {
      if (!data?.murti_history) return;

      const imagesMap = {};
      
      for (const murti of data.murti_history) {
        const images = await fetchMurtiImages(murti.id);
        imagesMap[murti.id] = images;
      }
      
      setMurtiImagesData(imagesMap);
    };

    loadAllImages();
  }, [data]);

  const handleEditClick = (bappa) => {
    console.log("editingId : ", bappa.id)
    setEditingId(bappa.id);
    setEditedValues({
      murti_id: bappa.name,
      final_price: bappa.price,
    });
  };

  const handleSaveClick = async (id) => {
    try {
      await updateBappa({
        variables: {
          id,
          murti_id: editedValues.murti_id,
          final_price: editedValues.final_price,
        },
      });
      setEditingId(null);
      await refetch(); // refresh the list
    } catch (err) {
      console.error("Error updating Bappa", err);
      alert("Failed to update!");
    }
  };

  const handleInputChange = (field, value) => {
    setEditedValues(prev => ({ ...prev, [field]: value }));
  };

  const isAuthenticated = useAuthenticated();
  const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Bappa?")) {
      try {
        await deleteBappa({ variables: { id } });
        await refetch(); // refresh data
      } catch (error) {
        console.error("Failed to delete Bappa:", error);
        alert("Something went wrong while deleting!");
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      </>
    );
  }

  const murtiData = data?.murti_history || [];

  const bappas = murtiData.map(item => ({
    id: item.id,
    name: item.murti_id,
    size: item.size,
    price: item.final_price,
    image: item.image || 'https://images.pexels.com/photos/8636095/pexels-photo-8636095.jpeg?auto=compress&cs=tinysrgb&w=500',
    booked: item.booking_status === 'booked',
    booking_status: item.booking_status,
    fullName: item.customer_name,
    phoneNumber: item.customer_phone,
    paid_amount: item.paid_amount,
    paid_amount_sc: item.paid_amount_sc,
    suggestions: item.suggestions, // Make sure suggestions are passed
    customer_email: item.customer_email, // Make sure email is passed
    images: murtiImagesData[item.id] || [] // Add images array
  }));

  const bookings = murtiData
    .filter(item => item.booking_status === 'booked')
    .map(item => ({
      bappaId: item.id,
      fullName: item.customer_name,
      phoneNumber: item.customer_phone,
      bookedAt: item.created_at || new Date().toISOString(),
    }));

  const applyFilters = (bappaList) => {
    return bappaList
      .filter((b) => {
        if (!filterStatus) return true; // No status filter applied
        if (filterStatus === "available") {
          return b.booking_status !== "booked" && b.booking_status !== "pending";
        }
        return b.booking_status === filterStatus;
      })
      .filter((b) => !sizeFilter || b.size === sizeFilter)
      .filter((b) =>
        searchText.trim() === ""
          ? true
          : (b.name || "").toLowerCase().includes(searchText.toLowerCase()) ||
            (b.fullName || "").toLowerCase().includes(searchText.toLowerCase()) ||
            (b.size || "").toLowerCase().includes(searchText.toLowerCase())
      );
  };
    
  const bookedBappas = applyFilters(bappas.filter((b) => b.booking_status === "booked"));
  const availableBappas = applyFilters(bappas.filter((b) => b.booking_status !== "booked" && b.booking_status !== "pending"));
  const pendingBappas = applyFilters(bappas.filter((b) => b.booking_status === "pending")); // Added for clarity
  const allFilteredBappas = applyFilters(bappas); // This is the array you need for "All Murti" section

  const handleApprove = async (id) => {
    try {
      await approveBappa({
        variables: {
          id,
          booking_status: "booked"
        }
      });

      await refetch(); // Refresh data
    } catch (err) {
      console.error("Failed to approve Bappa:", err);
      alert("Something went wrong while approving!");
    }
  };

  const getBookingDetails = (bappaId) =>
    bookings.find(booking => booking.bappaId === bappaId);

  useEffect(() => {
    refetch()
  }, [showAddModal])
  
  // Totals (for booked only)
  const totalFinal = bookedBappas.reduce((sum, b) => sum + Number(b.price || 0), 0);
  const totalPaid = bookedBappas.reduce((sum, b) => sum + Number(b.paid_amount || 0), 0);
  const totalRemaining = totalFinal - totalPaid;

  return (
    <div className="container mx-auto px-4 py-8">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-200 mb-2">Admin Dashboard</h2>
          <p className="text-gray-200">Manage your Ganpati Bappa collection and bookings</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 md:mt-0 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Murti</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Murti</p>
              <p className="text-3xl font-bold text-blue-600">{allFilteredBappas.length}</p> {/* Use allFilteredBappas */}
            </div>
            <List className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Booked</p>
              <p className="text-3xl font-bold text-green-600">{bookedBappas.length}</p>
            </div>
            <Calendar className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-3xl font-bold text-orange-600">{availableBappas.length}</p>
            </div>
            <IndianRupee className="h-12 w-12 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        {/* Filter by Booking Status */}
        <select
          className="border px-3 py-2 rounded-md"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="available">Available</option>
          <option value="pending">Pending</option>
          <option value="booked">Booked</option>
        </select>

        {/* Filter by Size */}
        <select
          className="border px-3 py-2 rounded-md"
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value)}
        >
          <option value="">All Sizes</option>
          {[6, 9, 11, 12, 13, 14, 15, 18].map((value) => (
            <option key={value} value={`${value} inches`}>
              {value} inches
            </option>
          ))}
        </select>

        {/* Search Box */}
        <input
          type="text"
          className="border px-3 py-2 rounded-md flex-grow"
          placeholder="Search by Murti ID, Customer Name, or Size..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Booked Bappas */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-green-500" />
          <span>Booked Murti</span>
        </h3>

        {bookedBappas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No bookings yet for the current filters.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bookedBappas.map((bappa,index) => {
              const booking = getBookingDetails(bappa.id);
              return (
                <div key={bappa.id}
                onClick={() => setSelectedBappa(bappa)}
                className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex space-x-4">
                    <ImageSlider 
                      images={bappa.images}
                      defaultImage={bappa.image}
                      altText={bappa.name}
                      className="w-20 h-20 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        {editingId === bappa.id ? (
                          <input
                            type="text"
                            className="border px-2 py-1 rounded w-full text-sm"
                            value={editedValues.murti_id}
                            onChange={(e) => handleInputChange('murti_id', e.target.value)}
                          />
                        ) : (
                          <h4 className="font-bold text-gray-800">{bappa.name}</h4>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${bappa.booked
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                          }`}>
                          {bappa.booking_status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">ID: #{index+1} | {bappa.size}</p>
                      {editingId === bappa.id ? (
                        <input
                          type="text"
                          className="border px-2 py-1 rounded w-full text-sm mb-1"
                          value={editedValues.final_price}
                          onChange={(e) => handleInputChange('final_price', e.target.value)}
                          placeholder="Final Price"
                        />
                      ) : (
                        <p className="font-bold text-green-600">₹{bappa.price}</p>
                      )}

                      {booking && (
                        <div className="mt-3 space-y-1 text-sm">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>{booking.fullName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{booking.phoneNumber}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Booked: {new Date(booking.bookedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All Bappas */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
          <List className="h-6 w-6 text-blue-500" />
          <span>All Murti</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allFilteredBappas.length === 0 ? (
            <p className="text-gray-500 text-center py-8 col-span-full">No murti found matching the current filters.</p>
          ) : (
            allFilteredBappas.map((bappa,index) => ( 
              <div key={bappa.id} className={`relative border rounded-xl p-4 ${bappa.booked ? 'bg-green-50 border-green-200' : 'hover:shadow-md'} transition-all`}>

                {editingId === bappa.id ? (
                  <button
                    onClick={() => handleSaveClick(bappa.id)}
                    className="absolute top-2 right-10 text-green-600 hover:text-green-800"
                    title="Save"
                  >
                    💾
                  </button>
                ) : (
                  <button
                    onClick={() => handleEditClick(bappa)}
                    className="absolute top-2 right-10 text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    ✏️
                  </button>
                )}
                <button
                  onClick={() => handleDelete(bappa.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="flex space-x-4">
                  <ImageSlider 
                    images={bappa.images}
                    defaultImage={bappa.image}
                    altText={bappa.name}
                    className="w-16 h-16 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      {editingId === bappa.id ? (
                        <input
                          type="text"
                          className="border px-2 py-1 rounded w-full text-sm mr-2"
                          value={editedValues.murti_id}
                          onChange={(e) => handleInputChange('murti_id', e.target.value)}
                          placeholder="Murti ID"
                        />
                      ) : (
                        <h4 className="font-bold text-gray-800">{bappa.name}</h4>
                      )}
                      <span className={`absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-bold shadow ${bappa.booked
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                        }`}>
                        {bappa.booking_status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">ID: #{index+1}</p>
                    <p className="text-sm text-gray-600">{bappa.size}</p>
                    {editingId === bappa.id ? (
                      <input
                        type="number"
                        className="border px-2 py-1 rounded w-full text-sm mt-1"
                        value={editedValues.final_price}
                        onChange={(e) => handleInputChange('final_price', e.target.value)}
                        placeholder="Final Price"
                      />
                    ) : (
                      <p className="font-bold text-green-600">₹{bappa.price}</p>
                    )}
                    {bappa.booking_status === "pending" && <>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{bappa.fullName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{bappa.phoneNumber}</span>
                      </div>
                      <button
                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                        onClick={() => handleApprove(bappa.id)}
                      >
                        Approve
                      </button>
                    </>
                    }
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Murti Tally Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Murti Tally Summary</h3>

        {/* Filters - Keep these filters in sync with the main ones if they are meant to control this section */}
        {/* You already have the global filter states, so these separate selects here might be redundant
            unless you intend for independent filtering for the tally. For consistency, removing these
            and relying on the main filters is usually better. If you need separate filters for tally,
            you'd need separate state variables for them. */}
        {/* <div className="flex gap-4 mb-4">
          <select
            className="border px-3 py-2 rounded-md"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="available">Available</option>
            <option value="pending">Pending</option>
            <option value="booked">Booked</option>
          </select>
        </div> */}

        {/* Tally Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-xl">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Murti ID</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Final Price</th>
                <th className="p-3 text-left">Paid Amount</th>
                <th className="p-3 text-left">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {allFilteredBappas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-3 text-center text-gray-500">No data available for the current filters.</td>
                </tr>
              ) : (
                allFilteredBappas.map((bappa, idx) => ( 
                  <tr key={bappa.id} className="border-t">
                    <td className="p-3">{idx + 1}</td>
                    <td className="p-3">{bappa.name}</td>
                    <td className="p-3 capitalize">{bappa.booking_status}</td>
                    <td className="p-3">₹{bappa.price || 0}</td>
                    <td className="p-3">₹{bappa.paid_amount || 0}</td>
                    <td className="p-3">₹{(bappa.price || 0) - (bappa.paid_amount || 0)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 text-right space-y-1 font-semibold">
          <p>Total Final Price (Booked): ₹{totalFinal}</p> {/* Clarified this total is for booked */}
          <p>Total Paid (Booked): ₹{totalPaid}</p> {/* Clarified this total is for booked */}
          <p>Total Remaining (Booked): ₹{totalRemaining}</p> {/* Clarified this total is for booked */}
        </div>
      </div>

      {showAddModal && (
        <AddBappaModal
          onClose={() => setShowAddModal(false)}
          onAddBappa={onAddBappa}
        />
      )}
      
      {selectedBappa && (
        <BappaDetailsModal
          bappa={selectedBappa}
          onClose={() => setSelectedBappa(null)}
        />
      )}
    </div>
  );
};

export default AdminPage;