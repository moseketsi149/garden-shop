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
    image: 'https://tse4.mm.bing.net/th/id/OIP.Lr-XI7VDUrD9o3oZ0G_WYgHaE6?w=900&h=598&rs=1&pid=ImgDetMain&o=7&rm=3',
    isNew: true,
  },
  {
    name: 'Carrot Bundle',
    company: 'Greenies Farm',
    price: 14,
    stock: 90,
    category: 'fruits-vegetables',
    tags: ['carrots', 'fresh', 'vegetables'],
    image: 'https://blogchef.net/wp-content/uploads/2022/05/How-to-Cook-Fresh-Carrots-2-scaled.jpg',
    discount: 5,
  },
  {
    name: 'Mixed Salad Greens',
    company: 'Wonder Farm',
    price: 22,
    stock: 60,
    category: 'fruits-vegetables',
    tags: ['salad', 'greens', 'fresh'],
    image: 'https://c8.alamy.com/comp/2BX7TWH/salad-in-white-bowl-mixed-greens-with-black-olives-tomatoes-and-lots-of-vegetables-2BX7TWH.jpg',
    isNew: true,
  },
  {
    name: 'Dried Mango Slices',
    company: 'Trader',
    price: 45,
    stock: 200,
    category: 'processing',
    tags: ['dried', 'mango', 'snack'],
    image: 'https://tse3.mm.bing.net/th/id/OIP.uEcs2IyMzTUxfyV-UvBXjwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',
  },
  {
    name: 'Canned Tomato Sauce',
    company: 'Trader',
    price: 28,
    stock: 150,
    category: 'processing',
    tags: ['canned', 'sauce', 'tomatoes'],
    image: 'https://tse4.mm.bing.net/th/id/OIP.blm9p4Z5NYW0ALMsPopVPAHaE7?rs=1&pid=ImgDetMain&o=7&rm=3',
  },
  {
    name: 'Organic Fertilizer',
    company: 'The Roots Teams',
    price: 25,
    stock: 150,
    category: 'nutrition',
    tags: ['fertilizer', 'organic', 'soil'],
    image: 'https://cdn.cdnparenting.com/articles/2021/07/16191322/380433403.jpg',
  },
  {
    name: 'Plant Nutrition Pack',
    company: 'The Roots Teams',
    price: 60,
    stock: 80,
    category: 'nutrition',
    tags: ['nutrients', 'plant', 'care'],
    image: 'https://tse2.mm.bing.net/th/id/OIP.rS-9eitV7kTv0jtchCN1TQHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
    discount: 10,
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