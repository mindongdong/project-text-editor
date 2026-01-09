import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { BlockWrapper } from './advanced-image/BlockWrapper';
import { AdvancedImageData } from './advanced-image/types';

export default class AdvancedImageTool {
  private data: AdvancedImageData;
  private readOnly: boolean;
  private wrapper: HTMLElement;
  private root: Root | null = null;

  static get toolbox() {
    return {
      title: 'Image',
      icon: '<svg width="20" height="20" viewBox="-90 -74 516 424" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>',
    };
  }

  constructor({ data, readOnly }: { data: AdvancedImageData; readOnly: boolean }) {
    this.data = {
      layout: data.layout || 'empty',
      images: data.images || [],
      text: data.text || '',
      splitRatio: data.splitRatio || 0.5,
    };
    this.readOnly = readOnly;
    this.wrapper = document.createElement('div');
  }

  render() {
    if (!this.root) {
      this.root = createRoot(this.wrapper);
    }
    this._render();
    return this.wrapper;
  }

  _render() {
    if (this.root) {
      this.root.render(
        <BlockWrapper
          data={this.data}
          readOnly={this.readOnly}
          onDataChange={(newData) => {
            this.data = newData;
            // Trigger re-render to update UI with new data
            this._render();
          }}
        />
      );
    }
  }

  validate(_savedData: AdvancedImageData) {
    // Always return true to prevent Editor.js from removing the block
    // We handle empty states within the component itself (LayoutSelector)
    return true;
  }

  save() {
    return this.data;
  }
}
