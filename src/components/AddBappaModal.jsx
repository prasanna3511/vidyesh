import React, { useRef, useState } from "react";
import { X, Upload, Crown, Ruler, IndianRupee, Camera } from "lucide-react";
import { gql, useMutation } from '@apollo/client';
import  nhost from '../nhost';

const SUPPLIER_OPTIONS = ["P.B", "S.H", "N.P", "M.H", "A.M", "D.P"];
const MURTI_DESIGN_OPTIONS = [
  "Dagdusheth",
  "Bal Ganesh",
  "Asan Mandi",
  "Shivrekar",
  "Mhaisuri",
  "Kamal Asan",
  "Peshavai",
  "Raja",
  "Savkar",
  "Varad HAst",
  "Phillips",
  "Chaurang",
  "Furniture",
];

const INSERT_MURTI = gql`
  mutation InsertMurti(
    $murti_id: String!,
    $final_price: String!,
    $size: String!,
    $booking_status: String!,
    $image: String!,
    $Supplier: String!,
    $murti_design: String!
  ) {
    insert_murti_history(objects: {
      murti_id: $murti_id,
      final_price: $final_price,
      size: $size,
      booking_status: $booking_status,
      image: $image,
      Supplier: $Supplier,
      murti_design: $murti_design
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
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [formData, setFormData] = useState({
    id: "",
    size: "",
    price: "",
    supplier: "",
    murti_design: "",
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

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const loadImageElement = (src) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });

  const blobToFile = (blob, originalName) => {
    const safeBaseName = String(originalName || "murti-image").replace(/\.[^.]+$/, "");
    return new File([blob], `${safeBaseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  };

  const normalizeImageFile = async (file) => {
    if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp") {
      return file;
    }

    const dataUrl = await readFileAsDataUrl(file);
    const image = await loadImageElement(dataUrl);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    canvas.getContext("2d").drawImage(image, 0, 0);

    const normalizedBlob = await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to convert camera image."));
          return;
        }
        resolve(blob);
      }, "image/jpeg", 0.92);
    });

    return blobToFile(normalizedBlob, file.name);
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
  
    try {
      const normalizedFiles = await Promise.all(files.map((file) => normalizeImageFile(file)));
      const imagePreviews = await Promise.all(
        normalizedFiles.map(
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
        imageFiles: [...prev.imageFiles, ...normalizedFiles], // Append new files
      }));
      e.target.value = "";
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
          image:" ",
          Supplier: formData.supplier,
          murti_design: formData.murti_design,
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
        supplier: formData.supplier,
        murti_design: formData.murti_design,
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
              Supplier
            </label>
            <select
              name="supplier"
              value={formData.supplier}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white"
            >
              <option value="" disabled>
                Select Supplier
              </option>
              {SUPPLIER_OPTIONS.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Murti Design
            </label>
            <select
              name="murti_design"
              value={formData.murti_design}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white"
            >
              <option value="" disabled>
                Select Murti Design
              </option>
              {MURTI_DESIGN_OPTIONS.map((design) => (
                <option key={design} value={design}>
                  {design}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="h-4 w-4 inline mr-2" />
              Bappa Images
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Upload className="mr-2 inline h-4 w-4" />
                Upload From Gallery
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 rounded-xl border border-green-300 bg-green-50 px-4 py-3 font-medium text-green-700 transition hover:bg-green-100"
              >
                <Camera className="mr-2 inline h-4 w-4" />
                Capture From Camera
              </button>
            </div>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
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
              You can upload from gallery or open the camera directly. If no images are uploaded, a default image will be used.
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
