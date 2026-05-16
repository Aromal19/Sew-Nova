import React, { useState, useRef } from 'react';
import { FiCamera, FiUpload, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import MeasurementService from '../services/measurementService';

const AIMeasurementCapture = ({ onMeasurementsGenerated, onClose, customerId }) => {
  const [step, setStep] = useState(1); // 1: Instructions, 2: Capture, 3: Processing, 4: Results
  const [images, setImages] = useState({
    front: null,
    left_side: null
  });
  const [userHeight, setUserHeight] = useState('');
  const [measurements, setMeasurements] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const frontCameraRef = useRef(null);
  const sideCameraRef = useRef(null);
  const fileInputRef = useRef(null);

  const capturePhoto = (cameraRef, imageType) => {
    if (cameraRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const video = cameraRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], `${imageType}.jpg`, { type: 'image/jpeg' });
        setImages(prev => ({ ...prev, [imageType]: file }));
        setStep(2);
      }, 'image/jpeg', 0.8);
    }
  };

  const handleFileUpload = (event, imageType) => {
    const file = event.target.files[0];
    if (file) {
      setImages(prev => ({ ...prev, [imageType]: file }));
    }
  };

  const processMeasurements = async () => {
    if (!images.front) {
      setError('Front image is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check service health first
      const isHealthy = await MeasurementService.checkHealth();
      if (!isHealthy) {
        setError('Measurement service is not available. Please try again later.');
        return;
      }

      // Create form data
      const formData = MeasurementService.createFormData(
        images.front,
        images.left_side,
        userHeight || '170'
      );

      // Process measurements without saving to database
      const result = await MeasurementService.processMeasurements(formData);

      // Validate measurements
      const validation = MeasurementService.validateMeasurements(result.measurements);
      if (!validation.isValid) {
        setError(`Measurement validation failed: ${validation.errors.join(', ')}`);
        return;
      }

      // Format measurements for display
      const formattedMeasurements = MeasurementService.formatMeasurements(result.measurements);
      setMeasurements(formattedMeasurements);
      setStep(4);
      
      if (onMeasurementsGenerated) {
        onMeasurementsGenerated(formattedMeasurements, null);
      }
    } catch (err) {
      setError(err.message || 'Network error. Please check if measurement service is running.');
      console.error('Measurement processing error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetCapture = () => {
    setStep(1);
    setImages({ front: null, left_side: null });
    setMeasurements(null);
    setError(null);
  };

  const renderInstructions = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Body Measurement</h3>
        <p className="text-gray-600">Get accurate measurements using AI technology</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">📋 Instructions for Best Results:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Stand straight with arms slightly away from your body</li>
          <li>• Wear fitted clothing (not loose or baggy)</li>
          <li>• Ensure good lighting and plain background</li>
          <li>• Take photos from chest level, not from above or below</li>
          <li>• Make sure your full body is visible in the frame</li>
        </ul>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Height (cm) - Optional but recommended for accuracy
          </label>
          <input
            type="number"
            value={userHeight}
            onChange={(e) => setUserHeight(e.target.value)}
            placeholder="e.g., 170"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setStep(2)}
            className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2"
          >
            <FiCamera className="w-4 h-4" />
            <span>Start Capture</span>
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
          >
            <FiUpload className="w-4 h-4" />
            <span>Upload Photos</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files);
            if (files[0]) setImages(prev => ({ ...prev, front: files[0] }));
            if (files[1]) setImages(prev => ({ ...prev, left_side: files[1] }));
            setStep(2);
          }}
          className="hidden"
        />
      </div>
    </div>
  );

  const renderCapture = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Capture Your Photos</h3>
        <p className="text-gray-600">Take or upload photos for measurement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Front Photo */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Front View (Required)</h4>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
            {images.front ? (
              <div className="text-center">
                <img 
                  src={URL.createObjectURL(images.front)} 
                  alt="Front view" 
                  className="max-h-32 mx-auto rounded"
                />
                <p className="text-sm text-green-600 mt-2">✓ Front photo captured</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <FiCamera className="w-8 h-8 mx-auto mb-2" />
                <p>Front photo required</p>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'front')}
            className="w-full text-sm"
          />
        </div>

        {/* Side Photo */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Side View (Optional)</h4>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
            {images.left_side ? (
              <div className="text-center">
                <img 
                  src={URL.createObjectURL(images.left_side)} 
                  alt="Side view" 
                  className="max-h-32 mx-auto rounded"
                />
                <p className="text-sm text-green-600 mt-2">✓ Side photo captured</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <FiCamera className="w-8 h-8 mx-auto mb-2" />
                <p>Side photo optional</p>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'left_side')}
            className="w-full text-sm"
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={resetCapture}
          className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
        >
          Reset
        </button>
        
        <button
          onClick={processMeasurements}
          disabled={!images.front || loading}
          className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <FiCheck className="w-4 h-4" />
              <span>Generate Measurements</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-green-600 mb-2">Measurements Generated!</h3>
        <p className="text-gray-600">Your AI-generated measurements</p>
      </div>

      {measurements && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(measurements).map(([key, value]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-sm text-gray-600 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {typeof value === 'number' ? `${value.toFixed(1)} cm` : value}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={resetCapture}
          className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
        >
          Take New Photos
        </button>
        
        <button
          onClick={onClose}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Use These Measurements
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">AI Body Measurement</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <FiAlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {step === 1 && renderInstructions()}
          {step === 2 && renderCapture()}
          {step === 4 && renderResults()}
        </div>
      </div>
    </div>
  );
};

export default AIMeasurementCapture;
