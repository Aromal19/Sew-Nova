import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FiHome, 
  FiGrid, 
  FiShoppingBag, 
  FiLogIn,
  FiUserPlus,
  FiMenu,
  FiX,
  FiShield,
  FiUser
} from "react-icons/fi";
import HeaderImage from "../assets/Header.png";

const stats = [
  { number: "10K+", label: "Happy Customers" },
  { number: "500+", label: "Expert Tailors" },
  { number: "1000+", label: "Premium Fabrics" },
  { number: "24/7", label: "Support" },
];

const features = [
  {
    title: "Custom Tailoring",
    description: "Get outfits tailored to your unique style and measurements with our expert tailors.",
    icon: "🧵",
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "Premium Fabrics",
    description: "Choose from a curated selection of high-quality fabrics sourced globally.",
    icon: "🪡",
    color: "from-emerald-500 to-teal-600",
  },
  {
    title: "Fast Delivery",
    description: "Enjoy quick turnaround times and reliable doorstep delivery for every order.",
    icon: "🚚",
    color: "from-orange-500 to-amber-600",
  },
  {
    title: "Sustainable Fashion",
    description: "We prioritize eco-friendly practices and materials for a greener tomorrow.",
    icon: "🌱",
    color: "from-green-500 to-emerald-600",
  },
];

const testimonials = [
  {
    name: "Ava Patel",
    role: "Fashion Designer",
    quote: "Sew Nova transformed my wardrobe! The fit and quality are unmatched. I've never felt more confident in my clothes.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
  },
  {
    name: "Liam Chen",
    role: "Business Executive",
    quote: "I love the sustainable options and the fast delivery. The attention to detail is incredible. Highly recommended!",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
  },
  {
    name: "Sophia Garcia",
    role: "Entrepreneur",
    quote: "The custom tailoring service is a game changer. I feel so confident in my new clothes! Worth every penny.",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 5,
  },
];

const tailors = [
  {
    name: "James Smith",
    location: "New Delhi",
    rating: 4.8,
    experience: "15 years",
    speciality: "Formal Wear",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Ananya Rao",
    location: "Mumbai",
    rating: 4.9,
    experience: "12 years",
    speciality: "Bridal Wear",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Farbeic Ali",
    location: "Chennai",
    rating: 4.7,
    experience: "18 years",
    speciality: "Casual Wear",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
  },
];

const fabricVendors = [
  {
    name: "Premium Cotton Co.",
    location: "Ahmedabad",
    rating: 4.6,
    speciality: "Organic Cotton",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "Silk Paradise",
    location: "Varanasi",
    rating: 4.8,
    speciality: "Pure Silk",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "Wool Masters",
    location: "Srinagar",
    rating: 4.7,
    speciality: "Kashmiri Wool",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=center",
  },
];

const renderStars = (rating) => {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`text-lg ${i < rating ? "text-yellow-400" : "text-gray-300"}`}>
      ★
    </span>
  ));
};

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Handle scroll effect and active section
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      
      // Update active section based on scroll position
      const sections = ['home', 'workflow', 'features', 'tailors', 'vendors'];
      const scrollPosition = window.scrollY + 100;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const navItems = [
    { key: "home", label: "Home", icon: FiHome, href: "#home" },
    { key: "workflow", label: "How It Works", icon: FiGrid, href: "#workflow" },
    { key: "features", label: "Features", icon: FiShield, href: "#features" },
    { key: "tailors", label: "Tailors", icon: FiUser, href: "#tailors" },
    { key: "vendors", label: "Vendors", icon: FiShoppingBag, href: "#vendors" },
  ];

  const isActive = (sectionKey) => activeSection === sectionKey;

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

     return (
           <div className="min-h-screen bg-gradient-to-br from-white via-[#f2f29d]/20 to-white">
      {/* Integrated Navbar */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#000714]/95 backdrop-blur-md shadow-2xl border-b border-gray-800/50' 
          : 'bg-[#000714]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-amber-400/25 transition-all duration-300">
                  <span className="text-[#000714] font-bold text-sm">S</span>
                </div>
                <span className="text-white font-bold text-lg ml-3 group-hover:text-amber-400 transition-colors duration-300">
                  SewNova
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-1">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  const active = isActive(item.key);
                  
                  return (
                    <button
                      key={item.key}
                      onClick={() => scrollToSection(item.key)}
                      className={`group relative flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                        active 
                          ? 'bg-amber-500/20 text-white shadow-lg border border-amber-500/30' 
                          : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      {/* Active indicator */}
                      {active && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
                      )}
                      
                      {/* Icon */}
                      <IconComponent 
                        className={`text-lg mr-2 transition-all duration-300 ${
                          active ? 'text-amber-400' : 'group-hover:text-amber-400'
                        }`} 
                      />
                      
                      {/* Label */}
                      <span className={active ? 'text-white' : 'text-gray-300'}>
                        {item.label}
                      </span>
                      
                      {/* Hover effect */}
                      <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                        active 
                          ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5' 
                          : 'bg-gradient-to-r from-gray-800/0 to-gray-800/0 group-hover:from-gray-800/20 group-hover:to-gray-800/10'
                      }`}></div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right side buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                to="/login"
                className="group flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300"
              >
                <FiLogIn className="text-lg group-hover:text-amber-400 transition-colors duration-300 mr-2" />
                <span className="text-sm font-medium">Sign In</span>
              </Link>
              <Link
                to="/signup"
                className="group flex items-center px-4 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-[#000714] rounded-lg text-sm font-semibold hover:from-amber-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-amber-400/25"
              >
                <FiUserPlus className="text-lg mr-2" />
                <span>Sign Up</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="group flex items-center justify-center p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <FiX className="block h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <FiMenu className="block h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-4 pt-2 pb-4 space-y-2 bg-[#000714] border-t border-gray-800">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.key);
              
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    scrollToSection(item.key);
                    setIsMenuOpen(false);
                  }}
                  className={`group flex items-center w-full px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                    active 
                      ? 'bg-amber-500/20 text-white shadow-lg border border-amber-500/30' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-amber-400 to-orange-500 rounded-r-full"></div>
                  )}
                  
                  {/* Icon */}
                  <IconComponent 
                    className={`text-xl mr-3 transition-all duration-300 ${
                      active ? 'text-amber-400' : 'group-hover:text-amber-400'
                    }`} 
                  />
                  
                  {/* Label */}
                  <span className={active ? 'text-white' : 'text-gray-300'}>
                    {item.label}
                  </span>
                </button>
              );
            })}
            
            {/* Mobile auth buttons */}
            <div className="pt-4 pb-2 border-t border-gray-800 space-y-2">
              <Link
                to="/login"
                className="group flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiLogIn className="text-lg group-hover:text-amber-400 transition-colors duration-300 mr-3" />
                <span className="text-sm font-medium">Sign In</span>
              </Link>
              <Link
                to="/signup"
                className="group flex items-center px-4 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-[#000714] rounded-lg text-sm font-semibold hover:from-amber-500 hover:to-orange-600 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiUserPlus className="text-lg mr-3" />
                <span>Sign Up</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16">
                 {/* Hero Section */}
         <section id="home" className="relative bg-gradient-to-br from-[#000714] via-[#011336] to-[#000714] text-white py-20 px-8 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
          </div>
          
          <div className="relative max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="text-center lg:text-left">
                <div className="mb-8">
                  <span className="inline-block px-4 py-2 bg-amber-400 text-blue-900 rounded-full text-sm font-semibold mb-4">
                    ✨ Premium Custom Tailoring Platform
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
                  Craft Your Perfect
                  <br />
                  <span className="text-white">Style Story</span>
                </h1>
                
                <p className="text-xl mb-10 text-gray-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Experience the future of fashion with expert tailors, premium fabrics, and sustainable choices. 
                  Your style, your way.
                </p>
                
                                 <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                   <Link 
                     to="/customer/signup" 
                     className="group relative px-8 py-4 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-amber-400/50 transition-all duration-500 transform hover:scale-110 overflow-hidden"
                   >
                     <span className="relative z-10">Start Your Journey</span>
                     <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   </Link>
                   <button 
                     onClick={() => scrollToSection('features')}
                     className="group relative px-8 py-4 border-2 border-white text-white rounded-2xl font-bold text-lg hover:bg-white hover:text-[#000714] transition-all duration-500 transform hover:scale-110 overflow-hidden backdrop-blur-sm"
                   >
                     <span className="relative z-10">Explore Services</span>
                     <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   </button>
                 </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto lg:mx-0">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-2">{stat.number}</div>
                      <div className="text-gray-300 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Header Image */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <img 
                    src={HeaderImage} 
                    alt="SewNova Header" 
                    className="w-full max-w-lg h-auto rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                  />
                  {/* Optional overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

                          {/* How It Works Section */}
         <section id="workflow" className="py-20 px-8 bg-[#f2f29d]/10">
           <div className="max-w-6xl mx-auto">
             <div className="text-center mb-16">
               <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-white font-semibold text-sm mb-6 shadow-lg">
                 <span className="mr-2">✨</span>
                 Simple 4-Step Process
               </div>
               <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                 How <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">SewNova</span> Works
               </h2>
               <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                 Experience seamless custom tailoring with our streamlined process designed for perfection
               </p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               <div className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 border border-gray-100 overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                 <div className="relative z-10 text-center">
                   <div className="w-20 h-20 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-amber-400/50 transition-all duration-700 transform group-hover:rotate-12">
                     <span className="text-3xl font-bold text-white">1</span>
                   </div>
                   <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-gray-900 transition-colors duration-300">Choose Your Style</h3>
                   <p className="text-gray-600 leading-relaxed">Browse our curated collection and select your preferred style from our extensive catalog</p>
                 </div>
               </div>
               
               <div className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 border border-gray-100 overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                 <div className="relative z-10 text-center">
                   <div className="w-20 h-20 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-amber-400/50 transition-all duration-700 transform group-hover:rotate-12">
                     <span className="text-3xl font-bold text-white">2</span>
                   </div>
                   <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-gray-900 transition-colors duration-300">Select Premium Fabric</h3>
                   <p className="text-gray-600 leading-relaxed">Choose from our handpicked selection of premium fabrics sourced from around the world</p>
                 </div>
               </div>
               
               <div className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 border border-gray-100 overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                 <div className="relative z-10 text-center">
                   <div className="w-20 h-20 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-amber-400/50 transition-all duration-700 transform group-hover:rotate-12">
                     <span className="text-3xl font-bold text-white">3</span>
                   </div>
                   <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-gray-900 transition-colors duration-300">Expert Measurement</h3>
                   <p className="text-gray-600 leading-relaxed">Our master tailors take precise measurements ensuring the perfect fit for your body</p>
                 </div>
               </div>
               
               <div className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 border border-gray-100 overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                 <div className="relative z-10 text-center">
                   <div className="w-20 h-20 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-amber-400/50 transition-all duration-700 transform group-hover:rotate-12">
                     <span className="text-3xl font-bold text-white">4</span>
                   </div>
                   <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-gray-900 transition-colors duration-300">Perfect Delivery</h3>
                   <p className="text-gray-600 leading-relaxed">Receive your impeccably crafted custom outfit delivered right to your doorstep</p>
                 </div>
               </div>
             </div>
           </div>
         </section>

                          {/* Features Section */}
         <section id="features" className="py-20 px-8 bg-[#f2f29d]/10">
           <div className="max-w-6xl mx-auto">
             <div className="text-center mb-16">
               <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-white font-semibold text-sm mb-6 shadow-lg">
                 <span className="mr-2">⭐</span>
                 Premium Features
               </div>
               <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                 Why Choose <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">SewNova</span>?
               </h2>
               <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                 Experience the perfect blend of traditional craftsmanship and modern innovation in custom tailoring
               </p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {features.map((feature, index) => (
                 <div key={index} className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 border border-gray-100 overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                   <div className="relative z-10 text-center">
                     <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-2xl group-hover:shadow-xl transition-all duration-700 transform group-hover:rotate-12`}>
                       <span className="text-4xl">{feature.icon}</span>
                     </div>
                     <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-gray-900 transition-colors duration-300">{feature.title}</h3>
                     <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         </section>

                          {/* Tailors Section */}
         <section id="tailors" className="py-20 px-8 bg-[#f2f29d]/10">
           <div className="max-w-6xl mx-auto">
             <div className="text-center mb-16">
               <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full text-white font-semibold text-sm mb-6 shadow-lg">
                 <span className="mr-2">👔</span>
                 Master Artisans
               </div>
               <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                 Meet Our <span className="bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">Expert Tailors</span>
               </h2>
               <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                 Skilled master artisans with decades of experience in creating impeccable fits and timeless designs
               </p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
               {tailors.map((tailor, index) => (
                 <div key={index} className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 border border-gray-100 overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                   <div className="relative z-10 text-center">
                     <div className="relative mb-6">
                       <div className="w-28 h-28 rounded-3xl mx-auto mb-4 overflow-hidden shadow-2xl group-hover:shadow-purple-400/50 transition-all duration-700 transform group-hover:scale-110">
                         <img 
                           src={tailor.image} 
                           alt={tailor.name} 
                           className="w-full h-full object-cover"
                         />
                       </div>
                       <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                         <span className="text-white text-xs font-bold">★</span>
                       </div>
                     </div>
                     <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-gray-900 transition-colors duration-300">{tailor.name}</h3>
                     <p className="text-gray-600 mb-3 font-medium">{tailor.location}</p>
                     <div className="flex justify-center mb-3">
                       {renderStars(tailor.rating)}
                     </div>
                     <p className="text-sm text-gray-500 mb-4">{tailor.rating} rating</p>
                     <div className="space-y-2 bg-gray-50 rounded-2xl p-4">
                       <div className="flex justify-between items-center">
                         <span className="text-gray-600 font-medium">Experience:</span>
                         <span className="text-purple-600 font-bold">{tailor.experience}</span>
                       </div>
                       <div className="flex justify-between items-center">
                         <span className="text-gray-600 font-medium">Speciality:</span>
                         <span className="text-purple-600 font-bold">{tailor.speciality}</span>
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>

             <div className="text-center">
               <Link 
                 to="/tailor/signup" 
                 className="group relative inline-flex items-center px-10 py-5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-400/50 transition-all duration-700 transform hover:scale-110 overflow-hidden"
               >
                 <span className="relative z-10 mr-3">Join as a Tailor</span>
                 <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
               </Link>
             </div>
           </div>
         </section>

                          {/* Vendors Section */}
         <section id="vendors" className="py-20 px-8 bg-[#f2f29d]/10">
           <div className="max-w-6xl mx-auto">
             <div className="text-center mb-16">
               <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full text-white font-semibold text-sm mb-6 shadow-lg">
                 <span className="mr-2">🏭</span>
                 Premium Suppliers
               </div>
               <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                 Premium <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">Fabric Vendors</span>
               </h2>
               <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                 Partner with the world's finest fabric suppliers for exceptional quality materials and sustainable sourcing
               </p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
               {fabricVendors.map((vendor, index) => (
                 <div key={index} className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 border border-gray-100 overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                   <div className="relative z-10 text-center">
                     <div className="relative mb-6">
                       <div className="w-28 h-28 rounded-3xl mx-auto mb-4 overflow-hidden shadow-2xl group-hover:shadow-emerald-400/50 transition-all duration-700 transform group-hover:scale-110">
                         <img 
                           src={vendor.image} 
                           alt={vendor.name} 
                           className="w-full h-full object-cover"
                         />
                       </div>
                       <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                         <span className="text-white text-xs font-bold">★</span>
                       </div>
                     </div>
                     <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-gray-900 transition-colors duration-300">{vendor.name}</h3>
                     <p className="text-gray-600 mb-3 font-medium">{vendor.location}</p>
                     <div className="flex justify-center mb-3">
                       {renderStars(vendor.rating)}
                     </div>
                     <p className="text-sm text-gray-500 mb-4">{vendor.rating} rating</p>
                     <div className="bg-emerald-50 rounded-2xl p-4">
                       <div className="flex justify-between items-center">
                         <span className="text-gray-600 font-medium">Speciality:</span>
                         <span className="text-emerald-600 font-bold">{vendor.speciality}</span>
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>

             <div className="text-center">
               <Link 
                 to="/seller/signup" 
                 className="group relative inline-flex items-center px-10 py-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-emerald-400/50 transition-all duration-700 transform hover:scale-110 overflow-hidden"
               >
                 <span className="relative z-10 mr-3">Join as a Vendor</span>
                 <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
               </Link>
             </div>
           </div>
         </section>

                          {/* Testimonials Section */}
         <section className="py-20 px-8 bg-[#f2f29d]/10">
           <div className="max-w-6xl mx-auto">
             <div className="text-center mb-16">
               <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full text-white font-semibold text-sm mb-6 shadow-lg">
                 <span className="mr-2">💬</span>
                 Customer Stories
               </div>
               <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                 What Our <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">Customers Say</span>
               </h2>
               <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                 Real stories from satisfied customers who transformed their style and confidence with SewNova
               </p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {testimonials.map((testimonial, index) => (
                 <div key={index} className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 border border-gray-100 overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                   <div className="relative z-10">
                     <div className="flex items-center mb-6">
                       <div className="relative">
                         <div className="w-20 h-20 rounded-3xl mr-4 overflow-hidden shadow-2xl group-hover:shadow-rose-400/50 transition-all duration-700 transform group-hover:scale-110">
                           <img 
                             src={testimonial.avatar} 
                             alt={testimonial.name} 
                             className="w-full h-full object-cover"
                           />
                         </div>
                         <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                           <span className="text-white text-xs">★</span>
                         </div>
                       </div>
                       <div>
                         <h3 className="text-lg font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">{testimonial.name}</h3>
                         <p className="text-gray-600 font-medium">{testimonial.role}</p>
                       </div>
                     </div>
                     <div className="flex mb-4">
                       {renderStars(testimonial.rating)}
                     </div>
                     <div className="bg-gray-50 rounded-2xl p-4">
                       <p className="text-gray-700 leading-relaxed italic">"{testimonial.quote}"</p>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         </section>

                 {/* Newsletter Section */}
         <section className="py-20 px-8 bg-gradient-to-br from-[#000714] via-[#011336] to-[#000714] text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Stay Updated with <span className="bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">SewNova</span>
            </h2>
            <p className="text-xl mb-8 text-gray-200">
              Get the latest fashion trends, exclusive offers, and styling tips delivered to your inbox
            </p>
                         <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
               <input
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="Enter your email"
                 className="flex-1 px-6 py-4 rounded-2xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-lg"
                 required
               />
               <button
                 type="submit"
                 className="group relative px-8 py-4 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white rounded-2xl font-bold shadow-2xl hover:shadow-amber-400/50 transition-all duration-500 transform hover:scale-110 overflow-hidden"
               >
                 <span className="relative z-10">Subscribe</span>
                 <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               </button>
             </form>
          </div>
        </section>

                 {/* Footer */}
         <footer className="bg-[#000714] text-white py-16 px-8">
           <div className="max-w-6xl mx-auto">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               <div>
                 <div className="flex items-center mb-4">
                   <div className="w-10 h-10 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                     <span className="text-white font-bold text-sm">S</span>
                   </div>
                   <span className="text-white font-bold text-xl ml-3">SewNova</span>
                 </div>
                 <p className="text-gray-300 mb-4 leading-relaxed">
                   Transforming fashion through custom tailoring and sustainable practices.
                 </p>
               </div>
               <div>
                 <h3 className="text-lg font-bold mb-4 text-amber-400">Services</h3>
                 <ul className="space-y-3 text-gray-300">
                   <li className="hover:text-amber-400 transition-colors duration-300 cursor-pointer">Custom Tailoring</li>
                   <li className="hover:text-amber-400 transition-colors duration-300 cursor-pointer">Fabric Selection</li>
                   <li className="hover:text-amber-400 transition-colors duration-300 cursor-pointer">Style Consultation</li>
                   <li className="hover:text-amber-400 transition-colors duration-300 cursor-pointer">Alterations</li>
                 </ul>
               </div>
               <div>
                 <h3 className="text-lg font-bold mb-4 text-amber-400">Company</h3>
                 <ul className="space-y-3 text-gray-300">
                   <li className="hover:text-amber-400 transition-colors duration-300 cursor-pointer">About Us</li>
                   <li className="hover:text-amber-400 transition-colors duration-300 cursor-pointer">Our Tailors</li>
                   <li className="hover:text-amber-400 transition-colors duration-300 cursor-pointer">Fabric Vendors</li>
                   <li className="hover:text-amber-400 transition-colors duration-300 cursor-pointer">Contact</li>
                 </ul>
               </div>
               <div>
                 <h3 className="text-lg font-bold mb-4 text-amber-400">Support</h3>
                 <ul className="space-y-3 text-gray-300">
                   <li className="hover:text-amber-400 transition-colors duration-300 cursor-pointer">Help Center</li>
                   <li className="hover:text-amber-400 transition-colors duration-300 cursor-pointer">Size Guide</li>
                   <li className="hover:text-amber-400 transition-colors duration-300 cursor-pointer">Shipping Info</li>
                   <li className="hover:text-amber-400 transition-colors duration-300 cursor-pointer">Returns</li>
                 </ul>
               </div>
             </div>
             <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
               <p>&copy; 2024 SewNova. All rights reserved.</p>
             </div>
           </div>
         </footer>
      </div>
    </div>
  );
  };
  
  export default LandingPage; 