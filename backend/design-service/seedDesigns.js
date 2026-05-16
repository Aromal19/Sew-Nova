const mongoose = require('mongoose');
require('dotenv').config();

const Design = require('./models/design');

// Comprehensive design data with gender, garmentType, preferred fabrics
const sampleDesigns = [
  // ─── MEN'S DESIGNS ──────────────────────────────────────────────────────────
  {
    name: "Classic Men's Kurta",
    category: "Men",
    garmentType: "mens-kurta",
    images: ["/assets/designs/sketch.png"],
    description: "Traditional Indian kurta with full sleeves and mandarin collar. Perfect for festivals and casual occasions.",
    price: 150,
    difficulty: "intermediate",
    estimatedTime: 4,
    tags: ["ethnic", "traditional", "casual"],
    requiredMeasurements: ["chest", "waist", "shoulder_width", "sleeve_length", "height"],
    preferredFabrics: ["Cotton", "Linen", "Khadi", "Silk Cotton"],
    sizeCriteria: ["S", "M", "L", "XL", "XXL"]
  },
  {
    name: "Men's Formal Shirt",
    category: "Men",
    garmentType: "mens-shirt",
    images: ["/assets/designs/sketch.png"],
    description: "Crisp formal shirt with button-down collar. Ideal for office and business meetings.",
    price: 120,
    difficulty: "intermediate",
    estimatedTime: 5,
    tags: ["formal", "office", "business"],
    requiredMeasurements: ["neck", "chest", "waist", "shoulder_width", "sleeve_length", "height"],
    preferredFabrics: ["Cotton", "Poplin", "Oxford Cloth", "Linen"],
    sizeCriteria: ["S", "M", "L", "XL", "XXL"]
  },
  {
    name: "Men's Pathani Suit",
    category: "Men",
    garmentType: "mens-kurta",
    images: ["/assets/designs/sketch.png"],
    description: "Elegant Pathani-style suit with side pockets and traditional detailing. Great for festive occasions.",
    price: 280,
    difficulty: "advanced",
    estimatedTime: 7,
    tags: ["ethnic", "festive", "traditional"],
    requiredMeasurements: ["chest", "waist", "shoulder_width", "sleeve_length", "height"],
    preferredFabrics: ["Khadi", "Linen", "Silk", "Cotton Blend"],
    sizeCriteria: ["S", "M", "L", "XL", "XXL"]
  },
  {
    name: "Men's Business Suit",
    category: "Men",
    garmentType: "mens-suit",
    images: ["/assets/designs/sketch.png"],
    description: "Two-piece tailored business suit with sharp lapels. The ultimate professional statement.",
    price: 580,
    difficulty: "advanced",
    estimatedTime: 12,
    tags: ["formal", "office", "business"],
    requiredMeasurements: ["chest", "waist", "shoulder_width", "sleeve_length", "height", "inseam"],
    preferredFabrics: ["Wool", "Wool Blend", "Polyester Blend", "Serge"],
    sizeCriteria: ["S", "M", "L", "XL", "XXL"]
  },
  {
    name: "Men's Casual Linen Trousers",
    category: "Men",
    garmentType: "mens-trousers",
    images: ["/assets/designs/sketch.png"],
    description: "Relaxed-fit linen trousers perfect for summer outings and casual settings.",
    price: 95,
    difficulty: "beginner",
    estimatedTime: 3,
    tags: ["casual", "western", "beach"],
    requiredMeasurements: ["waist", "hip", "inseam", "height"],
    preferredFabrics: ["Linen", "Cotton", "Linen Cotton Blend"],
    sizeCriteria: ["28", "30", "32", "34", "36", "38"]
  },
  {
    name: "Men's Festive Sherwani",
    category: "Men",
    garmentType: "mens-suit",
    images: ["/assets/designs/sketch.png"],
    description: "Majestic sherwani with intricate embroidery. Perfect for weddings and grand celebrations.",
    price: 850,
    difficulty: "advanced",
    estimatedTime: 15,
    tags: ["bridal", "wedding", "festive"],
    requiredMeasurements: ["chest", "waist", "shoulder_width", "sleeve_length", "height"],
    preferredFabrics: ["Silk", "Brocade", "Velvet", "Sherwani Fabric"],
    sizeCriteria: ["S", "M", "L", "XL", "XXL"]
  },
  {
    name: "Men's Nehru Jacket",
    category: "Men",
    garmentType: "mens-suit",
    images: ["/assets/designs/sketch.png"],
    description: "Classic Nehru collar jacket that pairs with kurta or western shirts. Timeless Indo-western style.",
    price: 220,
    difficulty: "intermediate",
    estimatedTime: 6,
    tags: ["ethnic", "fusion", "festive"],
    requiredMeasurements: ["chest", "waist", "shoulder_width", "height"],
    preferredFabrics: ["Silk", "Cotton Silk", "Linen", "Brocade"],
    sizeCriteria: ["S", "M", "L", "XL", "XXL"]
  },
  {
    name: "Men's Dhoti Kurta Set",
    category: "Men",
    garmentType: "mens-kurta",
    images: ["/assets/designs/sketch.png"],
    description: "Traditional dhoti with matching kurta. The go-to outfit for religious ceremonies and cultural events.",
    price: 180,
    difficulty: "intermediate",
    estimatedTime: 5,
    tags: ["traditional", "ethnic", "festive"],
    requiredMeasurements: ["waist", "chest", "shoulder_width", "height"],
    preferredFabrics: ["Cotton", "Silk", "Khadi"],
    sizeCriteria: ["S", "M", "L", "XL"]
  },

  // ─── WOMEN'S DESIGNS ─────────────────────────────────────────────────────────
  {
    name: "Women's Anarkali Suit",
    category: "Women",
    garmentType: "womens-dress",
    images: ["/assets/designs/sketch.png"],
    description: "Floor-length Anarkali suit with flared skirt and rich embroidery. Breathtaking at any ceremony.",
    price: 380,
    difficulty: "advanced",
    estimatedTime: 10,
    tags: ["ethnic", "festive", "bridal"],
    requiredMeasurements: ["chest", "waist", "hip", "shoulder_width", "sleeve_length", "height"],
    preferredFabrics: ["Georgette", "Chiffon", "Silk", "Net"],
    sizeCriteria: ["XS", "S", "M", "L", "XL"]
  },
  {
    name: "Women's Salwar Kameez",
    category: "Women",
    garmentType: "womens-blouse",
    images: ["/assets/designs/sketch.png"],
    description: "Classic salwar kameez with dupatta. Comfortable and versatile for everyday wear and casual occasions.",
    price: 165,
    difficulty: "intermediate",
    estimatedTime: 5,
    tags: ["casual", "ethnic", "traditional"],
    requiredMeasurements: ["chest", "waist", "hip", "shoulder_width", "sleeve_length", "height"],
    preferredFabrics: ["Cotton", "Rayon", "Georgette", "Silk Cotton"],
    sizeCriteria: ["XS", "S", "M", "L", "XL", "XXL"]
  },
  {
    name: "Women's Bridal Lehenga",
    category: "Women",
    garmentType: "womens-lehenga",
    images: ["/assets/designs/sketch.png"],
    description: "Opulent bridal lehenga with heavy zardozi embroidery and a flared skirt. The dream wedding outfit.",
    price: 1200,
    difficulty: "advanced",
    estimatedTime: 20,
    tags: ["bridal", "wedding", "festive"],
    requiredMeasurements: ["chest", "waist", "hip", "shoulder_width", "height"],
    preferredFabrics: ["Silk", "Velvet", "Brocade", "Net", "Satin"],
    sizeCriteria: ["XS", "S", "M", "L", "XL"]
  },
  {
    name: "Saree Blouse",
    category: "Women",
    garmentType: "womens-saree-blouse",
    images: ["/assets/designs/sketch.png"],
    description: "Custom-tailored saree blouse with back design and sleeve options. Perfect fit guaranteed.",
    price: 85,
    difficulty: "intermediate",
    estimatedTime: 3,
    tags: ["traditional", "ethnic", "wedding"],
    requiredMeasurements: ["chest", "waist", "shoulder_width", "sleeve_length"],
    preferredFabrics: ["Silk", "Brocade", "Cotton Silk", "Net"],
    sizeCriteria: ["XS", "S", "M", "L", "XL"]
  },
  {
    name: "Women's Pencil Skirt",
    category: "Women",
    garmentType: "womens-dress",
    images: ["/assets/designs/sketch.png"],
    description: "Fitted knee-length pencil skirt perfect for office wear and formal occasions.",
    price: 110,
    difficulty: "intermediate",
    estimatedTime: 4,
    tags: ["formal", "office", "western"],
    requiredMeasurements: ["waist", "hip", "height"],
    preferredFabrics: ["Crepe", "Wool Blend", "Polyester", "Cotton Blend"],
    sizeCriteria: ["XS", "S", "M", "L", "XL"]
  },
  {
    name: "Women's A-Line Dress",
    category: "Women",
    garmentType: "womens-dress",
    images: ["/assets/designs/sketch.png"],
    description: "Flowy A-line dress with a fitted bodice. Flattering silhouette for all body types.",
    price: 195,
    difficulty: "intermediate",
    estimatedTime: 6,
    tags: ["casual", "western", "party"],
    requiredMeasurements: ["chest", "waist", "hip", "shoulder_width", "height"],
    preferredFabrics: ["Cotton", "Linen", "Rayon", "Chiffon"],
    sizeCriteria: ["XS", "S", "M", "L", "XL"]
  },
  {
    name: "Women's Formal Blazer",
    category: "Women",
    garmentType: "womens-blouse",
    images: ["/assets/designs/sketch.png"],
    description: "Tailored women's blazer with structured shoulders. A power suit essential for the modern professional.",
    price: 280,
    difficulty: "advanced",
    estimatedTime: 8,
    tags: ["formal", "office", "western"],
    requiredMeasurements: ["chest", "waist", "shoulder_width", "sleeve_length", "height"],
    preferredFabrics: ["Wool Blend", "Polyester", "Cotton Blend", "Tweed"],
    sizeCriteria: ["XS", "S", "M", "L", "XL"]
  },
  {
    name: "Women's Churidar Suit",
    category: "Women",
    garmentType: "womens-blouse",
    images: ["/assets/designs/sketch.png"],
    description: "Fitted churidar suit with kameez and matching dupatta. Elegant and comfortable for daily wear.",
    price: 145,
    difficulty: "beginner",
    estimatedTime: 4,
    tags: ["ethnic", "casual", "traditional"],
    requiredMeasurements: ["chest", "waist", "hip", "shoulder_width", "sleeve_length", "height"],
    preferredFabrics: ["Cotton", "Rayon", "Silk Cotton"],
    sizeCriteria: ["XS", "S", "M", "L", "XL", "XXL"]
  },
  {
    name: "Women's Party Gown",
    category: "Women",
    garmentType: "womens-dress",
    images: ["/assets/designs/sketch.png"],
    description: "Floor-length evening gown with an elegant silhouette. Steal the show at any party.",
    price: 420,
    difficulty: "advanced",
    estimatedTime: 10,
    tags: ["formal", "party", "evening"],
    requiredMeasurements: ["chest", "waist", "hip", "shoulder_width", "height"],
    preferredFabrics: ["Satin", "Silk", "Chiffon", "Net", "Taffeta"],
    sizeCriteria: ["XS", "S", "M", "L", "XL"]
  },
  {
    name: "Women's Crop Top",
    category: "Women",
    garmentType: "womens-blouse",
    images: ["/assets/designs/sketch.png"],
    description: "Trendy cropped blouse that pairs with sarees, skirts, or palazzos. Modern and stylish.",
    price: 75,
    difficulty: "beginner",
    estimatedTime: 2,
    tags: ["casual", "western", "fusion"],
    requiredMeasurements: ["chest", "waist", "shoulder_width"],
    preferredFabrics: ["Cotton", "Linen", "Georgette", "Crepe"],
    sizeCriteria: ["XS", "S", "M", "L", "XL"]
  },

  // ─── UNISEX DESIGNS ──────────────────────────────────────────────────────────
  {
    name: "Unisex Linen Shirt",
    category: "Unisex",
    garmentType: "mens-shirt",
    images: ["/assets/designs/sketch.png"],
    description: "Relaxed-fit premium linen shirt in natural tones. Effortlessly cool for beach and casual events.",
    price: 130,
    difficulty: "beginner",
    estimatedTime: 3,
    tags: ["casual", "beach", "western"],
    requiredMeasurements: ["chest", "shoulder_width", "sleeve_length", "height"],
    preferredFabrics: ["Linen", "Cotton Linen", "Natural Linen"],
    sizeCriteria: ["XS", "S", "M", "L", "XL", "XXL"]
  },
  {
    name: "Unisex Hoodie",
    category: "Unisex",
    garmentType: "mens-shirt",
    images: ["/assets/designs/sketch.png"],
    description: "Cozy unisex hoodie with kangaroo pocket. The ultimate comfort wear for all seasons.",
    price: 165,
    difficulty: "intermediate",
    estimatedTime: 5,
    tags: ["casual", "sports", "western"],
    requiredMeasurements: ["chest", "shoulder_width", "sleeve_length", "height"],
    preferredFabrics: ["Fleece", "Cotton Fleece", "Sweatshirt Fabric", "French Terry"],
    sizeCriteria: ["XS", "S", "M", "L", "XL", "XXL"]
  }
];

// Connect to MongoDB and seed data
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting comprehensive design seeding process...');

    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing designs
    await Design.deleteMany({});
    console.log('🗑️  Cleared existing designs');

    // Insert sample designs
    const createdDesigns = await Design.insertMany(sampleDesigns);
    console.log(`✅ Successfully seeded ${createdDesigns.length} designs`);

    const men = createdDesigns.filter(d => d.category === 'Men').length;
    const women = createdDesigns.filter(d => d.category === 'Women').length;
    const unisex = createdDesigns.filter(d => d.category === 'Unisex').length;

    console.log('\n📊 Seeding Summary:');
    console.log(`   Total designs : ${createdDesigns.length}`);
    console.log(`   Men's designs : ${men}`);
    console.log(`   Women's designs: ${women}`);
    console.log(`   Unisex designs: ${unisex}`);

    console.log('\n🎉 Design seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding designs:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { sampleDesigns, seedDatabase };
