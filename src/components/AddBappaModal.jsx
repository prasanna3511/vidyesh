import React, { useState } from "react";
import { X, Upload, Crown, Ruler, IndianRupee } from "lucide-react";
import { gql, useMutation } from '@apollo/client';
import  nhost from '../nhost';
const INSERT_MURTI = gql`
  mutation InsertMurti($murti_id: String!, $final_price: String!, $size: String!, $booking_status: String!,$image: String!) {
    insert_murti_history(objects: {
      murti_id: $murti_id,
      final_price: $final_price,
      size: $size,
      booking_status: $booking_status,
      image: $image
    }) {
      returning {
        id
      }
    }
  }
`;


const AddBappaModal = ({ onClose, onAddBappa }) => {
  const [formData, setFormData] = useState({
    id: "",
    size: "",
    price: "",
    image: "",
  });
  const [insertMurti] = useMutation(INSERT_MURTI);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          image: e.target.result,
          imageFile: file 
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.id || !formData.size || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }
    let imageUrl = "";

    if (formData.imageFile) {
      const result = await nhost.storage.upload({
        file: formData.imageFile,
        bucketId: 'default', // or custom bucket if you have one
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      imageUrl = nhost.storage.getPublicUrl({ fileId: result.fileMetadata.id }) || ""; // you can also store result.fileMetadata.id
    }
    console.log("imageurl",imageUrl)
  
    try {
      await insertMurti({
        variables: {
          murti_id: formData.id,
          final_price: formData.price,
          size: formData.size,
          booking_status: "available", // or use dynamic value if needed,
          image:imageUrl
        },
      });
  
      onAddBappa({
        name: formData.id,
        size: formData.size,
        price: parseInt(formData.price),
        image:
          formData.image ||
          "https://images.pexels.com/photos/8636095/pexels-photo-8636095.jpeg?auto=compress&cs=tinysrgb&w=500",
      });
  
      onClose();
    } catch (error) {
      console.error("Failed to insert murti:", error);
      alert("Something went wrong while saving.");
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-green-600 p-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Crown className="h-6 w-6" />
            <span>Add New Murti</span>
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Crown className="h-4 w-4 inline mr-2" />
              Murti id *
            </label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              placeholder="e.g., Vakratunda Maharaj"
            />
          </div>

          <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
              <Ruler className="h-4 w-4 inline mr-2" />
              Size *
            </label>
            <select
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white"
            >
              <option value="" disabled>
                Select Size
              </option>
              {[6, 9, 11, 12, 13, 14, 15, 18].map((value) => (
                <option value={`${value} inches`}> {value} inches</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <IndianRupee className="h-4 w-4 inline mr-2" />
              Price *
            </label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter price in rupees"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="h-4 w-4 inline mr-2" />
              Bappa Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
            />
            {formData.image && (
              <div className="mt-3">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">
              If no image is uploaded, a default image will be used.
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-xl font-bold hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300"
            >
              Add Bappa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBappaModal;
