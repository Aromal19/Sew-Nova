import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiUser,
  FiScissors,
  FiShoppingBag,
  FiPackage,
  FiPlus,
  FiMinus,
  FiHome,
  FiMail,
  FiPhone,
  FiMapPin,
  FiStar,
  FiClock,
  FiShield,
  FiHeart,
  FiSearch,
  FiFilter,
  FiShoppingCart,
  FiUser as FiUserIcon,
  FiSettings,
  FiLogOut,
  FiCamera,
} from "react-icons/fi";
import { apiCall } from "../../config/api";
import { useBooking } from "../../context/BookingContext";
import { useCart } from "../../context/CartContext";
import { loadRazorpayScript, createRazorpayInstance, createRazorpayOptions, handleRazorpayError } from "../../utils/razorpay";
import Swal from 'sweetalert2';
import AIMeasurementCapture from "../../components/AIMeasurementCapture";
import DesignSelection from "../../components/DesignSelection";
import EnhancedMeasurementForm from "../../components/EnhancedMeasurementForm";
import BookingCacheService from "../../utils/bookingCache";

// Header Component
const Header = ({ onNavigate }) => (
  <header className="bg-white shadow-lg border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900">SewNova</h1>
          </div>
        </div>
        <nav className="hidden md:flex space-x-8">
          <button
            onClick={() => onNavigate('/customer/landing')}
            className="text-gray-700 hover:text-amber-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <FiHome className="mr-2" />
            Home
          </button>
          <button
            onClick={() => onNavigate('/fabrics')}
            className="text-gray-700 hover:text-amber-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <FiShoppingBag className="mr-2" />
            Fabrics
          </button>
          <button
            onClick={() => onNavigate('/tailors')}
            className="text-gray-700 hover:text-amber-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <FiScissors className="mr-2" />
            Tailors
          </button>
        </nav>
        <div className="flex items-center space-x-4">
          <button className="text-gray-700 hover:text-amber-600 p-2">
            <FiShoppingCart className="h-5 w-5" />
          </button>
          <button className="text-gray-700 hover:text-amber-600 p-2">
            <FiUserIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </header>
);

// Footer Component
const Footer = () => (
  <footer className="bg-gray-900 text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">SewNova</h3>
          <p className="text-gray-400 mb-4">
            Your trusted partner for premium fabrics and expert tailoring services.
          </p>
          <div className="flex space-x-4">
            <button className="text-gray-400 hover:text-white">
              <FiMail className="h-5 w-5" />
            </button>
            <button className="text-gray-400 hover:text-white">
              <FiPhone className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div>
          <h4 className="text-md font-semibold mb-4">Services</h4>
          <ul className="space-y-2 text-gray-400">
            <li>Custom Tailoring</li>
            <li>Fabric Selection</li>
            <li>Design Consultation</li>
            <li>Measurement Services</li>
          </ul>
        </div>
        <div>
          <h4 className="text-md font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-gray-400">
            <li>Help Center</li>
            <li>Contact Us</li>
            <li>Size Guide</li>
            <li>Returns & Exchanges</li>
          </ul>
        </div>
        <div>
          <h4 className="text-md font-semibold mb-4">Contact Info</h4>
          <div className="space-y-2 text-gray-400">
            <div className="flex items-center">
              <FiMapPin className="mr-2 h-4 w-4" />
              <span>123 Fashion Street, Mumbai</span>
            </div>
            <div className="flex items-center">
              <FiPhone className="mr-2 h-4 w-4" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center">
              <FiMail className="mr-2 h-4 w-4" />
              <span>info@sewnova.com</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; 2024 SewNova. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const BookingFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { state: bookingState, setServiceType, setCurrentStep: setFlowStep, setSelectedFabric: setCtxSelectedFabric } = useBooking();
  const { items, clearCart } = useCart();

  // Booking data state
  const [bookingData, setBookingData] = useState({
    // Step 1: Fabric Selection
    selectedFabrics: [],
    
    // Step 2: Cart Review
    cartItems: [],
    
    // Step 3: Service Type Decision
    serviceType: null, // 'fabric-only' or 'fabric-tailor'
    
    // Step 4: Design Selection (for fabric+tailor)
    selectedDesign: null,
    designType: "", // 'custom', 'predefined'
    designInstructions: "",
    
    // Step 5: Tailor Selection (for fabric+tailor)
    tailorId: searchParams.get("tailorId") || null,
    
    // Step 6: Measurements (for fabric+tailor)
    measurementId: null,
    customMeasurements: {},
    
    // Step 7: Confirmation
    garmentType: "",
    quantity: 1,
    addressId: null,
    deliveryAddress: {},
    preferredDate: "",
    preferredTime: "",
    fabricCost: 0,
    tailoringCost: 0,
    totalCost: 0,
    advanceAmount: 0,
    notes: "",
  });

  const [availableTailors, setAvailableTailors] = useState([]);
  const [availableFabrics, setAvailableFabrics] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedTailor, setSelectedTailor] = useState(null);
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [showAIMeasurement, setShowAIMeasurement] = useState(false);
  const [showEnhancedMeasurementForm, setShowEnhancedMeasurementForm] = useState(false);
  const [isEnhancedFormActive, setIsEnhancedFormActive] = useState(false);
  const [bookingCache] = useState(new BookingCacheService());
  const [isPaying, setIsPaying] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Add useEffect to track bookingData changes for debugging
  useEffect(() => {
    console.log('📊 Booking data updated:', bookingData);
  }, [bookingData]);

  // Add localStorage persistence
  useEffect(() => {
    // Save to localStorage whenever bookingData changes
    // But don't save if we just loaded from location.state
    if (!location.state) {
      localStorage.setItem('bookingData', JSON.stringify(bookingData));
    }
  }, [bookingData, location.state]);

  // Initialize from location.state (from checkout page) - PRIORITY
  useEffect(() => {
    if (location.state) {
      console.log('📍 Received location state:', location.state);
      
      // Clear old localStorage when new data arrives from checkout
      localStorage.removeItem('bookingData');
      
      // Handle multiple fabrics from checkout
      if (location.state.fabrics && Array.isArray(location.state.fabrics)) {
        console.log('🛍️ Multiple fabrics detected:', location.state.fabrics);
        
        // Calculate total fabric cost
        const totalFabricCost = location.state.fabrics.reduce((sum, fabric) => {
          return sum + (fabric.price * fabric.quantity);
        }, 0);
        
        // Auto-select fabric-only for multiple fabrics and skip Review Cart step
        const isMultipleFabrics = location.state.fabrics.length > 1;
        
        setBookingData(prev => ({
          ...prev,
          selectedFabrics: location.state.fabrics,
          serviceType: 'fabric-only', // Auto-select fabric-only
          fabricCost: totalFabricCost,
          quantity: location.state.fabrics.reduce((sum, f) => sum + f.quantity, 0)
        }));
        
        // Skip Review Cart step if multiple fabrics - go directly to step 2
        if (isMultipleFabrics) {
          console.log('⏭️ Skipping Review Cart step for multiple fabrics');
          setCurrentStep(2); // Skip to next step (Delivery Address)
        }
        
        // Set first fabric as selected for display purposes
        if (location.state.fabrics.length > 0) {
          // Fetch full fabric details for the first one
          const fetchFabricDetails = async () => {
            try {
              const response = await apiCall('SELLER_SERVICE', `/api/public/products/${location.state.fabrics[0].id}`);
              if (response?.success && response?.data) {
                setSelectedFabric(response.data);
              }
            } catch (error) {
              console.error('Error fetching fabric details:', error);
            }
          };
          fetchFabricDetails();
        }
      }
      // Handle single fabric (legacy support)
      else if (location.state.fabricId) {
        setBookingData(prev => ({
          ...prev,
          fabricId: location.state.fabricId,
          serviceType: location.state.serviceType,
          quantity: location.state.quantity || 1
        }));
      }
      // Handle service type
      else if (location.state.serviceType) {
        setBookingData(prev => ({
          ...prev,
          serviceType: location.state.serviceType
        }));
      }
    }
    // Only load from localStorage if there's NO location.state
    else {
      const savedBookingData = localStorage.getItem('bookingData');
      if (savedBookingData) {
        try {
          const parsedData = JSON.parse(savedBookingData);
          console.log('🔄 Restoring booking data from localStorage:', parsedData);
          setBookingData(parsedData);
        } catch (error) {
          console.error('❌ Error parsing saved booking data:', error);
        }
      }
    }
  }, [location.state]);

  const loadScript = (src) => {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async () => {
    try {
      // Validate booking data before payment
      const validation = validateBookingData();
      if (!validation.isValid) {
        Swal.fire({
          icon: 'error',
          title: 'Incomplete Booking',
          text: `Please complete the following: ${validation.errors.join(', ')}`,
          confirmButtonText: 'OK'
        });
        return;
      }

      setIsPaying(true);

      const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!loaded) {
        alert('Failed to load payment SDK. Please check your internet connection.');
        setIsPaying(false);
        return;
      }

      const amountToPay = Number(bookingData.totalCost || bookingData.advanceAmount || 0);
      if (!amountToPay || amountToPay <= 0) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Amount',
          text: 'Please check the payment amount and try again.',
          confirmButtonText: 'OK'
        });
        setIsPaying(false);
        return;
      }

      // 1) Create Razorpay order (without creating booking first)
      const computedBookingType = (bookingData.serviceType === 'fabric-tailor' && bookingData.tailorId) ? 'complete' : 'fabric';
      
      const orderRes = await apiCall(
        "PAYMENT_SERVICE",
        "/api/payments/create-order",
        {
          method: "POST",
          body: { 
            amount: amountToPay, 
            currency: "INR", 
            notes: { 
              source: "booking-flow",
              bookingData: {
                bookingType: computedBookingType,
                tailorId: bookingData.tailorId || undefined,
                fabricId: bookingData.fabricId || undefined,
                measurementId: bookingData.measurementId || undefined,
                measurementSnapshot: (bookingData.customMeasurements && Object.keys(bookingData.customMeasurements).length > 0) ? bookingData.customMeasurements : undefined,
                addressId: bookingData.addressId || bookingData.deliveryAddress?._id,
                orderDetails: {
                  garmentType: bookingData.garmentType || 'other',
                  quantity: bookingData.quantity || 1,
                  designDescription: bookingData.designInstructions || bookingData.selectedDesign?.name || '',
                  specialInstructions: bookingData.notes || '',
                  deliveryDate: bookingData.preferredDate || new Date().toISOString()
                },
                pricing: {
                  fabricCost: bookingData.fabricCost || 0,
                  tailoringCost: bookingData.tailoringCost || 0,
                  totalAmount: amountToPay,
                  advanceAmount: amountToPay
                }
              }
            },
            userId: bookingData.customerId || "507f1f77bcf86cd799439012"
          }
        }
      );

      if (!orderRes?.success || !orderRes?.order?.id || !orderRes?.key) {
        Swal.fire({
          icon: 'error',
          title: 'Payment Order Failed',
          text: 'Could not create payment order. Please try again.',
          confirmButtonText: 'OK'
        });
        setIsPaying(false);
        return;
      }

      // Load Razorpay script and create instance
      try {
        await loadRazorpayScript();
        
        const options = createRazorpayOptions(
          orderRes,
          async function (response) {
            try {
              const verifyRes = await apiCall(
                "PAYMENT_SERVICE",
                "/api/payments/verify",
                {
                  method: "POST",
                  body: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                  }
                }
              );

              if (verifyRes?.success) {
                // Save booking data to backend BEFORE clearing cache
                try {
                  console.log('💾 Payment successful, saving booking data...');
                  await saveBookingToBackend(bookingData);
                  
                  // Update UI state
                  setPaymentCompleted(true);
                  setBookingData(prev => ({
                    ...prev,
                    paymentStatus: 'paid',
                    orderId: verifyRes.paymentId
                  }));
                  
                  // Show success message
                  Swal.fire({
                    icon: 'success',
                    title: 'Payment Successful!',
                    text: 'Your booking has been confirmed and saved.',
                    confirmButtonText: 'OK'
                  });
                  
                  // Clear booking cache AFTER successful save
                  clearBookingCache();
                  
                  // Clear cart items since order is complete
                  console.log('🛒 Clearing cart after successful order');
                  clearCart();
                  
                  // Dispatch custom event to notify other components
                  window.dispatchEvent(new CustomEvent('bookingCacheCleared'));
                  
                } catch (saveError) {
                  console.error('❌ Error saving booking after payment:', saveError);
                  Swal.fire({
                    icon: 'error',
                    title: 'Payment Successful but Save Failed',
                    text: 'Your payment was processed but there was an error saving your booking. Please contact support.',
                    confirmButtonText: 'OK'
                  });
                }
                
                // Show success message and redirect
                Swal.fire({
                  icon: 'success',
                  title: 'Payment Successful!',
                  text: 'Your order has been placed successfully.',
                  confirmButtonText: 'View Dashboard',
                  showConfirmButton: true,
                  allowOutsideClick: false
                }).then(() => {
                  // Navigate to success page or dashboard
                  navigate('/dashboard/customer', { 
                    state: { 
                      paymentSuccess: true, 
                      orderId: verifyRes.paymentId,
                      message: 'Payment completed successfully!' 
                    }
                  });
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Payment Verification Failed',
                  text: 'Your payment could not be verified. Please try again.',
                  confirmButtonText: 'OK'
                });
              }
            } catch (e) {
              console.error('Payment verification error:', e);
              Swal.fire({
                icon: 'error',
                title: 'Payment Error',
                text: 'There was an error verifying payment. Please try again.',
                confirmButtonText: 'OK'
              });
            } finally {
              setIsPaying(false);
            }
          },
          (error) => {
            console.error('Payment error:', error);
            Swal.fire({
              icon: 'error',
              title: 'Payment Failed',
              text: handleRazorpayError(error),
              confirmButtonText: 'OK'
            });
            setIsPaying(false);
          },
          () => {
            console.log('Payment modal dismissed');
            setIsPaying(false);
          }
        );

        const rzp = await createRazorpayInstance(options);
        rzp.open();
      } catch (error) {
        console.error('Razorpay initialization error:', error);
        alert('Payment system is not available. Please refresh the page and try again.');
        setIsPaying(false);
      }
    } catch (err) {
      alert('Unable to start payment. Please try again.');
      setIsPaying(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    loadBookingProgress();
  }, []);

  useEffect(() => {
    if (location.state?.fromCheckout) {
      setCurrentStep(2);
      setBookingData((prev) => ({ ...prev, serviceType: "complete" }));
    }
    
    // Handle resume from cart
    if (location.state?.resume) {
      loadBookingProgress();
    }
  }, [location.state]);

  // Load saved booking progress
  const loadBookingProgress = () => {
    const savedProgress = bookingCache.getBookingProgress();
    if (savedProgress) {
      setBookingData(savedProgress);
      setCurrentStep(savedProgress.currentStep || 1);
      
      // Restore selected items
      if (savedProgress.selectedFabric) {
        setSelectedFabric(savedProgress.selectedFabric);
      }
      if (savedProgress.selectedTailor) {
        setSelectedTailor(savedProgress.selectedTailor);
      }
    }
  };

  // Save booking progress
  const saveBookingProgress = () => {
    const progressData = {
      ...bookingData,
      currentStep,
      selectedFabric,
      selectedTailor
    };
    
    bookingCache.saveBookingProgress(progressData);
  };

  // Auto-save on data changes
  useEffect(() => {
    if (bookingData.selectedFabric || bookingData.serviceType) {
      saveBookingProgress();
    }
  }, [bookingData, currentStep, selectedFabric, selectedTailor]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      let fabricsRaw = [];

      // Fetch tailors
      try {
        const tailorsResponse = await apiCall(
          "TAILOR_SERVICE",
          "/api/public/tailors?limit=20&isVerified=true",
          { method: "GET" }
        );
        if (tailorsResponse.success && tailorsResponse.data) {
          setAvailableTailors(
            tailorsResponse.data.map((t) => ({
              _id: t._id,
              firstname: t.firstname,
              lastname: t.lastname,
              shopName: t.shopName,
              rating: t.rating || 4.0,
              experience: t.experience || 0,
              services: t.services || [
                { name: "Custom Tailoring", price: t.basePrice  },
              ],
            }))
          );
        }
      } catch {
        setAvailableTailors([]);
      }

      // Fetch fabrics
      try {
        const fabricsResponse = await apiCall(
          "SELLER_SERVICE",
          "/api/public/products?limit=20&isActive=true",
          { method: "GET" }
        );
        if (fabricsResponse.success && fabricsResponse.data) {
          fabricsRaw = fabricsResponse.data;
          setAvailableFabrics(
            fabricsResponse.data.map((f) => ({
              _id: f._id,
              name: f.name,
              price: f.price,
              color: f.color,
              category: f.category,
              images: Array.isArray(f.images) ? f.images.map((img) => (img?.url ? img.url : img)) : [],
              seller: f.seller?.name || "Unknown",
            }))
          );
        }
      } catch {
        setAvailableFabrics([]);
      }

      // If fabric was preselected (from Cart or Tailor profile), set it
      const preselectedId = location.state?.preselectedFabricId || bookingState.selectedFabricId || null;
      if (preselectedId) {
        const match = fabricsRaw?.find((f) => f._id === preselectedId);
        if (match) {
          setSelectedFabric(match);
          setBookingData((p) => ({ ...p, fabricId: match._id, fabricCost: match.price, serviceType: "fabric-tailor" }));
        } else {
          // Fallback to cart items if available with same id shape
          const cartFabric = items.find((it) => it.type === "fabric" && (it._id === preselectedId || it.id === preselectedId));
          if (cartFabric) {
            const candidate = {
              _id: cartFabric._id || cartFabric.id,
              name: cartFabric.name,
              price: cartFabric.price,
              color: cartFabric.color,
              category: cartFabric.category,
              images: Array.isArray(cartFabric.images)
                ? cartFabric.images.map((img) => (img?.url ? img.url : img))
                : cartFabric.image
                ? [cartFabric.image]
                : [],
              seller: cartFabric.seller?.name || cartFabric.seller || "Unknown",
            };
            setSelectedFabric(candidate);
            setBookingData((p) => ({ ...p, fabricId: candidate._id, fabricCost: candidate.price, serviceType: "fabric-tailor" }));
          }
        }
        setServiceType("fabric-tailor");
        setFlowStep(1);
      }

      // Measurements
      try {
        const mRes = await apiCall("CUSTOMER_SERVICE", "/api/measurements", {
          method: "GET",
        });
        if (mRes.success && mRes.data) setMeasurements(mRes.data);
      } catch {
        setMeasurements([
          {
            _id: "default",
            measurementName: "Standard",
            measurements: { chest: 42, waist: 36 },
          },
        ]);
      }

      // Addresses
      try {
        const aRes = await apiCall("CUSTOMER_SERVICE", "/api/addresses", {
          method: "GET",
        });
        if (aRes.success && aRes.data) setAddresses(aRes.data);
      } catch {
        setAddresses([
          {
            _id: "default",
            addressLine: "Add your address",
            city: "City",
            state: "State",
            pincode: "000000",
            isDefault: true,
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to normalize measurement field names for backend API
  // Also extracts raw numeric values from {value, unit} objects returned by AI service
  const normalizeMeasurements = (measurements) => {
    const normalized = {};
    const fieldMapping = {
      'shoulder_width': 'shoulder',
      'sleeve_length': 'sleeve',
      'body_length': 'length',
      'kurta_length': 'length',
      'shirt_length': 'length'
    };
    
    for (const [key, value] of Object.entries(measurements)) {
      const normalizedKey = fieldMapping[key] || key;
      // Handle AI measurement format: { value: 96.2, unit: 'cm' }
      if (value && typeof value === 'object' && value.value !== undefined) {
        normalized[normalizedKey] = value.value;
      } else {
        normalized[normalizedKey] = value;
      }
    }
    
    return normalized;
  };

  // Helper to fetch fabric estimate
  const fetchFabricEstimate = async (measurementsObj, garmentTypeOverride = null) => {
    // Use override if provided, otherwise fall back to bookingData
    const garmentType = garmentTypeOverride || bookingData.garmentType;
    
    // Only estimate if we have a valid garment type and measurements
    if (!garmentType || garmentType === 'other' || !measurementsObj) {
        console.log("⚠️ Skipping fabric estimation:", { garmentType, hasMeasurements: !!measurementsObj });
        return;
    }

    try {
        setLoading(true);
        
        // Normalize measurement field names
        const normalizedMeasurements = normalizeMeasurements(measurementsObj);
        console.log("🔍 Fetching fabric estimate for:", garmentType, normalizedMeasurements);
        
        const res = await apiCall("ADMIN_SERVICE", "/api/fabric/estimate", {
            method: "POST",
            body: { 
                garmentType: garmentType, 
                measurements: normalizedMeasurements 
            }
        });

        if (res && res.finalMeters) {
            console.log("✅ Fabric Estimate Received:", res);
            setBookingData(prev => ({
                ...prev,
                quantity: res.finalMeters,
                estimationDetails: res // Store full details for UI
            }));
            
            // Optional: User feedback
            Swal.fire({
                icon: 'info',
                title: 'Fabric Requirement Updated',
                text: `Based on your measurements, you need ${res.finalMeters} meters.`,
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            console.warn("⚠️ API response missing finalMeters:", res);
        }
    } catch (error) {
        console.error("❌ Fabric estimation failed:", error);
        // Fail silently or fallback to default? 
        // We'll just log it for now so flow isn't blocked.
    } finally {
        setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length) {
      const currentStepTitle = steps[currentStep - 1]?.title;
      
      // Validation before moving to next step
      if (currentStepTitle === "Review Cart") {
        if (!selectedFabric) {
          Swal.fire({
            icon: 'warning',
            title: 'No Fabric Selected',
            text: 'Please select a fabric before proceeding.',
            confirmButtonText: 'OK'
          });
          return;
        }
        if (!bookingData.serviceType) {
          Swal.fire({
            icon: 'warning',
            title: 'Service Type Required',
            text: 'Please choose whether you want fabric only or fabric with tailoring.',
            confirmButtonText: 'OK'
          });
          return;
        }
      }
      
      // Address validation for fabric-only flow
      if (currentStepTitle === "Delivery Address") {
        if (!bookingData.addressId && !bookingData.deliveryAddress?._id) {
          Swal.fire({
            icon: 'warning',
            title: 'Address Required',
            text: 'Please select a delivery address before proceeding.',
            confirmButtonText: 'OK'
          });
          return;
        }
      }
      
      // IMPORTANT: Only trigger fabric estimation for fabric-tailor flow, NOT fabric-only
      // Fabric-only is a quantity-and-payment flow, not a measurement or estimation flow
      if (currentStepTitle === "Measurements" && 
          bookingData.serviceType === 'fabric-tailor' && 
          bookingData.garmentType && 
          bookingData.garmentType !== 'other') {
        console.log("🚀 Leaving Measurements step (fabric-tailor flow), triggering fabric estimation...");
        
        // Get measurements from either customMeasurements or find the selected measurement
        let measurementsToUse = bookingData.customMeasurements;
        
        if (!measurementsToUse || Object.keys(measurementsToUse).length === 0) {
          // Try to find the selected measurement from the list
          const selectedMeasurement = measurements.find(m => m._id === bookingData.measurementId);
          if (selectedMeasurement && selectedMeasurement.measurements) {
            measurementsToUse = selectedMeasurement.measurements;
          }
        }
        
        if (measurementsToUse && Object.keys(measurementsToUse).length > 0) {
          await fetchFabricEstimate(measurementsToUse, bookingData.garmentType);
        } else {
          console.warn("⚠️ No measurements found to estimate fabric");
        }
      }
      
      setCurrentStep(currentStep + 1);
      saveBookingProgress();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      saveBookingProgress();
    }
  };

  // Validation function to check if booking data is complete
  const validateBookingData = () => {
    const errors = [];
    
    if (!bookingData.serviceType) {
      errors.push('Service type is required');
    }
    
    // Tailor is only required for fabric-tailor flow
    if (bookingData.serviceType === 'fabric-tailor' && !bookingData.tailorId) {
      errors.push('Tailor selection is required');
    }
    
    // Measurements are only required for fabric-tailor flow
    if (bookingData.serviceType === 'fabric-tailor' && 
        !bookingData.measurementId && 
        (!bookingData.customMeasurements || Object.keys(bookingData.customMeasurements).length === 0)) {
      errors.push('Measurements are required');
    }
    
    // Address is always required
    if (!bookingData.addressId && !bookingData.deliveryAddress?._id) {
      errors.push('Delivery address is required');
    }
    
    // Garment type is only required for fabric-tailor flow
    if (bookingData.serviceType === 'fabric-tailor' && !bookingData.garmentType) {
      errors.push('Garment type is required');
    }
    
    // Quantity must always be at least 1
    if (!bookingData.quantity || bookingData.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }
    
    // Fabric must be selected
    if (!bookingData.fabricId) {
      errors.push('Fabric selection is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Function to save booking data to backend
  const saveBookingToBackend = async (bookingDataToSave) => {
    try {
      console.log('💾 Saving booking to backend:', bookingDataToSave);
      
      // Import BookingService
      const { default: BookingService } = await import('../../services/bookingService');
      
      // Determine booking type
      const isFabricOnly = bookingDataToSave.serviceType === 'fabric-only';
      
      // Check if we have multiple fabrics
      const hasMultipleFabrics = bookingDataToSave.selectedFabrics && bookingDataToSave.selectedFabrics.length > 1;
      
      if (hasMultipleFabrics) {
        console.log(`📦 Creating ${bookingDataToSave.selectedFabrics.length} separate bookings for multiple fabrics`);
        
        // Calculate total fabric cost for proportional pricing
        const totalFabricCost = bookingDataToSave.selectedFabrics.reduce((sum, fabric) => 
          sum + (fabric.price * fabric.quantity), 0
        );
        
        // Create a booking for each fabric
        const bookingPromises = bookingDataToSave.selectedFabrics.map(async (fabric, index) => {
          const fabricCost = fabric.price * fabric.quantity;
          // Calculate proportional share of total payment
          const proportionalPayment = Math.round((fabricCost / totalFabricCost) * (bookingDataToSave.advanceAmount || bookingDataToSave.totalCost || 0));
          
          const fabricBookingData = {
            bookingType: 'fabric',
            tailorId: null,
            fabricId: fabric.id,
            addressId: bookingDataToSave.addressId,
            orderDetails: {
              garmentType: 'other',
              quantity: fabric.quantity,
              designDescription: `Fabric ${index + 1} of ${bookingDataToSave.selectedFabrics.length}`,
              specialInstructions: bookingDataToSave.notes || '',
              deliveryDate: bookingDataToSave.preferredDate ? new Date(bookingDataToSave.preferredDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
            pricing: {
              fabricCost: fabricCost,
              tailoringCost: 0,
              additionalCharges: 0,
              totalAmount: fabricCost,
              advanceAmount: proportionalPayment,
              remainingAmount: fabricCost - proportionalPayment
            },
            payment: {
              status: 'paid',
              method: 'razorpay',
              paidAmount: proportionalPayment,
              paidAt: new Date()
            }
          };
          
          console.log(`📦 Creating booking ${index + 1}/${bookingDataToSave.selectedFabrics.length} for fabric:`, fabric.name);
          return await BookingService.createBooking(fabricBookingData);
        });
        
        // Wait for all bookings to complete
        const responses = await Promise.all(bookingPromises);
        console.log(`✅ All ${responses.length} bookings saved successfully`);
        return { success: true, bookings: responses };
      }
      
      // Single fabric booking (original logic)
      
      // Ensure we have a valid fabricId
      const finalFabricId = bookingDataToSave.fabricId || 
                           (bookingDataToSave.selectedFabrics && bookingDataToSave.selectedFabrics.length > 0 
                            ? (bookingDataToSave.selectedFabrics[0].id || bookingDataToSave.selectedFabrics[0]._id) 
                            : null);

      const apiBookingData = {
        bookingType: isFabricOnly ? 'fabric' : 
                    bookingDataToSave.serviceType === 'fabric-tailor' ? 'complete' : 'tailor',
        tailorId: isFabricOnly ? null : bookingDataToSave.tailorId,
        fabricId: finalFabricId,
        // Only include measurements for fabric-tailor orders
        ...(isFabricOnly ? {} : {
          measurementId: bookingDataToSave.measurementId,
          measurementSnapshot: bookingDataToSave.customMeasurements
        }),
        addressId: bookingDataToSave.addressId,
        orderDetails: {
          garmentType: bookingDataToSave.garmentType || 'other',
          quantity: bookingDataToSave.quantity,
          designDescription: bookingDataToSave.designInstructions,
          specialInstructions: bookingDataToSave.notes,
          deliveryDate: bookingDataToSave.preferredDate ? new Date(bookingDataToSave.preferredDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        pricing: {
          fabricCost: bookingDataToSave.fabricCost || 0,
          tailoringCost: isFabricOnly ? 0 : (bookingDataToSave.tailoringCost || 0),
          additionalCharges: 0,
          totalAmount: bookingDataToSave.totalCost || 0,
          advanceAmount: bookingDataToSave.advanceAmount || 0,
          remainingAmount: (bookingDataToSave.totalCost || 0) - (bookingDataToSave.advanceAmount || 0)
        },
        // IMPORTANT: Populate sellerId if implicit from fabric (though backend should handle it too)
        payment: {
          status: 'paid',
          method: 'razorpay',
          paidAmount: bookingDataToSave.advanceAmount || bookingDataToSave.totalCost || 0,
          paidAt: new Date()
        }
      };
      
      const response = await BookingService.createBooking(apiBookingData);
      console.log('✅ Booking saved successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error saving booking:', error);
      throw error;
    }
  };

  // Debug function to show current booking data
  const debugBookingData = () => {
    console.log('🔍 Current booking data:', bookingData);
    console.log('🔍 Validation result:', validateBookingData());
    Swal.fire({
      title: 'Booking Data Debug',
      html: `
        <div style="text-align: left; font-family: monospace; font-size: 12px;">
          <strong>Service Type:</strong> ${bookingData.serviceType || 'Not set'}<br/>
          <strong>Tailor ID:</strong> ${bookingData.tailorId || 'Not set'}<br/>
          <strong>Fabric ID:</strong> ${bookingData.fabricId || 'Not set'}<br/>
          <strong>Measurement ID:</strong> ${bookingData.measurementId || 'Not set'}<br/>
          <strong>Address ID:</strong> ${bookingData.addressId || 'Not set'}<br/>
          <strong>Garment Type:</strong> ${bookingData.garmentType || 'Not set'}<br/>
          <strong>Quantity:</strong> ${bookingData.quantity || 'Not set'}<br/>
          <strong>Total Cost:</strong> ${bookingData.totalCost || 'Not set'}<br/>
          <strong>Validation:</strong> ${validateBookingData().isValid ? '✅ Valid' : '❌ Invalid'}<br/>
          ${!validateBookingData().isValid ? `<strong>Errors:</strong> ${validateBookingData().errors.join(', ')}` : ''}
        </div>
      `,
      confirmButtonText: 'OK'
    });
  };

  // Clear booking cache when order is confirmed
  const clearBookingCache = () => {
    bookingCache.clearBookingProgress();
    localStorage.removeItem('bookingData');
  };

  const handleTailorSelect = (t) => {
    setSelectedTailor(t);
    setBookingData((p) => ({
      ...p,
      tailorId: t._id,
      tailoringCost: t.services[0]?.price || 0,
    }));
  };

  const handleFabricSelect = (f) => {
    setSelectedFabric(f);
    setBookingData((p) => ({
      ...p,
      fabricId: f._id,
      fabricCost: f.price,
    }));
  };

  const calculateTotal = () => {
    const fabricCost = selectedFabric
      ? selectedFabric.price * bookingData.quantity
      : 0;
    const tailoringCost = selectedTailor?.services[0]?.price || 0;
    const designCost = bookingData.selectedDesign?.price || 0;
    const deliveryFee = 100;
    const subtotal = fabricCost + tailoringCost + designCost + deliveryFee;
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;
    
    setBookingData((p) => ({
      ...p,
      fabricCost,
      tailoringCost,
      totalCost: total,
      advanceAmount: Math.round(total * 0.3),
    }));
  };

  useEffect(() => {
    calculateTotal();
  }, [selectedFabric, selectedTailor, bookingData.quantity, bookingData.selectedDesign]);

  // Define steps based on the new flow
  const getSteps = () => {
    const baseSteps = [
      { id: 1, title: "Select Fabric", icon: FiShoppingBag, description: "Choose or confirm your fabric" },
      { id: 2, title: "Review Cart", icon: FiShoppingCart, description: "Review your fabric selection" },
    ];

    if (bookingData.serviceType === 'fabric-tailor') {
      return [
        ...baseSteps,
        { id: 3, title: "Select Design", icon: FiPackage, description: "Choose your design preference" },
        { id: 4, title: "Choose Tailor", icon: FiScissors, description: "Select your preferred tailor" },
        { id: 5, title: "Measurements", icon: FiUser, description: "Provide your measurements" },
        { id: 6, title: "Delivery Address", icon: FiHome, description: "Select delivery address" },
        { id: 7, title: "Confirm Order", icon: FiCheck, description: "Review and confirm your order" },
      ];
    } else if (bookingData.serviceType === 'fabric-only') {
      return [
        ...baseSteps,
        { id: 3, title: "Delivery Address", icon: FiHome, description: "Select delivery address" },
        { id: 4, title: "Confirm Order", icon: FiCheck, description: "Review and confirm your order" },
      ];
    }

    return baseSteps;
  };

  const steps = getSteps();

  const cartFabrics = useMemo(() => items.filter((it) => it.type === "fabric"), [items]);

  const renderStepContent = () => {
    const currentStepTitle = steps[currentStep - 1]?.title;
    
    switch (currentStepTitle) {
      case "Select Fabric":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Fabric</h2>
              {selectedFabric ? (
                <p className="text-gray-700">
                  Fabric Selected: <span className="font-semibold">{selectedFabric.name}</span>
                </p>
              ) : (
                <p className="text-gray-600">Select the fabric to continue</p>
              )}
              {selectedFabric && (
                <button
                  onClick={() => { setSelectedFabric(null); setCtxSelectedFabric(null); setBookingData((p) => ({ ...p, fabricId: null, fabricCost: 0 })); }}
                  className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Change Fabric
                </button>
              )}
            </div>
            
            {!selectedFabric && (
            <>
            {cartFabrics.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold mb-3">Your Cart Fabrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cartFabrics.map((cf) => (
                    <div key={cf.id} className="border rounded-lg p-3 cursor-pointer hover:shadow" onClick={() => {
                      const candidate = { _id: cf._id || cf.id, name: cf.name, price: cf.price, color: cf.color, category: cf.category, images: Array.isArray(cf.images) ? cf.images.map((img) => (img?.url ? img.url : img)) : (cf.image ? [cf.image] : []) };
                      setSelectedFabric(candidate);
                      setCtxSelectedFabric(candidate._id);
                      setBookingData((p) => ({ ...p, fabricId: candidate._id, fabricCost: candidate.price }));
                    }}>
                      <div className="aspect-w-16 aspect-h-12 mb-2">
                        <img src={(Array.isArray(cf.images) && (cf.images[0]?.url || cf.images[0])) || cf.image || '/placeholder-fabric.jpg'} alt={cf.name} className="w-full h-32 object-cover rounded" />
                      </div>
                      <div className="font-medium">{cf.name}</div>
                      <div className="text-sm text-gray-600">₹{cf.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
              {availableFabrics.map((fabric) => (
                <div
                  key={fabric._id}
                  className={`bg-white rounded-lg shadow-md border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                    bookingData.selectedFabrics.some(f => f._id === fabric._id)
                      ? "border-amber-500 shadow-lg"
                      : "border-gray-200"
                  }`}
                  onClick={() => {
                    setSelectedFabric(fabric);
                    setCtxSelectedFabric(fabric._id);
                    setBookingData(prev => ({ ...prev, fabricId: fabric._id, fabricCost: fabric.price }));
                  }}
                >
                  <div className="p-4">
                    <div className="aspect-w-16 aspect-h-12 mb-4">
                      <img
                        src={(Array.isArray(fabric.images) && fabric.images[0]) || fabric.image || '/placeholder-fabric.jpg'}
                        alt={fabric.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{fabric.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">Color: {fabric.color}</p>
                    <p className="text-gray-600 text-sm mb-2">Category: {fabric.category}</p>
                    <p className="text-gray-600 text-sm mb-3">Seller: {typeof fabric.seller === 'object' ? (fabric.seller?.businessName || fabric.seller?.name || 'Unknown') : fabric.seller}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-amber-600">₹{fabric.price}</span>
                      {bookingData.fabricId === fabric._id && (
                        <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm font-medium">Selected</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </>) }
          </div>
        );

      case "Review Cart":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Review Your Selection</h2>
              <p className="text-gray-600">Confirm your fabric and choose your service type</p>
            </div>
            
            {/* Enhanced Fabric Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-100">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {bookingData.selectedFabrics && bookingData.selectedFabrics.length > 1 
                    ? `Selected Fabrics (${bookingData.selectedFabrics.length})` 
                    : 'Selected Fabric'}
                </h3>
                {(selectedFabric || (bookingData.selectedFabrics && bookingData.selectedFabrics.length > 0)) && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <FiCheck className="mr-1 h-4 w-4" /> Confirmed
                  </span>
                )}
              </div>
              
              {/* Display Multiple Fabrics from Checkout */}
              {bookingData.selectedFabrics && bookingData.selectedFabrics.length > 0 ? (
                <div className="space-y-6">
                  {/* Multiple Fabrics List */}
                  {bookingData.selectedFabrics.map((fabric, index) => (
                    <div key={index} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Fabric Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={fabric.image || '/placeholder-fabric.jpg'}
                            alt={fabric.name}
                            className="w-full md:w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white"
                          />
                        </div>
                        
                        {/* Fabric Info */}
                        <div className="flex-1 space-y-3">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">{fabric.name}</h4>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-lg font-semibold text-amber-600">₹{fabric.price}</span>
                              <span className="text-gray-600">per meter</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-amber-200">
                            <div>
                              <div className="text-sm text-gray-600">Quantity</div>
                              <div className="text-2xl font-bold text-gray-900">{fabric.quantity} <span className="text-lg text-gray-600">meters</span></div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Subtotal</div>
                              <div className="text-2xl font-bold text-amber-600">₹{(fabric.price * fabric.quantity).toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Total Cost Display */}
                  <div className="bg-white rounded-lg p-6 border-2 border-amber-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Total Fabrics</div>
                        <div className="text-2xl font-bold text-gray-900">{bookingData.selectedFabrics.reduce((sum, f) => sum + f.quantity, 0)} <span className="text-lg text-gray-600">meters</span></div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">Total Fabric Cost</div>
                        <div className="text-3xl font-bold text-amber-600">
                          ₹{bookingData.selectedFabrics.reduce((sum, f) => sum + (f.price * f.quantity), 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedFabric ? (
                <div className="space-y-6">
                  {/* Single Fabric Display (existing code) */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Fabric Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={(Array.isArray(selectedFabric.images) && (selectedFabric.images[0]?.url || selectedFabric.images[0])) || selectedFabric.image || '/placeholder-fabric.jpg'}
                          alt={selectedFabric.name}
                          className="w-full md:w-40 h-40 object-cover rounded-lg shadow-md border-2 border-white"
                        />
                      </div>
                      
                      {/* Fabric Info */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="text-2xl font-bold text-gray-900">{selectedFabric.name}</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                              {selectedFabric.color}
                            </span>
                            <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                              {selectedFabric.category}
                            </span>
                            {selectedFabric.seller && (
                              <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                                By {typeof selectedFabric.seller === 'object' ? (selectedFabric.seller?.businessName || selectedFabric.seller?.name || 'Unknown') : selectedFabric.seller}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-amber-200">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-amber-600">₹{selectedFabric.price}</span>
                            <span className="text-gray-600 font-medium">per meter</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quantity Controls - Prominent Design */}
                  <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      Meters of Fabric Required
                    </label>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Decrease Button */}
                        <button
                          onClick={() => {
                            if (bookingData.quantity > 1) {
                              setBookingData(prev => ({ ...prev, quantity: prev.quantity - 1 }));
                            }
                          }}
                          disabled={bookingData.quantity <= 1}
                          className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-2xl transition-all duration-200 shadow-lg ${
                            bookingData.quantity <= 1
                              ? 'bg-gray-300 cursor-not-allowed'
                              : 'bg-red-500 hover:bg-red-600 active:scale-95'
                          }`}
                          aria-label="Decrease quantity"
                        >
                          <FiMinus className="h-6 w-6" />
                        </button>
                        
                        {/* Quantity Display */}
                        <div className="bg-gradient-to-br from-amber-100 to-orange-100 px-8 py-4 rounded-lg border-2 border-amber-300 min-w-[140px] text-center">
                          <div className="text-4xl font-bold text-gray-900">{bookingData.quantity}</div>
                          <div className="text-sm font-medium text-gray-600 mt-1">meters</div>
                        </div>
                        
                        {/* Increase Button */}
                        <button
                          onClick={() => setBookingData(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 flex items-center justify-center text-white font-bold text-2xl transition-all duration-200 shadow-lg"
                          aria-label="Increase quantity"
                        >
                          <FiPlus className="h-6 w-6" />
                        </button>
                      </div>
                      
                      {/* Real-time Price Calculation */}
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">Total Fabric Cost</div>
                        <div className="text-3xl font-bold text-amber-600">
                          ₹{((selectedFabric.price || 0) * (bookingData.quantity || 1)).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {selectedFabric.price} × {bookingData.quantity} meters
                        </div>
                      </div>
                    </div>
                    
                    {/* Minimum quantity note */}
                    <p className="text-sm text-gray-500 mt-4 flex items-center">
                      <FiShield className="mr-2 h-4 w-4" />
                      Minimum order: 1 meter
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No fabric selected</p>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Go back to select fabric
                  </button>
                </div>
              )}
            </div>

            {/* Service Type Selection - Enhanced */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Choose Your Service</h3>
              <p className="text-gray-600 mb-6">Select whether you want fabric only or with tailoring services</p>
              
              <div className={`grid grid-cols-1 ${bookingData.selectedFabrics && bookingData.selectedFabrics.length > 1 ? '' : 'md:grid-cols-2'} gap-6`}>
                {/* Fabric Only Option */}
                <button
                  onClick={() => setBookingData(prev => ({ ...prev, serviceType: 'fabric-only' }))}
                  className={`relative p-6 border-3 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
                    bookingData.serviceType === 'fabric-only'
                      ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl'
                      : 'border-gray-200 hover:border-amber-300 hover:shadow-lg'
                  }`}
                >
                  {bookingData.serviceType === 'fabric-only' && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-white rounded-full p-1">
                      <FiCheck className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      bookingData.serviceType === 'fabric-only' ? 'bg-amber-100' : 'bg-gray-100'
                    }`}>
                      <FiShoppingBag className="h-8 w-8 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-xl mb-2 text-gray-900">Fabric Only</h4>
                      <p className="text-gray-600 text-sm mb-3">Purchase fabric without tailoring services</p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center">
                          <FiCheck className="mr-2 h-4 w-4 text-green-500" />
                          Quick delivery
                        </li>
                        <li className="flex items-center">
                          <FiCheck className="mr-2 h-4 w-4 text-green-500" />
                          No measurements needed
                        </li>
                        <li className="flex items-center">
                          <FiCheck className="mr-2 h-4 w-4 text-green-500" />
                          Lower cost
                        </li>
                      </ul>
                    </div>
                  </div>
                </button>
                
                {/* Fabric + Tailoring Option - Only show for single fabric */}
                {(!bookingData.selectedFabrics || bookingData.selectedFabrics.length <= 1) && (
                  <button
                    onClick={() => setBookingData(prev => ({ ...prev, serviceType: 'fabric-tailor' }))}
                    className={`relative p-6 border-3 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
                      bookingData.serviceType === 'fabric-tailor'
                        ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl'
                        : 'border-gray-200 hover:border-amber-300 hover:shadow-lg'
                    }`}
                  >
                    {bookingData.serviceType === 'fabric-tailor' && (
                      <div className="absolute top-3 right-3 bg-amber-500 text-white rounded-full p-1">
                        <FiCheck className="h-5 w-5" />
                      </div>
                    )}
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        bookingData.serviceType === 'fabric-tailor' ? 'bg-amber-100' : 'bg-gray-100'
                      }`}>
                        <FiScissors className="h-8 w-8 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl mb-2 text-gray-900">Fabric + Tailoring</h4>
                        <p className="text-gray-600 text-sm mb-3">Get custom tailoring with your fabric</p>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li className="flex items-center">
                            <FiCheck className="mr-2 h-4 w-4 text-green-500" />
                            Custom design options
                          </li>
                          <li className="flex items-center">
                            <FiCheck className="mr-2 h-4 w-4 text-green-500" />
                            Expert tailors
                          </li>
                          <li className="flex items-center">
                            <FiCheck className="mr-2 h-4 w-4 text-green-500" />
                            Perfect fit guaranteed
                          </li>
                        </ul>
                      </div>
                    </div>
                  </button>
                )}
                
                {/* Info message when multiple fabrics prevent tailoring */}
                {bookingData.selectedFabrics && bookingData.selectedFabrics.length > 1 && (
                  <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <FiShoppingBag className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900 mb-2">Multiple Fabrics Detected</h4>
                        <p className="text-sm text-blue-800">
                          You have {bookingData.selectedFabrics.length} different fabrics selected. Tailoring services require a single fabric selection, so only "Fabric Only" purchase is available.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Service type selection indicator */}
              {bookingData.serviceType && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 flex items-center">
                    <FiCheck className="mr-2 h-4 w-4" />
                    You've selected: <strong className="ml-1">
                      {bookingData.serviceType === 'fabric-only' ? 'Fabric Only' : 'Fabric + Tailoring'}
                    </strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "Select Design":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Design</h2>
              <p className="text-gray-600">Browse our curated collection — each design shows its recommended fabrics</p>
            </div>
            
            {/* Design Type is always predefined now */}
            
            {/* Predefined Design Selection */}
            <div className="space-y-6">
              <DesignSelection 
                onDesignSelect={(design) => {
                  console.log('🎨 Selected design in booking flow:', design);
                  
                  // Direct garment type mapping
                  const GARMENT_TYPE_MAP = {
                    'kurta': 'mens-kurta', 'mens kurta': 'mens-kurta', 'ethnic kurta': 'mens-kurta',
                    'shirt': 'mens-shirt', 'casual shirt': 'mens-shirt', 't-shirt': 'mens-shirt', 'tshirt': 'mens-shirt',
                    'trousers': 'mens-trousers', 'pants': 'mens-trousers', 'shorts': 'mens-trousers',
                    'suit': 'mens-suit', 'blazer': 'mens-suit', 'business suit': 'mens-suit',
                    'blouse': 'womens-blouse', 'top': 'womens-blouse', 'evening blouse': 'womens-blouse',
                    'dress': 'womens-dress', 'gown': 'womens-dress', 'evening gown': 'womens-dress',
                    'frock': 'womens-dress', 'jumpsuit': 'womens-dress', 'party dress': 'womens-dress',
                    'lehenga': 'womens-lehenga', 'ghagra': 'womens-lehenga',
                    'saree': 'womens-saree-blouse', 'sari': 'womens-saree-blouse', 'saree blouse': 'womens-saree-blouse',
                  };

                  let normalizedGarmentType = design.garmentTypeCode || design.garmentType || '';
                  
                  if (!normalizedGarmentType || !Object.values(GARMENT_TYPE_MAP).includes(normalizedGarmentType)) {
                    const designGarmentType = (design.garmentType || '').toLowerCase().trim();
                    const designName = (design.name || '').toLowerCase().trim();
                    
                    normalizedGarmentType = GARMENT_TYPE_MAP[designGarmentType]
                      || GARMENT_TYPE_MAP[designName]
                      || Object.entries(GARMENT_TYPE_MAP).find(([key]) => 
                          designGarmentType.includes(key) || designName.includes(key)
                        )?.[1]
                      || 'mens-kurta';
                  }
                  
                  setBookingData(prev => ({ 
                    ...prev, 
                    selectedDesign: design,
                    designType: 'predefined',
                    garmentType: normalizedGarmentType
                  }));
                }}
                selectedDesignId={bookingData.selectedDesign?._id}
                initialCategory={(() => {
                  try {
                    const userData = JSON.parse(localStorage.getItem('user') || '{}');
                    return userData.gender === 'male' ? 'Men' : (userData.gender === 'female' ? 'Women' : 'all');
                  } catch { return 'all'; }
                })()}
              />
              
              {bookingData.selectedDesign && (
                <div className="bg-white rounded-lg shadow-md p-6 border-2 border-amber-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Selected Design
                    </h3>
                    <button
                      onClick={() => setBookingData(prev => ({ ...prev, selectedDesign: null }))}
                      className="text-sm text-amber-600 hover:text-amber-800 transition-colors"
                    >
                      Change Selection
                    </button>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <img
                      src={bookingData.selectedDesign.image || (bookingData.selectedDesign.images && bookingData.selectedDesign.images[0])}
                      alt={bookingData.selectedDesign.name}
                      className="w-24 h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/96x128?text=Design+Image';
                      }}
                    />
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {bookingData.selectedDesign.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {bookingData.selectedDesign.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-gray-500">
                        <span className="capitalize bg-gray-100 px-2 py-1 rounded">{bookingData.selectedDesign.category}</span>
                        <span className="capitalize bg-gray-100 px-2 py-1 rounded">{bookingData.selectedDesign.difficulty}</span>
                        {bookingData.selectedDesign.price && (
                          <span className="font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                            ₹{bookingData.selectedDesign.price}
                          </span>
                        )}
                      </div>
                      
                      {bookingData.selectedDesign.preferredFabrics && bookingData.selectedDesign.preferredFabrics.length > 0 && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center">
                            <FiPackage className="mr-1 h-3 w-3" /> Recommended Fabrics to Use
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {bookingData.selectedDesign.preferredFabrics.map((fabric, i) => (
                              <span key={i} className="bg-white border border-amber-300 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                {fabric}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {bookingData.selectedDesign.sizeCriteria && bookingData.selectedDesign.sizeCriteria.length > 0 && (
                        <div className="mt-2 text-xs text-blue-600">
                          Sizes: {bookingData.selectedDesign.sizeCriteria.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "Choose Tailor":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Your Tailor</h2>
              <p className="text-gray-600">Choose from our verified and experienced tailors</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTailors.map((tailor) => (
                <div
                  key={tailor._id}
                  className={`bg-white rounded-lg shadow-md border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                    bookingData.tailorId === tailor._id
                      ? "border-amber-500 shadow-lg"
                      : "border-gray-200"
                  }`}
                  onClick={() => setBookingData(prev => ({ ...prev, tailorId: tailor._id }))}
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <FiScissors className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{tailor.shopName}</h3>
                        <p className="text-gray-600">{tailor.firstname} {tailor.lastname}</p>
                      </div>
                    </div>
                    
                    {/* <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2">
                        <FiStar className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">{tailor.rating}/5.0</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiClock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{tailor.experience} years experience</span>
                      </div>
                    </div> */}
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-amber-600">{tailor.services[0]?.price}</span>
                        {bookingData.tailorId === tailor._id && (
                          <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm font-medium">
                            Selected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "Measurements":
        // If we have a selected design with measurement requirements, show enhanced form
        if (bookingData.selectedDesign && bookingData.selectedDesign.measurementDetails && bookingData.selectedDesign.measurementDetails.length > 0) {
          // Ensure enhanced form active flag is set
          if (!isEnhancedFormActive) setIsEnhancedFormActive(true);
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Measurements</h2>
                <p className="text-gray-600">Provide your measurements for the selected design</p>
              </div>

              <EnhancedMeasurementForm
                design={bookingData.selectedDesign}
                onMeasurementSubmit={async (measurementData, savedMeasurement) => {
                  console.log('📋 Measurements submitted:', measurementData);
                  console.log('💾 Saved measurement:', savedMeasurement);
                  
                  // Update booking data with measurements
                  setBookingData(prev => ({
                    ...prev,
                    measurementId: savedMeasurement?._id || savedMeasurement?.id || null,
                    customMeasurements: measurementData
                  }));
                  
                  // Trigger estimation (pass garmentType explicitly)
                  const currentGarmentType = bookingData.garmentType;
                  console.log("📏 Triggering fabric estimation, garmentType:", currentGarmentType);
                  await fetchFabricEstimate(measurementData, currentGarmentType);
                  
                  // Deactivate enhanced form flag, then advance
                  setIsEnhancedFormActive(false);
                  setCurrentStep(prev => prev + 1);
                  saveBookingProgress();
                }}
                onCancel={() => {
                  setIsEnhancedFormActive(false);
                  setShowEnhancedMeasurementForm(false);
                  // Go back to design selection
                  setCurrentStep(3); // Design selection step
                }}
              />
            </div>
          );
        }
        // Reset flag if we fall through to the simple form
        if (isEnhancedFormActive) setIsEnhancedFormActive(false);

        // Fallback to simple measurement selection for designs without specific requirements
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Measurements</h2>
              <p className="text-gray-600">Select your measurements or use AI to generate them</p>
            </div>

            {/* AI Measurement Option */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FiCamera className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI Body Measurement</h3>
                    <p className="text-sm text-gray-600">Get accurate measurements using AI technology</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIMeasurement(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <FiCamera className="w-4 h-4" />
                  <span>Start AI Measurement</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {measurements.map((measurement) => (
                <div
                  key={measurement._id}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    bookingData.measurementId === measurement._id
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                   onClick={() => {
                    setBookingData(prev => ({ ...prev, measurementId: measurement._id }));
                    // Trigger estimation using the selected measurement's data
                    if (measurement.measurements) {
                        fetchFabricEstimate(measurement.measurements, bookingData.garmentType);
                    }
                  }}
                >
                  <h3 className="font-semibold text-lg mb-2">{measurement.measurementName}</h3>
                  <div className="space-y-1">
                    {Object.entries(measurement.measurements || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm text-gray-600">
                        <span className="capitalize">{key}:</span>
                        <span>{value}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* AI Measurement Modal */}
            {showAIMeasurement && (
              <AIMeasurementCapture
                onMeasurementsGenerated={(measurements, savedMeasurement) => {
                  if (savedMeasurement) {
                    // Refresh measurements list
                    fetchInitialData();
                    setBookingData(prev => ({ 
                      ...prev, 
                      measurementId: savedMeasurement._id || savedMeasurement.id 
                    }));
                    // Trigger estimation
                    fetchFabricEstimate(measurements, bookingData.garmentType);
                  }
                  setShowAIMeasurement(false);
                }}
                onClose={() => setShowAIMeasurement(false)}
                customerId={null} // TODO: Get from auth context when available
              />
            )}
          </div>
        );

      case "Delivery Address":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Delivery Address</h2>
              <p className="text-gray-600">Choose an address for delivery</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => navigate('/customer/addresses')}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
              >
                Manage Addresses
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    bookingData.addressId === addr._id
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setBookingData(prev => ({ ...prev, addressId: addr._id, deliveryAddress: addr }))}
                >
                  <div className="flex items-start space-x-3">
                    <FiMapPin className="mt-1 h-5 w-5 text-amber-600" />
                    <div>
                      <div className="font-semibold text-gray-900">{addr.addressLine || addr.name || 'Address'}</div>
                      <div className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</div>
                      {addr.isDefault && (
                        <div className="mt-1 inline-block text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Default</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "Confirm Order":
        console.log("Confirm Order Data:", bookingData); // Debug log
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Confirm Your Order</h2>
              <p className="text-gray-600">Review all details before placing your order</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* Fabric-Only Specific Summary */}
                {bookingData.serviceType === 'fabric-only' ? (
                  <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-100">
                    <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
                      <FiShoppingBag className="mr-3 h-6 w-6 text-amber-600" />
                      Fabric Purchase Summary
                    </h3>
                    
                    {/* Fabric Details - Show all fabrics if multiple, otherwise show single */}
                    {bookingData.selectedFabrics && bookingData.selectedFabrics.length > 0 ? (
                      <div className="space-y-4 mb-6">
                        {bookingData.selectedFabrics.map((fabric, index) => (
                          <div key={index} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
                            <div className="flex flex-col md:flex-row gap-6">
                              <img
                                src={fabric.image || '/placeholder-fabric.jpg'}
                                alt={fabric.name}
                                className="w-full md:w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white"
                              />
                              <div className="flex-1">
                                <h4 className="text-xl font-bold text-gray-900 mb-2">{fabric.name}</h4>
                                <div className="bg-white rounded-lg p-3 border border-amber-200 inline-block mb-3">
                                  <div className="text-sm text-gray-600">Price per meter</div>
                                  <div className="text-2xl font-bold text-amber-600">₹{fabric.price}</div>
                                </div>
                                <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-amber-200">
                                  <div>
                                    <div className="text-sm text-gray-600">Quantity</div>
                                    <div className="text-xl font-bold text-gray-900">{fabric.quantity} <span className="text-base text-gray-600">meters</span></div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-gray-600">Subtotal</div>
                                    <div className="text-xl font-bold text-amber-600">₹{(fabric.price * fabric.quantity).toLocaleString()}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : selectedFabric && (
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 mb-6 border border-amber-200">
                        <div className="flex flex-col md:flex-row gap-6">
                          <img
                            src={(Array.isArray(selectedFabric.images) && (selectedFabric.images[0]?.url || selectedFabric.images[0])) || selectedFabric.image || '/placeholder-fabric.jpg'}
                            alt={selectedFabric.name}
                            className="w-full md:w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white"
                          />
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedFabric.name}</h4>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                                {selectedFabric.color}
                              </span>
                              <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                                {selectedFabric.category}
                              </span>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-amber-200 inline-block">
                              <div className="text-sm text-gray-600">Price per meter</div>
                              <div className="text-2xl font-bold text-amber-600">₹{selectedFabric.price}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Quantity Display */}
                    <div className="bg-white rounded-lg p-6 border-2 border-gray-200 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Quantity Ordered</div>
                          <div className="text-3xl font-bold text-gray-900">
                            {(() => {
                              // Calculate total quantity from all fabrics
                              if (bookingData.selectedFabrics && bookingData.selectedFabrics.length > 0) {
                                return bookingData.selectedFabrics.reduce((sum, fabric) => sum + fabric.quantity, 0);
                              }
                              return bookingData.quantity || 0;
                            })()} <span className="text-xl text-gray-600">meters</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 mb-1">Total Fabric Cost</div>
                          <div className="text-3xl font-bold text-amber-600">
                            ₹{(() => {
                              // Calculate total cost from all fabrics
                              if (bookingData.selectedFabrics && bookingData.selectedFabrics.length > 0) {
                                return bookingData.selectedFabrics.reduce((sum, fabric) => sum + (fabric.price * fabric.quantity), 0).toLocaleString();
                              }
                              return (bookingData.fabricCost || 0).toLocaleString();
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Service Type Badge */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 flex items-center">
                        <FiCheck className="mr-2 h-5 w-5" />
                        <strong>Fabric Only Purchase</strong> - No tailoring services included
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Fabric-Tailor Summary */
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                    <div className="space-y-4">
                      {/* Fabric Requirement Card for Tailor Flow */}
                      {bookingData.estimationDetails ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <FiScissors className="text-blue-600 h-5 w-5" />
                            <h3 className="text-lg font-bold text-gray-900">Fabric Requirement</h3>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                              <span className="block text-gray-500">Selected Garment</span>
                              <span className="font-semibold text-gray-900">
                                {bookingData.garmentType ? bookingData.garmentType.charAt(0).toUpperCase() + bookingData.garmentType.slice(1) : 'Standard'}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-500">Selected Size</span>
                              <span className="font-semibold text-gray-900 bg-blue-100 px-2 py-0.5 rounded text-blue-800">
                                {bookingData.estimationDetails.selectedSize}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-500">Fabric Required</span>
                              <span className="font-bold text-lg text-blue-700">
                                {bookingData.estimationDetails.finalMeters} meters
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-500">Fabric Width</span>
                              <span className="font-semibold text-gray-900">
                                {bookingData.estimationDetails.fabricWidth || 44}"
                              </span>
                            </div>
                          </div>

                        </div>
                      ) : selectedFabric && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <h4 className="font-semibold text-gray-800 mb-2">{selectedFabric.name}</h4>
                          <div className="text-sm text-gray-600">
                            <div>Quantity: {bookingData.quantity || 1} meters</div>
                          </div>
                        </div>
                      )}

                      {/* Tailoring Details */}
                      <div>
                        <h4 className="font-medium">Tailoring Service</h4>
                        <div className="flex justify-between text-sm text-gray-600 ml-4">
                          <span>{selectedTailor?.shopName}</span>
                          <span>₹{selectedTailor?.services[0]?.price || 0}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Design</h4>
                        <div className="text-sm text-gray-600 ml-4">
                          {bookingData.designType === 'custom' ? (
                            <div>
                              <div>Custom Design</div>
                              {bookingData.designInstructions && (
                                <div className="mt-1 text-xs text-gray-500">
                                  "{bookingData.designInstructions.substring(0, 50)}..."
                                </div>
                              )}
                            </div>
                          ) : bookingData.selectedDesign ? (
                            <div>
                              <div>Predefined Design: {bookingData.selectedDesign.name}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {bookingData.selectedDesign.category} • {bookingData.selectedDesign.difficulty}
                              </div>
                              {bookingData.selectedDesign.sizeCriteria && bookingData.selectedDesign.sizeCriteria.length > 0 && (
                                <div className="text-xs text-blue-600 mt-1">
                                  Size criteria: {bookingData.selectedDesign.sizeCriteria.join(', ')}
                                </div>
                              )}
                            </div>
                          ) : (
                            'No design selected'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4">Order Total</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Fabric Cost:</span>
                      <span>₹{(() => {
                        // Calculate total from all fabrics if selectedFabrics exists
                        if (bookingData.selectedFabrics && bookingData.selectedFabrics.length > 0) {
                          return bookingData.selectedFabrics.reduce((sum, fabric) => sum + (fabric.price * fabric.quantity), 0);
                        }
                        return bookingData.fabricCost || 0;
                      })()}</span>
                    </div>
                    {bookingData.serviceType === 'fabric-tailor' && (
                      <div className="flex justify-between">
                        <span>Tailoring Cost:</span>
                        <span>₹{bookingData.tailoringCost}</span>
                      </div>
                    )}
                    {bookingData.selectedDesign && bookingData.selectedDesign.price && (
                      <div className="flex justify-between">
                        <span>Design Cost:</span>
                        <span>₹{bookingData.selectedDesign.price}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span>₹100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{(() => {
                        // Calculate fabric cost from all fabrics
                        const fabricCost = bookingData.selectedFabrics && bookingData.selectedFabrics.length > 0
                          ? bookingData.selectedFabrics.reduce((sum, fabric) => sum + (fabric.price * fabric.quantity), 0)
                          : (bookingData.fabricCost || 0);
                        const tailoringCost = bookingData.serviceType === 'fabric-tailor' ? (bookingData.tailoringCost || 0) : 0;
                        const designCost = bookingData.selectedDesign?.price || 0;
                        const deliveryFee = 100;
                        return fabricCost + tailoringCost + designCost + deliveryFee;
                      })()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (5%):</span>
                      <span>₹{(() => {
                        // Calculate fabric cost from all fabrics
                        const fabricCost = bookingData.selectedFabrics && bookingData.selectedFabrics.length > 0
                          ? bookingData.selectedFabrics.reduce((sum, fabric) => sum + (fabric.price * fabric.quantity), 0)
                          : (bookingData.fabricCost || 0);
                        const tailoringCost = bookingData.serviceType === 'fabric-tailor' ? (bookingData.tailoringCost || 0) : 0;
                        const designCost = bookingData.selectedDesign?.price || 0;
                        const deliveryFee = 100;
                        const subtotal = fabricCost + tailoringCost + designCost + deliveryFee;
                        return Math.round(subtotal * 0.05);
                      })()}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>₹{(() => {
                          // Calculate fabric cost from all fabrics
                          const fabricCost = bookingData.selectedFabrics && bookingData.selectedFabrics.length > 0
                            ? bookingData.selectedFabrics.reduce((sum, fabric) => sum + (fabric.price * fabric.quantity), 0)
                            : (bookingData.fabricCost || 0);
                          const tailoringCost = bookingData.serviceType === 'fabric-tailor' ? (bookingData.tailoringCost || 0) : 0;
                          const designCost = bookingData.selectedDesign?.price || 0;
                          const deliveryFee = 100;
                          const subtotal = fabricCost + tailoringCost + designCost + deliveryFee;
                          const tax = Math.round(subtotal * 0.05);
                          return subtotal + tax;
                        })()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4">Delivery Address</h3>
                  {bookingData.deliveryAddress && bookingData.deliveryAddress._id ? (
                    <div className="text-sm text-gray-700">
                      <div className="font-medium">{bookingData.deliveryAddress.addressLine || 'Address'}</div>
                      <div>{bookingData.deliveryAddress.city}, {bookingData.deliveryAddress.state} - {bookingData.deliveryAddress.pincode}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No address selected. Please go back and select an address.</div>
                  )}
                </div>
                
                <div className="w-full">
                  {paymentCompleted ? (
                    <div className="w-full py-3 px-6 rounded-lg font-semibold bg-green-100 text-green-800 border border-green-200 text-center">
                      ✅ Payment Completed
                    </div>
                  ) : (
                    <button 
                      onClick={initiatePayment}
                      disabled={isPaying}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${isPaying ? 'bg-amber-300 text-white' : 'bg-amber-600 text-white hover:bg-amber-700'}`}
                    >
                      {isPaying ? 'Processing...' : 'Pay Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={navigate} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                      currentStep > step.id
                        ? "bg-amber-600 border-amber-600 text-white"
                        : currentStep === step.id
                        ? "bg-amber-100 border-amber-600 text-amber-600"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <FiCheck className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? "text-gray-900" : "text-gray-400"
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? "bg-amber-600" : "bg-gray-300"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
          ) : (
            <>
              {renderStepContent()}

              {/* Navigation Buttons — hidden when EnhancedMeasurementForm manages its own flow */}
              {!isEnhancedFormActive && (
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <div>
                  {currentStep > 1 && (
                    <button
                      onClick={handlePrevious}
                      className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <FiArrowLeft className="mr-2" />
                      Back
                    </button>
                  )}
                </div>
                
                <div className="flex space-x-4">
                  {currentStep < steps.length && (
                    <button
                      onClick={handleNext}
                      className="flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Next
                      <FiArrowRight className="ml-2" />
                    </button>
                  )}
                </div>
              </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BookingFlow;
