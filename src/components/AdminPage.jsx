import React, { useEffect, useState } from 'react';
import {
  Plus,
  List,
  Calendar,
  User,
  Phone,
  Mail,
  IndianRupee,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Pencil,
  X,
  MessageSquareText,
} from 'lucide-react';
import AddBappaModal from './AddBappaModal';
import LoginModal from './LoginModal';
import BappaDetailsModal from '../components/BappaDetails';
import ApproveBappaModal from './ApproveBappaModal';
import RoundUpModal from './RoundupModal';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { getImageUrl, normalizeImageRecord, normalizeMurti } from '../utils/murti.js';

const SUPPLIER_OPTIONS = ['P.B', 'S.H', 'N.P', 'M.H', 'A.M', 'D.P', 'R.S', 'V.W'];
const MURTI_DESIGN_OPTIONS = [
  'Dagdusheth',
  'Bal Ganesh',
  'Asan Mandi',
  'Shivrekar',
  'Mhaisuri',
  'Kamal Asan',
  'Peshavai',
  'Raja',
  'Savkar',
  'Varad HAst',
  'Phillips',
  'Chaurang',
  'Furniture',
  'Feta',
  'Single Load',
  'Double Load',
  'Veling',
  'Lalbaug',
];
const BOOKING_SUGGESTION_OPTIONS = [
  'गणोबा',
  'जानवे काढणे',
  "हातावर 'श्री' काढणे",
  'कलर टचअप',
  'घरपोच सेवा (शुल्क लागू)',
];

const STATUS_OPTIONS = ['available', 'pending', 'booked', 'delivered'];

const getCurrentDbDate = () => new Date().toISOString().split('T')[0];
const getCurrentYear = () => String(new Date().getFullYear());
const getWhatsAppNumber = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
};

const EditMurtiModal = ({ values, onChange, onClose, onSave }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
        <h3 className="text-lg font-bold text-white">Edit Murti</h3>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-white transition hover:bg-white/20"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto p-5">
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
            inputMode="decimal"
            className="w-full rounded-xl border px-4 py-3 text-gray-800"
            value={values.discount_price}
            onChange={(e) => onChange('discount_price', e.target.value)}
            placeholder="Optional"
          />
        </div>

        {(values.booking_status === 'booked' || values.booking_status === 'delivered') && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Paid Amount</label>
            <input
              type="text"
              inputMode="decimal"
              className="w-full rounded-xl border px-4 py-3 text-gray-800"
              value={values.paid_amount ?? ''}
              onChange={(e) => onChange('paid_amount', e.target.value)}
              placeholder="Enter paid amount"
            />
          </div>
        )}

        {(values.booking_status === 'booked' || values.booking_status === 'delivered') && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Advance Payment Method</label>
            <select
              className="w-full rounded-xl border px-4 py-3 text-gray-800"
              value={values.payment_mode || 'Online'}
              onChange={(e) => onChange('payment_mode', e.target.value)}
            >
              <option value="Online">Online</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        )}

        {(values.booking_status === 'booked' || values.booking_status === 'delivered') && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Customer Name</label>
            <input
              type="text"
              className="w-full rounded-xl border px-4 py-3 text-gray-800"
              value={values.customer_name || ''}
              onChange={(e) => onChange('customer_name', e.target.value)}
              placeholder="Enter customer name"
            />
          </div>
        )}

        {(values.booking_status === 'booked' || values.booking_status === 'delivered') && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Mobile Number</label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full rounded-xl border px-4 py-3 text-gray-800"
              value={values.customer_phone || ''}
              onChange={(e) => onChange('customer_phone', e.target.value)}
              placeholder="Enter mobile number"
            />
          </div>
        )}

        {(values.booking_status === 'booked' || values.booking_status === 'delivered') && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Suggestions</label>
            <div className="space-y-2 rounded-xl border px-4 py-3">
              {BOOKING_SUGGESTION_OPTIONS.map((option) => {
                const selectedSuggestions = values.suggestions || [];
                const isChecked = selectedSuggestions.includes(option);

                return (
                  <label key={option} className="flex items-center gap-2 text-gray-700">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        const nextSuggestions = isChecked
                          ? selectedSuggestions.filter((item) => item !== option)
                          : [...selectedSuggestions, option];
                        onChange('suggestions', nextSuggestions);
                      }}
                      className="form-checkbox"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

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

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Supplier</label>
          <select
            className="w-full rounded-xl border px-4 py-3 text-gray-800"
            value={values.supplier || ''}
            onChange={(e) => onChange('supplier', e.target.value)}
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
          <label className="mb-2 block text-sm font-medium text-gray-700">Murti Design</label>
          <select
            className="w-full rounded-xl border px-4 py-3 text-gray-800"
            value={values.murti_design || ''}
            onChange={(e) => onChange('murti_design', e.target.value)}
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
          <label className="mb-2 block text-sm font-medium text-gray-700">Stored At</label>
          <input
            type="text"
            className="w-full rounded-xl border px-4 py-3 text-gray-800"
            value={values.stored_at || ''}
            onChange={(e) => onChange('stored_at', e.target.value)}
            placeholder="Enter storage location"
          />
        </div>

        {(values.booking_status === 'booked' || values.booking_status === 'delivered') && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Address</label>
            <textarea
              className="w-full rounded-xl border px-4 py-3 text-gray-800"
              value={values.address || ''}
              onChange={(e) => onChange('address', e.target.value)}
              rows={3}
              placeholder="Enter address"
            />
          </div>
        )}
      </div>

      <div className="flex shrink-0 justify-end gap-3 border-t bg-white px-5 py-4">
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

const MessageManagerModal = ({
  onClose,
  onSubmit,
  isSaving,
  isLoadingMessages,
  formValues,
  onFormChange,
  messages,
  selectedMessageId,
  onSelectMessage,
  onCreateNew,
}) => {
  const [showPreviousMessages, setShowPreviousMessages] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-gradient-to-r from-fuchsia-600 to-pink-600 px-5 py-4">
          <h3 className="text-lg font-bold text-white">Create Message</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white transition hover:bg-white/20"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              value={formValues.title}
              onChange={(e) => onFormChange('title', e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-gray-800"
              placeholder="Message title"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Message *</label>
            <textarea
              value={formValues.message}
              onChange={(e) => onFormChange('message', e.target.value)}
              rows={5}
              className="w-full rounded-xl border px-4 py-3 text-gray-800"
              placeholder="Enter the main message text"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onCreateNew}
              className="rounded-xl border border-pink-300 px-4 py-2 text-sm font-medium text-pink-700 transition hover:bg-pink-50"
            >
              Create New
            </button>
            <button
              type="button"
              onClick={() => setShowPreviousMessages((prev) => !prev)}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              {showPreviousMessages ? 'Hide Previous Messages' : 'Show Previous Messages'}
            </button>
            {messages.length > 0 && (
              <p className="text-sm text-gray-500">
                Default selected: {messages.find((item) => item.id === selectedMessageId)?.title || messages[0]?.title}
              </p>
            )}
          </div>

          {showPreviousMessages && (
            <div className="max-h-56 space-y-3 overflow-y-auto rounded-2xl border bg-gray-50 p-4">
              {isLoadingMessages ? (
                <p className="text-sm text-gray-500">Loading previous messages...</p>
              ) : messages.length === 0 ? (
                <p className="text-sm text-gray-500">No previous messages yet.</p>
              ) : (
                messages.map((item, index) => {
                  const isSelected = item.id === selectedMessageId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectMessage(item.id)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        isSelected ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white hover:border-pink-300'
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <p className="font-semibold text-gray-800">{item.title || `Message ${item.id}`}</p>
                        {index === 0 && <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">Latest</span>}
                      </div>
                      <p className="line-clamp-3 text-sm text-gray-600">{item.message}</p>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t bg-white px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSaving}
            className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-4 py-2 font-bold text-white transition hover:from-fuchsia-700 hover:to-pink-700 disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : selectedMessageId ? 'Update Message' : 'Save Message'}
          </button>
        </div>
      </div>
    </div>
  );
};

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
        const urls = images
          .map((img) => getImageUrl(img.image_ref || img.image_id))
          .filter(Boolean);

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
      <div className={`${className} flex items-center justify-center bg-gray-200 animate-pulse`}>
        <span className="text-xs text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className} group`}>
      <img
        src={imageUrls[currentImageIndex] || defaultImage}
        alt={altText}
        className="h-full w-full rounded-lg object-contain"
        onError={(e) => {
          e.target.src = defaultImage;
        }}
      />

      {imageUrls.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-1 top-1/2 -translate-y-1/2 transform rounded-full bg-black bg-opacity-50 p-1 text-white opacity-0 transition-opacity duration-200 hover:bg-opacity-70 group-hover:opacity-100"
            title="Previous image"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-1 top-1/2 -translate-y-1/2 transform rounded-full bg-black bg-opacity-50 p-1 text-white opacity-0 transition-opacity duration-200 hover:bg-opacity-70 group-hover:opacity-100"
            title="Next image"
          >
            <ChevronRight className="h-3 w-3" />
          </button>

          <div className="absolute bottom-1 right-1 rounded bg-black bg-opacity-50 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {currentImageIndex + 1}/{imageUrls.length}
          </div>
        </>
      )}
    </div>
  );
};

const AdminPage = ({ onAddBappa }) => {
  const MAX_AUTO_RETRIES = 6;
  const RETRY_DELAY_MS = 5000;
  const { isAuthenticated, isReady, user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [selectedBappa, setSelectedBappa] = useState(null);
  const [murtiImagesData, setMurtiImagesData] = useState({});
  const [sizeFilter, setSizeFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [designFilter, setDesignFilter] = useState('');
  const [bookedSuggestionFilter, setBookedSuggestionFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [pendingApprovalBappa, setPendingApprovalBappa] = useState(null);
  const [roundUpBappa, setRoundUpBappa] = useState(null);
  const [advertisementMessages, setAdvertisementMessages] = useState([]);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [messageFormValues, setMessageFormValues] = useState({ title: '', message: '' });
  const [isSavingMessage, setIsSavingMessage] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showBookedMurtiDetails, setShowBookedMurtiDetails] = useState(false);
  const [showAllMurtiDetails, setShowAllMurtiDetails] = useState(false);
  const [showMurtiTallyDetails, setShowMurtiTallyDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [yearFilter, setYearFilter] = useState(getCurrentYear());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [murtis, setMurtis] = useState([]);

  const loadMurtis = async () => {
    setLoading(true);
    try {
      const response = await api.get('/murtis');
      const mapped = (response.data || []).map(normalizeMurti);
      setMurtis(mapped);
      setError('');
    } catch (loadError) {
      setError(loadError.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const loadAdvertisementMessages = async (useLatestAsDefault = false) => {
    setIsLoadingMessages(true);
    try {
      const response = await api.get('/advertisements');
      const records = response.data || [];
      setAdvertisementMessages(records);
      setSelectedMessageId((prev) => (useLatestAsDefault ? records[0]?.id ?? null : prev ?? records[0]?.id ?? null));
    } catch (loadError) {
      console.error('Failed to load advertisement messages:', loadError);
      setAdvertisementMessages([]);
      setSelectedMessageId(null);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      setShowLoginModal(!isAuthenticated);
    }
  }, [isReady, isAuthenticated]);

  useEffect(() => {
    loadMurtis();
    loadAdvertisementMessages(true);
  }, []);

  useEffect(() => {
    if (!error) {
      setRetryAttempt(0);
      return;
    }

    if (retryAttempt >= MAX_AUTO_RETRIES) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        await loadMurtis();
      } finally {
        setRetryAttempt((prev) => prev + 1);
      }
    }, RETRY_DELAY_MS);

    return () => clearTimeout(timer);
  }, [error, retryAttempt]);

  const fetchMurtiImages = async (murtiId) => {
    try {
      const response = await api.get(`/murtis/${murtiId}/images`);
      return (response.data || []).map(normalizeImageRecord);
    } catch (fetchError) {
      console.error('Error fetching murti images:', fetchError);
      return [];
    }
  };

  useEffect(() => {
    const loadAllImages = async () => {
      if (!murtis.length) {
        setMurtiImagesData({});
        return;
      }

      const imagesMap = {};
      for (const murti of murtis) {
        const images = await fetchMurtiImages(murti.id);
        imagesMap[murti.id] = images;
      }

      setMurtiImagesData(imagesMap);
    };

    loadAllImages();
  }, [murtis]);

  useEffect(() => {
    if (!showMessageModal) return;

    const selected = advertisementMessages.find((item) => item.id === selectedMessageId);
    if (selected) {
      setMessageFormValues({
        title: selected.title || '',
        message: selected.message || '',
      });
    } else if (advertisementMessages.length === 0) {
      setMessageFormValues({ title: '', message: '' });
    }
  }, [showMessageModal, selectedMessageId, advertisementMessages]);

  const handleEditClick = (bappa) => {
    setEditingId(bappa.id);
    setEditedValues({
      murti_id: bappa.name,
      final_price: bappa.price,
      discount_price: bappa.discount_price || '',
      paid_amount: bappa.paid_amount ?? '',
      address: bappa.address || '',
      customer_name: bappa.fullName || '',
      customer_phone: bappa.phoneNumber || '',
      suggestions: String(bappa.suggestions || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      booking_status: bappa.booking_status || 'available',
      supplier: bappa.supplier || '',
      murti_design: bappa.murti_design || '',
      stored_at: bappa.stored_at || '',
      payment_mode: bappa.payment_mode || 'Online',
    });
  };

  const handleSaveClick = async (id) => {
    try {
      const discountPrice =
        editedValues.discount_price === '' || editedValues.discount_price === null || editedValues.discount_price === undefined
          ? null
          : Number(editedValues.discount_price);
      const paidAmount =
        editedValues.paid_amount === '' || editedValues.paid_amount === null || editedValues.paid_amount === undefined
          ? null
          : Number(editedValues.paid_amount);

      await api.patch(`/murtis/${id}`, {
        murti_id: editedValues.murti_id,
        final_price: Number(editedValues.final_price),
        discount_price: discountPrice,
        paid_amount: paidAmount,
        address:
          editedValues.booking_status === 'booked' || editedValues.booking_status === 'delivered'
            ? editedValues.address?.trim() || null
            : null,
        customer_name:
          editedValues.booking_status === 'booked' || editedValues.booking_status === 'delivered'
            ? editedValues.customer_name?.trim() || null
            : null,
        customer_phone:
          editedValues.booking_status === 'booked' || editedValues.booking_status === 'delivered'
            ? editedValues.customer_phone?.trim() || null
            : null,
        suggestions:
          editedValues.booking_status === 'booked' || editedValues.booking_status === 'delivered'
            ? (editedValues.suggestions || []).join(', ')
            : null,
        booking_status: editedValues.booking_status,
        booking_date: getCurrentDbDate(),
        supplier: editedValues.supplier || null,
        murti_design: editedValues.murti_design || null,
        stored_at: editedValues.stored_at?.trim() || null,
        payment_mode:
          editedValues.booking_status === 'booked' || editedValues.booking_status === 'delivered'
            ? editedValues.payment_mode || 'Online'
            : null,
      });

      setEditingId(null);
      setEditedValues({});
      await loadMurtis();
    } catch (saveError) {
      console.error('Error updating Bappa', saveError);
      alert('Failed to update!');
    }
  };

  const handleInputChange = (field, value) => {
    setEditedValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleCloseEditModal = () => {
    setEditingId(null);
    setEditedValues({});
  };

  const handleMessageFormChange = (field, value) => {
    setMessageFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateNewMessage = () => {
    setSelectedMessageId(null);
    setMessageFormValues({ title: '', message: '' });
  };

  const handleSaveMessageTemplate = async () => {
    if (!messageFormValues.title.trim() || !messageFormValues.message.trim()) {
      alert('Please fill in both title and message.');
      return;
    }

    setIsSavingMessage(true);
    try {
      if (selectedMessageId !== null) {
        await api.patch(`/advertisements/${selectedMessageId}`, {
          title: messageFormValues.title.trim(),
          message: messageFormValues.message.trim(),
        });
      } else {
        await api.post('/advertisements', {
          title: messageFormValues.title.trim(),
          message: messageFormValues.message.trim(),
          placement: 'general',
        });
      }

      await loadAdvertisementMessages(true);
      if (selectedMessageId === null) {
        setMessageFormValues({ title: '', message: '' });
      }
    } catch (messageError) {
      console.error('Failed to save advertisement message:', messageError);
      alert('Could not save the message.');
    } finally {
      setIsSavingMessage(false);
    }
  };

  const handleSendMessage = async (bappa) => {
    const whatsappNumber = getWhatsAppNumber(bappa.phoneNumber);
    if (!whatsappNumber) {
      alert('Phone number not available for this booking.');
      return;
    }

    const selectedTemplate =
      advertisementMessages.find((item) => item.id === selectedMessageId) || advertisementMessages[0] || null;

    const message = [
      selectedTemplate?.title ? `*${selectedTemplate.title}*` : null,
      selectedTemplate?.message || null,
      [
        'Customer Details',
        `Name: ${bappa.fullName || '-'}`,
        `Phone: ${bappa.phoneNumber || '-'}`,
        `Booked by: ${bappa.booked_by || '-'}`,
        bappa.address ? `Address: ${bappa.address}` : null,
        `Murti: ${bappa.name || '-'}`,
        `Size: ${bappa.size || '-'}`,
      ].filter(Boolean).join('\n'),
      `Message Sent By :- ${user?.name || user?.email || 'Admin'}`,
      'This is an automated message.',
    ]
      .filter(Boolean)
      .join('\n\n');

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Bappa?')) {
      try {
        await api.delete(`/murtis/${id}`);
        await loadMurtis();
      } catch (deleteError) {
        console.error('Failed to delete Bappa:', deleteError);
        alert('Something went wrong while deleting!');
      }
    }
  };

  const bappas = murtis.map((item) => ({
    ...item,
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
    payment_mode: item.payment_mode || 'Online',
    address: item.address,
    suggestions: item.suggestions,
    customer_email: item.customer_email,
    booked_by: item.booked_by,
    images: murtiImagesData[item.id] || [],
    discount_price: item.discount_price,
    date: item.booking_date || null,
    supplier: item.supplier || '',
    murti_design: item.murti_design || '',
    stored_at: item.stored_at || '',
  }));

  const bookings = bappas
    .filter((item) => item.booking_status === 'booked')
    .map((item) => ({
      bappaId: item.id,
      fullName: item.customer_name,
      phoneNumber: item.customer_phone,
      bookedAt: item.date || null,
    }));

  const getYearFromDate = (dateValue) => {
    if (!dateValue) return null;
    const [year] = String(dateValue).split('-');
    return year || null;
  };

  const availableYears = [...new Set(
    bappas
      .filter((b) => b.date)
      .map((b) => getYearFromDate(b.date))
      .concat(getCurrentYear())
      .filter(Boolean)
  )].sort((a, b) => Number(b) - Number(a));

  const availableBookedSuggestions = [...new Set(
    bappas
      .filter((b) => b.booking_status === 'booked' || b.booking_status === 'delivered')
      .flatMap((b) =>
        String(b.suggestions || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      )
      .concat(BOOKING_SUGGESTION_OPTIONS)
  )];

  const matchesYearFilter = (bappa) => {
    if (!yearFilter) return true;
    if (!bappa.date) return false;
    return getYearFromDate(bappa.date) === yearFilter;
  };

  const applyFilters = (bappaList) => {
    return bappaList
      .filter((b) => {
        if (!filterStatus) return true;
        if (filterStatus === 'available') {
          return b.booking_status !== 'booked' && b.booking_status !== 'pending';
        }
        return b.booking_status === filterStatus;
      })
      .filter(matchesYearFilter)
      .filter((b) => !sizeFilter || b.size === sizeFilter)
      .filter((b) => !supplierFilter || b.supplier === supplierFilter)
      .filter((b) => !designFilter || b.murti_design === designFilter)
      .filter((b) =>
        searchText.trim() === ''
          ? true
          : (b.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
            (b.fullName || '').toLowerCase().includes(searchText.toLowerCase()) ||
            (b.size || '').toLowerCase().includes(searchText.toLowerCase())
      );
  };

  const matchesBookedSuggestionFilter = (bappa) => {
    if (!bookedSuggestionFilter) return true;
    return String(bappa.suggestions || '')
      .split(',')
      .map((item) => item.trim())
      .includes(bookedSuggestionFilter);
  };

  const bookedBappas = applyFilters(
    bappas.filter((b) => b.booking_status === 'booked' || b.booking_status === 'delivered')
  ).filter(matchesBookedSuggestionFilter);
  const availableBappas = applyFilters(
    bappas.filter((b) => b.booking_status !== 'booked' && b.booking_status !== 'pending')
  );
  const allFilteredBappas = applyFilters(bappas);

  const handleApprove = async (id, discountedAmount) => {
    try {
      await api.patch(`/murtis/${id}`, {
        booking_status: 'booked',
        discount_price: parseInt(discountedAmount, 10),
        booking_date: getCurrentDbDate(),
      });

      await loadMurtis();
    } catch (approveError) {
      console.error('Failed to approve Bappa:', approveError);
      alert('Something went wrong while approving!');
    }
  };

  const getBookingDetails = (bappaId) =>
    bookings.find((booking) => booking.bappaId === bappaId);

  const totalFinal = bookedBappas.reduce((sum, b) => sum + Number(b.price || 0), 0);
  const totalPaid = bookedBappas.reduce((sum, b) => sum + Number(b.paid_amount || 0), 0);
  const totalRemaining = totalFinal - totalPaid;
  const totalDiscounted = bookedBappas.reduce(
    (sum, b) => sum + Number(b.discount_price || b.price || 0),
    0
  );
  const totalRemainingDiscounted = totalDiscounted - totalPaid;

  if (!isReady) {
    return <div className="px-4 py-8 text-center text-white">Checking login...</div>;
  }

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
      <div className="space-y-4 px-4 py-8 text-center text-red-200">
        <p>Failed to load admin data: {error}</p>
        <p className="text-sm text-white">
          Retrying automatically {retryAttempt < MAX_AUTO_RETRIES ? `(${retryAttempt + 1}/${MAX_AUTO_RETRIES})` : 'stopped'}.
        </p>
        <button
          type="button"
          onClick={() => {
            setRetryAttempt(0);
            loadMurtis();
          }}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-800"
        >
          Retry now
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-bold text-gray-200 md:text-4xl">Admin Dashboard</h2>
          <p className="text-gray-200">Manage your Ganpati Bappa collection and bookings</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 md:mt-0">
          <button
            onClick={() => setShowMessageModal(true)}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-6 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:from-fuchsia-700 hover:to-pink-700"
          >
            <MessageSquareText className="h-5 w-5" />
            <span>Create Message</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-green-700"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Murti</span>
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border-l-4 border-blue-500 bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Murti</p>
              <p className="text-3xl font-bold text-blue-600">{allFilteredBappas.length}</p>
            </div>
            <List className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="rounded-xl border-l-4 border-green-500 bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Booked</p>
              <p className="text-3xl font-bold text-green-600">{bookedBappas.length}</p>
            </div>
            <Calendar className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="rounded-xl border-l-4 border-orange-500 bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-3xl font-bold text-orange-600">{availableBappas.length}</p>
            </div>
            <IndianRupee className="h-12 w-12 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <select
          className="rounded-md border px-3 py-2"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="available">Available</option>
          <option value="pending">Pending</option>
          <option value="booked">Booked</option>
          <option value="delivered">Delivered</option>
        </select>

        <select
          className="rounded-md border px-3 py-2"
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value)}
        >
          <option value="">All Sizes</option>
          {[6, 9, 11, 12, 13, 14, 15, 18, 21, 24].map((value) => (
            <option key={value} value={`${value} inches`}>
              {value} inches
            </option>
          ))}
        </select>

        <select
          className="rounded-md border px-3 py-2"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          <option value="">All Years</option>
          {availableYears.map((year) => (
            <option key={year} value={String(year)}>
              {year}
            </option>
          ))}
        </select>

        <select
          className="rounded-md border px-3 py-2"
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
        >
          <option value="">All Suppliers</option>
          {SUPPLIER_OPTIONS.map((supplier) => (
            <option key={supplier} value={supplier}>
              {supplier}
            </option>
          ))}
        </select>

        <select
          className="rounded-md border px-3 py-2"
          value={designFilter}
          onChange={(e) => setDesignFilter(e.target.value)}
        >
          <option value="">All Designs</option>
          {MURTI_DESIGN_OPTIONS.map((design) => (
            <option key={design} value={design}>
              {design}
            </option>
          ))}
        </select>

        <input
          type="text"
          className="flex-grow rounded-md border px-3 py-2"
          placeholder="Search by Murti ID, Customer Name, or Size..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className="mb-8 rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="flex items-center space-x-2 text-2xl font-bold text-gray-800">
            <Calendar className="h-6 w-6 text-green-500" />
            <span>Booked Murti</span>
          </h3>
          <div className="flex flex-col gap-3 self-start md:flex-row md:items-center">
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
              value={bookedSuggestionFilter}
              onChange={(e) => setBookedSuggestionFilter(e.target.value)}
            >
              <option value="">All Suggestions</option>
              {availableBookedSuggestions.map((suggestion) => (
                <option key={suggestion} value={suggestion}>
                  {suggestion}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowBookedMurtiDetails((prev) => !prev)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <span>{showBookedMurtiDetails ? 'Hide Details' : 'Show Details'}</span>
              {showBookedMurtiDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {showBookedMurtiDetails && (
          <>
            {bookedBappas.length === 0 ? (
              <p className="py-8 text-center text-gray-500">No bookings yet for the current filters.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {bookedBappas.map((bappa, index) => {
                  const booking = getBookingDetails(bappa.id);
                  return (
                    <div
                      key={bappa.id}
                      onClick={() => setSelectedBappa(bappa)}
                      className="relative rounded-xl border p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="mb-4 flex justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendMessage(bappa);
                          }}
                          className="rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-3 py-2 text-sm font-semibold text-white shadow transition hover:from-green-600 hover:to-green-700 focus:outline-none"
                          title="Send Message"
                        >
                          Send Message
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
                          className="h-20 w-20 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <h4 className="font-bold text-gray-800">{bappa.name}</h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                bappa.booking_status === 'booked'
                                  ? 'bg-green-100 text-green-700'
                                  : bappa.booking_status === 'pending'
                                    ? 'bg-blue-100 text-blue-700'
                                    : bappa.booking_status === 'delivered'
                                      ? 'bg-gray-200 text-gray-700'
                                      : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {bappa.booking_status}
                            </span>
                          </div>
                          <p className="mb-2 text-sm text-gray-600">ID: #{index + 1} | {bappa.size}</p>
                          <p className="font-bold text-green-600">₹{bappa.price}</p>
                          <div>
                            <p className="text-sm text-blue-700">Discount Price: {bappa.discount_price ? `₹${bappa.discount_price}` : '-'}</p>
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
          </>
        )}
      </div>

      <div className="rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="flex items-center space-x-2 text-2xl font-bold text-gray-800">
            <List className="h-6 w-6 text-blue-500" />
            <span>All Murti</span>
          </h3>
          <button
            type="button"
            onClick={() => setShowAllMurtiDetails((prev) => !prev)}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <span>{showAllMurtiDetails ? 'Hide Details' : 'Show Details'}</span>
            {showAllMurtiDetails ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        {showAllMurtiDetails && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allFilteredBappas.length === 0 ? (
              <p className="col-span-full py-8 text-center text-gray-500">No murti found matching the current filters.</p>
            ) : (
              allFilteredBappas.map((bappa, index) => (
                <div key={bappa.id} className={`relative rounded-xl border p-4 transition-all ${bappa.booked ? 'border-green-200 bg-green-50' : 'hover:shadow-md'}`}>
                  <button
                    onClick={() => handleEditClick(bappa)}
                    className="absolute right-10 top-2 rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(bappa.id)}
                    className="absolute right-2 top-2 text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>

                  <div className="flex space-x-4">
                    <ImageSlider
                      images={bappa.images}
                      defaultImage={bappa.image}
                      altText={bappa.name}
                      className="h-16 w-16 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-bold text-gray-800">{bappa.name}</h4>
                        <span className={`absolute bottom-2 right-2 rounded-full px-2 py-1 text-xs font-bold shadow ${
                          bappa.booked ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {bappa.booking_status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">ID: #{index + 1}</p>
                      <p className="text-sm text-gray-600">{bappa.size}</p>
                      <p className="font-bold text-green-600">₹{bappa.price}</p>
                      {bappa.booking_status === 'pending' && (
                        <>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>{bappa.fullName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{bappa.phoneNumber}</span>
                          </div>
                          <button
                            className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-white transition-all hover:bg-blue-700"
                            onClick={() => setPendingApprovalBappa(bappa)}
                          >
                            Approve
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="text-2xl font-bold text-gray-800">Murti Tally Summary</h3>
          <button
            type="button"
            onClick={() => setShowMurtiTallyDetails((prev) => !prev)}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <span>{showMurtiTallyDetails ? 'Hide Details' : 'Show Details'}</span>
            {showMurtiTallyDetails ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        {showMurtiTallyDetails && (
          <div className="overflow-x-auto">
            <table className="min-w-full rounded-xl border border-gray-200">
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
                    <td colSpan="7" className="p-3 text-center text-gray-500">No data available for the current filters.</td>
                  </tr>
                ) : (
                  allFilteredBappas.map((bappa, idx) => (
                    <tr key={bappa.id} className="border-t">
                      <td className="p-3">{idx + 1}</td>
                      <td className="p-3">{bappa.name}</td>
                      <td className="p-3 capitalize">{bappa.booking_status}</td>
                      <td className="p-3">₹{bappa.price || 0}</td>
                      <td className="p-3">₹{bappa.discount_price || '-'}</td>
                      <td className="p-3">₹{bappa.paid_amount || 0}</td>
                      <td className="p-3">₹{(bappa.price || 0) - (bappa.paid_amount || 0)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 space-y-4 text-right font-semibold">
          <div>
            <h3 className="mb-2 text-center text-lg font-bold">Final Price Totals</h3>
            <p>Total Final Price (Booked): ₹{totalFinal}</p>
            <p>Total Paid (Booked): ₹{totalPaid}</p>
            <p>Total Remaining (Booked): ₹{totalRemaining}</p>
          </div>

          <hr className="my-4" />
          <div>
            <h3 className="mb-2 text-center text-lg font-bold">Discounted Price Totals</h3>
            <p>Total Discounted Price (Booked): ₹{totalDiscounted}</p>
            <p>Total Paid (Booked): ₹{totalPaid}</p>
            <p>Total Remaining (Discounted Booked): ₹{totalRemainingDiscounted}</p>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddBappaModal
          onClose={() => setShowAddModal(false)}
          onAddBappa={onAddBappa || loadMurtis}
        />
      )}
      {showMessageModal && (
        <MessageManagerModal
          onClose={() => setShowMessageModal(false)}
          onSubmit={handleSaveMessageTemplate}
          isSaving={isSavingMessage}
          isLoadingMessages={isLoadingMessages}
          formValues={messageFormValues}
          onFormChange={handleMessageFormChange}
          messages={advertisementMessages}
          selectedMessageId={selectedMessageId}
          onCreateNew={handleCreateNewMessage}
          onSelectMessage={(id) => {
            const selected = advertisementMessages.find((item) => item.id === id);
            setSelectedMessageId(id);
            if (selected) {
              setMessageFormValues({
                title: selected.title || '',
                message: selected.message || '',
              });
            }
          }}
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
          onApprove={async (id, discountedAmount) => {
            await handleApprove(id, discountedAmount);
            setPendingApprovalBappa(null);
          }}
        />
      )}
      {roundUpBappa && (
        <RoundUpModal
          bappa={roundUpBappa}
          onClose={() => setRoundUpBappa(null)}
          onSubmit={async (id, roundupAmount) => {
            await api.patch(`/murtis/${id}/delivery`, {
              booking_status: 'delivered',
              roundup_amount: roundupAmount,
            });
            await loadMurtis();
          }}
        />
      )}
    </div>
  );
};

export default AdminPage;
