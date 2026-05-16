import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FiArrowLeft, 
  FiHeart, 
  FiShare2, 
  FiShoppingCart, 
  FiStar, 
  FiTruck, 
  FiShield, 
  FiTag,
  FiPlus,
  FiMinus,
  FiCheck,
  FiX,
  FiImage,
  FiZoomIn,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail
} from "react-icons/fi";
import { apiCall } from "../../config/api";
import { useCart } from "../../context/CartContext";
import Sidebar from "../../components/Sidebar";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedTailor, setSelectedTailor] = useState(null);
  const [showTailorModal, setShowTailorModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { addFabricToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      
      const response = await apiCall('SELLER_SERVICE', `/api/public/products/${id}`, {
        method: 'GET'
      });
      
      if (response.success && response.data) {
        const productData = response.data;
        
        // Transform the data to match our component structure
        const transformedProduct = {
          _id: productData._id,
          name: productData.name,
          description: productData.description,
          category: productData.category,
          price: productData.price,
          pricePerUnit: productData.pricePerUnit || "per meter",
          color: productData.color,
          pattern: productData.pattern || "Solid",
          weight: productData.weight,
          width: productData.width,
          careInstructions: productData.careInstructions,
          images: productData.images ? productData.images.map(img => img.url || img) : [],
          stock: productData.stock || 0,
          tags: productData.tags || [],
          seller: {
            name: productData.seller?.name || "Unknown Seller",
            rating: productData.seller?.rating || 4.0,
            reviews: productData.seller?.reviews || 0,
            location: productData.seller?.location || "Location not specified"
          },
          rating: productData.rating?.average || 4.0,
          reviews: productData.rating?.count || 0,
          specifications: {
            material: productData.material || "Not specified",
            origin: productData.origin || "Not specified",
            finish: productData.finish || "Not specified",
            shrinkage: productData.shrinkage || "Not specified",
            colorfastness: productData.colorfastness || "Not specified"
          }
        };
        
        setProduct(transformedProduct);
      } else {
        setError("Product not found");
        console.error("Failed to fetch product:", response.message);
      }
    } catch (err) {
      setError("Failed to load product details");
      console.error("Error fetching product:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // TODO: API call to add/remove from wishlist
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addFabricToCart({ id: product._id, name: product.name, price: product.price, image: product.images?.[0], quantity });
    navigate('/customer/cart');
  };

  const handleSelectTailor = (tailor) => {
    setSelectedTailor(tailor);
    setShowTailorModal(false);
    // Navigate to booking flow
    navigate(`/customer/booking/create?productId=${id}&tailorId=${tailor._id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiX className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Not Found</h3>
            <p className="text-gray-600 mb-4">{error || "The product you're looking for doesn't exist."}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiShare2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleAddToWishlist}
                className={`p-2 rounded-lg transition-colors ${
                  isWishlisted 
                    ? 'text-red-500 bg-red-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <img
                src={product.images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${
                    selectedImageIndex === index 
                      ? 'border-amber-500' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{product.category}</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
              <span className="text-gray-600">/{product.pricePerUnit}</span>
              <div className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <FiTag className="w-4 h-4 mr-1" />
                In Stock ({product.stock} available)
              </div>
            </div>

            {/* Color and Pattern */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Color:</span>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: product.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{product.color}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Pattern:</span>
                <span className="text-sm text-gray-600">{product.pattern}</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500">meters</span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-medium hover:from-amber-500 hover:to-orange-600 transition-all duration-200"
              >
                <FiShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </button>
              <button
                onClick={handleAddToWishlist}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isWishlisted
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Seller Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{product.seller.name}</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{product.seller.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{product.seller.reviews} reviews</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiMapPin className="w-4 h-4 mr-1" />
                  {product.seller.location}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FiTruck className="w-4 h-4" />
                <span>Free delivery</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FiShield className="w-4 h-4" />
                <span>Quality guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button className="py-2 px-1 border-b-2 border-amber-500 text-amber-600 font-medium">
                Description
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Specifications
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Reviews
              </button>
            </nav>
          </div>

          <div className="py-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {showFullDescription ? product.description : product.description.substring(0, 200)}
                {product.description.length > 200 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="ml-2 text-amber-600 hover:text-amber-700 font-medium"
                  >
                    {showFullDescription ? 'Show less' : '...Read more'}
                  </button>
                )}
              </p>
            </div>

            {/* Specifications */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Fabric Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Material:</span>
                    <span className="text-gray-900">{product.specifications.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span className="text-gray-900">{product.weight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Width:</span>
                    <span className="text-gray-900">{product.width}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Origin:</span>
                    <span className="text-gray-900">{product.specifications.origin}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Care Instructions</h4>
                <p className="text-sm text-gray-700">{product.careInstructions}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tailor Selection Modal */}
      {showTailorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Select a Tailor</h2>
                <button
                  onClick={() => setShowTailorModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUser className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tailor Selection</h3>
                <p className="text-gray-600">
                  This will show available tailors who can work with this fabric.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Integration with tailor service coming soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ProductDetail;