import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";

const products = [
  {
    name: "Fresh Tomatoes",
    company: "Motheo Fresh Supplies",
    price: 18,
    stock: 120,
    category: "fruits-vegetables",
    tags: ["tomatoes", "fresh", "vegetables"],
    image: "products/fresh-tomato-substitutes-2.jpg",
    isNew: true,
  },
  {
    name: "Carrot Bundle",
    company: "Greenies Farm",
    price: 14,
    stock: 90,
    category: "fruits-vegetables",
    tags: ["carrots", "fresh", "vegetables"],
    image: "products/carrot-table-with-fresh-vegetables_1268-33080.jpg",
    discount: 5,
  },
  {
    name: "Mixed Salad Greens",
    company: "Wonder Farm",
    price: 22,
    stock: 60,
    category: "fruits-vegetables",
    tags: ["salad", "greens", "fresh"],
    image: "products/Mixed Salad Greens.jpg",
    isNew: true,
  },
  {
    name: "Dried Mango Slices",
    company: "Trader",
    price: 45,
    stock: 200,
    category: "processing",
    tags: ["dried", "mango", "snack"],
    image: "products/Dried Mango Slice.jpg",
  },
  {
    name: "Canned Tomato Sauce",
    company: "Trader",
    price: 28,
    stock: 150,
    category: "processing",
    tags: ["canned", "sauce", "tomatoes"],
    image: "products/Canned Tomato Sauce.jpg",
  },
  {
    name: "Organic Fertilizer",
    company: "The Roots Teams",
    price: 25,
    stock: 150,
    category: "nutrition",
    tags: ["fertilizer", "organic", "soil"],
    image: "products/Organic Fertilizer.jpg",
  },
  {
    name: "Plant Nutrition Pack",
    company: "The Roots Teams",
    price: 60,
    stock: 80,
    category: "nutrition",
    tags: ["nutrients", "plant", "care"],
    image: "products/Plant Nutrition Pack.jpg",
    discount: 10,
  },
  {
    name: "Fresh Strawberries",
    company: "Wonder Farm",
    price: 22,
    stock: 60,
    category: "fruits-vegetables",
    tags: ["strawberries", "berries", "fresh", "fruits"],
    image: "products/Fresh Strawberries.jpg",
  },
  {
    name: "Fresh Apples",
    company: "Wonder Farm",
    price: 22,
    stock: 60,
    category: "fruits-vegetables",
    tags: ["apples", "fruits", "fresh"],
    image: "products/Fresh Apples.jpg",
  },
  {
    name: "Premium Blueberry Bushes",
    company: "Berry Best Nursery",
    price: 85,
    stock: 25,
    category: "fruits-vegetables",
    tags: ["berries", "bushes", "perennial"],
    image: "products/Premium Blueberry Bushes.jpg",
    comingSoon: true,
    expectedArrival: "July 2026",
  },
  {
    name: "Heirloom Seed Collection",
    company: "Heritage Seeds Co.",
    price: 120,
    stock: 50,
    category: "processing",
    tags: ["seeds", "heirloom", "rare"],
    image: "products/Heirloom Seed Collection.jpg",
    comingSoon: true,
    expectedArrival: "August 2026",
  },
];

export const sampleProducts = [
  ...products,
];

export const seedSampleProducts = async () => {
  try {
    const productsRef = collection(db, "products");

    for (const product of products) {
      const q = query(productsRef, where("name", "==", product.name));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        await addDoc(productsRef, {
          ...product,
          createdAt: serverTimestamp(),
        });
      } else {
        for (const docSnap of snapshot.docs) {
          await updateDoc(doc(productsRef, docSnap.id), {
            ...product,
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    console.log("Products seeded successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
    throw error;
  }
};

export const deduplicateProducts = async () => {
  try {
    const productsRef = collection(db, "products");
    const q = query(productsRef, orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs;

    const seen = new Map();

    for (const docSnap of docs) {
      const data = docSnap.data();
      const name = data.name;

      if (seen.has(name)) {
        await deleteDoc(doc(productsRef, docSnap.id));
        console.log(`Deleted duplicate: ${name} (${docSnap.id})`);
      } else {
        seen.set(name, docSnap.id);
      }
    }

    console.log(`Deduplication complete. Kept ${seen.size} unique products.`);
  } catch (error) {
    console.error("Deduplication failed:", error);
    throw error;
  }
};
