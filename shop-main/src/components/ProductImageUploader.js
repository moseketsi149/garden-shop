import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { storage } from '../firebase/config';
import { db } from '../firebase/config';

export default function ProductImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState([]);
  const [error, setError] = useState(null);

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

      setUploaded(results);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

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

      {uploading && <p className="text-blue-600">Uploading and updating products...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {uploaded.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Upload Results</h3>
          <div className="space-y-2">
            {uploaded.map((result) => (
              <div key={result.name} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                <img src={result.url} alt={result.name} className="w-12 h-12 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{result.name}</p>
                  <p className="text-xs text-slate-500">
                    {result.productUpdated ? 'Product updated in Firestore' : 'No matching product found'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}