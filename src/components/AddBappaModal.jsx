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

const INSERT_MURTI_IMAGE = gql`
  mutation InsertMurtiImage($image_id: String!, $murti_id: Int!) {
    insert_murti_images(objects: { image_id: $image_id, murti_id: $murti_id }) {
      returning {
        id
        image_id
        murti_id
      }
    }
  }
`;

const AddBappaModal = ({ onClose, onAddBappa }) => {
  const [insertMurtiImage] = useMutation(INSERT_MURTI_IMAGE);

  const [formData, setFormData] = useState({
    id: "",
    size: "",
    price: "",
    images: [], // array of base64 previews
    imageFiles: [], // actual File objects
  });
  const [insertMurti] = useMutation(INSERT_MURTI);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
  
    try {
      const imagePreviews = await Promise.all(
        files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
      );
  
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...imagePreviews], // Append new images
        imageFiles: [...prev.imageFiles, ...files], // Append new files
      }));
    } catch (error) {
      console.error("Error reading files:", error);
      alert("Error reading image files");
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.id || !formData.size || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }
  
    let mainImageUrl = ""; // For insert_murti_history
    const uploadedImageIds = [];
  
    try {
      // Upload all images
      for (let file of formData.imageFiles) {
        const result = await nhost.storage.upload({
          file,
          bucketId: 'default',
        });
  
        if (result.error) {
          throw new Error(result.error.message);
        }
  
        const publicUrl = nhost.storage.getPublicUrl({ fileId: result.fileMetadata.id });
  
        uploadedImageIds.push(result.fileMetadata.id);
  
        // Use the first image as main image
        if (!mainImageUrl) {
          mainImageUrl = publicUrl;
        }
      }
  
      // Insert main murti record
      const { data } = await insertMurti({
        variables: {
          murti_id: formData.id,
          final_price: formData.price,
          size: formData.size,
          booking_status: "available",
          image:" "
        },
      });
  
      const murti_id = data.insert_murti_history.returning[0].id; // assuming it's an integer for murti_images
  console.log("data : ",data)
      // Insert image references
      for (let image_id of uploadedImageIds) {
        await insertMurtiImage({
          variables: {
            murti_id,
            image_id,
          },
        });
      }
  
      // Optional: callback for UI
      onAddBappa({
        name: formData.id,
        size: formData.size,
        price: parseInt(formData.price),
        image: mainImageUrl,
      });
  
      onClose();
    } catch (error) {
      console.error("Error saving murti or images:", error);
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
                <option key={value} value={`${value} inches`}>
                  {value} inches
                </option>
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
              Bappa Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
            />
            
            {formData.images.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">
                  Selected Images ({formData.images.length}):
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {formData.images.map((img, index) => (
                    <div key={`image-${index}`} className="relative">
                      <img
                        src={img}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500 mt-2">
              You can select multiple images. If no images are uploaded, a default image will be used.
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