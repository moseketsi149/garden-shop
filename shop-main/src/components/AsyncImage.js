import React, { useEffect, useState } from 'react';
import { resolveImageUrl } from '../utils/storageUtils';

export default function AsyncImage({ src, alt = '', className = '', style = {}, fallback, ...props }) {
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setFailed(false);
    setUrl(null);

    const load = async () => {
      if (!src) return;
      const resolved = await resolveImageUrl(src);
      if (!active) return;
      setUrl(resolved || null);
    };

    load();

    return () => {
      active = false;
    };
  }, [src]);

  const handleError = (e) => {
    setFailed(true);
    if (props.onError) props.onError(e);
  };

  const imageSrc = !failed && url ? url : (!failed && typeof src === 'string' && /^(https?:\/\/|data:image\/)/.test(src) ? src : null);

  if (!imageSrc && fallback) {
    return <img src={fallback} alt={alt} className={className} style={style} {...props} />;
  }

  if (!imageSrc) {
    // render transparent placeholder until we have a URL
    return <div className={className} style={{ backgroundColor: '#f1f5f9', ...style }} />;
  }

  return <img src={imageSrc} alt={alt} className={className} style={style} onError={handleError} {...props} />;
}
