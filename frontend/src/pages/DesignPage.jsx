import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DesignSelection from '../components/DesignSelection';
import DesignDebugInfo from '../components/DesignDebugInfo';
import EnhancedMeasurementForm from '../components/EnhancedMeasurementForm';

const DesignPage = () => {
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [measurements, setMeasurements] = useState(null);
  const navigate = useNavigate();

  const handleDesignSelect = (design) => {
    setSelectedDesign(design);
    console.log('Selected design:', design);
    
    // Check if design requires measurements
    if (design.measurementDetails && design.measurementDetails.length > 0) {
      setShowMeasurementForm(true);
    } else {
      // Navigate directly to try-on if no measurements required
      navigate(`/tryon?designId=${design._id}`);
    }
  };

  const handleBackToBrowse = () => {
    setSelectedDesign(null);
    setShowMeasurementForm(false);
    setMeasurements(null);
  };

  const handleMeasurementSubmit = (measurementData, savedMeasurement) => {
    setMeasurements(measurementData);
    console.log('Measurements submitted:', measurementData);
    console.log('Saved measurement:', savedMeasurement);
    
    // Navigate to try-on page with design ID and measurements
    const params = new URLSearchParams({
      designId: selectedDesign._id,
      measurements: JSON.stringify(measurementData)
    });
    navigate(`/tryon?${params.toString()}`);
  };

  const handleMeasurementCancel = () => {
    setShowMeasurementForm(false);
    setSelectedDesign(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Design Library
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Browse and select your perfect design
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Design
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl">
            Browse through our curated collection of designs and select the perfect outfit for your virtual try-on experience. 
            Each design is carefully crafted by our expert tailors and designers.
          </p>
        </div>

        {/* Debug Info */}
        <DesignDebugInfo />

        {/* Show Enhanced Measurement Form if design is selected and requires measurements */}
        {showMeasurementForm && selectedDesign ? (
          <EnhancedMeasurementForm
            design={selectedDesign}
            onMeasurementSubmit={handleMeasurementSubmit}
            onCancel={handleMeasurementCancel}
          />
        ) : (
          /* Design Selection Component */
          <DesignSelection 
            onDesignSelect={handleDesignSelect}
            selectedDesignId={selectedDesign?._id}
          />
        )}

        {/* Selected Design Preview */}
        {selectedDesign && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Selected Design
              </h3>
              <button
                onClick={handleBackToBrowse}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Change Selection
              </button>
            </div>
            
            <div className="flex items-start space-x-4">
              <img
                src={selectedDesign.image || (selectedDesign.images && selectedDesign.images.length > 0 ? (selectedDesign.images[0].url || selectedDesign.images[0]) : null)}
                alt={selectedDesign.name}
                className="w-24 h-32 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgOTYgMTI4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iOTYiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQ4IiB5PSI2NCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EZXNpZ24gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==';
                }}
              />
              
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {selectedDesign.name}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {selectedDesign.description}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="capitalize">{selectedDesign.category}</span>
                  <span className="capitalize">{selectedDesign.difficulty}</span>
                  {selectedDesign.price && (
                    <span className="font-medium text-green-600">
                      ₹{selectedDesign.price}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleDesignSelect(selectedDesign)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Try This Design
                </button>
                <button
                  onClick={handleBackToBrowse}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Browse More
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                How to Use Design Selection
              </h3>
              <div className="text-blue-800 space-y-2">
                <p>
                  <strong>Browse Designs:</strong> Use the search and filter options to find designs that match your style and occasion.
                </p>
                <p>
                  <strong>Select a Design:</strong> Click on any design card to select it for virtual try-on.
                </p>
                <p>
                  <strong>Try It On:</strong> Once selected, you'll be taken to our virtual try-on experience where you can see how the design looks on you.
                </p>
                <p>
                  <strong>Difficulty Levels:</strong> Designs are marked with difficulty levels (Beginner, Intermediate, Advanced) to help you choose based on your tailoring experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignPage;
