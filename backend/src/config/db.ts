import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

export let isMockMode = false;
const JSON_DB_DIR = path.join(__dirname, '../../data');
const JSON_DB_PATH = path.join(JSON_DB_DIR, 'db.json');

// Ensure database folder exists
if (!fs.existsSync(JSON_DB_DIR)) {
  fs.mkdirSync(JSON_DB_DIR, { recursive: true });
}

// Initial structure for local DB fallback
const defaultStructure = {
  users: [] as any[],
  products: [] as any[],
  categories: [] as any[],
  orders: [] as any[],
  reviews: [] as any[],
  coupons: [] as any[]
};

// Check if db.json exists, if not create it
if (!fs.existsSync(JSON_DB_PATH)) {
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(defaultStructure, null, 2));
}

// Read/write helpers for fallback
export const readLocalDB = () => {
  try {
    const data = fs.readFileSync(JSON_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return defaultStructure;
  }
};

export const writeLocalDB = (data: any) => {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to write to local DB:', error);
  }
};

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('\n=========================================');
    console.warn('WARNING: MONGODB_URI environment variable is missing.');
    console.warn('Switching to Local JSON Database Fallback mode.');
    console.warn(`Local DB path: ${JSON_DB_PATH}`);
    console.warn('=========================================\n');
    isMockMode = true;
    return;
  }

  try {
    // Set connection timeout to 2 seconds for quick fallback check
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.warn('\n=========================================');
    console.warn('WARNING: Failed to connect to MongoDB server.');
    console.warn(error instanceof Error ? error.message : 'Unknown MongoDB connection error');
    console.warn('Switching to Local JSON Database Fallback mode.');
    console.warn(`Local DB path: ${JSON_DB_PATH}`);
    console.warn('=========================================\n');
    isMockMode = true;
  }
};

// Unified database operations utility
export const localDb = {
  find: (collectionName: string, query?: (item: any) => boolean) => {
    const db = readLocalDB();
    const items = db[collectionName] || [];
    return query ? items.filter(query) : items;
  },
  
  findById: (collectionName: string, id: string) => {
    const db = readLocalDB();
    const items = db[collectionName] || [];
    return items.find((item: any) => item._id === id || item.id === id);
  },
  
  findOne: (collectionName: string, query: (item: any) => boolean) => {
    const db = readLocalDB();
    const items = db[collectionName] || [];
    return items.find(query);
  },
  
  create: (collectionName: string, data: any) => {
    const db = readLocalDB();
    if (!db[collectionName]) db[collectionName] = [];
    
    // Auto-generate standard ID like MongoDB ObjectId
    const newItem = {
      _id: Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    db[collectionName].push(newItem);
    writeLocalDB(db);
    return newItem;
  },
  
  findByIdAndUpdate: (collectionName: string, id: string, update: any) => {
    const db = readLocalDB();
    const items = db[collectionName] || [];
    const index = items.findIndex((item: any) => item._id === id || item.id === id);
    if (index === -1) return null;
    
    const updatedItem = {
      ...items[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    items[index] = updatedItem;
    db[collectionName] = items;
    writeLocalDB(db);
    return updatedItem;
  },
  
  findByIdAndDelete: (collectionName: string, id: string) => {
    const db = readLocalDB();
    const items = db[collectionName] || [];
    const index = items.findIndex((item: any) => item._id === id || item.id === id);
    if (index === -1) return null;
    
    const deletedItem = items[index];
    items.splice(index, 1);
    db[collectionName] = items;
    writeLocalDB(db);
    return deletedItem;
  }
};
