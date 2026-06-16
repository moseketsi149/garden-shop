import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
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
    image: 'https://minnetonkaorchards.com/wp-content/uploads/2022/06/Ind-2.jpg',
    isNew: true,
  },
  {
    name: 'Carrot Bundle',
    company: 'Greenies Farm',
    price: 14,
    stock: 90,
    category: 'fruits-vegetables',
    tags: ['carrots', 'fresh', 'vegetables'],
    image: 'https://images.unsplash.com/photo-1447175008436-1701707537c8',
    discount: 5,
  },
  {
    name: 'Fresh Strawberries',
    company: 'Greenies Farm',
    price: 55,
    stock: 100,
    category: 'fruits-vegetables',
    tags: ['strawberries', 'fresh', 'fruit'],
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6',
    discount: 5,
  },
  {
    name: 'Plant Nutrition Pack',
    company: 'The Roots Team',
    price: 60,
    stock: 80,
    category: 'nutrition',
    tags: ['nutrients', 'plant', 'care'],
    image: 'https://example.com/nutrition-pack.jpg',
    discount: 10,
  },

  // ADD NEW PRODUCTS HERE
  {
    name: 'Fresh Apples',
    company: 'Mountain Farms',
    price: 25,
    stock: 75,
    category: 'fruits-vegetables',
    tags: ['apples', 'fruit', 'fresh'],
    image: 'https://example.com/apples.jpg',
    isNew: true,
  },
];

export const seedSampleProducts = async () => {
  try {
    const productsRef = collection(db, 'products');

    for (const product of sampleProducts) {
      const existing = await getDocs(
        query(productsRef, where('name', '==', product.name))
      );

      if (existing.empty) {
        await addDoc(productsRef, {
          ...product,
          createdAt: serverTimestamp(),
        });

        console.log(`Added: ${product.name}`);
      } else {
        console.log(`Already exists: ${product.name}`);
      }
    }

    console.log('Product seeding completed.');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};