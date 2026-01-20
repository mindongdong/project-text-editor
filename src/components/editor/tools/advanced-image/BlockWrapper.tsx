import React, { useState, useEffect } from 'react';
import { AdvancedImageData, AdvancedImageLayout } from './types';
import { LayoutSelector } from './LayoutSelector';
import { FullWidthLayout } from './FullWidthLayout';
import { SplitLayout } from './SplitLayout';
import { GridLayout } from './GridLayout';

interface BlockWrapperProps {
  data: AdvancedImageData;
  onDataChange: (data: AdvancedImageData) => void;
  readOnly: boolean;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({ data, onDataChange, readOnly }) => {
  const [layout, setLayout] = useState<AdvancedImageLayout>(data.layout || 'empty');

  // Initialize with empty layout if no data
  useEffect(() => {
    if (!data.layout) {
      setLayout('empty');
    }
  }, [data.layout]);

  const handleLayoutSelect = (newLayout: AdvancedImageLayout) => {
    setLayout(newLayout);
    onDataChange({
      ...data,
      layout: newLayout,
      images: data.images || [],
    });
  };

  const renderContent = () => {
    switch (layout) {
      case 'empty':
        return <LayoutSelector onSelect={handleLayoutSelect} />;

      case 'full':
        return (
          <div className="relative">
            <FullWidthLayout
              image={data.images[0]}
              onUpdate={(imageData) => {
                if (!imageData.url) {
                  // If image removed, keep layout but clear image data
                  onDataChange({ ...data, images: [] });
                } else {
                  onDataChange({ ...data, images: [imageData] });
                }
              }}
              readOnly={readOnly}
            />
            {!readOnly && (
              <button
                onClick={() => handleLayoutSelect('empty')}
                className="absolute top-2 left-2 p-1 bg-white/80 rounded text-xs text-gray-600 hover:text-blue-600 shadow-sm z-10"
              >
                레이아웃 변경
              </button>
            )}
          </div>
        );

      case 'split-left':
      case 'split-right':
        return (
          <div className="relative">
            <SplitLayout
              layout={layout}
              image={data.images[0]}
              text={data.text}
              splitRatio={data.splitRatio}
              readOnly={readOnly}
              onUpdate={(updatedData) => {
                onDataChange({
                  ...data,
                  images: updatedData.image ? [updatedData.image] : [],
                  text: updatedData.text,
                  splitRatio: updatedData.splitRatio,
                });
              }}
            />
            {!readOnly && (
              <button
                onClick={() => handleLayoutSelect('empty')}
                className="absolute top-2 left-2 p-1 bg-white/80 rounded text-xs text-gray-600 hover:text-blue-600 shadow-sm z-10"
              >
                레이아웃 변경
              </button>
            )}
          </div>
        );

      default:
        if (layout.startsWith('grid')) {
          return (
            <div className="relative">
              <GridLayout
                layout={layout as 'grid-1x2' | 'grid-1x3' | 'grid-2x2' | 'grid-3x3'}
                images={data.images}
                readOnly={readOnly}
                onUpdate={(newImages: Array<{ url: string; caption?: string }>) => {
                  onDataChange({
                    ...data,
                    images: newImages,
                  });
                }}
              />
              {!readOnly && (
                <button
                  onClick={() => handleLayoutSelect('empty')}
                  className="absolute top-2 left-2 p-1 bg-white/80 rounded text-xs text-gray-600 hover:text-blue-600 shadow-sm z-20"
                >
                  레이아웃 변경
                </button>
              )}
            </div>
          );
        }
        return null;
    }
  };

  return <div className="advanced-image-block my-4">{renderContent()}</div>;
};
