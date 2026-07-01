import { useEffect, useState } from 'react';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { storage } from '../firebase/config';
import { db } from '../firebase/config';

export default function StorageImageViewer() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);

  const fetchImages = async () => {
    try {
      const productsRef = ref(storage, 'products/');
      const result = await listAll(productsRef);

      const urls = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            url,
            fullPath: itemRef.fullPath,
          };
        })
      );

      setImages(urls);
      setError(null);
    } catch (err) {
      if (err.code === 'storage/object-not-found') {
        setImages([]);
        setError(null);
      } else {
        setError(err.message || 'Failed to fetch images from storage');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    setError(null);

    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const fileName = file.name.replace(/\.[^/.]+$/, '');
          const storageRef = ref(storage, `products/${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);

          const q = query(collection(db, 'products'), where('name', '==', fileName));
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            const productDoc = snapshot.docs[0];
            await updateDoc(doc(db, 'products', productDoc.id), { image: url });
            return { name: file.name, url, productUpdated: true };
          }

          return { name: file.name, url, productUpdated: false };
        })
      );

      setUploadResults(results);
      await fetchImages();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading images from Firebase Storage...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Upload Product Images to Firebase Storage</h2>
      
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        disabled={uploading}
        className="mb-4 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
      />

      {uploading && <p className="text-blue-600 mb-4">Uploading and updating products...</p>}
      {error && <p className="text-red-600 mb-4">Error: {error}</p>}

      <h3 className="text-xl font-semibold mb-3">Product Images ({images.length})</h3>
      
      {images.length === 0 && (
        <p className="text-slate-500 mb-4">No images found in the products/ folder.</p>
      )}

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <div key={image.fullPath} className="rounded-lg overflow-hidden shadow-md bg-white">
            <img
              src={image.url}
              alt={image.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e2e8f0"/><text x="50" y="55" text-anchor="middle" font-size="12" fill="%2364748b">Failed</text></svg>';
              }}
            />
            <p className="p-2 text-sm text-center truncate">{image.name}</p>
          </div>
        ))}
      </div>

      {uploadResults.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-medium mb-2">Upload Results</h4>
          <div className="space-y-1">
            {uploadResults.map((result) => (
              <p key={result.name} className="text-sm">
                {result.productUpdated ? '✅' : '⚠️'} {result.name}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}