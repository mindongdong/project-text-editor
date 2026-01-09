import React from 'react';
import { AdvancedImageLayout } from './types';

interface LayoutSelectorProps {
  onSelect: (layout: AdvancedImageLayout) => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({ onSelect }) => {
  const layouts: { id: AdvancedImageLayout; label: string; icon: React.ReactNode }[] = [
    {
      id: 'full',
      label: '글 전체 너비',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
          <path d="M3 14l5-5 5 5 5-5 5 5" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: 'split-left',
      label: '왼쪽 이미지, 오른쪽 텍스트',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
          <line x1="12" y1="3" x2="12" y2="21" strokeWidth="2" />
          <path d="M3 14l4-4 5 5" strokeWidth="2" />
          <line x1="14" y1="8" x2="19" y2="8" strokeWidth="2" />
          <line x1="14" y1="12" x2="19" y2="12" strokeWidth="2" />
          <line x1="14" y1="16" x2="19" y2="16" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: 'split-right',
      label: '오른쪽 이미지, 왼쪽 텍스트',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
          <line x1="12" y1="3" x2="12" y2="21" strokeWidth="2" />
          <path d="M12 14l4-4 5 5" strokeWidth="2" />
          <line x1="5" y1="8" x2="10" y2="8" strokeWidth="2" />
          <line x1="5" y1="12" x2="10" y2="12" strokeWidth="2" />
          <line x1="5" y1="16" x2="10" y2="16" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: 'grid-2x2',
      label: '2×2 그리드',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
          <line x1="12" y1="3" x2="12" y2="21" strokeWidth="2" />
          <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3" style={{ marginTop: '1px' }}>
        이미지를 표시하고자 하는 레이아웃을 선택하세요
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            onClick={() => onSelect(layout.id)}
            className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="text-gray-400 group-hover:text-blue-500 mb-2">{layout.icon}</div>
            <span className="text-xs text-gray-600 font-medium">{layout.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
