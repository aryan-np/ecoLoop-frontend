import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import recycleAPI from '../api/recycle';
import Toast from '../components/Toast';
import UnauthorizedModal from '../components/UnauthorizedModal';
import LocationPicker from '../components/LocationPicker';
import { getAccess } from '../auth/tokenService';
import { getErrorMessage } from '../utils/errorHandler';

export default function ScrapRequestForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [submittedCategory, setSubmittedCategory] = useState('');
  
  const [formData, setFormData] = useState({
    scrap_category: '',
    estimated_weight: '',
    scrap_condition: 'clean',
    pickup_address: '',
    latitude: null,
    longitude: null,
    preferred_pickup_date: '',
    preferred_time_slot: '',
    notes: '',
    photos: []
  });

  const [toast, setToast] = useState(null);

  const timeSlots = [
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'evening', label: 'Evening' }
  ];

  const conditions = [
    { value: 'clean', label: 'Clean' },
    { value: 'mixed', label: 'Mixed' }
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await recycleAPI.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
      setToast({ type: 'error', message: getErrorMessage(err, 'Failed to load scrap categories') });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.photos.length + files.length > 5) {
      setToast({ type: 'error', message: 'Maximum 5 images allowed' });
      return;
    }
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check authentication
    if (!getAccess()) {
      setShowUnauthorizedModal(true);
      return;
    }
    
    // Validation
    if (!formData.scrap_category || !formData.estimated_weight || !formData.pickup_address || 
        !formData.preferred_pickup_date || !formData.preferred_time_slot) {
      setToast({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setLoading(true);
    try {
      // Find the category for the success message
      const selectedCategory = categories.find(cat => cat.id === parseInt(formData.scrap_category));
      
      // Prepare data as FormData for file upload support
      const submitData = new FormData();
      submitData.append('category', formData.scrap_category);
      submitData.append('weight_kg', formData.estimated_weight);
      submitData.append('pickup_address', formData.pickup_address);
      submitData.append('preferred_time_slot', formData.preferred_time_slot);
      submitData.append('condition', formData.scrap_condition);
      if (formData.notes) submitData.append('notes', formData.notes);
      
      // Add coordinates if selected (format to 5 decimal places)
      if (formData.latitude !== null) submitData.append('latitude', Number(formData.latitude.toFixed(5)));
      if (formData.longitude !== null) submitData.append('longitude', Number(formData.longitude.toFixed(5)));
      
      // Append photos using the correct field name expected by backend
      formData.photos.forEach((photo) => {
        submitData.append('uploaded_images', photo);
      });

      await recycleAPI.submitScrapRequest(submitData);
      
      setSubmittedCategory(selectedCategory?.material_type || 'scrap');
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error submitting scrap request:', err);
      setToast({ type: 'error', message: getErrorMessage(err, 'Failed to submit request. Please try again.') });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/recycle');
  };

  if (showSuccessModal) {
    return <SuccessModal category={submittedCategory} onClose={() => setShowSuccessModal(false)} />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-medium">Back</span>
      </button>

      {/* Page Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Scrap Request Form</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Scrap Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scrap Category <span className="text-red-500">*</span>
          </label>
          <select
            name="scrap_category"
            value={formData.scrap_category}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select scrap category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.material_type} - Rs. {category.rate_per_kg}/kg
              </option>
            ))}
          </select>
        </div>

        {/* Estimated Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Weight (kg) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="estimated_weight"
            value={formData.estimated_weight}
            onChange={handleInputChange}
            placeholder="e.g., 5 kg, 10-15 kg"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Scrap Condition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scrap Condition <span className="text-red-500">*</span>
          </label>
          <select
            name="scrap_condition"
            value={formData.scrap_condition}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {conditions.map(condition => (
              <option key={condition.value} value={condition.value}>{condition.label}</option>
            ))}
          </select>
        </div>

        {/* Pickup Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pickup Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="pickup_address"
            value={formData.pickup_address}
            onChange={handleInputChange}
            placeholder="e.g., Kathmandu, Thamel"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          
          <div className="mt-4">
            <LocationPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={(lat, lng) => {
                setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
              }}
            />
          </div>
        </div>

        {/* Preferred Pickup Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Pickup Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="preferred_pickup_date"
              value={formData.preferred_pickup_date}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Time Slot <span className="text-red-500">*</span>
            </label>
            <select
              name="preferred_time_slot"
              value={formData.preferred_time_slot}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select time slot</option>
              {timeSlots.map(slot => (
                <option key={slot.value} value={slot.value}>{slot.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photo Upload (Optional, for verification)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
              disabled={formData.photos.length >= 5}
            />
            <label
              htmlFor="photo-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-gray-600 font-medium">Upload</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">Upload up to 5 images</p>
          
          {/* Photo Preview */}
          {formData.photos.length > 0 && (
            <div className="mt-4 grid grid-cols-5 gap-2">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
            placeholder="Provide details about accessibility, specific pickup instructions, or any other relevant information..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Scrap Request'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Unauthorized Modal */}
      <UnauthorizedModal 
        isOpen={showUnauthorizedModal} 
        onClose={() => setShowUnauthorizedModal(false)} 
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// Success Modal Component
function SuccessModal({ category, onClose }) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
        {/* Success Icon */}
        <div className="bg-teal-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Your scrap request has been submitted.
        </h2>

        {/* Status Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">Status: Pending Pickup</p>
          <p className="text-sm text-blue-800">
            A recycler will contact you soon to schedule the pickup for your {category.toLowerCase()} scrap.
          </p>
        </div>

        {/* Additional Message */}
        <p className="text-sm text-gray-600 mb-6">
          Your contribution helps reduce waste and support sustainable recycling practices in Kathmandu Valley.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/my-transactions')}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition"
          >
            View My Transactions
          </button>
          <button
            onClick={() => navigate('/products')}
            className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-lg transition"
          >
            Back to Browse
          </button>
        </div>
      </div>
    </div>
  );
}
