import React, { useState, useRef, useEffect } from 'react';
import { ImageUploader } from './ImageUploader';
import { uploadImage } from '@/utils/imageUpload';

interface SplitLayoutProps {
  image?: { url: string; caption?: string };
  text?: string;
  splitRatio?: number;
  layout: 'split-left' | 'split-right';
  onUpdate: (data: {
    image?: { url: string; caption?: string };
    text?: string;
    splitRatio?: number;
  }) => void;
  readOnly: boolean;
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({
  image,
  text,
  splitRatio = 0.5,
  layout,
  onUpdate,
  readOnly,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImage(file);
      onUpdate({ image: { ...image, url }, text, splitRatio });
    } catch (error) {
      console.error('Replacement failed:', error);
      alert('이미지 교체에 실패했습니다.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return;
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const relativeX = e.clientX - containerRect.left;

      // Calculate new ratio (clamped between 0.2 and 0.8)
      let newRatio = relativeX / containerWidth;
      newRatio = Math.max(0.2, Math.min(0.8, newRatio));

      // If layout is split-right, the image is on the right, so the ratio logic might need adjustment
      // But let's assume splitRatio always defines the width of the LEFT element

      onUpdate({
        image,
        text,
        splitRatio: newRatio,
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, image, text, onUpdate]);

  const renderImageArea = () => {
    if (!image?.url) {
      return (
        <div className="h-full min-h-[200px]">
          <ImageUploader
            onUpload={(url) => onUpdate({ image: { url, caption: '' }, text, splitRatio })}
            className="h-full flex flex-col justify-center"
          />
        </div>
      );
    }

    return (
      <div className="relative h-full">
        <img
          src={image.url}
          alt="Split view"
          className={`w-full h-auto object-cover rounded-lg shadow-sm ${
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
          <button
            onClick={() => onUpdate({ image: { url: '', caption: '' }, text, splitRatio })}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-gray-500 hover:text-red-500 opacity-0 hover:opacity-100 transition-opacity"
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
    );
  };

  const renderTextArea = () => {
    return (
      <textarea
        value={text || ''}
        onChange={(e) => onUpdate({ image, text: e.target.value, splitRatio })}
        placeholder="내용을 입력하세요..."
        readOnly={readOnly}
        className="w-full h-full min-h-[200px] p-4 bg-transparent border-none focus:ring-0 resize-none text-gray-700 leading-relaxed"
        onKeyDown={(e) => {
          if (e.key === 'Backspace' || e.key === 'Enter') {
            e.stopPropagation();
          }
        }}
      />
    );
  };

  // Determine left and right content based on layout
  const leftContent = layout === 'split-left' ? renderImageArea() : renderTextArea();
  const rightContent = layout === 'split-left' ? renderTextArea() : renderImageArea();

  return (
    <div
      ref={containerRef}
      className="flex w-full gap-4 relative select-none"
      style={{ minHeight: '200px' }}
    >
      {/* Left Panel */}
      <div style={{ width: `${splitRatio * 100}%` }} className="relative">
        {leftContent}
      </div>

      {/* Resize Handle */}
      {!readOnly && (
        <div
          onMouseDown={handleMouseDown}
          className={`absolute top-0 bottom-0 w-4 cursor-col-resize flex items-center justify-center hover:bg-blue-50 transition-colors z-10
            ${isResizing ? 'bg-blue-100' : ''}`}
          style={{ left: `calc(${splitRatio * 100}% - 8px)` }}
        >
          <div className="w-1 h-8 bg-gray-300 rounded-full" />
        </div>
      )}

      {/* Right Panel */}
      <div style={{ width: `${(1 - splitRatio) * 100}%` }} className="relative pl-4">
        {rightContent}
      </div>
    </div>
  );
};
