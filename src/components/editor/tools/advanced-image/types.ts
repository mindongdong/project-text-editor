export type AdvancedImageLayout =
  | 'empty'
  | 'full'
  | 'split-left'
  | 'split-right'
  | 'grid-1x2'
  | 'grid-1x3'
  | 'grid-2x2'
  | 'grid-3x3';

export interface AdvancedImageData {
  layout: AdvancedImageLayout;
  images: Array<{
    url: string;
    caption?: string;
    width?: number;
    height?: number;
  }>;
  text?: string;
  splitRatio?: number; // 0.1 to 0.9
}
