import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const sampleProducts = [
  {
    name: 'Fresh Tomatoes',
    company: 'Motheo Fresh Supplies',
    price: 18,
    stock: 120,
    category: 'fruits-vegetables',
    tags: ['tomatoes', 'fresh', 'vegetables'],
    image: null,
    isNew: true,
  },
  {
    name: 'Carrot Bundle',
    company: 'Greenies Farm',
    price: 14,
    stock: 90,
    category: 'fruits-vegetables',
    tags: ['carrots', 'fresh', 'vegetables'],
    image: null,
    discount: 5,
  },
  {
    name: 'Mixed Salad Greens',
    company: 'Wonder Farm',
    price: 22,
    stock: 60,
    category: 'fruits-vegetables',
    tags: ['salad', 'greens', 'fresh'],
    image: null,
    isNew: true,
  },
  {
    name: 'Dried Mango Slices',
    company: 'Trader',
    price: 45,
    stock: 200,
    category: 'processing',
    tags: ['dried', 'mango', 'snack'],
    image: null,
  },
  {
    name: 'Canned Tomato Sauce',
    company: 'Trader',
    price: 28,
    stock: 150,
    category: 'processing',
    tags: ['canned', 'sauce', 'tomatoes'],
    image: null,
  },
  {
    name: 'Organic Fertilizer',
    company: 'The Roots Teams',
    price: 25,
    stock: 150,
    category: 'nutrition',
    tags: ['fertilizer', 'organic', 'soil'],
    image: null,
  },
  {
    name: 'Plant Nutrition Pack',
    company: 'The Roots Teams',
    price: 60,
    stock: 80,
    category: 'nutrition',
    tags: ['nutrients', 'plant', 'care'],
    image: null,
    discount: 10,
  },
  {
    name: 'Fresh Strawberries',
    company: 'Greenies Farm',
    price: 55,
    stock: 100,
    category: 'fruits-vegetables',
    tags: ['strawberries', 'fresh', 'fruits'],
    image: null,
    discount: 5,
  },
];

export const seedSampleProducts = async () => {
  try {
    const productsRef = collection(db, 'products');

    // Prevent duplicate seeding
    const existingProducts = await getDocs(productsRef);

    if (!existingProducts.empty) {
      console.log('Products already exist. Skipping seed.');
      return;
    }

    await Promise.all(
      sampleProducts.map((product) =>
        addDoc(productsRef, {
          ...product,
          createdAt: serverTimestamp(),
        })
      )
    );

    console.log('Sample products seeded successfully.');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};