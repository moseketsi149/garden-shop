import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const productImageUrls = {
  driedMango: 'https://tse1.mm.bing.net/th/id/OIP.dN_LpFidwiVxOr8n4tOnWQHaHS?rs=1&pid=ImgDetMain&o=7&rm=3',
  nutritionPack: 'https://tse2.mm.bing.net/th/id/OIP.rS-9eitV7kTv0jtchCN1TQHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
  tomatoSauce: 'https://therootedfarmhouse.com/wp-content/uploads/2023/10/Easy-Tomatoes-Sauce-Recipe-The-Best-Tomatoes-for-Canning-4-682x1024.webp',
  tomatoes: 'https://minnetonkaorchards.com/wp-content/uploads/2022/06/Ind-2.jpg',
};

const unstableImageMarkers = [
  'picsum.photos',
  'images.unsplash.com',
  'source.unsplash.com',
  'tse',
  'bing.net/th',
  'random',
  'loremflickr',
];

const svgImage = (label, bgStart, bgEnd, accent, artwork) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgStart}"/>
        <stop offset="100%" stop-color="${bgEnd}"/>
      </linearGradient>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#0f172a" flood-opacity="0.18"/>
      </filter>
    </defs>
    <rect width="800" height="600" rx="48" fill="url(#bg)"/>
    <circle cx="115" cy="115" r="95" fill="${accent}" opacity="0.12"/>
    <circle cx="700" cy="500" r="130" fill="${accent}" opacity="0.1"/>
    <g filter="url(#softShadow)">
      ${artwork}
    </g>
    <text x="400" y="540" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#0f172a">${label}</text>
  </svg>
`)}`;

const productImages = {
  tomatoes: productImageUrls.tomatoes,
  carrots: svgImage('Carrots', '#ffedd5', '#fed7aa', '#f97316', `
    <path d="M250 315 C330 245 445 215 590 205 L540 300 C430 315 340 355 250 430Z" fill="#f97316"/>
    <path d="M250 315 C330 245 445 215 590 205 L560 245 C430 250 340 285 250 365Z" fill="#fb923c"/>
    <path d="M250 315 L190 260 M275 335 L205 320 M300 355 L235 390" stroke="#166534" stroke-width="18" stroke-linecap="round"/>
    <path d="M210 260 C165 235 150 190 170 150 C195 195 220 220 250 315Z" fill="#22c55e"/>
    <path d="M225 335 C180 340 145 315 130 275 C175 295 210 305 275 335Z" fill="#15803d"/>
    <path d="M250 390 C215 430 170 440 135 425 C180 405 215 385 300 355Z" fill="#16a34a"/>
  `),
  salad: svgImage('Salad', '#ecfdf5', '#bbf7d0', '#22c55e', `
    <ellipse cx="400" cy="365" rx="240" ry="70" fill="#ffffff" opacity="0.75"/>
    <path d="M235 335 C215 250 280 190 360 215 C420 235 420 315 360 360 C305 340 270 330 235 335Z" fill="#22c55e"/>
    <path d="M365 340 C350 250 420 185 505 210 C560 230 565 310 505 360 C450 335 405 325 365 340Z" fill="#16a34a"/>
    <path d="M285 405 C260 320 330 250 415 275 C475 295 480 380 415 430 C360 400 320 390 285 405Z" fill="#15803d"/>
    <circle cx="310" cy="285" r="36" fill="#ef4444"/>
    <circle cx="480" cy="285" r="32" fill="#f97316"/>
    <circle cx="405" cy="340" r="30" fill="#facc15"/>
  `),
  driedMango: productImageUrls.driedMango,
  sauce: productImageUrls.tomatoSauce,
  fertilizer: svgImage('Fertilizer', '#fef3c7', '#fde68a', '#92400e', `
    <path d="M270 220 L530 220 L585 500 L215 500Z" fill="#a16207"/>
    <path d="M270 220 L530 220 L500 285 L300 285Z" fill="#d97706"/>
    <rect x="300" y="320" width="200" height="105" rx="22" fill="#fef3c7" opacity="0.9"/>
    <path d="M335 355 C360 315 400 315 425 355 C400 395 360 395 335 355Z" fill="#16a34a"/>
    <path d="M360 355 L360 425 M400 355 L400 425" stroke="#166534" stroke-width="12" stroke-linecap="round"/>
  `),
  nutrition: productImageUrls.nutritionPack,
  strawberries: svgImage('Strawberries', '#ffe4e6', '#fecdd3', '#e11d48', `
    <path d="M330 230 C350 170 450 170 470 230 C505 275 505 370 445 430 C390 390 340 390 285 430 C225 370 225 275 260 230Z" fill="#e11d48"/>
    <path d="M315 230 C340 185 390 170 425 205 C395 225 355 230 315 230Z" fill="#16a34a"/>
    <path d="M390 205 C420 165 470 165 500 205 C465 225 425 225 390 205Z" fill="#22c55e"/>
    <path d="M350 215 C330 175 305 160 270 175 C295 210 320 225 350 215Z" fill="#15803d"/>
    <circle cx="345" cy="300" r="7" fill="#fecdd3"/>
    <circle cx="395" cy="315" r="7" fill="#fecdd3"/>
    <circle cx="430" cy="365" r="7" fill="#fecdd3"/>
    <circle cx="315" cy="370" r="7" fill="#fecdd3"/>
  `),
};

const sampleProducts = [
  {
    name: 'Fresh Tomatoes',
    company: 'Motheo Fresh Supplies',
    price: 18,
    stock: 120,
    category: 'fruits-vegetables',
    tags: ['tomatoes', 'fresh', 'vegetables'],
    image: productImages.tomatoes,
    isNew: true,
  },
  {
    name: 'Carrot Bundle',
    company: 'Greenies Farm',
    price: 14,
    stock: 90,
    category: 'fruits-vegetables',
    tags: ['carrots', 'fresh', 'vegetables'],
    image: productImages.carrots,
    discount: 5,
  },
  {
    name: 'Mixed Salad Greens',
    company: 'Wonder Farm',
    price: 22,
    stock: 60,
    category: 'fruits-vegetables',
    tags: ['salad', 'greens', 'fresh'],
    image: productImages.salad,
    isNew: true,
  },
  {
    name: 'Dried Mango Slices',
    company: 'Trader',
    price: 45,
    stock: 200,
    category: 'processing',
    tags: ['dried', 'mango', 'snack'],
    image: productImages.driedMango,
  },
  {
    name: 'Canned Tomato Sauce',
    company: 'Trader',
    price: 28,
    stock: 150,
    category: 'processing',
    tags: ['canned', 'sauce', 'tomatoes'],
    image: productImages.sauce,
  },
  {
    name: 'Organic Fertilizer',
    company: 'The Roots Teams',
    price: 25,
    stock: 150,
    category: 'nutrition',
    tags: ['fertilizer', 'organic', 'soil'],
    image: productImages.fertilizer,
  },
  {
    name: 'Plant Nutrition Pack',
    company: 'The Roots Teams',
    price: 60,
    stock: 80,
    category: 'nutrition',
    tags: ['nutrients', 'plant', 'care'],
    image: productImages.nutrition,
    discount: 10,
  },
  {
    name: 'Fresh Strawberries',
    company: 'Greenies Farm',
    price: 55,
    stock: 100,
    category: 'fruits-vegetables',
    tags: ['strawberries', 'fresh', 'fruits'],
    image: productImages.strawberries,
    discount: 5,
  },
];

const isStableProductImage = (src) => {
  if (!src || typeof src !== 'string') return false;
  const normalized = src.trim().toLowerCase();
  if (
    !normalized.startsWith('http') &&
    !normalized.startsWith('data:image/') &&
    !normalized.startsWith('/')
  ) {
    return false;
  }
  return !unstableImageMarkers.some((marker) => normalized.includes(marker));
};

const ensureStableSampleImages = async () => {
  try {
    const productsRef = collection(db, 'products');

    await Promise.all(
      sampleProducts.map(async (product) => {
        const snapshot = await getDocs(query(productsRef, where('name', '==', product.name)));

        await Promise.all(
          snapshot.docs.map((productDoc) => {
            const existingImage = productDoc.data().image;
            if (existingImage === product.image) return null;
            return updateDoc(doc(db, 'products', productDoc.id), {
              image: product.image,
              updatedAt: serverTimestamp(),
            });
          })
        );
      })
    );
  } catch (error) {
    console.warn('Could not refresh sample product images:', error);
  }
};

export const seedSampleProducts = async () => {
  try {
    const productsRef = collection(db, 'products');

    const existingProducts = await getDocs(productsRef);

    if (!existingProducts.empty) {
      console.log('Products already exist. Refreshing sample product images.');
      await ensureStableSampleImages();
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
