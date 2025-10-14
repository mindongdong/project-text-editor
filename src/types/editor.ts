import { OutputData, OutputBlockData } from '@editorjs/editorjs';

/**
 * Extended Editor.js block with type-safe data structure
 */
export interface EditorBlock extends OutputBlockData {
  id: string;
  type: 'paragraph' | 'header' | 'image' | 'embed' | 'list';
  data: {
    text?: string;
    level?: number;
    file?: {
      url: string;
      width?: number;
      height?: number;
    };
    caption?: string;
    embed?: string;
    width?: number;
    height?: number;
    items?: string[];
    style?: 'ordered' | 'unordered';
  };
}

/**
 * Complete project form data structure
 * Matches the Project model in PRD
 */
export interface ProjectFormData {
  title: string;
  subTitle: string;
  thumbnail1: string;
  thumbnail2: string;
  hashTag: string[];
  summary: string;
  isOnMain: boolean;
  isGroup: boolean;
  contentJson: OutputData;
  editorVersion: string;
}

/**
 * Editor component props
 */
export interface EditorComponentProps {
  initialData?: OutputData;
  onChange?: (data: OutputData) => void;
  readOnly?: boolean;
}

/**
 * Draft data stored in localStorage
 */
export interface DraftData {
  data: OutputData;
  savedAt: string;
}
