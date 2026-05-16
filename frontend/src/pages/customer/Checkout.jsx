import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiCheck, 
  FiScissors, 
  FiShoppingBag,
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
  FiArrowLeft,
  FiArrowRight,
  FiPackage,
  FiUser,
  FiCreditCard,
  FiLock,
  FiTruck,
} from "react-icons/fi";
import { useCart } from "../../context/CartContext";

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

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totals } = useCart();
  const [choice, setChoice] = useState("fabric"); // enforce fabric-only for cart-level checkout

  const fabrics = useMemo(() => items.filter((it) => it.type === "fabric"), [items]);

  const handleContinue = () => {
    if (choice === "fabric") {
      // For fabric-only: pass all fabrics to booking flow
      navigate("/customer/booking-flow", { 
        state: { 
          fabrics: fabrics.map(f => ({
            id: f.id,
            name: f.name,
            price: f.price,
            quantity: f.quantity || 1,
            image: f.image
          })),
          serviceType: 'fabric-only'
        } 
      });
    } else if (choice === "fabric_tailor") {
      // For fabric + tailoring: only works with single fabric
      if (fabrics.length === 1) {
        navigate("/customer/booking-flow", { 
          state: { 
            fabricId: fabrics[0].id,
            serviceType: 'fabric-tailor',
            quantity: fabrics[0].quantity || 1
          } 
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={navigate} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600 text-lg">Complete your order and choose your service</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                {fabrics.map((fabric) => (
                  <div key={fabric.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        {fabric.image ? (
                          <img src={fabric.image} alt={fabric.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <FiShoppingBag className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{fabric.name}</h3>
                        <p className="text-sm text-gray-600">Quantity: {fabric.quantity || 1}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-gray-900">
                        ₹{(fabric.price || 0) * (fabric.quantity || 1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Subtotal</span>
                  <span className="text-amber-600">₹{totals.total}</span>
                </div>
              </div>
            </div>

            {/* Service Selection */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Choose Your Service</h2>
              
              <div className={`grid grid-cols-1 ${fabrics.length === 1 ? 'md:grid-cols-2' : ''} gap-6`}>
                <button 
                  onClick={() => setChoice("fabric")} 
                  className={`p-6 border-2 rounded-lg text-left transition-all duration-200 ${
                    choice === "fabric" 
                      ? 'border-amber-500 bg-amber-50 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <FiShoppingBag className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Fabric Only</h3>
                      <p className="text-gray-600">Just the fabrics, no tailoring</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FiCheck className="w-4 h-4 mr-2 text-green-500" />
                      <span>Direct fabric purchase</span>
                    </div>
                    <div className="flex items-center">
                      <FiTruck className="w-4 h-4 mr-2 text-green-500" />
                      <span>Free shipping included</span>
                    </div>
                    <div className="flex items-center">
                      <FiLock className="w-4 h-4 mr-2 text-green-500" />
                      <span>Secure payment</span>
                    </div>
                  </div>
                </button>
                
                {/* Only show Fabric + Tailoring option when there's a single fabric */}
                {fabrics.length === 1 && (
                  <button 
                    onClick={() => setChoice("fabric_tailor")} 
                    className={`p-6 border-2 rounded-lg text-left transition-all duration-200 ${
                      choice === "fabric_tailor" 
                        ? 'border-amber-500 bg-amber-50 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <FiScissors className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Fabric + Tailoring</h3>
                        <p className="text-gray-600">Complete custom tailoring service</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FiUser className="w-4 h-4 mr-2 text-green-500" />
                        <span>Choose your tailor</span>
                      </div>
                      <div className="flex items-center">
                        <FiPackage className="w-4 h-4 mr-2 text-green-500" />
                        <span>Custom design options</span>
                      </div>
                      <div className="flex items-center">
                        <FiShield className="w-4 h-4 mr-2 text-green-500" />
                        <span>Professional measurements</span>
                      </div>
                    </div>
                  </button>
                )}
                
                {/* Show info message when multiple fabrics prevent tailoring */}
                {fabrics.length > 1 && (
                  <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <FiShoppingBag className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">Multiple Fabrics Detected</h3>
                        <p className="text-sm text-blue-800 mb-3">
                          You have {fabrics.length} different fabrics in your cart. Tailoring services require a single fabric selection.
                        </p>
                        <p className="text-sm text-blue-700">
                          <strong>Options:</strong>
                        </p>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4">
                          <li>• Continue with fabric-only purchase for all items</li>
                          <li>• Or remove items to select tailoring for one fabric</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Total & Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Order Total</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({fabrics.length} items)</span>
                  <span className="font-medium text-gray-900">₹{totals.subtotal}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">Free</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">₹0</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-semibold">
                    <span>Total</span>
                    <span className="text-amber-600">₹{totals.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button 
                onClick={handleContinue} 
                className="w-full px-6 py-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold text-lg flex items-center justify-center"
              >
                <FiCheck className="mr-2" />
                {choice === "fabric" ? "Complete Order" : "Continue to Tailor Selection"}
              </button>
              
              <button 
                onClick={() => navigate("/customer/cart")} 
                className="w-full px-6 py-3 bg-white text-amber-600 border-2 border-amber-600 rounded-lg hover:bg-amber-50 transition-colors font-semibold flex items-center justify-center"
              >
                <FiArrowLeft className="mr-2" />
                Back to Cart
              </button>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <FiLock className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Secure Checkout</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Your payment information is encrypted and secure.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;

