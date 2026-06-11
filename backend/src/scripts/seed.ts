import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const JSON_DB_DIR = path.join(__dirname, '../../data');
const JSON_DB_PATH = path.join(JSON_DB_DIR, 'db.json');

const categories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Beauty & Wellness',
    slug: 'beauty-wellness',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'
  }
];

const products = [
  {
    title: 'AcoustiMax Wireless Headphones',
    description: 'Immersive sound quality with active hybrid noise cancellation (ANC), premium memory foam ear cushions, and up to 40 hours of continuous battery life. Features quick-charge support (10 mins charge = 5 hours playback) and high-fidelity Bluetooth 5.2 connectivity.',
    price: 8999,
    discountPrice: 6999,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80'
    ],
    category: 'Electronics',
    stock: 25,
    specifications: {
      'Driver Size': '40mm Dynamic',
      'Bluetooth Version': '5.2',
      'Battery Life': '40 Hours (ANC Off)',
      'Charging Port': 'USB Type-C',
      'Noise Cancellation': 'Active (ANC) up to 32dB'
    },
    ratingsAvg: 4.6,
    reviewCount: 3,
    bestSeller: true,
    featured: true
  },
  {
    title: 'Veloce Smart Fitness Watch v4',
    description: 'Track your health in real-time with optical heart-rate monitors, blood oxygen SPO2 trackers, and 24/7 sleep stage analyzers. IP68 certified water-resistant construction, responsive 1.78" AMOLED display, and built-in GPS mapping for run tracking.',
    price: 4999,
    discountPrice: 3499,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&auto=format&fit=crop&q=80'
    ],
    category: 'Electronics',
    stock: 50,
    specifications: {
      'Display Size': '1.78" AMOLED',
      'Water Resistance': 'IP68 (up to 1.5m for 30m)',
      'Sensors': 'SpO2, 3-Axis Heart Rate, Accelerometer',
      'GPS': 'Built-In (GPS, GLONASS)',
      'Battery Life': '7-10 Days Active Use'
    },
    ratingsAvg: 4.2,
    reviewCount: 2,
    bestSeller: false,
    featured: true
  },
  {
    title: 'AirCharge Pro 15W Wireless Pad',
    description: 'Ultra-thin QI-certified charging station with premium anodized aluminum frame and non-slip silicone pads. Automatically detects your device profile to deliver up to 15W of fast, stable charging power safely.',
    price: 1999,
    discountPrice: 1299,
    images: [
      'https://images.unsplash.com/photo-1622445262465-2481c4574875?w=800&auto=format&fit=crop&q=80'
    ],
    category: 'Electronics',
    stock: 3, // Low stock for inventory warnings testing
    specifications: {
      'Output Power': '5W / 7.5W / 10W / 15W',
      'Input Interface': 'USB Type-C',
      'Charging Efficiency': '> 80%',
      'Certifications': 'Qi, CE, FCC, RoHS'
    },
    ratingsAvg: 4.8,
    reviewCount: 1,
    bestSeller: false,
    featured: false
  },
  {
    title: 'UrbanFit Classic Denim Jacket',
    description: 'Timeless denim jacket tailored from premium organic cotton with a touch of stretch for day-long comfort. Features dual button-flap chest pockets, welt hand pockets, and adjustable waist buttons.',
    price: 3499,
    discountPrice: 2499,
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80'
    ],
    category: 'Fashion',
    stock: 40,
    specifications: {
      'Material': '98% Organic Cotton, 2% Elastane',
      'Fit': 'Regular Fit',
      'Care': 'Machine wash cold, tumble dry low',
      'Weight': 'Medium-weight denim'
    },
    ratingsAvg: 4.5,
    reviewCount: 2,
    bestSeller: true,
    featured: true
  },
  {
    title: 'Nomad Premium Leather Backpack',
    description: 'Handcrafted from full-grain vegetable-tanned leather, this travel backpack features a padded 16" laptop sleeve, internal organizers, and secret rear zipper pockets. Solid brass hardware ensures lifelong durability.',
    price: 12999,
    discountPrice: 8999,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80'
    ],
    category: 'Fashion',
    stock: 12,
    specifications: {
      'Material': 'Full-grain Vegetable Tanned Leather',
      'Laptop Compatibility': 'Up to 16" MacBook Pro',
      'Capacity': '22 Liters',
      'Dimensions': '18" x 12" x 6"'
    },
    ratingsAvg: 4.9,
    reviewCount: 2,
    bestSeller: true,
    featured: true
  },
  {
    title: 'Aura Premium Essential Oil Diffuser',
    description: 'Ultrasonic cool-mist aromatherapy diffuser with a natural bamboo wood base and custom hand-blown glass cover. Features 7 color-changing LED mood lights, continuous & intermittent misting modes, and auto-shutoff security.',
    price: 2999,
    discountPrice: 1999,
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519625073050-2815233885ab?w=800&auto=format&fit=crop&q=80'
    ],
    category: 'Home & Kitchen',
    stock: 35,
    specifications: {
      'Water Capacity': '300ml',
      'Coverage Area': 'up to 250 sq ft',
      'Mist Output': '30ml/hour',
      'Material': 'Bamboo Wood Base + Glass Cover',
      'Safety': 'Auto-Shutoff when dry'
    },
    ratingsAvg: 4.4,
    reviewCount: 2,
    bestSeller: false,
    featured: true
  },
  {
    title: 'Barista Classic Cold Brew Maker',
    description: 'Brew smooth, low-acid cold brew concentrate at home. Includes extra-thick borosilicate glass carafe, heavy-duty laser-cut stainless steel mesh filter, and airtight silicone cap seals to lock freshness up to two weeks.',
    price: 2499,
    discountPrice: 1699,
    images: [
      'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&auto=format&fit=crop&q=80'
    ],
    category: 'Home & Kitchen',
    stock: 4, // Low stock for testing
    specifications: {
      'Carafe Material': 'Borosilicate Glass',
      'Filter': 'Dual-mesh Stainless Steel',
      'Capacity': '1.5 Liters',
      'Dishwasher Safe': 'Yes, all parts'
    },
    ratingsAvg: 4.7,
    reviewCount: 2,
    bestSeller: true,
    featured: false
  },
  {
    title: 'GlowRx Organics Vitamin C Serum',
    description: 'Brighten skin tone, boost collagen synthesis, and neutralize free-radicals with our clinical-grade 15% Vitamin C serum, fortified with Hyaluronic Acid and Ferulic Acid. 100% vegan, cruelty-free, and organic formulation.',
    price: 1499,
    discountPrice: 999,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&auto=format&fit=crop&q=80'
    ],
    category: 'Beauty & Wellness',
    stock: 100,
    specifications: {
      'Active Ingredients': '15% L-Ascorbic Acid, Hyaluronic Acid, Vitamin E',
      'Skin Type': 'All Skin Types',
      'Volume': '30 ml / 1 fl. oz',
      'Scent': 'Unscented, Citrus Undertones'
    },
    ratingsAvg: 4.3,
    reviewCount: 2,
    bestSeller: true,
    featured: true
  }
];

const coupons = [
  {
    code: 'WELCOME10',
    discountType: 'PERCENT',
    discountValue: 10,
    minPurchase: 1000,
    expiryDate: new Date('2028-12-31T23:59:59Z'),
    active: true
  },
  {
    code: 'MEGA20',
    discountType: 'PERCENT',
    discountValue: 20,
    minPurchase: 3000,
    expiryDate: new Date('2028-12-31T23:59:59Z'),
    active: true
  },
  {
    code: 'FLAT500',
    discountType: 'FLAT',
    discountValue: 500,
    minPurchase: 4000,
    expiryDate: new Date('2028-12-31T23:59:59Z'),
    active: true
  }
];

const seedData = async () => {
  console.log('Starting database seeding...');
  
  // Encrypt passwords
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123', salt);

  const users = [
    {
      name: 'Default Administrator',
      email: 'admin@ecommerce.com',
      passwordHash,
      role: 'ADMIN',
      addresses: [
        {
          fullName: 'Suresh Kumar',
          street: '12th Main Road, Indiranagar',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560038',
          phone: '9876543210',
          isDefault: true
        }
      ],
      wishlist: []
    },
    {
      name: 'Default Customer',
      email: 'customer@ecommerce.com',
      passwordHash,
      role: 'CUSTOMER',
      addresses: [
        {
          fullName: 'Rohan Sharma',
          street: 'A-45, Phase 1, Sector 62',
          city: 'Noida',
          state: 'Uttar Pradesh',
          zipCode: '201301',
          phone: '9123456789',
          isDefault: true
        }
      ],
      wishlist: []
    }
  ];

  // 1. Seed to local JSON DB fallback file
  try {
    const localDbData = {
      users: users.map((u: any, i: number) => ({
        _id: `user_id_mock_${i + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...u
      })),
      categories: categories.map((c: any, i: number) => ({
        _id: `category_id_mock_${i + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...c
      })),
      products: products.map((p: any, i: number) => ({
        _id: `product_id_mock_${i + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...p
      })),
      coupons: coupons.map((cp: any, i: number) => ({
        _id: `coupon_id_mock_${i + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...cp
      })),
      orders: [] as any[],
      reviews: [
        {
          _id: 'rev_mock_1',
          productId: 'product_id_mock_1',
          userId: 'user_id_mock_2',
          username: 'Rohan Sharma',
          rating: 5,
          title: 'Unbelievable noise cancellation!',
          comment: 'The hybrid ANC on these headphones is absolute magic. I use them on train commutes and it blocks out everything. Audio signature is balanced and rich.',
          createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
        },
        {
          _id: 'rev_mock_2',
          productId: 'product_id_mock_1',
          userId: 'user_id_mock_1',
          username: 'Suresh Kumar',
          rating: 4,
          title: 'Very comfortable, slightly bass-heavy',
          comment: 'Perfect memory foam padding for long coding sessions. The battery runs forever. Equalizer settings are default bass-boosted, but you can tune it.',
          createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
        }
      ]
    };

    if (!fs.existsSync(JSON_DB_DIR)) {
      fs.mkdirSync(JSON_DB_DIR, { recursive: true });
    }
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(localDbData, null, 2));
    console.log('✔ Local db.json seeded successfully!');
  } catch (err) {
    console.error('✘ Error seeding local JSON DB:', err);
  }

  // 2. Seed to MongoDB if connection string exists
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      console.log('Connecting to MongoDB to seed database...');
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log('MongoDB connection established.');

      // Clear collections
      await mongoose.connection.db?.dropDatabase();
      console.log('Cleared existing database tables.');

      // Import models dynamically to prevent loading errors
      const User = require('../models/User').default;
      const Product = require('../models/Product').default;
      const Category = require('../models/Category').default;
      const Coupon = require('../models/Coupon').default;
      const Review = require('../models/Review').default;

      // Seed Users
      const createdUsers = await User.insertMany(users);
      console.log(`✔ Imported ${createdUsers.length} users into MongoDB.`);

      // Seed Categories
      const createdCategories = await Category.insertMany(categories);
      console.log(`✔ Imported ${createdCategories.length} categories into MongoDB.`);

      // Seed Products (map ID matching categories)
      const createdProducts = await Product.insertMany(products);
      console.log(`✔ Imported ${createdProducts.length} products into MongoDB.`);

      // Seed Coupons
      const createdCoupons = await Coupon.insertMany(coupons);
      console.log(`✔ Imported ${createdCoupons.length} coupons into MongoDB.`);

      // Seed Reviews
      const customer = createdUsers.find((u: any) => u.role === 'CUSTOMER');
      const admin = createdUsers.find((u: any) => u.role === 'ADMIN');
      const headset = createdProducts.find((p: any) => p.title.includes('Wireless Headphones'));
      
      if (headset && customer && admin) {
        const reviews = [
          {
            productId: headset._id.toString(),
            userId: customer._id.toString(),
            username: customer.name,
            rating: 5,
            title: 'Unbelievable noise cancellation!',
            comment: 'The hybrid ANC on these headphones is absolute magic. I use them on train commutes and it blocks out everything. Audio signature is balanced and rich.'
          },
          {
            productId: headset._id.toString(),
            userId: admin._id.toString(),
            username: admin.name,
            rating: 4,
            title: 'Very comfortable, slightly bass-heavy',
            comment: 'Perfect memory foam padding for long coding sessions. The battery runs forever. Equalizer settings are default bass-boosted, but you can tune it.'
          }
        ];
        await Review.insertMany(reviews);
        
        // Update product statistics
        headset.reviewCount = 2;
        headset.ratingsAvg = 4.5;
        await headset.save();
        console.log('✔ Seeding reviews completed.');
      }

      await mongoose.disconnect();
      console.log('MongoDB seed complete. Connection closed.');
    } catch (error) {
      console.warn('⚠️ MongoDB Seeding failed (this is expected if MongoDB is not running locally). Fallback DB is fully seeded.');
      console.log(error);
    }
  } else {
    console.log('No MONGODB_URI found in env. Skipping MongoDB seeding.');
  }
  
  console.log('\nSeeding summary:');
  console.log('-------------------');
  console.log('ADMIN LOGIN:    admin@ecommerce.com / Password123');
  console.log('CUSTOMER LOGIN: customer@ecommerce.com / Password123');
  console.log('-------------------\n');
};

seedData();
