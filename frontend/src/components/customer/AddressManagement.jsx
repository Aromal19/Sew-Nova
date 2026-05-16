import React, { useState, useEffect } from 'react';
import { FiHome, FiBriefcase, FiMap, FiSearch, FiLoader } from 'react-icons/fi';

const AddressManagement = ({ address, onSubmit, onCancel, title, variant = 'default', initialShopFields = {} }) => {
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [localities, setLocalities] = useState([]);
  const [showLocalityDropdown, setShowLocalityDropdown] = useState(false);
  const [formData, setFormData] = useState({
    addressType: 'home',
    addressLine: '',
    landmark: '',
    locality: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false,
    // Shop-specific
    shopName: initialShopFields.shopName || '',
    speciality: initialShopFields.speciality || '',
    experience: initialShopFields.experience || ''
  });

  useEffect(() => {
    if (address) {
      setFormData(prev => ({
        ...prev,
        addressType: address.addressType || 'home',
        addressLine: address.addressLine || '',
        landmark: address.landmark || '',
        locality: address.locality || '',
        city: address.city || '',
        district: address.district || '',
        state: address.state || '',
        pincode: address.pincode || '',
        country: address.country || 'India',
        isDefault: !!address.isDefault,
        shopName: initialShopFields.shopName || prev.shopName || '',
        speciality: initialShopFields.speciality || prev.speciality || '',
        experience: initialShopFields.experience || prev.experience || ''
      }));
    }
  }, [address, initialShopFields.shopName, initialShopFields.speciality, initialShopFields.experience]);

  // Indian states and districts data
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Function to fetch address details from pincode
  const fetchAddressFromPincode = async (pincode) => {
    if (!pincode || pincode.length !== 6) {
      return;
    }

    setPincodeLoading(true);
    setPincodeError('');

    try {
      // Using the correct API endpoint format
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch pincode data');
      }

      const data = await response.json();
      
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffices = data[0].PostOffice;
        
        // Extract unique localities from post offices
        const uniqueLocalities = [...new Set(postOffices.map(po => po.Name).filter(Boolean))];
        setLocalities(uniqueLocalities);
        
        // If only one locality, auto-select it
        if (uniqueLocalities.length === 1) {
          setFormData(prev => ({
            ...prev,
            locality: uniqueLocalities[0],
            city: postOffices[0].Division || postOffices[0].Block || '',
            district: postOffices[0].District || '',
            state: postOffices[0].State || '',
            country: 'India'
          }));
          setShowLocalityDropdown(false);
        } else if (uniqueLocalities.length > 1) {
          // If multiple localities, show dropdown
          setFormData(prev => ({
            ...prev,
            locality: '',
            city: postOffices[0].Division || postOffices[0].Block || '',
            district: postOffices[0].District || '',
            state: postOffices[0].State || '',
            country: 'India'
          }));
          setShowLocalityDropdown(true);
        }
        
        setPincodeError('');
      } else {
        setPincodeError('Pincode not found. Please check and try again.');
        // Clear the fields if pincode is invalid
        setFormData(prev => ({
          ...prev,
          locality: '',
          city: '',
          district: '',
          state: ''
        }));
        setLocalities([]);
        setShowLocalityDropdown(false);
      }
    } catch (error) {
      console.error('Error fetching pincode data:', error);
      setPincodeError('Failed to fetch address details. Please try again.');
      // Clear the fields on error
      setFormData(prev => ({
        ...prev,
        locality: '',
        city: '',
        district: '',
        state: ''
      }));
      setLocalities([]);
      setShowLocalityDropdown(false);
    } finally {
      setPincodeLoading(false);
    }
  };

  // Handle pincode input with debouncing
  const handlePincodeChange = (e) => {
    const { value } = e.target;
    
    // Update the pincode field
    setFormData(prev => ({
      ...prev,
      pincode: value
    }));

    // Clear error when user starts typing
    setPincodeError('');

    // Fetch address details when pincode is 6 digits
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      fetchAddressFromPincode(value);
    } else if (value.length < 6) {
      // Clear fields if pincode is incomplete
      setFormData(prev => ({
        ...prev,
        locality: '',
        city: '',
        district: '',
        state: ''
      }));
      setLocalities([]);
      setShowLocalityDropdown(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (typeof onSubmit === 'function') {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      addressType: 'home',
      addressLine: '',
      landmark: '',
      locality: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      country: 'India',
      isDefault: false
    });
    setLocalities([]);
    setShowLocalityDropdown(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">{title || (address ? 'Edit Address' : 'Add New Address')}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
            {variant === 'shop' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleInputChange}
                    placeholder="Enter shop name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speciality
                  </label>
                  <select
                    name="speciality"
                    value={formData.speciality}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select Speciality</option>
                    <option value="Formal Wear">Formal Wear</option>
                    <option value="Casual Wear">Casual Wear</option>
                    <option value="Bridal Wear">Bridal Wear</option>
                    <option value="Western Wear">Western Wear</option>
                    <option value="Traditional Wear">Traditional Wear</option>
                    <option value="Alterations">Alterations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Type
                </label>
                <select
                  name="addressType"
                  value={formData.addressType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="home">Home</option>
                  <option value="office">Office</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line
                </label>
                <input
                  type="text"
                  name="addressLine"
                  value={formData.addressLine}
                  onChange={handleInputChange}
                  placeholder="House/Flat number, Street name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="Near hospital, school, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Locality
                </label>
                {showLocalityDropdown && localities.length > 1 ? (
                  <select
                    name="locality"
                    value={formData.locality}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select Locality</option>
                    {localities.map(locality => (
                      <option key={locality} value={locality}>{locality}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="locality"
                    value={formData.locality}
                    onChange={handleInputChange}
                    placeholder="Enter locality name"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      formData.pincode.length === 6 && !pincodeError && formData.locality ? 'bg-green-50 border-green-300' : 'border-gray-300'
                    }`}
                    required
                  />
                )}
                {formData.pincode.length === 6 && !pincodeError && formData.locality && (
                  <p className="text-green-500 text-xs mt-1">
                    {showLocalityDropdown && localities.length > 1 ? 'Please select from available localities' : 'Auto-filled from pincode'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter city name"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    formData.pincode.length === 6 && !pincodeError ? 'bg-green-50 border-green-300' : 'border-gray-300'
                  }`}
                  required
                />
                {formData.pincode.length === 6 && !pincodeError && formData.city && (
                  <p className="text-green-500 text-xs mt-1">Auto-filled from pincode</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="Enter district name"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    formData.pincode.length === 6 && !pincodeError ? 'bg-green-50 border-green-300' : 'border-gray-300'
                  }`}
                  required
                />
                {formData.pincode.length === 6 && !pincodeError && formData.district && (
                  <p className="text-green-500 text-xs mt-1">Auto-filled from pincode</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    formData.pincode.length === 6 && !pincodeError ? 'bg-green-50 border-green-300' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select State</option>
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {formData.pincode.length === 6 && !pincodeError && formData.state && (
                  <p className="text-green-500 text-xs mt-1">Auto-filled from pincode</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Enter a 6-digit pincode to automatically fetch city, district, and state details
                </p>
                <div className="relative">
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handlePincodeChange}
                    placeholder="6-digit pincode"
                    pattern="[0-9]{6}"
                    maxLength="6"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      pincodeError ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {pincodeLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <FiLoader className="w-4 h-4 text-emerald-500 animate-spin" />
                    </div>
                  )}
                  {formData.pincode.length === 6 && !pincodeLoading && !pincodeError && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <FiSearch className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                </div>
                {pincodeError && (
                  <p className="text-red-500 text-xs mt-1">{pincodeError}</p>
                )}
                {formData.pincode.length === 6 && !pincodeLoading && !pincodeError && (
                  <p className="text-green-500 text-xs mt-1">✓ Address details fetched successfully</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <label className="text-sm text-gray-700">
                Set as default address
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (address ? 'Save Changes' : 'Save Address')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof onCancel === 'function') onCancel();
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};

export default AddressManagement; 