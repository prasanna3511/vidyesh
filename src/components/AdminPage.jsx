
import React, { useEffect, useState } from 'react';
import { Plus, List, Calendar, User, Phone, Mail, IndianRupee, Trash2, ChevronLeft, ChevronRight, Pencil, X } from 'lucide-react';
import AddBappaModal from './AddBappaModal';
import { useAuthenticated } from '@nhost/react';
import LoginModal from './LoginModal';
import { gql, useQuery } from '@apollo/client';
import { useMutation } from '@apollo/client';
import BappaDetailsModal from '../components/BappaDetails';
import nhost from '../nhost';
import ApproveBappaModal from './ApproveBappaModal';
import RoundUpModal from './RoundupModal'; // Adjust path if needed


const DELETE_BAPPA = gql`
  mutation DeleteBappa($id: Int!) {
    delete_murti_history(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

const APPROVE_BAPPA = gql`
mutation ApproveBappa($id: Int!, $booking_status: String!, $discount_price: numeric!, $date: date!) {
  update_murti_history(
    where: { id: { _eq: $id } }
    _set: { booking_status: $booking_status, discount_price: $discount_price, date: $date }
  ) {
    returning {
      id
      booking_status
      discount_price
      booked_by
      date
    }
  }
}

`;

// const UPDATE_BAPPA = gql`
// mutation UpdateBappa($id: Int!, $murti_id: String!, $final_price: String!) {
//     update_murti_history(
//       where: { id: { _eq: $id } },
//       _set: { murti_id: $murti_id, final_price: $final_price }
//     ) {
//       affected_rows
//     }
//   }
// `;const UPDATE_BAPPA = gql`
// mutation UpdateBappa($id: Int!, $murti_id: String!, $final_price: String!) {
//     update_murti_history(
//       where: { id: { _eq: $id } },
//       _set: { murti_id: $murti_id, final_price: $final_price }
//     ) {
//       affected_rows
//     }
//   }
// `;
const UPDATE_BAPPA = gql`
mutation UpdateBappa(
  $id: Int!,
  $murti_id: String!,
  $final_price: String!,
  $discount_price: numeric,
  $booking_status: String!,
  $date: date!
) {
  update_murti_history(
    where: { id: { _eq: $id } },
    _set: { murti_id: $murti_id, final_price: $final_price, discount_price: $discount_price, booking_status: $booking_status, date: $date }
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
      date
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

const STATUS_OPTIONS = ['available', 'pending', 'booked', 'delivered'];

const getCurrentDbDate = () => new Date().toISOString().split('T')[0];

const EditMurtiModal = ({ values, onChange, onClose, onSave }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
        <h3 className="text-lg font-bold text-white">Edit Murti</h3>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-white transition hover:bg-white/20"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Murti ID</label>
          <input
            type="text"
            className="w-full rounded-xl border px-4 py-3 text-gray-800"
            value={values.murti_id}
            onChange={(e) => onChange('murti_id', e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Final Price</label>
          <input
            type="text"
            className="w-full rounded-xl border px-4 py-3 text-gray-800"
            value={values.final_price}
            onChange={(e) => onChange('final_price', e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Discount Price</label>
          <input
            type="text"
            className="w-full rounded-xl border px-4 py-3 text-gray-800"
            value={values.discount_price}
            onChange={(e) => onChange('discount_price', e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
          <select
            className="w-full rounded-xl border px-4 py-3 text-gray-800"
            value={values.booking_status}
            onChange={(e) => onChange('booking_status', e.target.value)}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t px-5 py-4">
        <button
          onClick={onClose}
          className="rounded-xl border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 font-bold text-white transition hover:from-green-600 hover:to-green-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
);

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
  const [pendingApprovalBappa, setPendingApprovalBappa] = useState(null);
  const [roundUpBappa, setRoundUpBappa] = useState(null);
  
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
    setEditingId(bappa.id);
    setEditedValues({
      murti_id: bappa.name,
      final_price: bappa.price,
      discount_price: bappa.discount_price || "",
      booking_status: bappa.booking_status || "available"
    });
  };

  // const handleSaveClick = async (id) => {
  //   try {
  //     await updateBappa({
  //       variables: {
  //         id,
  //         murti_id: editedValues.murti_id,
  //         final_price: editedValues.final_price,
  //       },
  //     });
  //     setEditingId(null);
  //     await refetch(); // refresh the list
  //   } catch (err) {
  //     console.error("Error updating Bappa", err);
  //     alert("Failed to update!");
  //   }
  // };
  const handleSaveClick = async (id) => {
    try {
      const discountPrice =
        editedValues.discount_price === "" || editedValues.discount_price === null || editedValues.discount_price === undefined
          ? null
          : Number(editedValues.discount_price);
      await updateBappa({
        variables: {
          id,
          murti_id: editedValues.murti_id,
          final_price: editedValues.final_price,
          discount_price: discountPrice,
          booking_status: editedValues.booking_status,
          date: getCurrentDbDate()
        },
      });
      setEditingId(null);
      setEditedValues({});
      await refetch(); // refresh the list
    } catch (err) {
      console.error("Error updating Bappa", err);
      alert("Failed to update!");
    }
  };
  

  const handleInputChange = (field, value) => {
    setEditedValues(prev => ({ ...prev, [field]: value }));
  };

  const handleCloseEditModal = () => {
    setEditingId(null);
    setEditedValues({});
  };

  const isAuthenticated = useAuthenticated();
  const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated);

  useEffect(() => {
    refetch();
  }, [showAddModal, refetch]);

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

  if (loading) {
    return <div className="px-4 py-8 text-center text-white">Loading admin data...</div>;
  }

  if (error) {
    return (
      <div className="px-4 py-8 text-center text-red-200">
        Failed to load admin data: {error.message}
      </div>
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
    booked_by: item.booked_by,
    images: murtiImagesData[item.id] || [], // Add images array
    discount_price:item.discount_price,
    date: item.date || null
  }));

  const bookings = murtiData
    .filter(item => item.booking_status === 'booked')
    .map(item => ({
      bappaId: item.id,
      fullName: item.customer_name,
      phoneNumber: item.customer_phone,
      bookedAt: item.date || null,
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
    
  const bookedBappas = applyFilters(bappas.filter((b) => b.booking_status === "booked" || b.booking_status === "delivered"));
  const availableBappas = applyFilters(bappas.filter((b) => b.booking_status !== "booked" && b.booking_status !== "pending"));
  const pendingBappas = applyFilters(bappas.filter((b) => b.booking_status === "pending")); // Added for clarity
  const allFilteredBappas = applyFilters(bappas); // This is the array you need for "All Murti" section
  const handleApprove = async (id,discountedAmount) => {
    try {
      await approveBappa({
        variables: {
          id,
          booking_status: "booked",discount_price: parseInt(discountedAmount, 10), date: getCurrentDbDate(),
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

  // Totals (for booked only)
  const totalFinal = bookedBappas.reduce((sum, b) => sum + Number(b.price || 0), 0);
  const totalPaid = bookedBappas.reduce((sum, b) => sum + Number(b.paid_amount || 0), 0);
  const totalRemaining = totalFinal - totalPaid;
  const totalDiscounted = bookedBappas.reduce(
    (sum, b) => sum + Number(b.discount_price || b.price || 0),
    0
  );
  const totalRemainingDiscounted = totalDiscounted - totalPaid;

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
          <option value="delivered">Delivered</option>
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
                className="relative border rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="mb-4 flex justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRoundUpBappa(bappa);
                      }}
                      className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-2 text-sm font-semibold text-white shadow transition hover:from-yellow-500 hover:to-yellow-700 focus:outline-none"
                      title="Round Up"
                    >
                      Round up
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(bappa);
                      }}
                      className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>


                  <div className="flex space-x-4">
                    <ImageSlider 
                      images={bappa.images}
                      defaultImage={bappa.image}
                      altText={bappa.name}
                      className="w-20 h-20 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <h4 className="font-bold text-gray-800">{bappa.name}</h4>
                        <span  className={`px-2 py-1 rounded-full text-xs font-bold ${
    bappa.booking_status === 'booked'
      ? 'bg-green-100 text-green-700'
      : bappa.booking_status === 'pending'
      ? 'bg-blue-100 text-blue-700'
      : bappa.booking_status === 'delivered'
      ? 'bg-gray-200 text-gray-700'
      : 'bg-gray-100 text-gray-500'
  }`}>
                          {bappa.booking_status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">ID: #{index+1} | {bappa.size}</p>
                      <p className="font-bold text-green-600">₹{bappa.price}</p>
                      <div>
                        <p className="text-sm text-blue-700">Discount Price: {bappa.discount_price ? "₹" + bappa.discount_price : "-"}</p>
                      </div>


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
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="break-all">Booked by: {bappa.booked_by || 'Not recorded'}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Booked: {booking.bookedAt ? new Date(booking.bookedAt).toLocaleDateString() : 'Not available'}
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

                <button
                  onClick={() => handleEditClick(bappa)}
                  className="absolute top-2 right-10 rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
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
                      <h4 className="font-bold text-gray-800">{bappa.name}</h4>
                      <span className={`absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-bold shadow ${bappa.booked
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                        }`}>
                        {bappa.booking_status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">ID: #{index+1}</p>
                    <p className="text-sm text-gray-600">{bappa.size}</p>
                    <p className="font-bold text-green-600">₹{bappa.price}</p>
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
                        // onClick={() => handleApprove(bappa.id)}
                        onClick={() => setPendingApprovalBappa(bappa)}
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


        {/* Tally Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-xl">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Murti ID</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Final Price</th>
                <th className="p-3 text-left">Discounted Price</th>
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
                    <td className="p-3">₹{bappa.discount_price || "-"}</td> 
                    <td className="p-3">₹{bappa.paid_amount || 0}</td>
                    <td className="p-3">₹{(bappa.price || 0) - (bappa.paid_amount || 0)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        {/* <div className="mt-4 text-right space-y-1 font-semibold">
          <p>Total Final Price (Booked): ₹{totalFinal}</p> 
          <p>Total Paid (Booked): ₹{totalPaid}</p> 
          <p>Total Remaining (Booked): ₹{totalRemaining}</p> 
        </div> */}
       <div className="mt-4 text-right space-y-4 font-semibold">

{/* Final Price Totals */}
<div>
  <h3 className="text-lg font-bold text-center mb-2">Final Price Totals</h3>
  <p>Total Final Price (Booked): ₹{totalFinal}</p>
  <p>Total Paid (Booked): ₹{totalPaid}</p>
  <p>Total Remaining (Booked): ₹{totalRemaining}</p>
</div>

<hr className="my-4" />
<div>
  <h3 className="text-lg font-bold text-center mb-2">Discounted Price Totals</h3>
  <p>Total Discounted Price (Booked): ₹{totalDiscounted}</p>
  <p>Total Paid (Booked): ₹{totalPaid}</p>
  <p>Total Remaining (Discounted Booked): ₹{totalRemainingDiscounted}</p>
</div>

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
      {editingId !== null && (
        <EditMurtiModal
          values={editedValues}
          onChange={handleInputChange}
          onClose={handleCloseEditModal}
          onSave={() => handleSaveClick(editingId)}
        />
      )}
      {pendingApprovalBappa && (
  <ApproveBappaModal
    bappa={pendingApprovalBappa}
    onClose={() => setPendingApprovalBappa(null)}
    onApprove={async (id,discountedAmount) => {
      await handleApprove(id,discountedAmount);
      setPendingApprovalBappa(null);
    }}
  />
)}
{roundUpBappa && (
  <RoundUpModal
    bappa={roundUpBappa}
    onClose={() => setRoundUpBappa(null)}
    refetch={refetch}
  />
)}

    </div>
  );
};

export default AdminPage;
