import React, { useState, useEffect } from 'react';
import { FiPhone, FiChevronDown } from 'react-icons/fi';

const PhoneNumberInput = ({ 
  value, 
  onChange, 
  onCountryCodeChange, // New prop for country code changes
  disabled = false, 
  error = null, 
  className = '',
  placeholder = 'Enter phone number',
  variant = 'default', // 'default' or 'signup'
  focusColor = 'emerald' // 'emerald', 'amber', 'purple'
}) => {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'India',
    flag: '🇮🇳',
    callingCode: '+91'
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch countries from REST Countries API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,idd');
        const data = await response.json();
        
        // Filter countries with calling codes and sort by name
        const countriesWithCodes = data
          .filter(country => country.idd?.root || country.idd?.suffixes)
          .map(country => {
            const callingCode = country.idd?.root + (country.idd?.suffixes?.[0] || '');
            return {
              name: country.name.common,
              flag: country.flags.emoji,
              callingCode: callingCode || '+1', // Default to +1 if no code found
              idd: country.idd
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(countriesWithCodes);
        setFilteredCountries(countriesWithCodes);
        
        // Set default country (India)
        const defaultCountry = countriesWithCodes.find(c => c.name === 'India') || countriesWithCodes[0];
        setSelectedCountry(defaultCountry);
      } catch (error) {
        console.error('Error fetching countries:', error);
        // Fallback to basic countries if API fails
        const fallbackCountries = [
          { name: 'India', flag: '🇮🇳', callingCode: '+91' },
          { name: 'United States', flag: '🇺🇸', callingCode: '+1' },
          { name: 'United Kingdom', flag: '🇬🇧', callingCode: '+44' },
          { name: 'Canada', flag: '🇨🇦', callingCode: '+1' },
          { name: 'Australia', flag: '🇦🇺', callingCode: '+61' }
        ];
        setCountries(fallbackCountries);
        setFilteredCountries(fallbackCountries);
        setSelectedCountry(fallbackCountries[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Filter countries based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.callingCode.includes(searchTerm)
      );
      setFilteredCountries(filtered);
    }
  }, [searchTerm, countries]);

  // Handle country selection
  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchTerm('');
    
    // Update the phone number value with new country code
    const phoneNumber = value.replace(/^\+\d+\s*/, ''); // Remove existing country code
    const newValue = `${country.callingCode} ${phoneNumber}`.trim();
    
    // Call onChange with both phone and countryCode
    onChange({ 
      target: { 
        name: 'phone', 
        value: newValue 
      } 
    });
    
    // Also update countryCode if the parent component needs it
    if (onCountryCodeChange) {
      onCountryCodeChange(country.callingCode);
    }
  };

  // Handle phone number input change
  const handlePhoneChange = (e) => {
    const inputValue = e.target.value;
    
    // If user starts typing without country code, add it
    if (!inputValue.startsWith('+') && !inputValue.startsWith(selectedCountry.callingCode)) {
      const phoneNumber = inputValue.replace(/^\+\d+\s*/, ''); // Remove any existing country code
      const newValue = `${selectedCountry.callingCode} ${phoneNumber}`.trim();
      onChange({ target: { name: 'phone', value: newValue } });
    } else {
      onChange(e);
    }
  };

  // Extract phone number without country code for display
  const getPhoneNumberWithoutCode = () => {
    if (!value) return '';
    // Escape special regex characters in the calling code
    const escapedCallingCode = selectedCountry.callingCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return value.replace(new RegExp(`^${escapedCallingCode}\\s*`), '');
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`w-20 ${variant === 'signup' ? 'h-16' : 'h-10'} bg-gray-200 animate-pulse rounded-2xl`}></div>
        <div className={`flex-1 ${variant === 'signup' ? 'h-16' : 'h-10'} bg-gray-200 animate-pulse rounded-2xl`}></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex">
        {/* Country Code Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className={`flex items-center space-x-2 px-3 border border-r-0 focus:outline-none ${
              variant === 'signup' 
                ? 'py-4 rounded-l-2xl bg-gray-50 text-gray-800 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300 text-sm placeholder-gray-500' 
                : 'py-2 rounded-l-lg focus:ring-2 focus:ring-emerald-400'
            } ${
              disabled 
                ? 'border-gray-200 bg-gray-50 text-gray-500' 
                : 'border-gray-300 hover:border-gray-400'
            } ${error ? 'border-red-300' : ''}`.replace('focus:ring-amber-400', `focus:ring-${focusColor}-400`)}
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm font-medium">{selectedCountry.callingCode}</span>
            <FiChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && !disabled && (
            <div className="absolute top-full left-0 z-50 w-72 max-h-64 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
              <div className="p-3 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="flex-1 text-sm font-medium">{country.name}</span>
                      <span className="text-sm font-medium text-gray-600">{country.callingCode}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No countries found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="flex-1 relative">
          <input
            type="tel"
            name="phone"
            value={getPhoneNumberWithoutCode()}
            onChange={handlePhoneChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full pl-3 pr-10 py-2 border focus:outline-none ${
              variant === 'signup' 
                ? 'py-4 rounded-r-2xl bg-gray-50 text-gray-800 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300 text-sm placeholder-gray-500' 
                : 'rounded-r-lg focus:ring-2 focus:ring-emerald-400'
            } ${
              disabled 
                ? 'border-gray-200 bg-gray-50 text-gray-500' 
                : 'border-gray-300'
            } ${error ? 'border-red-300' : ''}`.replace('focus:ring-amber-400', `focus:ring-${focusColor}-400`)}
          />
          <FiPhone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default PhoneNumberInput; 