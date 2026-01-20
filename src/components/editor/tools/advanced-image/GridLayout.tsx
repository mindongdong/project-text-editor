import React, { useRef } from 'react';
import { ImageUploader } from './ImageUploader';
import { uploadImage } from '@/utils/imageUpload';

interface GridLayoutProps {
  images: Array<{ url: string; caption?: string }>;
  layout: 'grid-1x2' | 'grid-1x3' | 'grid-2x2' | 'grid-3x3';
  onUpdate: (images: Array<{ url: string; caption?: string }>) => void;
  readOnly: boolean;
}

export const GridLayout: React.FC<GridLayoutProps> = ({ images, layout, onUpdate, readOnly }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeIndexRef = useRef<number | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeIndexRef.current === null) return;

    try {
      const url = await uploadImage(file);
      handleImageUpdate(activeIndexRef.current, url);
    } catch (error) {
      console.error('Replacement failed:', error);
      alert('이미지 교체에 실패했습니다.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      activeIndexRef.current = null;
    }
  };

  const triggerReplacement = (index: number) => {
    if (readOnly) return;
    activeIndexRef.current = index;
    fileInputRef.current?.click();
  };
  const getGridConfig = () => {
    switch (layout) {
      case 'grid-1x2':
        return { cols: 2, count: 2 };
      case 'grid-1x3':
        return { cols: 3, count: 3 };
      case 'grid-2x2':
        return { cols: 2, count: 4 };
      case 'grid-3x3':
        return { cols: 3, count: 9 };
      default:
        return { cols: 2, count: 2 };
    }
  };

  const { cols, count } = getGridConfig();

  // Ensure we have the correct number of slots
  const slots = Array(count)
    .fill(null)
    .map((_, index) => images[index] || null);

  const handleImageUpdate = (index: number, url: string) => {
    const newImages = [...images];
    // Fill gaps if necessary
    while (newImages.length < index) {
      newImages.push({ url: '' });
    }
    newImages[index] = { url, caption: '' };
    onUpdate(newImages);
  };

  const handleImageRemove = (index: number) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], url: '' };
    onUpdate(newImages);
  };

  return (
    <div className="grid gap-4 w-full" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {slots.map((image, index) => (
        <div
          key={index}
          className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100"
        >
          {image?.url ? (
            <div className="relative w-full h-full group">
              <img
                src={image.url}
                alt={`Grid item ${index + 1}`}
                className={`w-full h-full object-cover ${
                  !readOnly ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
                }`}
                onClick={() => triggerReplacement(index)}
                style={{ marginTop: '0px', marginBottom: '0px' }}
              />
              {!readOnly && (
                <button
                  onClick={() => handleImageRemove(index)}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4">
              <ImageUploader
                onUpload={(url) => handleImageUpdate(index, url)}
                className="w-full h-full min-h-0 p-2 border-dashed border-2 border-gray-200 hover:border-blue-400"
              />
            </div>
          )}
        </div>
      ))}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};
