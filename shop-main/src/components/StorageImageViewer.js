import { useEffect, useState } from 'react';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

export default function StorageImageViewer() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const rootRef = ref(storage, '/');

        const result = await listAll(rootRef);

        const urls = await Promise.all(
          result.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            return {
              name: itemRef.name,
              url,
            };
          })
        );

        setImages(urls);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch images from storage');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading images from Firebase Storage...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Firebase Storage Images ({images.length})</h2>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <div key={image.name} className="rounded-lg overflow-hidden shadow-md bg-white">
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
    </div>
  );
}