import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Stable product images (use only reliable URLs)
 */
const productImageUrls = {
  driedMango:
    "https://tse1.mm.bing.net/th/id/OIP.dN_LpFidwiVxOr8n4tOnWQHaHS?rs=1&pid=ImgDetMain&o=7&rm=3",
  nutritionPack:
    "https://tse2.mm.bing.net/th/id/OIP.rS-9eitV7kTv0jtchCN1TQHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
  tomatoes:
    "https://minnetonkaorchards.com/wp-content/uploads/2022/06/Ind-2.jpg",
  organicFertilizer:
    "https://tse1.explicit.bing.net/th/id/OIP.OAzeWGolsGkwjpIxdiKhoQHaFE?rs=1&pid=ImgDetMain&o=7&rm=3",
  FreshApples: 
  "https://thumbs.dreamstime.com/z/fresh-apples-26723823.jpg",
  FreshStrawberries:
    "https://sagealphagal.com/wp-content/uploads/2024/05/Bowls-of-Fresh-Strawberries-YayImages.jpg",
  MixedSaladGreens:
"https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
CarrotBundle:
    "https://tse4.mm.bing.net/th/id/OIP.7D_cxvMc0lRrVT7i9QCTpAHaFW?w=1600&h=1157&rs=1&pid=ImgDetMain&o=7&rm=3",
  CannedTomatoSauce:
    "https://tse4.mm.bing.net/th/id/OIP.blm9p4Z5NYW0ALMsPopVPAHaE7?rs=1&pid=ImgDetMain&o=7&rm=3",
};

/**
 * Sample products (ADD NEW PRODUCTS HERE)
 */
const sampleProducts = [
  {
    name: "Fresh Tomatoes",
    company: "Motheo Fresh Supplies",
    price: 18,
    stock: 120,
    category: "fruits-vegetables",
    tags: ["tomatoes", "fresh", "vegetables"],
    image: productImageUrls.tomatoes,
    isNew: true,
  },
  {
    name: "Carrot Bundle",
    company: "Greenies Farm",
    price: 14,
    stock: 90,
    category: "fruits-vegetables",
    tags: ["carrots", "fresh", "vegetables"],
    image: productImageUrls.CarrotBundle,
    discount: 5,
  },
  {
    name: "Mixed Salad Greens",
    company: "Wonder Farm",
    price: 22,
    stock: 60,
    category: "fruits-vegetables",
    tags: ["salad", "greens", "fresh"],
    image: productImageUrls.MixedSaladGreens,
    isNew: true,
  },
  {
    name: "Dried Mango Slices",
    company: "Trader",
    price: 45,
    stock: 200,
    category: "processing",
    tags: ["dried", "mango", "snack"],
    image: productImageUrls.driedMango,
  },
  {
    name: "Canned Tomato Sauce",
    company: "Trader",
    price: 28,
    stock: 150,
    category: "processing",
    tags: ["canned", "sauce", "tomatoes"],
    image: productImageUrls.CannedTomatoSauce,
  },
  {
    name: "Organic Fertilizer",
    company: "The Roots Teams",
    price: 25,
    stock: 150,
    category: "nutrition",
    tags: ["fertilizer", "organic", "soil"],
    image: productImageUrls.OrganicFertilizer,
  },
  {
    name: "Plant Nutrition Pack",
    company: "The Roots Teams",
    price: 60,
    stock: 80,
    category: "nutrition",
    tags: ["nutrients", "plant", "care"],
    image: productImageUrls.nutritionPack,
    discount: 10,
  },
  {
    name: "Fresh Strawberries",
    company: "Wonder Farm",
    price: 22,
    stock: 60,
    category: "fruits-vegetables",
    tags: ["strawberries", "berries", "fresh", "fruits"],
    image: productImageUrls.FreshStrawberries,
  },
  {
    name: "Fresh Apples",
    company: "Wonder Farm",
    price: 22,
    stock: 60,
    category: "fruits-vegetables",
    tags: ["apples", "fruits", "fresh"],
    image: productImageUrls.FreshApples,
  },
  {
    name: "Premium Blueberry Bushes",
    company: "Berry Best Nursery",
    price: 85,
    stock: 25,
    category: "fruits-vegetables",
    tags: ["berries", "bushes", "perennial"],
    image:
      "https://img.freepik.com/premium-photo/photo-field-blueberry-bushes-ready-harvest_933496-44001.jpg?w=2000",
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
    image:
      "https://coastalgardens.ca/wp-content/uploads/2022/02/seed-packs.jpg",
    comingSoon: true,
    expectedArrival: "August 2026",
  },
];

/**
 * Update images for existing products and add any missing ones
 */
const ensureStableSampleProducts = async () => {
  try {
    const productsRef = collection(db, "products");
    const allProducts = await getDocs(productsRef);
    console.log(`Found ${allProducts.size} existing products in Firestore`);

    const missingTimestampDocs = allProducts.docs.filter(
      (docSnap) => !docSnap.data().createdAt,
    );
    if (missingTimestampDocs.length > 0) {
      const batch = writeBatch(db);
      missingTimestampDocs.forEach((docSnap) => {
        batch.update(doc(db, "products", docSnap.id), {
          createdAt: serverTimestamp(),
        });
      });
      await batch.commit();
    }

    await Promise.all(
      sampleProducts.map(async (product) => {
        const snapshot = await getDocs(
          query(productsRef, where("name", "==", product.name)),
        );

        if (snapshot.empty) {
          console.log(`Adding new product: ${product.name}`);
          await addDoc(productsRef, {
            ...product,
            createdAt: serverTimestamp(),
          });
          return;
        }

        console.log(`Updating existing product: ${product.name}`);
        await Promise.all(
          snapshot.docs.map((docSnap) => {
            const payload = {
              ...product,
              updatedAt: serverTimestamp(),
            };
            return updateDoc(doc(db, "products", docSnap.id), payload);
          }),
        );
      }),
    );
  } catch (error) {
    console.error("Product refresh failed:", error);
  }
};

let seeding = false;

export const seedSampleProducts = async () => {
  if (seeding) return;

  seeding = true;

  try {
    const productsRef = collection(db, "products");

    for (const product of sampleProducts) {
      if (!product.image) {
        console.error(
          `Skipping ${product.name}: image is undefined`
        );
        continue;
      }

      const snapshot = await getDocs(
        query(productsRef, where("name", "==", product.name))
      );

      if (snapshot.empty) {
        await addDoc(productsRef, {
          ...product,
          createdAt: serverTimestamp(),
        });

        console.log(
          `Added product: ${product.name}`
        );
      } else {
        for (const docSnap of snapshot.docs) {
          await updateDoc(
            doc(db, "products", docSnap.id),
            {
              ...product,
              updatedAt: serverTimestamp(),
            }
          );
        }

        console.log(
          `Updated product: ${product.name}`
        );
      }
    }

    console.log("Product seeding completed");
  } catch (error) {
    console.error(
      "Error seeding products:",
      error
    );
  } finally {
    seeding = false;
  }
};