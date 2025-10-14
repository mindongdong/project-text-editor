import { OutputData } from '@editorjs/editorjs';

/**
 * Test fixtures for Editor.js OutputData
 *
 * Includes sample data for all supported block types:
 * - Paragraph
 * - Header (levels 1-6)
 * - Image (with/without caption)
 * - List (ordered/unordered)
 * - Embed (YouTube/Vimeo)
 */

// Valid Paragraph block
export const paragraphBlock = {
  id: 'paragraph-1',
  type: 'paragraph',
  data: {
    text: 'This is a sample paragraph with <b>bold</b> and <i>italic</i> text.',
  },
};

// Valid Header blocks (different levels)
export const headerBlock1 = {
  id: 'header-1',
  type: 'header',
  data: {
    text: 'Heading Level 1',
    level: 1,
  },
};

export const headerBlock2 = {
  id: 'header-2',
  type: 'header',
  data: {
    text: 'Heading Level 2',
    level: 2,
  },
};

export const headerBlock3 = {
  id: 'header-3',
  type: 'header',
  data: {
    text: 'Heading Level 3',
    level: 3,
  },
};

// Valid Image block
export const imageBlock = {
  id: 'image-1',
  type: 'image',
  data: {
    file: {
      url: 'https://example.com/image.jpg',
      width: 800,
      height: 600,
    },
    caption: 'Sample image caption',
    withBorder: false,
    stretched: false,
    withBackground: false,
  },
};

// Image block without caption
export const imageBlockNoCaption = {
  id: 'image-2',
  type: 'image',
  data: {
    file: {
      url: 'https://example.com/image2.jpg',
      width: 1200,
      height: 800,
    },
    caption: '',
    withBorder: false,
    stretched: false,
    withBackground: false,
  },
};

// Invalid Image block (missing URL)
export const imageBlockInvalid = {
  id: 'image-invalid',
  type: 'image',
  data: {
    file: {},
    caption: 'Image with no URL',
  },
};

// Valid List block (unordered)
export const listBlockUnordered = {
  id: 'list-1',
  type: 'list',
  data: {
    style: 'unordered',
    items: [
      'First item',
      'Second item with <b>bold text</b>',
      'Third item',
    ],
  },
};

// Valid List block (ordered)
export const listBlockOrdered = {
  id: 'list-2',
  type: 'list',
  data: {
    style: 'ordered',
    items: [
      'Step one',
      'Step two',
      'Step three',
    ],
  },
};

// Invalid List block (empty items)
export const listBlockEmpty = {
  id: 'list-invalid',
  type: 'list',
  data: {
    style: 'unordered',
    items: [],
  },
};

// Valid Embed block (YouTube)
export const embedBlockYouTube = {
  id: 'embed-1',
  type: 'embed',
  data: {
    service: 'youtube',
    source: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    width: 580,
    height: 320,
    caption: 'Sample YouTube video',
  },
};

// Valid Embed block (Vimeo)
export const embedBlockVimeo = {
  id: 'embed-2',
  type: 'embed',
  data: {
    service: 'vimeo',
    source: 'https://vimeo.com/123456789',
    embed: 'https://player.vimeo.com/video/123456789',
    width: 580,
    height: 320,
    caption: 'Sample Vimeo video',
  },
};

// Invalid Embed block (missing embed URL)
export const embedBlockInvalid = {
  id: 'embed-invalid',
  type: 'embed',
  data: {
    service: 'youtube',
    caption: 'Embed with no URL',
  },
};

// Unsupported block type
export const unsupportedBlock = {
  id: 'unsupported-1',
  type: 'code',
  data: {
    code: 'console.log("Hello World");',
  },
};

// Complete valid OutputData with multiple blocks
export const validOutputData: OutputData = {
  time: Date.now(),
  blocks: [
    headerBlock1,
    paragraphBlock,
    imageBlock,
    listBlockUnordered,
    embedBlockYouTube,
  ],
  version: '2.28.0',
};

// OutputData with invalid blocks
export const outputDataWithInvalidBlocks: OutputData = {
  time: Date.now(),
  blocks: [
    headerBlock2,
    imageBlockInvalid,
    listBlockEmpty,
    embedBlockInvalid,
  ],
  version: '2.28.0',
};

// Empty OutputData
export const emptyOutputData: OutputData = {
  time: Date.now(),
  blocks: [],
  version: '2.28.0',
};

// OutputData with all block types
export const comprehensiveOutputData: OutputData = {
  time: Date.now(),
  blocks: [
    headerBlock1,
    headerBlock2,
    headerBlock3,
    paragraphBlock,
    imageBlock,
    imageBlockNoCaption,
    listBlockUnordered,
    listBlockOrdered,
    embedBlockYouTube,
    embedBlockVimeo,
  ],
  version: '2.28.0',
};

// OutputData with unsupported blocks
export const outputDataWithUnsupportedBlocks: OutputData = {
  time: Date.now(),
  blocks: [
    headerBlock1,
    paragraphBlock,
    unsupportedBlock,
  ],
  version: '2.28.0',
};

// OutputData for XSS testing (with script tags)
export const maliciousOutputData: OutputData = {
  time: Date.now(),
  blocks: [
    {
      id: 'malicious-1',
      type: 'paragraph',
      data: {
        text: 'This has a <script>alert("XSS")</script> tag',
      },
    },
    {
      id: 'malicious-2',
      type: 'paragraph',
      data: {
        text: '<img src="x" onerror="alert(\'XSS\')" />',
      },
    },
    {
      id: 'malicious-3',
      type: 'header',
      data: {
        text: 'Header with <script>alert("XSS")</script>',
        level: 2,
      },
    },
  ],
  version: '2.28.0',
};
