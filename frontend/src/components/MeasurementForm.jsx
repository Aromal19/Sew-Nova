import React, { useState, useEffect } from 'react';
import { apiCall } from '../config/api';

const MeasurementForm = ({ design, onMeasurementSubmit, onCancel }) => {
  const [measurements, setMeasurements] = useState({});
  const [userMeasurements, setUserMeasurements] = useState([]);
  const [selectedMeasurementSet, setSelectedMeasurementSet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user's existing measurements
  useEffect(() => {
    const fetchUserMeasurements = async () => {
      try {
        setLoading(true);
        const response = await apiCall('CUSTOMER_SERVICE', '/api/measurements');
        if (response.success) {
          setUserMeasurements(response.data);
          // Auto-select default measurement if available
          const defaultMeasurement = response.data.find(m => m.isDefault);
          if (defaultMeasurement) {
            setSelectedMeasurementSet(defaultMeasurement);
            autoFillMeasurements(defaultMeasurement);
          }
        }
      } catch (err) {
        console.error('Error fetching user measurements:', err);
        setError('Failed to load your measurements');
      } finally {
        setLoading(false);
      }
    };

    fetchUserMeasurements();
  }, []);

  // Auto-fill measurements from selected measurement set
  const autoFillMeasurements = (measurementSet) => {
    if (!measurementSet || !design?.measurementDetails) return;

    const newMeasurements = {};
    design.measurementDetails.forEach(measurement => {
      const measurementId = measurement.id;
      let value = null;

      // Map design measurement IDs to user measurement fields
      switch (measurementId) {
        case 'chest':
          value = measurementSet.chest;
          break;
        case 'waist':
          value = measurementSet.waist;
          break;
        case 'hip':
          value = measurementSet.hip;
          break;
        case 'shoulder_width':
          value = measurementSet.shoulder;
          break;
        case 'sleeve_length':
          value = measurementSet.sleeveLength;
          break;
        case 'neck':
          value = measurementSet.neck;
          break;
        case 'inseam':
          value = measurementSet.inseam;
          break;
        case 'thigh':
          value = measurementSet.thigh;
          break;
        case 'knee':
          value = measurementSet.knee;
          break;
        case 'ankle':
          value = measurementSet.ankle;
          break;
        case 'height':
          value = measurementSet.height;
          break;
        case 'bicep':
          value = measurementSet.sleeveWidth; // Map bicep to sleeveWidth
          break;
        case 'armhole':
          value = measurementSet.sleeveWidth; // Map armhole to sleeveWidth
          break;
        case 'wrist':
          value = measurementSet.sleeveWidth; // Map wrist to sleeveWidth
          break;
        default:
          // Check custom measurements
          if (measurementSet.customMeasurements && measurementSet.customMeasurements[measurementId]) {
            value = measurementSet.customMeasurements[measurementId];
          }
          break;
      }

      if (value && value > 0) {
        newMeasurements[measurementId] = value;
      }
    });

    setMeasurements(newMeasurements);
  };

  // Handle measurement set selection
  const handleMeasurementSetSelect = (measurementSet) => {
    setSelectedMeasurementSet(measurementSet);
    autoFillMeasurements(measurementSet);
  };

  // Handle individual measurement input changes
  const handleMeasurementChange = (measurementId, value) => {
    setMeasurements(prev => ({
      ...prev,
      [measurementId]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!design?.measurementDetails) return false;
    
    return design.measurementDetails.every(measurement => {
      const value = measurements[measurement.id];
      return value && value > 0;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill in all required measurements');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create measurement data for this design
      const measurementData = {
        measurementName: `${design.name} - ${new Date().toLocaleDateString()}`,
        measurementType: design.category.toLowerCase(),
        gender: 'unisex', // You might want to get this from user profile
        ageGroup: 'adult',
        ...measurements,
        customMeasurements: Object.fromEntries(
          Object.entries(measurements).filter(([key]) => 
            !['chest', 'waist', 'hip', 'shoulder', 'sleeveLength', 'neck', 'inseam', 'thigh', 'knee', 'ankle', 'height'].includes(key)
          )
        )
      };

      // Save the measurement
      const response = await apiCall('CUSTOMER_SERVICE', '/api/measurements', {
        method: 'POST',
        body: JSON.stringify(measurementData)
      });

      if (response.success) {
        onMeasurementSubmit(measurements, response.data);
      } else {
        setError('Failed to save measurements');
      }
    } catch (err) {
      console.error('Error submitting measurements:', err);
      setError('Failed to save measurements');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading your measurements...</span>
      </div>
    );
  }

  if (!design?.measurementDetails || design.measurementDetails.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No measurements required for this design.</p>
        <button
          onClick={() => onMeasurementSubmit({}, null)}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Measurement Form
          </h2>
          <p className="text-gray-600">
            Please provide your measurements for <strong>{design.name}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {design.measurementDetails.length} measurement{design.measurementDetails.length !== 1 ? 's' : ''} required
          </p>
        </div>

        {/* Auto-fill Section */}
        {userMeasurements.length > 0 && (
          <div className="p-6 bg-blue-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Quick Fill from Your Measurements
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select one of your saved measurements to auto-fill the form. Matching measurements will be automatically entered.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {userMeasurements.map((measurement) => (
                <button
                  key={measurement._id}
                  onClick={() => handleMeasurementSetSelect(measurement)}
                  className={`p-3 text-left rounded-lg border-2 transition-all ${
                    selectedMeasurementSet?._id === measurement._id
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">
                    {measurement.measurementName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {measurement.measurementType} • {measurement.gender}
                  </div>
                  {measurement.isDefault && (
                    <div className="text-xs text-blue-600 font-medium">
                      Default
                    </div>
                  )}
                </button>
              ))}
            </div>
            {selectedMeasurementSet && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-green-800">
                    Auto-filled from "{selectedMeasurementSet.measurementName}". Review and adjust as needed.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Measurement Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Measurement Tips</h4>
                <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                  <li>• Use a flexible measuring tape</li>
                  <li>• Measure over light clothing or bare skin</li>
                  <li>• Keep the tape snug but not tight</li>
                  <li>• Measure in inches or centimeters consistently</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {design.measurementDetails.map((measurement) => (
              <div key={measurement.id} className="space-y-2">
                <label
                  htmlFor={measurement.id}
                  className="block text-sm font-medium text-gray-700"
                >
                  {measurement.label}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id={measurement.id}
                    step="0.1"
                    min="0"
                    value={measurements[measurement.id] || ''}
                    onChange={(e) => handleMeasurementChange(measurement.id, parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Enter ${measurement.label.toLowerCase()}`}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">
                      {measurement.unit}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 capitalize">
                  {measurement.category.replace('_', ' ')}
                </p>
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                {Object.keys(measurements).filter(key => measurements[key] > 0).length} / {design.measurementDetails.length} completed
              </div>
              <button
                type="submit"
                disabled={!validateForm() || isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Save Measurements'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeasurementForm;
