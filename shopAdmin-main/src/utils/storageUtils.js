import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../firebase/config';

const cache = new Map();

export async function resolveImageUrl(imagePath) {
  if (!imagePath) return null;
  if (typeof imagePath === 'string' && /^(https?:\/\/|data:image\/)/.test(imagePath)) return imagePath;
  if (cache.has(imagePath)) return cache.get(imagePath);
  try {
    const imageRef = ref(storage, imagePath);
    const url = await getDownloadURL(imageRef);
    cache.set(imagePath, url);
    return url;
  } catch (err) {
    console.warn('resolveImageUrl failed for', imagePath, err?.message || err);
    return null;
  }
}

export function clearImageCache() { cache.clear(); }
