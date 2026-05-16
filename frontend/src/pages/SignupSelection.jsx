import React from "react";
import { Link } from "react-router-dom";
import { FiUser, FiShoppingBag, FiScissors, FiArrowRight, FiLogIn } from "react-icons/fi";

const SignupSelection = () => {
  const signupOptions = [
    {
      title: "Customer",
      description: "Order custom clothing and browse premium fabrics",
      icon: FiUser,
      color: "amber",
      gradient: "from-amber-400 to-orange-500",
      bgPattern: "bg-amber-400",
      link: "/customer/signup",
      features: ["Browse premium fabrics", "Order custom clothing", "Track orders", "Manage profile"],
      subtitle: "Join SewNova"
    },
    {
      title: "Fabric Seller",
      description: "Sell your premium fabrics to customers and tailors",
      icon: FiShoppingBag,
      color: "emerald",
      gradient: "from-emerald-400 to-teal-500",
      bgPattern: "bg-emerald-400",
      link: "/seller/signup",
      features: ["List premium fabrics", "Manage inventory", "Track sales", "Business analytics"],
      subtitle: "Join as a Vendor"
    },
    {
      title: "Tailor",
      description: "Offer expert tailoring services to customers",
      icon: FiScissors,
      color: "purple",
      gradient: "from-purple-400 to-pink-500",
      bgPattern: "bg-purple-400",
      link: "/tailor/signup",
      features: ["Accept custom orders", "Manage portfolio", "Set rates", "Track earnings"],
      subtitle: "Join as a Tailor"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f2f29d]/20 to-white flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-72 h-72 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-[#000714] font-bold text-lg">S</span>
            </div>
            <span className="text-[#000714] font-bold text-2xl ml-3">SewNova</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Choose Your Account Type</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Select the type of account that best fits your needs and start your journey with SewNova</p>
        </div>

        {/* Signup Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {signupOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 border border-gray-100 overflow-hidden"
              >
                {/* Top gradient border */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${option.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700`}></div>
                
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${option.color}-50 via-white to-${option.color}-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700`}></div>
                
                <div className="relative z-10 p-8">
                  {/* Icon */}
                  <div className={`w-20 h-20 bg-gradient-to-r ${option.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-${option.color}-400/50 transition-all duration-700 transform group-hover:rotate-12`}>
                    <IconComponent className="text-3xl text-white" />
                  </div>

                  {/* Content */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors duration-300">{option.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">{option.description}</p>
                    
                    {/* Features */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">What you can do:</h4>
                      <ul className="space-y-2">
                        {option.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="text-sm text-gray-600 flex items-center justify-center">
                            <span className={`text-${option.color}-500 mr-2 text-lg`}>✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Button */}
                  <Link
                    to={option.link}
                    className={`w-full py-4 bg-gradient-to-r ${option.gradient} hover:from-${option.color}-500 hover:to-${option.color === 'amber' ? 'orange' : option.color === 'emerald' ? 'teal' : 'pink'}-600 text-white font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-${option.color}-400/50 transform hover:scale-105 text-sm`}
                  >
                    {option.subtitle}
                    <FiArrowRight className="ml-2 text-lg" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="text-center">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 max-w-md mx-auto">
            <p className="text-gray-600 mb-6 text-lg">Already have an account?</p>
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FiLogIn className="mr-3 text-lg" />
              Sign In
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link 
            to="/" 
            className="text-gray-500 hover:text-amber-500 transition-colors text-sm font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupSelection; 