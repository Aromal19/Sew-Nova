import React, { useState, useEffect } from 'react';
import SizeStandardsScraper from '../utils/sizeStandardsScraper';

const EnhancedAIMeasurement = ({ 
  design, 
  userHeight, 
  userWeight, 
  userGender, 
  selectedUnit, 
  onMeasurementsGenerated 
}) => {
  const [standards, setStandards] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchLatestStandards();
  }, []);

  const fetchLatestStandards = async () => {
    setLoading(true);
    try {
      const scraper = new SizeStandardsScraper();
      const latestStandards = await scraper.getSizeStandards();
      setStandards(latestStandards);
      setLastUpdated(latestStandards.last_updated);
    } catch (err) {
      console.error('Error fetching size standards:', err);
      setError('Failed to fetch latest size standards. Using cached data.');
    } finally {
      setLoading(false);
    }
  };

  const calculateMeasurementsWithStandards = () => {
    if (!standards || !userHeight || !userWeight) return null;

    const heightCm = selectedUnit === 'in' ? userHeight * 2.54 : userHeight;
    const weightKg = selectedUnit === 'in' ? userWeight * 0.453592 : userWeight;
    
    const genderStandards = standards[userGender] || standards.male;
    const measurements = {};

    // Calculate measurements using latest standards
    design.measurementDetails.forEach(measurement => {
      const measurementId = measurement.id;
      let value = 0;

      switch (measurementId) {
        case 'chest':
          value = (heightCm * genderStandards.chest_to_height_ratio) + 
                  (weightKg * genderStandards.weight_factor) + 
                  (genderStandards.chest_base || 0);
          break;
        case 'waist':
          value = (heightCm * genderStandards.waist_to_height_ratio) + 
                  (weightKg * genderStandards.weight_factor * 1.2) + 
                  (genderStandards.waist_base || 0);
          break;
        case 'hip':
          value = (heightCm * genderStandards.hip_to_height_ratio) + 
                  (weightKg * genderStandards.weight_factor * 0.8) + 
                  (genderStandards.hip_base || 0);
          break;
        case 'shoulder_width':
          value = heightCm * genderStandards.shoulder_to_height_ratio;
          break;
        case 'sleeve_length':
          value = heightCm * genderStandards.sleeve_to_height_ratio;
          break;
        case 'neck':
          value = heightCm * 0.20; // Standard neck ratio
          break;
        case 'inseam':
          value = heightCm * 0.45; // Standard inseam ratio
          break;
        case 'thigh':
          value = (heightCm * 0.30) + (weightKg * 0.15);
          break;
        case 'knee':
          value = heightCm * 0.15;
          break;
        case 'ankle':
          value = heightCm * 0.10;
          break;
        case 'height':
          value = heightCm;
          break;
        case 'bicep':
          value = (heightCm * 0.15) + (weightKg * 0.10);
          break;
        case 'armhole':
          value = heightCm * genderStandards.shoulder_to_height_ratio;
          break;
        case 'wrist':
          value = heightCm * 0.08;
          break;
        default:
          value = (heightCm * 0.20) + (weightKg * 0.10);
          break;
      }

      // Apply regional adjustments if available
      if (standards.regional_adjustments) {
        const region = getUserRegion(); // You'd implement this
        const adjustments = standards.regional_adjustments[region];
        if (adjustments && adjustments.chest_adjustment) {
          value *= adjustments.chest_adjustment;
        }
      }

      // Convert to selected unit if needed
      if (selectedUnit === 'in') {
        value = value / 2.54;
      }

      measurements[measurementId] = Math.round(value * 10) / 10; // Round to 1 decimal
    });

    return measurements;
  };

  const getUserRegion = () => {
    // This would detect user's region based on:
    // - Browser locale
    // - IP geolocation
    // - User preferences
    // For now, return default
    return 'EU';
  };

  const handleGenerateMeasurements = async () => {
    if (!userHeight || !userWeight) {
      setError('Please enter your height and weight');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      const measurements = calculateMeasurementsWithStandards();
      
      if (measurements) {
        onMeasurementsGenerated(measurements);
      } else {
        setError('Failed to calculate measurements');
      }
    } catch (err) {
      console.error('Error generating measurements:', err);
      setError('Failed to generate measurements');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Standards Status */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              AI Measurement Status
            </h4>
            <p className="text-xs text-blue-700">
              {loading ? 'Fetching latest size standards...' : 
               standards ? 'Using latest global size standards' : 
               'Using fallback standards'}
            </p>
          </div>
          {lastUpdated && (
            <div className="text-xs text-blue-600">
              Updated: {new Date(lastUpdated).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Generate Button */}
      <div className="text-center">
        <button
          onClick={handleGenerateMeasurements}
          disabled={loading || !userHeight || !userWeight}
          className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Generating...' : 'Generate AI Measurements'}
        </button>
      </div>

      {/* Standards Info */}
      {standards && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h5 className="text-sm font-medium text-gray-900 mb-2">
            Using Latest Standards
          </h5>
          <div className="text-xs text-gray-600 space-y-1">
            <p>• WHO Global Body Proportion Standards</p>
            <p>• Fashion Industry Regional Variations</p>
            <p>• Updated: {new Date(standards.last_updated).toLocaleDateString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAIMeasurement;
