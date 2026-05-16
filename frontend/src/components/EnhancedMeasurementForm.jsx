import React, { useState, useEffect } from 'react';
import { apiCall } from '../config/api';

const EnhancedMeasurementForm = ({ design, onMeasurementSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [measurementMethod, setMeasurementMethod] = useState(null); // 'manual', 'ai', 'existing'
  const [measurements, setMeasurements] = useState({});
  const [userMeasurements, setUserMeasurements] = useState([]);
  const [selectedMeasurementSet, setSelectedMeasurementSet] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiMeasurementStatus, setAiMeasurementStatus] = useState('idle'); // 'idle', 'processing', 'completed', 'error'
  const [selectedUnit, setSelectedUnit] = useState('cm'); // 'cm' or 'in'
  const [userHeight, setUserHeight] = useState('');
  const [userWeight, setUserWeight] = useState('');
  const [showAiEditMode, setShowAiEditMode] = useState(false);

  const steps = [
    { id: 1, title: 'Measurements', description: 'Provide your measurements' },
    { id: 2, title: 'Confirm Measurements', description: 'Review and confirm your measurements' }
  ];

  // Unit conversion functions
  const convertToCm = (value, fromUnit) => {
    if (fromUnit === 'in') {
      return value * 2.54; // Convert inches to cm
    }
    return value; // Already in cm
  };

  const convertFromCm = (value, toUnit) => {
    if (toUnit === 'in') {
      return value / 2.54; // Convert cm to inches
    }
    return value; // Already in cm
  };

  const convertMeasurements = (measurementData, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return measurementData;
    
    const converted = {};
    Object.entries(measurementData).forEach(([key, value]) => {
      if (typeof value === 'number' && value > 0) {
        if (fromUnit === 'in' && toUnit === 'cm') {
          converted[key] = convertToCm(value, 'in');
        } else if (fromUnit === 'cm' && toUnit === 'in') {
          converted[key] = convertFromCm(value, 'in');
        } else {
          converted[key] = value;
        }
      } else {
        converted[key] = value;
      }
    });
    return converted;
  };

  // Auto-detect gender from design category
  const getGenderFromDesign = () => {
    if (!design?.category) return 'unisex';
    
    const category = design.category.toLowerCase();
    
    // Male categories
    if (category.includes('men') || category.includes('male') || category.includes('mens')) {
      return 'male';
    }
    
    // Female categories
    if (category.includes('women') || category.includes('female') || category.includes('womens') || 
        category.includes('ladies') || category.includes('girls')) {
      return 'female';
    }
    
    // Default to unisex for other categories
    return 'unisex';
  };

  // Calculate measurements based on height, weight, and auto-detected gender
  const calculateMeasurementsFromBodyData = (height, weight) => {
    const gender = getGenderFromDesign();
    const heightCm = selectedUnit === 'in' ? convertToCm(height, 'in') : height;
    const weightKg = selectedUnit === 'in' ? weight * 0.453592 : weight; // Convert lbs to kg if needed
    
    // BMI calculation
    const bmi = weightKg / Math.pow(heightCm / 100, 2);
    
    // Base measurements in cm (will be converted to selected unit later)
    let measurements = {};
    
    if (gender === 'male' || gender === 'unisex') {
      // Male body proportions based on global standards
      measurements = {
        chest: Math.round((heightCm * 0.55) + (weightKg * 0.3) + 5),
        waist: Math.round((heightCm * 0.45) + (weightKg * 0.4) - 5),
        hip: Math.round((heightCm * 0.50) + (weightKg * 0.25) + 2),
        shoulder_width: Math.round(heightCm * 0.25),
        sleeve_length: Math.round(heightCm * 0.35),
        neck: Math.round(heightCm * 0.20),
        inseam: Math.round(heightCm * 0.45),
        thigh: Math.round((heightCm * 0.30) + (weightKg * 0.15)),
        knee: Math.round(heightCm * 0.15),
        ankle: Math.round(heightCm * 0.10),
        height: Math.round(heightCm),
        bicep: Math.round((heightCm * 0.15) + (weightKg * 0.10)),
        armhole: Math.round(heightCm * 0.25),
        wrist: Math.round(heightCm * 0.08)
      };
    } else {
      // Female body proportions based on global standards
      measurements = {
        chest: Math.round((heightCm * 0.52) + (weightKg * 0.35) + 3),
        waist: Math.round((heightCm * 0.42) + (weightKg * 0.45) - 3),
        hip: Math.round((heightCm * 0.55) + (weightKg * 0.30) + 5),
        shoulder_width: Math.round(heightCm * 0.23),
        sleeve_length: Math.round(heightCm * 0.33),
        neck: Math.round(heightCm * 0.18),
        inseam: Math.round(heightCm * 0.43),
        thigh: Math.round((heightCm * 0.28) + (weightKg * 0.20)),
        knee: Math.round(heightCm * 0.14),
        ankle: Math.round(heightCm * 0.09),
        height: Math.round(heightCm),
        bicep: Math.round((heightCm * 0.14) + (weightKg * 0.12)),
        armhole: Math.round(heightCm * 0.23),
        wrist: Math.round(heightCm * 0.07)
      };
    }
    
    // Adjust based on BMI for more accurate predictions
    if (bmi < 18.5) {
      // Underweight - reduce measurements slightly
      Object.keys(measurements).forEach(key => {
        if (key !== 'height') measurements[key] = Math.round(measurements[key] * 0.95);
      });
    } else if (bmi > 25) {
      // Overweight - increase measurements slightly
      Object.keys(measurements).forEach(key => {
        if (key !== 'height') measurements[key] = Math.round(measurements[key] * 1.05);
      });
    }
    
    // Convert to selected unit if needed
    if (selectedUnit === 'in') {
      Object.keys(measurements).forEach(key => {
        measurements[key] = convertFromCm(measurements[key], 'in');
      });
    }
    
    return measurements;
  };

  // Fetch user's existing measurements
  useEffect(() => {
    const fetchUserMeasurements = async () => {
      try {
        setLoading(true);
        const response = await apiCall('CUSTOMER_SERVICE', '/api/measurements');
        if (response.success) {
          setUserMeasurements(response.data);
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
          value = measurementSet.sleeveWidth;
          break;
        case 'armhole':
          value = measurementSet.sleeveWidth;
          break;
        case 'wrist':
          value = measurementSet.sleeveWidth;
          break;
        default:
          if (measurementSet.customMeasurements && measurementSet.customMeasurements[measurementId]) {
            value = measurementSet.customMeasurements[measurementId];
          }
          break;
      }

      if (value && value > 0) {
        // Convert to selected unit if needed
        // Assume user measurements are stored in cm, convert if user selected inches
        if (selectedUnit === 'in') {
          value = convertFromCm(value, 'in');
        }
        newMeasurements[measurementId] = value;
      }
    });

    setMeasurements(newMeasurements);
  };

  // Handle measurement method selection
  const handleMethodSelect = (method) => {
    setMeasurementMethod(method);
    if (method === 'existing' && userMeasurements.length > 0) {
      const defaultMeasurement = userMeasurements.find(m => m.isDefault);
      if (defaultMeasurement) {
        setSelectedMeasurementSet(defaultMeasurement);
        autoFillMeasurements(defaultMeasurement);
      }
    }
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

  // Handle AI measurement generation
  const handleAiMeasurement = async () => {
    if (!userHeight || !userWeight) {
      setError('Please enter your height and weight first');
      return;
    }

    setAiMeasurementStatus('processing');
    try {
      // Simulate AI measurement process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Calculate measurements based on height, weight, and auto-detected gender
      const calculatedMeasurements = calculateMeasurementsFromBodyData(
        parseFloat(userHeight), 
        parseFloat(userWeight)
      );
      
      // Filter to only include measurements required by the design
      const aiMeasurements = {};
      design.measurementDetails.forEach(measurement => {
        const measurementId = measurement.id;
        if (calculatedMeasurements[measurementId]) {
          aiMeasurements[measurementId] = calculatedMeasurements[measurementId];
        }
      });
      
      setMeasurements(aiMeasurements);
      setAiMeasurementStatus('completed');
    } catch (err) {
      console.error('AI measurement error:', err);
      setAiMeasurementStatus('error');
      setError('AI measurement failed. Please try manual entry.');
    }
  };

  // Validate form
  const validateForm = () => {
    if (!design?.measurementDetails) return false;
    
    return design.measurementDetails.every(measurement => {
      const value = measurements[measurement.id];
      return value && value > 0;
    });
  };

  // Handle form submission: confirm locally and pass up without API call
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Please fill in all required measurements');
      return;
    }
    setIsSubmitting(true);
    try {
      const measurementsInCm = convertMeasurements(measurements, selectedUnit, 'cm');
      onMeasurementSubmit(measurementsInCm, null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate to next step
  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigate to previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render step 1: Measurement selection
  const renderMeasurementStep = () => (
    <div className="space-y-6">
      {/* Method Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          How would you like to provide your measurements?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Manual Entry */}
          <button
            onClick={() => handleMethodSelect('manual')}
            className={`p-6 text-left rounded-lg border-2 transition-all ${
              measurementMethod === 'manual'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900">Manual Entry</h4>
            </div>
            <p className="text-sm text-gray-600">
              Enter your measurements manually using a measuring tape
            </p>
          </button>

          {/* AI Measurement */}
          <button
            onClick={() => handleMethodSelect('ai')}
            className={`p-6 text-left rounded-lg border-2 transition-all ${
              measurementMethod === 'ai'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900">AI Body Measurement</h4>
            </div>
            <p className="text-sm text-gray-600">
              Get accurate measurements using AI technology
            </p>
          </button>

          {/* Existing Measurements */}
          {userMeasurements.length > 0 && (
            <button
              onClick={() => handleMethodSelect('existing')}
              className={`p-6 text-left rounded-lg border-2 transition-all ${
                measurementMethod === 'existing'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Use Existing</h4>
              </div>
              <p className="text-sm text-gray-600">
                Select from your saved measurements
              </p>
            </button>
          )}
        </div>
      </div>

      {/* Method-specific content */}
      {measurementMethod === 'manual' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Manual Measurement Entry
          </h3>
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
                      {selectedUnit}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 capitalize">
                  {measurement.category.replace('_', ' ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {measurementMethod === 'ai' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            AI Body Measurement
          </h3>
          <p className="text-gray-600 mb-6">
            Get accurate measurements using AI technology. Enter your height and weight to generate 
            precise measurements based on global body proportion standards.
          </p>

          {aiMeasurementStatus === 'idle' && (
            <div className="space-y-6">
              {/* Design Gender Detection */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">
                      Design Category: {design?.category || 'Unknown'}
                    </h4>
                    <p className="text-xs text-blue-700">
                      Gender automatically detected as: <span className="font-medium capitalize">{getGenderFromDesign()}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Height and Weight Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={userHeight}
                      onChange={(e) => setUserHeight(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter height"
                      step="0.1"
                      min="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">{selectedUnit}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={userWeight}
                      onChange={(e) => setUserWeight(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter weight"
                      step="0.1"
                      min="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">{selectedUnit === 'cm' ? 'kg' : 'lbs'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Measurement Tips */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">AI Measurement Tips</h4>
                    <ul className="text-xs text-blue-700 mt-1 space-y-1">
                      <li>• Enter your current height and weight for accurate predictions</li>
                      <li>• Gender is automatically detected from the design category</li>
                      <li>• Measurements are calculated using global body proportion standards</li>
                      <li>• Results are based on BMI and gender-specific body ratios</li>
                      <li>• You can edit the generated measurements if needed</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleAiMeasurement}
                  disabled={!userHeight || !userWeight}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Generate Measurements
                </button>
              </div>
            </div>
          )}

          {aiMeasurementStatus === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Calculating Your Measurements</h4>
              <p className="text-gray-600">Using global body proportion standards to generate accurate measurements...</p>
            </div>
          )}

          {aiMeasurementStatus === 'completed' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-800 font-medium">
                      Measurements generated successfully based on your body data!
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAiEditMode(!showAiEditMode)}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    {showAiEditMode ? 'View Summary' : 'Edit Measurements'}
                  </button>
                </div>
              </div>

              {!showAiEditMode ? (
                // Summary View
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {design.measurementDetails.map((measurement) => (
                      <div key={measurement.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">
                            {measurement.label}
                          </span>
                          <span className="text-sm text-gray-900">
                            {measurements[measurement.id]?.toFixed(1)} {selectedUnit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center space-x-4">
                    <button
                      onClick={() => setAiMeasurementStatus('idle')}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      Regenerate Measurements
                    </button>
                    <button
                      onClick={() => setShowAiEditMode(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit Measurements
                    </button>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Edit Your Measurements</h4>
                        <p className="text-xs text-blue-700 mt-1">
                          Review and adjust the AI-generated measurements for the perfect fit. 
                          All measurements are editable.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {design.measurementDetails.map((measurement) => (
                      <div key={measurement.id} className="space-y-2">
                        <label
                          htmlFor={`ai-${measurement.id}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          {measurement.label}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            id={`ai-${measurement.id}`}
                            step="0.1"
                            min="0"
                            value={measurements[measurement.id] || ''}
                            onChange={(e) => handleMeasurementChange(measurement.id, parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder={`Enter ${measurement.label.toLowerCase()}`}
                            required
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm">
                              {selectedUnit}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 capitalize">
                          {measurement.category.replace('_', ' ')}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowAiEditMode(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Back to Summary
                    </button>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setAiMeasurementStatus('idle')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Regenerate All
                      </button>
                      <button
                        onClick={() => {
                          if (validateForm()) {
                            handleNext();
                          } else {
                            setError('Please fill in all required measurements');
                          }
                        }}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {aiMeasurementStatus === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">AI Measurement Failed</h4>
              <p className="text-gray-600 mb-4">Please try again or use manual entry instead.</p>
              <button
                onClick={handleAiMeasurement}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors mr-3"
              >
                Try Again
              </button>
              <button
                onClick={() => handleMethodSelect('manual')}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Manual Entry
              </button>
            </div>
          )}
        </div>
      )}

      {measurementMethod === 'existing' && userMeasurements.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Select Your Measurements
          </h3>
          <p className="text-gray-600 mb-6">
            Choose from your saved measurements to auto-fill the form.
          </p>

          {!showEditForm ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userMeasurements.map((measurement) => (
                <button
                  key={measurement._id}
                  onClick={() => handleMeasurementSetSelect(measurement)}
                  className={`p-4 text-left rounded-lg border-2 transition-all ${
                    selectedMeasurementSet?._id === measurement._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900 mb-1">
                    {measurement.measurementName}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
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
          ) : (
            <div className="space-y-6">
              {/* Selected Measurement Set Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">
                      Editing: {selectedMeasurementSet?.measurementName}
                    </h4>
                    <p className="text-sm text-blue-700">
                      {selectedMeasurementSet?.measurementType} • {selectedMeasurementSet?.gender}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEditForm(false)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Change Selection
                  </button>
                </div>
              </div>

              {/* Editable Measurement Form */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Edit Your Measurements
                </h4>
                <p className="text-sm text-gray-600">
                  Review and adjust the auto-filled measurements as needed.
                </p>

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
                            {selectedUnit}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 capitalize">
                        {measurement.category.replace('_', ' ')}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowEditForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Validate form before proceeding
                      if (validateForm()) {
                        handleNext();
                      } else {
                        setError('Please fill in all required measurements');
                      }
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedMeasurementSet && !showEditForm && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-green-800">
                    Auto-filled from "{selectedMeasurementSet.measurementName}". Review and adjust as needed.
                  </span>
                </div>
                <button
                  onClick={() => setShowEditForm(true)}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Edit Measurements
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Render step 2: Measurement confirmation
  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Review and Confirm Your Order
        </h3>
        
        {/* Design Summary */}
        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Design Details</h4>
          <div className="flex items-start space-x-4">
            <img
              src={design.image || (design.images && design.images.length > 0 ? (design.images[0].url || design.images[0]) : null)}
              alt={design.name}
              className="w-20 h-24 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA4MCA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQwIiB5PSI0OCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EZXNpZ24gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==';
              }}
            />
            <div className="flex-1">
              <h5 className="font-medium text-gray-900">{design.name}</h5>
              <p className="text-sm text-gray-600 mb-2">{design.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="capitalize">{design.category}</span>
                <span className="capitalize">{design.difficulty}</span>
                {design.price && (
                  <span className="font-medium text-green-600">₹{design.price}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Measurements Summary */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Your Measurements</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {design.measurementDetails.map((measurement) => (
              <div key={measurement.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">{measurement.label}</span>
                <span className="text-sm font-medium text-gray-900">
                  {measurements[measurement.id]?.toFixed(1)} {selectedUnit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-gray-600">
                {steps[currentStep - 1].description}
              </p>
            </div>
            
            {/* Unit Selector */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Units:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => {
                    const currentMeasurements = { ...measurements };
                    setMeasurements(convertMeasurements(currentMeasurements, selectedUnit, 'cm'));
                    setSelectedUnit('cm');
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedUnit === 'cm'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  cm
                </button>
                <button
                  onClick={() => {
                    const currentMeasurements = { ...measurements };
                    setMeasurements(convertMeasurements(currentMeasurements, selectedUnit, 'in'));
                    setSelectedUnit('in');
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedUnit === 'in'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  in
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step Progress */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep > step.id
                    ? 'bg-green-500 text-white'
                    : currentStep === step.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.id ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

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

        {/* Step Content */}
        <div className="p-6">
          {currentStep === 1 && renderMeasurementStep()}
          {currentStep === 2 && renderConfirmationStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={currentStep === 1 ? onCancel : handlePrevious}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {currentStep === 1 ? 'Back' : 'Previous'}
          </button>
          
          <div className="flex items-center space-x-3">
            {currentStep === 1 && (
              <div className="text-sm text-gray-600">
                {Object.keys(measurements).filter(key => measurements[key] > 0).length} / {design.measurementDetails.length} completed
              </div>
            )}
            
            {currentStep === 1 ? (
              <button
                onClick={handleNext}
                disabled={!validateForm()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!validateForm() || isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Confirm Order'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMeasurementForm;
