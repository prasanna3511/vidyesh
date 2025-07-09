// import React, { useEffect, useState } from 'react';
// import { Plus, List, Calendar, User, Phone, IndianRupee, Trash2 } from 'lucide-react';
// import AddBappaModal from './AddBappaModal';
// import { useAuthenticated } from '@nhost/react';
// import LoginModal from './LoginModal';
// import { gql, useQuery } from '@apollo/client';
// import { useMutation } from '@apollo/client';
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
//   mutation UpdateBappa($id: Int!, $murti_id: String!, $final_price: float8!) {
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
//   const { loading, error, data , refetch } = useQuery(GET_MURTI_HISTORY);
//   const [approveBappa] = useMutation(APPROVE_BAPPA);
//   const [deleteBappa] = useMutation(DELETE_BAPPA);
//   const [editingId, setEditingId] = useState(null);
//   const [editedValues, setEditedValues] = useState({});
//   const [updateBappa] = useMutation(UPDATE_BAPPA);
//   const handleEditClick = (bappa) => {
//     console.log("editingId : ",bappa.id)
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
//           final_price: parseFloat(editedValues.final_price),
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
//   // const [showAddModal, setShowAddModal] = useState(false);
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
//   // console.log("murtiData : ",murtiData)

//   const bappas = murtiData.map(item => ({
//     id: item.id,
//     name: item.murti_id,
//     size: item.size,
//     price: item.final_price,
//     image: item.image || 'https://images.pexels.com/photos/8636095/pexels-photo-8636095.jpeg?auto=compress&cs=tinysrgb&w=500',
//     booked: item.booking_status === 'booked',
//     booking_status:item.booking_status,
//     fullName:item.customer_name,
//     phoneNumber:item.customer_phone
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
//   console.log("booked bappas : ",bappas)
//   const availableBappas = bappas.filter(b => !b.booked);
//   const handleApprove = async (id) => {
//     try {
//       await approveBappa({
//         variables: {
//           id,
//           booking_status: "booked"
//         }
//       });
  
//       // Optionally show a success message or toast here
  
//       await refetch(); // Refresh data
//     } catch (err) {
//       console.error("Failed to approve Bappa:", err);
//       alert("Something went wrong while approving!");
//     }
//   };
  
//   const getBookingDetails = (bappaId) =>
//     bookings.find(booking => booking.bappaId === bappaId);
//     useEffect(()=>{
//       refetch()
//     },[showAddModal])
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
//           <span>Add New Bappa</span>
//         </button>
//       </div>

//       {/* Statistics */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Total Bappas</p>
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
//           <span>Booked Bappas</span>
//         </h3>
        
//         {bookedBappas.length === 0 ? (
//           <p className="text-gray-500 text-center py-8">No bookings yet</p>
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {bookedBappas.map((bappa) => {
//               const booking = getBookingDetails(bappa.id);
//               return (
//                 <div key={bappa.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
//                   <div className="flex space-x-4">
//                     <img
//                       src={bappa.image}
//                       alt={bappa.name}
//                       className="w-20 h-20 rounded-lg object-contain"
//                     />
//                     <div className="flex-1">
//                       <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>

                      
//                       {/* <h4 className="font-bold text-lg text-gray-800">{bappa.name}</h4> */}
//                       {editingId === bappa.id ? (
//   <input
//     type="text"
//     className="border px-2 py-1 rounded w-full text-sm"
//     value={editedValues.murti_id}
//     onChange={(e) => handleInputChange('murti_id', e.target.value)}
//   />
// ) : (
//   <h4 className="font-bold text-gray-800">{bappa.name}</h4>
// )}
//                       <span className={`px-2 py-1 rounded-full text-xs font-bold ${
//                       bappa.booked 
//                         ? 'bg-green-100 text-green-700' 
//                         : 'bg-blue-100 text-blue-700'
//                     }`}>
//                       {bappa.booking_status}
//                     </span>
//                     </div>
//                       <p className="text-sm text-gray-600 mb-2">ID: #{bappa.id} | {bappa.size}</p>
//                       {/* <p className="font-bold text-green-600">₹{bappa.price}</p> */}
//                       {editingId === bappa.id ? (
//   <input
//     type="text"
//     className="border px-2 py-1 rounded w-full text-sm mb-1"
//     value={editedValues.murti_id}
//     onChange={(e) => handleInputChange('murti_id', e.target.value)}
//   />
// ) : (
//   <h4 className="font-bold text-gray-800">{bappa.name}</h4>
// )}


                   
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
//           <span>All Bappas</span>
//         </h3>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {bappas.map((bappa) => (
//             <div key={bappa.id} className={`relative border rounded-xl p-4 ${bappa.booked ? 'bg-green-50 border-green-200' : 'hover:shadow-md'} transition-all`}>

//               {/* {(bappa.booking_status === "pending"|| bappa.booking_status === "available") &&  */}
//               {editingId === bappa.id ? (
//     <button
//       onClick={() => handleSaveClick(bappa.id)}
//       className="absolute top-0 right-10 text-red-500 hover:text-red-700"
//       title="Save"
//     >
//       💾
//     </button>
//   ) : (
//     <button
//       onClick={() => handleEditClick(bappa)}
//       className="absolute top-0 right-10 text-red-500 hover:text-red-700"
//       title="Edit"
//     >
//       ✏️
//     </button>
//   )}
//     <button
//     onClick={() => handleDelete(bappa.id)}
//     className="absolute top-0 right-1 text-red-500 hover:text-red-700"
//     title="Delete"
//   >
//     <Trash2 className="w-5 h-5" />
//   </button>
//    {/* }  */}
//               <div className="flex space-x-4">
//                 <img
//                   src={bappa.image}
//                   alt={bappa.name}
//                   className="w-16 h-16 rounded-lg object-contain"
//                 />
//                 <div className="flex-1">
//                   <div className="flex items-center justify-between mb-2">
//                     <h4 className="font-bold text-gray-800">{bappa.name}</h4>
//                     <span  className={`absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-bold shadow ${
//     bappa.booked
//       ? 'bg-green-100 text-green-700'
//       : 'bg-blue-100 text-blue-700'
//   }`}>
//                       {bappa.booking_status}
//                     </span>
//                   </div>
//                   <p className="text-sm text-gray-600">ID: #{bappa.id}</p>
//                   <p className="text-sm text-gray-600">{bappa.size}</p>
//                   <p className="font-bold text-green-600">₹{bappa.price}</p>
//                   {bappa.booking_status === "pending" && <>
//                   <div className="flex items-center space-x-2">
//                             <User className="h-4 w-4 text-gray-500" />
//                             <span>{bappa.fullName}</span>
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             <Phone className="h-4 w-4 text-gray-500" />
//                             <span>{bappa.phoneNumber}</span>
//                           </div>
//         <button
//           className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
//           onClick={() => handleApprove(bappa.id)}
//         >
//           Approve
//         </button>
//         </>
//       }
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {showAddModal && (
//         <AddBappaModal
//           onClose={() => setShowAddModal(false)}
//           onAddBappa={onAddBappa}
//         />
//       )}
//     </div>
//   );
// };

// export default AdminPage;

import React, { useEffect, useState } from 'react';
import { Plus, List, Calendar, User, Phone, IndianRupee, Trash2 } from 'lucide-react';
import AddBappaModal from './AddBappaModal';
import { useAuthenticated } from '@nhost/react';
import LoginModal from './LoginModal';
import { gql, useQuery } from '@apollo/client';
import { useMutation } from '@apollo/client';

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

const AdminPage = ({ onAddBappa }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const { loading, error, data, refetch } = useQuery(GET_MURTI_HISTORY);
  const [approveBappa] = useMutation(APPROVE_BAPPA);
  const [deleteBappa] = useMutation(DELETE_BAPPA);
  const [editingId, setEditingId] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [updateBappa] = useMutation(UPDATE_BAPPA);

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
    phoneNumber: item.customer_phone
  }));

  const bookings = murtiData
    .filter(item => item.booking_status === 'booked')
    .map(item => ({
      bappaId: item.id,
      fullName: item.customer_name,
      phoneNumber: item.customer_phone,
      bookedAt: item.created_at || new Date().toISOString(),
    }));

  const bookedBappas = bappas.filter(b => b.booked);
  console.log("booked bappas : ", bappas)
  const availableBappas = bappas.filter(b => !b.booked);

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
          <span>Add New Bappa</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bappas</p>
              <p className="text-3xl font-bold text-blue-600">{bappas.length}</p>
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

      {/* Booked Bappas */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-green-500" />
          <span>Booked Bappas</span>
        </h3>

        {bookedBappas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No bookings yet</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bookedBappas.map((bappa,index) => {
              const booking = getBookingDetails(bappa.id);
              return (
                <div key={bappa.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex space-x-4">
                    <img
                      src={bappa.image}
                      alt={bappa.name}
                      className="w-20 h-20 rounded-lg object-contain"
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
          <span>All Bappas</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bappas.map((bappa,index) => (
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
                <img
                  src={bappa.image}
                  alt={bappa.name}
                  className="w-16 h-16 rounded-lg object-contain"
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
          ))}
        </div>
      </div>

      {showAddModal && (
        <AddBappaModal
          onClose={() => setShowAddModal(false)}
          onAddBappa={onAddBappa}
        />
      )}
    </div>
  );
};

export default AdminPage;