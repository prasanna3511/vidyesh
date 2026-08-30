import React, { useRef, useState } from "react";
import { Camera, Crown, IndianRupee, Ruler, Upload, X } from "lucide-react";
import { api } from "../lib/api.js";
import { MURTI_STORED_AT_OPTIONS } from "../constants/murtiOptions";

const SUPPLIER_OPTIONS = ["P.B", "S.H", "N.P", "M.H", "A.M", "D.P", "R.S", "V.W"];
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
  "Feta",
  "Single Load",
  "Double Load",
  "Veling",
  "Lalbaug"
];

const AddBappaModal = ({ onClose, onAddBappa }) => {
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    size: "",
    price: "",
    supplier: "",
    murti_design: "",
    stored_at: "",
    images: [],
    imageFiles: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const imagePreviews = await Promise.all(files.map((file) => readFileAsDataUrl(file)));
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...imagePreviews],
        imageFiles: [...prev.imageFiles, ...files],
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

    setIsSaving(true);
    try {
      const response = await api.post("/murtis", {
        murti_id: formData.id,
        final_price: Number(formData.price),
        size: formData.size,
        booking_status: "available",
        image: formData.images[0] || null,
        supplier: formData.supplier || null,
        murti_design: formData.murti_design || null,
        stored_at: formData.stored_at || null,
        images: formData.images.map((image, index) => ({
          image_ref: image,
          sort_order: index,
        })),
      });

      onAddBappa?.(response.data);
      onClose();
    } catch (error) {
      console.error("Error saving murti:", error);
      alert(error.message || "Something went wrong while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white">
        <div className="sticky top-0 flex items-center justify-between bg-gradient-to-r from-green-500 to-green-600 p-4">
          <h3 className="flex items-center space-x-2 text-xl font-bold text-white">
            <Crown className="h-5 w-5" />
            <span>Add Murti</span>
          </h3>
          <button onClick={onClose} className="rounded-full p-2 text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Murti ID *</label>
            <input name="id" value={formData.id} onChange={handleInputChange} className="w-full rounded-xl border px-4 py-3 text-gray-800" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700"><Ruler className="mr-2 inline h-4 w-4" />Size *</label>
            <input name="size" value={formData.size} onChange={handleInputChange} className="w-full rounded-xl border px-4 py-3 text-gray-800" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700"><IndianRupee className="mr-2 inline h-4 w-4" />Price *</label>
            <input name="price" type="number" value={formData.price} onChange={handleInputChange} className="w-full rounded-xl border px-4 py-3 text-gray-800" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Supplier</label>
            <select name="supplier" value={formData.supplier} onChange={handleInputChange} className="w-full rounded-xl border px-4 py-3 text-gray-800">
              <option value="">Select Supplier</option>
              {SUPPLIER_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Murti Design</label>
            <select name="murti_design" value={formData.murti_design} onChange={handleInputChange} className="w-full rounded-xl border px-4 py-3 text-gray-800">
              <option value="">Select Murti Design</option>
              {MURTI_DESIGN_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Murti will be stored at</label>
            <select name="stored_at" value={formData.stored_at} onChange={handleInputChange} className="w-full rounded-xl border px-4 py-3 text-gray-800">
              <option value="">Select Storage Location</option>
              {MURTI_STORED_AT_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">Images</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => galleryInputRef.current?.click()} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700">
                <Upload className="h-4 w-4" />
                Upload
              </button>
              <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700">
                <Camera className="h-4 w-4" />
                Camera
              </button>
            </div>
            <input ref={galleryInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
            <input ref={cameraInputRef} type="file" multiple accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />

            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {formData.images.map((image, index) => (
                  <div key={`${image}-${index}`} className="relative overflow-hidden rounded-xl border">
                    <img src={image} alt={`Murti ${index + 1}`} className="h-24 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1 top-1 rounded-full bg-black/60 px-2 text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 py-3 font-bold text-white disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Save Murti"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBappaModal;
