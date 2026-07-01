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
    image: "https://firebasestorage.googleapis.com/v0/b/devsolution-dfc75.firebasestorage.app/o/Fresh%20Tomatoes.jpg?alt=media",
    isNew: true,
  },
  {
    name: "Carrot Bundle",
    company: "Greenies Farm",
    price: 14,
    stock: 90,
    category: "fruits-vegetables",
    tags: ["carrots", "fresh", "vegetables"],
    image: "https://firebasestorage.googleapis.com/v0/b/devsolution-dfc75.firebasestorage.app/o/carrot-table-with-fresh-vegetables_1268-33080.jpg?alt=media",
    discount: 5,
  },
  {
    name: "Mixed Salad Greens",
    company: "Wonder Farm",
    price: 22,
    stock: 60,
    category: "fruits-vegetables",
    tags: ["salad", "greens", "fresh"],
    image: "https://firebasestorage.googleapis.com/v0/b/devsolution-dfc75.firebasestorage.app/o/Mixed%20Salad%20Greens.jpg?alt=media",
    isNew: true,
  },
  {
    name: "Dried Mango Slices",
    company: "Trader",
    price: 45,
    stock: 200,
    category: "processing",
    tags: ["dried", "mango", "snack"],
    image: "https://firebasestorage.googleapis.com/v0/b/devsolution-dfc75.firebasestorage.app/o/Dried%20Mango%20Slice.jpg?alt=media",
  },
  {
    name: "Canned Tomato Sauce",
    company: "Trader",
    price: 28,
    stock: 150,
    category: "processing",
    tags: ["canned", "sauce", "tomatoes"],
    image: "https://firebasestorage.googleapis.com/v0/b/devsolution-dfc75.firebasestorage.app/o/Canned%20Tomato%20Sauce.jpg?alt=media",
  },
  {
    name: "Organic Fertilizer",
    company: "The Roots Teams",
    price: 25,
    stock: 150,
    category: "nutrition",
    tags: ["fertilizer", "organic", "soil"],
    image: "https://firebasestorage.googleapis.com/v0/b/devsolution-dfc75.firebasestorage.app/o/Organic%20Fertilizer.jpg?alt=media",
  },
  {
    name: "Plant Nutrition Pack",
    company: "The Roots Teams",
    price: 60,
    stock: 80,
    category: "nutrition",
    tags: ["nutrients", "plant", "care"],
    image: "https://firebasestorage.googleapis.com/v0/b/devsolution-dfc75.firebasestorage.app/o/Plant%20Nutrition%20Pack.jpg?alt=media",
    discount: 10,
  },
  {
    name: "Fresh Strawberries",
    company: "Wonder Farm",
    price: 22,
    stock: 60,
    category: "fruits-vegetables",
    tags: ["strawberries", "berries", "fresh", "fruits"],
    image: "https://firebasestorage.googleapis.com/v0/b/devsolution-dfc75.firebasestorage.app/o/Fresh%20Strawberries.jpg?alt=media",
  },
  {
    name: "Fresh Apples",
    company: "Wonder Farm",
    price: 22,
    stock: 60,
    category: "fruits-vegetables",
    tags: ["apples", "fruits", "fresh"],
    image: "https://firebasestorage.googleapis.com/v0/b/devsolution-dfc75.firebasestorage.app/o/Fresh%20Apples.jpg?alt=media",
  },
  {
    name: "Premium Blueberry Bushes",
    company: "Berry Best Nursery",
    price: 85,
    stock: 25,
    category: "fruits-vegetables",
    tags: ["berries", "bushes", "perennial"],
    image: "https://firebasestorage.googleapis.com/v0/b/devsolution-dfc75.firebasestorage.app/o/Premium%20Blueberry%20Bushes.jpg?alt=media",
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
    image: "https://firebasestorage.googleapis.com/v0/b/devsolution-dfc75.firebasestorage.app/o/Heirloom%20Seed%20Collection.jpg?alt=media",
    comingSoon: true,
    expectedArrival: "August 2026",
  },
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
  }
};
