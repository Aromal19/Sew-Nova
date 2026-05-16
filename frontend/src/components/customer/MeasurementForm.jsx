import React, { useState, useEffect } from 'react';
import { FiUser, FiEdit, FiTrash2, FiStar, FiPlus, FiBarChart2, FiSave } from 'react-icons/fi';

const MeasurementForm = ({ measurement = null, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    measurementName: '',
    measurementType: 'custom',
    gender: '',
    ageGroup: 'adult',
    chest: '',
    waist: '',
    hip: '',
    shoulder: '',
    sleeveLength: '',
    sleeveWidth: '',
    neck: '',
    inseam: '',
    thigh: '',
    knee: '',
    ankle: '',
    height: 0,
    weight: 0,
    notes: '',
    preferences: {
      fit: 'regular',
      style: 'classic'
    },
    isDefault: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedTopSize, setSelectedTopSize] = useState('');
  const [selectedBottomSize, setSelectedBottomSize] = useState('');

  // Basic standard size charts (values in cm)
  const topSizeChart = {
    male: {
      XS: { chest: 84, waist: 72, shoulder: 42, sleeveLength: 60, neck: 36, sleeveWidth: 16, hip: 88 },
      S:  { chest: 90, waist: 78, shoulder: 44, sleeveLength: 61, neck: 37, sleeveWidth: 17, hip: 94 },
      M:  { chest: 96, waist: 84, shoulder: 46, sleeveLength: 62, neck: 38, sleeveWidth: 18, hip: 100 },
      L:  { chest: 102, waist: 90, shoulder: 48, sleeveLength: 63, neck: 39, sleeveWidth: 19, hip: 106 },
      XL: { chest: 108, waist: 96, shoulder: 50, sleeveLength: 64, neck: 40, sleeveWidth: 20, hip: 112 },
      XXL:{ chest: 114, waist: 102, shoulder: 52, sleeveLength: 65, neck: 41, sleeveWidth: 21, hip: 118 },
    },
    female: {
      XS: { chest: 78, waist: 62, shoulder: 38, sleeveLength: 58, neck: 32, sleeveWidth: 15, hip: 84 },
      S:  { chest: 84, waist: 66, shoulder: 39, sleeveLength: 59, neck: 33, sleeveWidth: 16, hip: 90 },
      M:  { chest: 90, waist: 72, shoulder: 40, sleeveLength: 60, neck: 34, sleeveWidth: 17, hip: 96 },
      L:  { chest: 96, waist: 78, shoulder: 41, sleeveLength: 61, neck: 35, sleeveWidth: 18, hip: 102 },
      XL: { chest: 102, waist: 84, shoulder: 42, sleeveLength: 62, neck: 36, sleeveWidth: 19, hip: 108 },
      XXL:{ chest: 108, waist: 90, shoulder: 43, sleeveLength: 63, neck: 37, sleeveWidth: 20, hip: 114 },
    },
    unisex: {}
  };

  const bottomWaistToMeasures = (waistInInches, gender) => {
    const waist = Math.round(waistInInches * 2.54); // convert to cm
    const hip = Math.round(waist * (gender === 'female' ? 1.15 : 1.10));
    const thigh = Math.round(hip * 0.6);
    const knee = Math.round(thigh * 0.7);
    const ankle = Math.round(thigh * 0.55);
    const inseam = 78; // default inseam in cm
    return { waist, hip, thigh, knee, ankle, inseam };
  };

  const applyTopSize = (sizeKey) => {
    const g = formData.gender || 'unisex';
    const chart = topSizeChart[g] || topSizeChart['male'];
    const preset = chart[sizeKey];
    if (!preset) return;
    setFormData(prev => ({
      ...prev,
      chest: preset.chest,
      waist: preset.waist,
      hip: preset.hip,
      shoulder: preset.shoulder,
      sleeveLength: preset.sleeveLength,
      sleeveWidth: preset.sleeveWidth,
      neck: preset.neck,
    }));
  };

  const applyBottomSize = (waistLabel) => {
    const match = /^(\d{2})$/.exec(waistLabel);
    if (!match) return;
    const waistInches = parseInt(match[1], 10);
    const m = bottomWaistToMeasures(waistInches, formData.gender || 'male');
    setFormData(prev => ({
      ...prev,
      waist: m.waist,
      hip: m.hip,
      thigh: m.thigh,
      knee: m.knee,
      ankle: m.ankle,
      inseam: m.inseam,
    }));
  };

  useEffect(() => {
    if (measurement) {
      setFormData({
        measurementName: measurement.measurementName || '',
        measurementType: measurement.measurementType || 'custom',
        gender: measurement.gender || '',
        ageGroup: measurement.ageGroup || 'adult',
        chest: measurement.chest || '',
        waist: measurement.waist || '',
        hip: measurement.hip || '',
        shoulder: measurement.shoulder || '',
        sleeveLength: measurement.sleeveLength || '',
        sleeveWidth: measurement.sleeveWidth || '',
        neck: measurement.neck || '',
        inseam: measurement.inseam || '',
        thigh: measurement.thigh || '',
        knee: measurement.knee || '',
        ankle: measurement.ankle || '',
        height: typeof measurement.height === 'number' ? measurement.height : 0,
        weight: typeof measurement.weight === 'number' ? measurement.weight : 0,
        notes: measurement.notes || '',
        preferences: measurement.preferences || {
          fit: 'regular',
          style: 'classic'
        },
        isDefault: measurement.isDefault || false
      });
    }
  }, [measurement]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.measurementName.trim()) {
      newErrors.measurementName = 'Measurement name is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!formData.chest || formData.chest <= 0) {
      newErrors.chest = 'Valid chest measurement is required';
    }
    if (!formData.waist || formData.waist <= 0) {
      newErrors.waist = 'Valid waist measurement is required';
    }
    if (!formData.hip || formData.hip <= 0) {
      newErrors.hip = 'Valid hip measurement is required';
    }
    // height and weight are optional/hidden; defaulted to 0

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (typeof onSubmit === 'function') {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Error saving measurement:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (fieldName) => {
    return `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
      errors[fieldName] ? 'border-red-300' : 'border-gray-300'
    }`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
                        <FiBarChart2 className="w-6 h-6 text-emerald-600" />
        <h3 className="text-xl font-semibold text-gray-800">
          {isEditing ? 'Edit Measurement' : 'Add New Measurement'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Measurement Name *
            </label>
            <input
              type="text"
              name="measurementName"
              value={formData.measurementName}
              onChange={handleInputChange}
              placeholder="e.g., My Measurements, Party Dress"
              className={getInputClass('measurementName')}
            />
            {errors.measurementName && (
              <p className="text-red-500 text-xs mt-1">{errors.measurementName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Measurement Type
            </label>
            <select
              name="measurementType"
              value={formData.measurementType}
              onChange={handleInputChange}
              className={getInputClass('measurementType')}
            >
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="traditional">Traditional</option>
              <option value="western">Western</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className={getInputClass('gender')}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unisex">Unisex</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age Group
            </label>
            <select
              name="ageGroup"
              value={formData.ageGroup}
              onChange={handleInputChange}
              className={getInputClass('ageGroup')}
            >
              <option value="kids">Kids</option>
              <option value="teen">Teen</option>
              <option value="adult">Adult</option>
              <option value="senior">Senior</option>
            </select>
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
              Set as default measurement
            </label>
          </div>
        </div>

        {/* Standard Size Selectors */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium text-gray-800 mb-4">Quick Fill from Standard Sizes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Top Size (XS - XXL)</label>
              <select
                value={selectedTopSize}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedTopSize(val);
                  if (val) applyTopSize(val);
                }}
                className={getInputClass('topSize')}
              >
                <option value="">Select Top Size</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bottom Waist (28 - 40)</label>
              <select
                value={selectedBottomSize}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedBottomSize(val);
                  if (val) applyBottomSize(val);
                }}
                className={getInputClass('bottomSize')}
              >
                <option value="">Select Bottom Waist</option>
                {['28','30','32','34','36','38','40'].map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Upper Body Measurements */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium text-gray-800 mb-4">Upper Body Measurements (in cm)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chest *
              </label>
              <input
                type="number"
                name="chest"
                value={formData.chest}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.1"
                className={getInputClass('chest')}
              />
              {errors.chest && (
                <p className="text-red-500 text-xs mt-1">{errors.chest}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waist *
              </label>
              <input
                type="number"
                name="waist"
                value={formData.waist}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.1"
                className={getInputClass('waist')}
              />
              {errors.waist && (
                <p className="text-red-500 text-xs mt-1">{errors.waist}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hip *
              </label>
              <input
                type="number"
                name="hip"
                value={formData.hip}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.1"
                className={getInputClass('hip')}
              />
              {errors.hip && (
                <p className="text-red-500 text-xs mt-1">{errors.hip}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shoulder
              </label>
              <input
                type="number"
                name="shoulder"
                value={formData.shoulder}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.1"
                className={getInputClass('shoulder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sleeve Length
              </label>
              <input
                type="number"
                name="sleeveLength"
                value={formData.sleeveLength}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.1"
                className={getInputClass('sleeveLength')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sleeve Width
              </label>
              <input
                type="number"
                name="sleeveWidth"
                value={formData.sleeveWidth}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.1"
                className={getInputClass('sleeveWidth')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Neck
              </label>
              <input
                type="number"
                name="neck"
                value={formData.neck}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.1"
                className={getInputClass('neck')}
              />
            </div>
          </div>
        </div>

        {/* Lower Body Measurements */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium text-gray-800 mb-4">Lower Body Measurements (in cm)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inseam
              </label>
              <input
                type="number"
                name="inseam"
                value={formData.inseam}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.1"
                className={getInputClass('inseam')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thigh
              </label>
              <input
                type="number"
                name="thigh"
                value={formData.thigh}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.1"
                className={getInputClass('thigh')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Knee
              </label>
              <input
                type="number"
                name="knee"
                value={formData.knee}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.1"
                className={getInputClass('knee')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ankle
              </label>
              <input
                type="number"
                name="ankle"
                value={formData.ankle}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.1"
                className={getInputClass('ankle')}
              />
            </div>
          </div>
        </div>

        {/* Height and Weight removed per requirements */}

        {/* Preferences */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium text-gray-800 mb-4">Style Preferences</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fit Preference
              </label>
              <select
                name="preferences.fit"
                value={formData.preferences.fit}
                onChange={handleInputChange}
                className={getInputClass('preferences.fit')}
              >
                <option value="loose">Loose</option>
                <option value="regular">Regular</option>
                <option value="fitted">Fitted</option>
                <option value="tight">Tight</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style Preference
              </label>
              <select
                name="preferences.style"
                value={formData.preferences.style}
                onChange={handleInputChange}
                className={getInputClass('preferences.style')}
              >
                <option value="modern">Modern</option>
                <option value="traditional">Traditional</option>
                <option value="classic">Classic</option>
                <option value="trendy">Trendy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="border-t pt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any special instructions or preferences..."
              rows="3"
              className={getInputClass('notes')}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
          >
            <FiSave className="w-4 h-4" />
            {loading ? 'Saving...' : (isEditing ? 'Update Measurement' : 'Save Measurement')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default MeasurementForm; 