const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Tailor = require('./src/models/Tailor');

const sampleTailors = [
  {
    firstname: 'Arjun',
    lastname: 'Mehta',
    email: 'arjun.mehta@sewnova.com',
    phone: '9811001001',
    shopName: 'Mehta Tailors & Co.',
    experience: 12,
    specialization: ['Kurta', 'Sherwani', 'Pathani Suit', 'Formal Shirt'],
    address: '24, Nehru Market, Chandni Chowk',
    pincode: '110006',
    district: 'Central Delhi',
    state: 'Delhi',
    country: 'India',
    isVerified: true,
    rating: 4.8,
    totalOrders: 340,
    services: [{ name: 'Custom Tailoring', price: 350 }]
  },
  {
    firstname: 'Priya',
    lastname: 'Sharma',
    email: 'priya.sharma@sewnova.com',
    phone: '9822002002',
    shopName: "Priya's Boutique",
    experience: 8,
    specialization: ['Anarkali Suit', 'Lehenga', 'Saree Blouse', 'Salwar Kameez'],
    address: '7, Linking Road, Bandra West',
    pincode: '400050',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    country: 'India',
    isVerified: true,
    rating: 4.9,
    totalOrders: 520,
    services: [{ name: 'Custom Tailoring', price: 420 }]
  },
  {
    firstname: 'Suresh',
    lastname: 'Iyer',
    email: 'suresh.iyer@sewnova.com',
    phone: '9944003003',
    shopName: 'Iyer Master Tailors',
    experience: 20,
    specialization: ['Business Suit', 'Blazer', 'Formal Trousers', 'Men\'s Shirt'],
    address: '15, Commercial Street',
    pincode: '560001',
    district: 'Bangalore Urban',
    state: 'Karnataka',
    country: 'India',
    isVerified: true,
    rating: 4.7,
    totalOrders: 890,
    services: [{ name: 'Custom Tailoring', price: 500 }]
  },
  {
    firstname: 'Fatima',
    lastname: 'Khan',
    email: 'fatima.khan@sewnova.com',
    phone: '9833004004',
    shopName: "Khan's Heritage Wear",
    experience: 15,
    specialization: ['Sherwani', 'Pathani Suit', 'Bridal Lehenga', 'Anarkali'],
    address: '3, Charminar Road, Old City',
    pincode: '500002',
    district: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    isVerified: true,
    rating: 4.9,
    totalOrders: 660,
    services: [{ name: 'Custom Tailoring', price: 480 }]
  },
  {
    firstname: 'Rajesh',
    lastname: 'Nair',
    email: 'rajesh.nair@sewnova.com',
    phone: '9895005005',
    shopName: 'Nair Fashion House',
    experience: 10,
    specialization: ['Dhoti Kurta', 'Mundu', 'Nehru Jacket', 'Casual Shirt'],
    address: '8, MG Road, Ernakulam',
    pincode: '682001',
    district: 'Ernakulam',
    state: 'Kerala',
    country: 'India',
    isVerified: true,
    rating: 4.6,
    totalOrders: 275,
    services: [{ name: 'Custom Tailoring', price: 300 }]
  },
  {
    firstname: 'Meena',
    lastname: 'Gupta',
    email: 'meena.gupta@sewnova.com',
    phone: '9755006006',
    shopName: "Meena's Designer Studio",
    experience: 7,
    specialization: ['Party Gown', 'A-Line Dress', 'Pencil Skirt', 'Crop Top'],
    address: '56, Civil Lines',
    pincode: '302001',
    district: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    isVerified: true,
    rating: 4.7,
    totalOrders: 200,
    services: [{ name: 'Custom Tailoring', price: 380 }]
  },
  {
    firstname: 'Vikram',
    lastname: 'Patel',
    email: 'vikram.patel@sewnova.com',
    phone: '9979007007',
    shopName: 'Patel Stitch & Style',
    experience: 5,
    specialization: ['Casual Shirt', 'Linen Trousers', 'Hoodie', 'T-Shirt'],
    address: '22, Law Garden',
    pincode: '380009',
    district: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    isVerified: true,
    rating: 4.4,
    totalOrders: 130,
    services: [{ name: 'Custom Tailoring', price: 260 }]
  },
  {
    firstname: 'Anitha',
    lastname: 'Reddy',
    email: 'anitha.reddy@sewnova.com',
    phone: '9866008008',
    shopName: "Anitha's Ethnic Creations",
    experience: 13,
    specialization: ['Saree Blouse', 'Churidar Suit', 'Salwar Kameez', 'Anarkali'],
    address: '9, Jubilee Hills',
    pincode: '500033',
    district: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    isVerified: true,
    rating: 4.8,
    totalOrders: 440,
    services: [{ name: 'Custom Tailoring', price: 360 }]
  },
  {
    firstname: 'Karan',
    lastname: 'Singh',
    email: 'karan.singh@sewnova.com',
    phone: '9855009009',
    shopName: 'Singh Bridal & Formal',
    experience: 18,
    specialization: ['Sherwani', 'Wedding Suit', 'Achkan', 'Nehru Jacket'],
    address: '4, Karol Bagh Market',
    pincode: '110005',
    district: 'West Delhi',
    state: 'Delhi',
    country: 'India',
    isVerified: true,
    rating: 4.9,
    totalOrders: 750,
    services: [{ name: 'Custom Tailoring', price: 600 }]
  },
  {
    firstname: 'Kavya',
    lastname: 'Menon',
    email: 'kavya.menon@sewnova.com',
    phone: '9747010010',
    shopName: "Kavya's Couture",
    experience: 9,
    specialization: ['Bridal Lehenga', 'Party Gown', 'Cocktail Dress', 'Saree Blouse'],
    address: '17, Indiranagar 100 Feet Road',
    pincode: '560038',
    district: 'Bangalore Urban',
    state: 'Karnataka',
    country: 'India',
    isVerified: true,
    rating: 4.8,
    totalOrders: 320,
    services: [{ name: 'Custom Tailoring', price: 450 }]
  }
];

const seedTailors = async () => {
  try {
    console.log('🌱 Starting tailor seeding process...');

    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Hash a default password for all seed tailors
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Tailor@123', salt);

    let created = 0;
    let skipped = 0;

    for (const tailorData of sampleTailors) {
      const exists = await Tailor.findOne({ email: tailorData.email });
      if (exists) {
        console.log(`⏭️  Skipping (already exists): ${tailorData.shopName}`);
        skipped++;
        continue;
      }

      const tailor = new Tailor({
        ...tailorData,
        password: hashedPassword,
        isEmailVerified: true,
        countryCode: '+91'
      });

      await tailor.save();
      console.log(`✅ Created: ${tailorData.shopName} (${tailorData.state})`);
      created++;
    }

    console.log('\n📊 Tailor Seeding Summary:');
    console.log(`   Created : ${created}`);
    console.log(`   Skipped : ${skipped}`);
    console.log(`   Total   : ${sampleTailors.length}`);
    console.log('\n🎉 Tailor seeding completed!');
    console.log('   Default password for all tailors: Tailor@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding tailors:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedTailors();
}

module.exports = { sampleTailors, seedTailors };
