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
    image: "https://minnetonkaorchards.com/wp-content/uploads/2022/06/Ind-2.jpg",
    isNew: true,
  },
  {
    name: "Carrot Bundle",
    company: "Greenies Farm",
    price: 14,
    stock: 90,
    category: "fruits-vegetables",
    tags: ["carrots", "fresh", "vegetables"],
    image: "https://tse4.mm.bing.net/th/id/OIP.7D_cxvMc0lRrVT7i9QCTpAHaFW?w=1600&h=1157&rs=1&pid=ImgDetMain&o=7&rm=3",
    discount: 5,
  },
  {
    name: "Mixed Salad Greens",
    company: "Wonder Farm",
    price: 22,
    stock: 60,
    category: "fruits-vegetables",
    tags: ["salad", "greens", "fresh"],
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
    isNew: true,
  },
  {
    name: "Dried Mango Slices",
    company: "Trader",
    price: 45,
    stock: 200,
    category: "processing",
    tags: ["dried", "mango", "snack"],
    image: "https://tse1.mm.bing.net/th/id/OIP.dN_LpFidwiVxOr8n4tOnWQHaHS?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    name: "Canned Tomato Sauce",
    company: "Trader",
    price: 28,
    stock: 150,
    category: "processing",
    tags: ["canned", "sauce", "tomatoes"],
    image: "https://tse4.mm.bing.net/th/id/OIP.blm9p4Z5NYW0ALMsPopVPAHaE7?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    name: "Organic Fertilizer",
    company: "The Roots Teams",
    price: 25,
    stock: 150,
    category: "nutrition",
    tags: ["fertilizer", "organic", "soil"],
    image: "https://tse1.explicit.bing.net/th/id/OIP.OAzeWGolsGkwjpIxdiKhoQHaFE?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    name: "Plant Nutrition Pack",
    company: "The Roots Teams",
    price: 60,
    stock: 80,
    category: "nutrition",
    tags: ["nutrients", "plant", "care"],
    image: "https://tse2.mm.bing.net/th/id/OIP.rS-9eitV7kTv0jtchCN1TQHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
    discount: 10,
  },
  {
    name: "Fresh Strawberries",
    company: "Wonder Farm",
    price: 22,
    stock: 60,
    category: "fruits-vegetables",
    tags: ["strawberries", "berries", "fresh", "fruits"],
    image: "https://sagealphagal.com/wp-content/uploads/2024/05/Bowls-of-Fresh-Strawberries-YayImages.jpg",
  },
  {
    name: "Fresh Apples",
    company: "Wonder Farm",
    price: 22,
    stock: 60,
    category: "fruits-vegetables",
    tags: ["apples", "fruits", "fresh"],
    image: "https://thumbs.dreamstime.com/z/fresh-apples-26723823.jpg",
  },
  {
    name: "Premium Blueberry Bushes",
    company: "Berry Best Nursery",
    price: 85,
    stock: 25,
    category: "fruits-vegetables",
    tags: ["berries", "bushes", "perennial"],
    image: "https://img.freepik.com/premium-photo/photo-field-blueberry-bushes-ready-harvest_933496-44001.jpg?w=2000",
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
    image: "https://coastalgardens.ca/wp-content/uploads/2022/02/seed-packs.jpg",
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
