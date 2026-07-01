import { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

export default function StorageImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    setError(null);

    try {
      const urls = await Promise.all(
        files.map(async (file) => {
          const storageRef = ref(storage, `products/${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          return { name: file.name, url };
        })
      );

      setUploadedUrls(urls);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Upload Images to Firebase Storage</h2>
      
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        disabled={uploading}
        className="mb-4"
      />

      {uploading && <p className="text-blue-600">Uploading...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {uploadedUrls.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Uploaded Images ({uploadedUrls.length})</h3>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {uploadedUrls.map((img) => (
              <div key={img.name} className="rounded-lg overflow-hidden shadow-md bg-white">
                <img src={img.url} alt={img.name} className="w-full h-32 object-cover" />
                <p className="p-2 text-xs truncate">{img.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}