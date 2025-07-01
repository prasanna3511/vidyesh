import React, { useState } from 'react';
import { Plus, List, Calendar, User, Phone, IndianRupee } from 'lucide-react';
import AddBappaModal from './AddBappaModal';
import { useAuthenticated } from '@nhost/react';
import LoginModal from './LoginModal';
import { gql, useQuery } from '@apollo/client';

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
  const { loading, error, data } = useQuery(GET_MURTI_HISTORY);

  // const bookedBappas = bappas.filter(bappa => bappa.booked);
  // const availableBappas = bappas.filter(bappa => !bappa.booked);

  // const getBookingDetails = (bappaId) => {
  //   return bookings.find(booking => booking.bappaId === bappaId);
  // };
  const isAuthenticated = useAuthenticated();
  // const [showAddModal, setShowAddModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated);

  if (!isAuthenticated) {
    return (
      <>
        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      </>
    );
  }

  const murtiData = data?.murti_history || [];
  // console.log("murtiData : ",murtiData)

  const bappas = murtiData.map(item => ({
    id: item.id,
    name: item.murti_id,
    size: item.size,
    price: parseInt(item.final_price),
    image: item.image || 'https://images.pexels.com/photos/8636095/pexels-photo-8636095.jpeg?auto=compress&cs=tinysrgb&w=500',
    booked: item.booking_status === 'booked',
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
  const availableBappas = bappas.filter(b => !b.booked);

  const getBookingDetails = (bappaId) =>
    bookings.find(booking => booking.bappaId === bappaId);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Manage your Ganpati Bappa collection and bookings</p>
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
            {bookedBappas.map((bappa) => {
              const booking = getBookingDetails(bappa.id);
              return (
                <div key={bappa.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex space-x-4">
                    <img
                      src={bappa.image}
                      alt={bappa.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-800">{bappa.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">ID: #{bappa.id} | {bappa.size}</p>
                      <p className="font-bold text-green-600">₹{bappa.final_price}</p>
                      
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
          {bappas.map((bappa) => (
            <div key={bappa.id} className={`border rounded-xl p-4 ${bappa.booked ? 'bg-green-50 border-green-200' : 'hover:shadow-md'} transition-all`}>
              <div className="flex space-x-4">
                <img
                  src={bappa.image}
                  alt={bappa.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-800">{bappa.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      bappa.booked 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {bappa.booked ? 'Booked' : 'Available'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">ID: #{bappa.id}</p>
                  <p className="text-sm text-gray-600">{bappa.size}</p>
                  <p className="font-bold text-green-600">₹{bappa.final_price}</p>
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