import React, { useRef } from 'react';
import { ImageUploader } from './ImageUploader';
import { uploadImage } from '@/utils/imageUpload';

interface FullWidthLayoutProps {
  image?: { url: string; caption?: string };
  onUpdate: (data: { url: string; caption?: string }) => void;
  readOnly: boolean;
}

export const FullWidthLayout: React.FC<FullWidthLayoutProps> = ({ image, onUpdate, readOnly }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImage(file);
      onUpdate({ ...image, url });
    } catch (error) {
      console.error('Replacement failed:', error);
      alert('이미지 교체에 실패했습니다.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!image?.url) {
    return <ImageUploader onUpload={(url) => onUpdate({ url, caption: '' })} />;
  }

  return (
    <div className="relative group">
      <img
        src={image.url}
        alt="Full width"
        className={`w-full h-auto rounded-lg shadow-sm ${
          !readOnly ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
        }`}
        onClick={() => !readOnly && fileInputRef.current?.click()}
        style={{ marginTop: '0px', marginBottom: '0px' }}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      {!readOnly && (
        <input
          type="text"
          placeholder="이미지 캡션 입력 (선택사항)"
          value={image.caption || ''}
          onChange={(e) => onUpdate({ ...image, caption: e.target.value })}
          className="w-full mt-2 p-2 text-center text-sm text-gray-600 bg-transparent border-none focus:ring-0 placeholder-gray-400"
        />
      )}
      {!readOnly && (
        <button
          onClick={() => onUpdate({ url: '', caption: '' })}
          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          title="이미지 제거"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
};
