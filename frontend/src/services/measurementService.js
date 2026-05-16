/**
 * Measurement Service API
 * Handles communication with the AI measurement service
 */

// Get measurement service URL from environment or use default
const getMeasurementServiceUrl = () => {
  // Try Vite environment variable first
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MEASUREMENT_SERVICE_URL) {
    return import.meta.env.VITE_MEASUREMENT_SERVICE_URL;
  }
  // Try Node.js process.env (for compatibility)
  if (typeof process !== 'undefined' && process.env?.REACT_APP_MEASUREMENT_SERVICE_URL) {
    return process.env.REACT_APP_MEASUREMENT_SERVICE_URL;
  }
  // Default fallback
  return 'http://localhost:8001';
};

const MEASUREMENT_SERVICE_URL = getMeasurementServiceUrl();

class MeasurementService {
  /**
   * Process images and generate measurements
   * @param {Object} formData - FormData containing images and parameters
   * @returns {Promise<Object>} - Measurement results
   */
  static async processMeasurements(formData) {
    try {
      const response = await fetch(`${MEASUREMENT_SERVICE_URL}/measure`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.error || 'Failed to process measurements');
      }

      return await response.json();
    } catch (error) {
      console.error('Measurement processing error:', error);
      throw error;
    }
  }

  /**
   * Process images and save measurements to customer service
   * @param {Object} formData - FormData containing images and parameters
   * @param {string} customerId - Customer ID for saving measurements
   * @returns {Promise<Object>} - Measurement results with saved measurement data
   */
  static async processAndSaveMeasurements(formData, customerId) {
    try {
      formData.append('customer_id', customerId);
      formData.append('measurement_name', 'AI Generated Measurements');

      const response = await fetch(`${MEASUREMENT_SERVICE_URL}/process_and_save`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process and save measurements');
      }

      return await response.json();
    } catch (error) {
      console.error('Measurement processing and saving error:', error);
      throw error;
    }
  }

  /**
   * Check if measurement service is healthy
   * @returns {Promise<boolean>} - Service health status
   */
  static async checkHealth() {
    try {
      const response = await fetch(`${MEASUREMENT_SERVICE_URL}/health`, {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      console.error('Measurement service health check failed:', error);
      return false;
    }
  }

  /**
   * Create FormData for measurement processing
   * @param {File} frontImage - Front view image
   * @param {File} sideImage - Side view image (optional)
   * @param {number} heightCm - User height in cm
   * @returns {FormData} - Formatted FormData object
   */
  static createFormData(frontImage, sideImage = null, heightCm = null) {
    const formData = new FormData();
    
    formData.append('front', frontImage);
    
    if (sideImage) {
      formData.append('side', sideImage);
    }
    
    if (heightCm) {
      formData.append('height_cm', heightCm.toString());
    }
    
    return formData;
  }

  /**
   * Validate measurement results
   * @param {Object} measurements - Measurement results
   * @returns {Object} - Validation result with isValid and errors
   */
  static validateMeasurements(measurements) {
    const errors = [];
    const requiredMeasurements = ['chest', 'waist', 'hip', 'shoulder'];
    
    // Check if all required measurements are present
    for (const measurement of requiredMeasurements) {
      if (!measurements[measurement] || measurements[measurement] <= 0) {
        errors.push(`Missing or invalid ${measurement} measurement`);
      }
    }
    
    // Check for reasonable measurement ranges (in cm)
    const ranges = {
      chest: [60, 150],
      waist: [50, 120],
      hip: [60, 150],
      shoulder: [30, 60]
    };
    
    for (const [measurement, [min, max]] of Object.entries(ranges)) {
      if (measurements[measurement] && (measurements[measurement] < min || measurements[measurement] > max)) {
        errors.push(`${measurement} measurement (${measurements[measurement]}cm) is outside reasonable range (${min}-${max}cm)`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format measurements for display
   * @param {Object} measurements - Raw measurement data
   * @returns {Object} - Formatted measurements with proper units
   */
  static formatMeasurements(measurements) {
    const formatted = {};
    
    for (const [key, value] of Object.entries(measurements)) {
      if (typeof value === 'number') {
        formatted[key] = {
          value: Math.round(value * 10) / 10, // Round to 1 decimal place
          unit: 'cm',
          display: `${Math.round(value * 10) / 10} cm`
        };
      } else {
        formatted[key] = value;
      }
    }
    
    return formatted;
  }
}

export default MeasurementService;
