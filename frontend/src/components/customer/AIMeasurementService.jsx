import React, { useState, useRef } from 'react';
import { FiCamera, FiUpload, FiX, FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import { getApiUrl } from '../../config/api';

const AIMeasurementService = ({ onMeasurementsGenerated, onClose }) => {
  const [step, setStep] = useState(1); // 1: upload, 2: processing, 3: results
  const [frontImage, setFrontImage] = useState(null);
  const [frontImagePreview, setFrontImagePreview] = useState(null);
  const [sideImage, setSideImage] = useState(null);
  const [sideImagePreview, setSideImagePreview] = useState(null);
  const [height, setHeight] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [aiMeasurements, setAiMeasurements] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [landmarksImage, setLandmarksImage] = useState(null);
  
  const frontFileRef = useRef(null);
  const sideFileRef = useRef(null);

  const handleImageUpload = (file, type) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large. Please select an image under 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'front') {
        setFrontImage(file);
        setFrontImagePreview(e.target.result);
      } else {
        setSideImage(file);
        setSideImagePreview(e.target.result);
      }
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (type) => {
    const fileInput = type === 'front' ? frontFileRef.current : sideFileRef.current;
    fileInput.click();
  };

  const removeImage = (type) => {
    if (type === 'front') {
      setFrontImage(null);
      setFrontImagePreview(null);
    } else {
      setSideImage(null);
      setSideImagePreview(null);
    }
  };

  const processAIMeasurements = async () => {
    if (!frontImage) {
      setError('Please upload a front-view image');
      return;
    }

    setProcessing(true);
    setError(null);
    setStep(2);

    try {
      const formData = new FormData();
      formData.append('front', frontImage);
      if (sideImage) {
        formData.append('side', sideImage);
      }
      if (height && height > 0) {
        formData.append('height_cm', parseFloat(height));
      }

      const measurementUrl = getApiUrl('MEASUREMENT_SERVICE', '/measure');
      const response = await axios.post(measurementUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 180000, // 180 second timeout for CPU-based AI processing (increased from 60s)
      });

      if (response.data.success) {
        setAiMeasurements(response.data.measurements);
        setMetadata(response.data.metadata);
        
        // Check if landmarks visualization is available
        if (response.data.landmarks_image) {
          setLandmarksImage(response.data.landmarks_image);
        }
        
        setStep(3);
      } else {
        throw new Error(response.data.message || 'Failed to process measurements');
      }
    } catch (error) {
      console.error('AI measurement error:', error);
      let errorMessage = 'Failed to process measurements. Please try again.';
      
      // Handle validation errors from new validation module
      if (error.response?.data?.error_message) {
        errorMessage = error.response.data.error_message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setStep(1);
    } finally {
      setProcessing(false);
    }
  };

  const applyMeasurements = () => {
    if (aiMeasurements && onMeasurementsGenerated) {
      // Convert AI measurements to the format expected by the backend
      const formattedMeasurements = {
        chest: Math.round(aiMeasurements.chest * 10) / 10,
        waist: Math.round(aiMeasurements.waist * 10) / 10,
        hip: Math.round(aiMeasurements.hip * 10) / 10,
        shoulder: Math.round(aiMeasurements.shoulder * 10) / 10,
        sleeveLength: Math.round(aiMeasurements.sleeveLength * 10) / 10,
        neck: Math.round(aiMeasurements.neck * 10) / 10,
        thigh: Math.round(aiMeasurements.thigh * 10) / 10,
        // Map additional measurements if available
        sleeveWidth: aiMeasurements.sleeveWidth ? Math.round(aiMeasurements.sleeveWidth * 10) / 10 : '',
        inseam: aiMeasurements.trouserLength ? Math.round(aiMeasurements.trouserLength * 10) / 10 : '',
        knee: aiMeasurements.knee ? Math.round(aiMeasurements.knee * 10) / 10 : '',
        ankle: aiMeasurements.ankle ? Math.round(aiMeasurements.ankle * 10) / 10 : '',
      };
      
      onMeasurementsGenerated(formattedMeasurements);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFrontImage(null);
    setFrontImagePreview(null);
    setSideImage(null);
    setSideImagePreview(null);
    setHeight('');
    setProcessing(false);
    setError(null);
    setAiMeasurements(null);
    setMetadata(null);
    setLandmarksImage(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FiCamera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">AI Body Measurements</h2>
                <p className="text-gray-600 text-sm">Upload photos to get automatic measurements</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">📸 How to take the perfect photo:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Stand straight with arms slightly away from your body</li>
                  <li>• Wear form-fitting clothes (avoid loose clothing)</li>
                  <li>• Ensure good lighting and clear background</li>
                  <li>• Take photo from chest level, full body visible</li>
                  <li>• Optional: Add a side view for better accuracy</li>
                </ul>
              </div>

              {/* Height Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Height (optional, for better accuracy)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="170"
                    min="100"
                    max="250"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-600">cm</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Providing your height helps the AI calculate more accurate measurements
                </p>
              </div>

              {/* Front Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Front View Photo *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  {frontImagePreview ? (
                    <div className="relative">
                      <img
                        src={frontImagePreview}
                        alt="Front view preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <button
                        onClick={() => removeImage('front')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Click to upload front view photo</p>
                      <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                  <input
                    ref={frontFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0], 'front')}
                    className="hidden"
                  />
                  <button
                    onClick={() => handleFileSelect('front')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {frontImagePreview ? 'Change Photo' : 'Select Photo'}
                  </button>
                </div>
              </div>

              {/* Side Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Side View Photo (optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  {sideImagePreview ? (
                    <div className="relative">
                      <img
                        src={sideImagePreview}
                        alt="Side view preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <button
                        onClick={() => removeImage('side')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Click to upload side view photo</p>
                      <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                  <input
                    ref={sideFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0], 'side')}
                    className="hidden"
                  />
                  <button
                    onClick={() => handleFileSelect('side')}
                    className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    {sideImagePreview ? 'Change Photo' : 'Select Photo'}
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                  <FiAlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={processAIMeasurements}
                  disabled={!frontImage || processing}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <FiCamera className="w-4 h-4" />
                  <span>Get AI Measurements</span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLoader className="w-8 h-8 text-white animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Your Photos</h3>
              <p className="text-gray-600 mb-4">
                Our AI is analyzing your body measurements. This may take 10-30 seconds.
              </p>
              <div className="bg-gray-100 rounded-full h-2 w-full max-w-md mx-auto">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          )}

          {step === 3 && aiMeasurements && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Measurements Generated!</h3>
                <p className="text-gray-600">Here are your AI-generated body measurements</p>
              </div>

              {/* AI Measurements Display */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Chest</p>
                  <p className="text-lg font-semibold text-gray-900">{Math.round(aiMeasurements.chest * 10) / 10} cm</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Waist</p>
                  <p className="text-lg font-semibold text-gray-900">{Math.round(aiMeasurements.waist * 10) / 10} cm</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Hip</p>
                  <p className="text-lg font-semibold text-gray-900">{Math.round(aiMeasurements.hip * 10) / 10} cm</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Shoulder</p>
                  <p className="text-lg font-semibold text-gray-900">{Math.round(aiMeasurements.shoulder * 10) / 10} cm</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Sleeve Length</p>
                  <p className="text-lg font-semibold text-gray-900">{Math.round(aiMeasurements.sleeveLength * 10) / 10} cm</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Neck</p>
                  <p className="text-lg font-semibold text-gray-900">{Math.round(aiMeasurements.neck * 10) / 10} cm</p>
                </div>
              </div>

              {/* Landmarks Visualization */}
              {landmarksImage ? (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">AI Detection Results</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-3">
                      The AI detected {metadata?.landmarks_detected || 'multiple'} body landmarks to calculate your measurements:
                    </p>
                    <div className="flex justify-center">
                      <img
                        src={`data:image/jpeg;base64,${landmarksImage}`}
                        alt="Detected landmarks visualization"
                        className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Green dots show detected body landmarks used for measurement calculations
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">AI Detection Results</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-3">
                      The AI successfully detected {metadata?.landmarks_detected || 'multiple'} body landmarks to calculate your measurements.
                    </p>
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FiCheck className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-sm text-gray-600">
                          Landmarks detected successfully
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {metadata?.landmarks_detected || 'Multiple'} key body points identified
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata */}
              {metadata && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">AI Analysis Details</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• Models used: {metadata.models_used?.pose}, {metadata.models_used?.depth}, {metadata.models_used?.segmentation}</p>
                    <p>• Landmarks detected: {metadata.landmarks_detected}</p>
                    <p>• Image dimensions: {metadata.image_dimensions?.width} x {metadata.image_dimensions?.height}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Try Again
                </button>
                <button
                  onClick={applyMeasurements}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 flex items-center space-x-2"
                >
                  <FiCheck className="w-4 h-4" />
                  <span>Save as New Measurement</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIMeasurementService;
