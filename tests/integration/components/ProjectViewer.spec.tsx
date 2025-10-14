import { render, screen } from '@testing-library/react';
import ProjectViewer from '@/components/viewer/ProjectViewer';
import {
  validOutputData,
  paragraphBlock,
  headerBlock1,
  headerBlock2,
  headerBlock3,
  imageBlock,
  listBlockOrdered,
  listBlockUnordered,
  embedBlockYouTube,
  maliciousOutputData,
} from '../../fixtures/editorOutput';
import { OutputData } from '@editorjs/editorjs';

/**
 * Integration tests for ProjectViewer Component
 *
 * Tests viewer integration including:
 * - Block type rendering (Paragraph, Header, Image, List, Embed)
 * - Empty/invalid state handling
 * - HTML sanitization verification
 * - Metadata display
 * - Error handling
 */

describe('ProjectViewer', () => {
  describe('Block Type Rendering', () => {
    it('should render paragraph blocks with sanitized HTML', () => {
      const content: OutputData = {
        time: Date.now(),
        blocks: [paragraphBlock],
        version: '2.28.0',
      };

      render(<ProjectViewer title="테스트" contentJson={content} />);

      expect(screen.getByText(/sample paragraph/i)).toBeInTheDocument();
      // Script tags should be removed
      expect(screen.queryByRole('script')).not.toBeInTheDocument();
    });

    it('should render header blocks with correct tags and classes', () => {
      const content: OutputData = {
        time: Date.now(),
        blocks: [headerBlock1, headerBlock2, headerBlock3],
        version: '2.28.0',
      };

      render(<ProjectViewer title="테스트" contentJson={content} />);

      // Use getByText with heading role since title is also h1
      expect(screen.getByRole('heading', { level: 1, name: /Heading Level 1/ })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /Heading Level 2/ })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /Heading Level 3/ })).toBeInTheDocument();

      const h1 = screen.getByRole('heading', { level: 1, name: /Heading Level 1/ });
      const h2 = screen.getByRole('heading', { level: 2, name: /Heading Level 2/ });

      expect(h1).toHaveClass('text-4xl', 'font-bold');
      expect(h2).toHaveClass('text-3xl', 'font-bold');
    });

    it('should render image block with src, alt, and caption', () => {
      const content: OutputData = {
        time: Date.now(),
        blocks: [imageBlock],
        version: '2.28.0',
      };

      render(<ProjectViewer title="테스트" contentJson={content} />);

      const img = screen.getByAltText('Sample image caption');
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
      expect(img).toHaveAttribute('loading', 'lazy');

      expect(screen.getByText('Sample image caption')).toBeInTheDocument();
    });

    it('should render ordered list block as ol with items', () => {
      const content: OutputData = {
        time: Date.now(),
        blocks: [listBlockOrdered],
        version: '2.28.0',
      };

      const { container } = render(<ProjectViewer title="테스트" contentJson={content} />);

      // Get the ordered list from the content area (not from footer)
      const orderedLists = container.querySelectorAll('ol');
      const contentList = orderedLists[0]; // First ol is in the content area
      expect(contentList).toBeInTheDocument();
      expect(contentList.tagName).toBe('OL');

      expect(screen.getByText('Step one')).toBeInTheDocument();
      expect(screen.getByText('Step two')).toBeInTheDocument();
    });

    it('should render unordered list block as ul with items', () => {
      const content: OutputData = {
        time: Date.now(),
        blocks: [listBlockUnordered],
        version: '2.28.0',
      };

      const { container } = render(<ProjectViewer title="테스트" contentJson={content} />);

      // Find UL in content area using class (footer has different class)
      const contentList = container.querySelector('ul.list-disc');
      expect(contentList).toBeInTheDocument();
      expect(contentList?.tagName).toBe('UL');

      expect(screen.getByText('First item')).toBeInTheDocument();
      expect(screen.getByText(/Second item with/)).toBeInTheDocument();
    });

    it('should render embed block with iframe', () => {
      const content: OutputData = {
        time: Date.now(),
        blocks: [embedBlockYouTube],
        version: '2.28.0',
      };

      const { container } = render(<ProjectViewer title="테스트" contentJson={content} />);

      const iframe = container.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/dQw4w9WgXcQ');
      expect(iframe).toHaveAttribute('allowfullscreen');

      expect(screen.getByText('Sample YouTube video')).toBeInTheDocument();
    });
  });

  describe('Empty/Invalid States', () => {
    it('should show fallback message when contentJson.blocks is empty', () => {
      const emptyContent: OutputData = {
        time: Date.now(),
        blocks: [],
        version: '2.28.0',
      };

      render(<ProjectViewer title="테스트" contentJson={emptyContent} />);

      expect(screen.getByText(/콘텐츠를 불러올 수 없습니다/)).toBeInTheDocument();
    });

    it('should show error message when image URL is missing', () => {
      const invalidImageBlock = {
        id: 'invalid-image',
        type: 'image',
        data: { file: {} }, // No URL
      };

      const content: OutputData = {
        time: Date.now(),
        blocks: [invalidImageBlock],
        version: '2.28.0',
      };

      render(<ProjectViewer title="테스트" contentJson={content} />);

      expect(screen.getByText(/이미지 URL이 없습니다/)).toBeInTheDocument();
    });

    it('should show error message when embed URL is missing', () => {
      const invalidEmbedBlock = {
        id: 'invalid-embed',
        type: 'embed',
        data: {}, // No embed URL
      };

      const content: OutputData = {
        time: Date.now(),
        blocks: [invalidEmbedBlock],
        version: '2.28.0',
      };

      render(<ProjectViewer title="테스트" contentJson={content} />);

      expect(screen.getByText(/임베드 URL이 없습니다/)).toBeInTheDocument();
    });

    it('should show warning for unsupported block type', () => {
      const unsupportedBlock = {
        id: 'unsupported',
        type: 'code', // Not supported yet
        data: { code: 'console.log("test")' },
      };

      const content: OutputData = {
        time: Date.now(),
        blocks: [unsupportedBlock],
        version: '2.28.0',
      };

      render(<ProjectViewer title="테스트" contentJson={content} />);

      expect(screen.getByText(/지원되지 않는 블록 타입/)).toBeInTheDocument();
      expect(screen.getByText(/code/)).toBeInTheDocument();
    });
  });

  describe('Sanitization Verification', () => {
    it('should apply sanitizeBasic to paragraph text', () => {
      const { container } = render(<ProjectViewer title="테스트" contentJson={maliciousOutputData} />);

      // Script tags should be removed from rendered output
      const scripts = container.querySelectorAll('script');
      expect(scripts.length).toBe(0);

      // The paragraph text should still be visible (without the script)
      expect(screen.getByText(/This has a/)).toBeInTheDocument();
    });

    it('should apply sanitizeBasic to header text', () => {
      const maliciousHeader = {
        id: 'malicious-header',
        type: 'header',
        data: {
          text: 'Safe Title<script>alert("xss")</script>',
          level: 2,
        },
      };

      const content: OutputData = {
        time: Date.now(),
        blocks: [maliciousHeader],
        version: '2.28.0',
      };

      const { container } = render(<ProjectViewer title="테스트" contentJson={content} />);

      const scripts = container.querySelectorAll('script');
      expect(scripts.length).toBe(0);

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Safe Title/);
    });

    it('should apply sanitizeBasic to list items', () => {
      const maliciousList = {
        id: 'malicious-list',
        type: 'list',
        data: {
          style: 'unordered',
          items: [
            'Safe item',
            'Malicious<script>alert("xss")</script> item',
          ],
        },
      };

      const content: OutputData = {
        time: Date.now(),
        blocks: [maliciousList],
        version: '2.28.0',
      };

      const { container } = render(<ProjectViewer title="테스트" contentJson={content} />);

      const scripts = container.querySelectorAll('script');
      expect(scripts.length).toBe(0);

      expect(screen.getByText('Safe item')).toBeInTheDocument();
      expect(screen.getByText(/Malicious/)).toBeInTheDocument();
    });

    it('should apply sanitizeBasic to image captions', () => {
      const maliciousImage = {
        id: 'malicious-image',
        type: 'image',
        data: {
          file: { url: 'https://example.com/test.jpg' },
          caption: 'Caption<script>alert("xss")</script>',
        },
      };

      const content: OutputData = {
        time: Date.now(),
        blocks: [maliciousImage],
        version: '2.28.0',
      };

      const { container } = render(<ProjectViewer title="테스트" contentJson={content} />);

      const scripts = container.querySelectorAll('script');
      expect(scripts.length).toBe(0);

      expect(screen.getByText(/Caption/)).toBeInTheDocument();
    });

    it('should remove script tags from rendered output', () => {
      const { container } = render(<ProjectViewer title="테스트" contentJson={maliciousOutputData} />);

      // No script elements should exist in the rendered output
      const scripts = container.querySelectorAll('script');
      expect(scripts.length).toBe(0);

      // innerHTML should not contain <script> tags
      expect(container.innerHTML).not.toContain('<script>');
      expect(container.innerHTML).not.toContain('alert');
    });
  });

  describe('Metadata Display', () => {
    it('should render title correctly', () => {
      render(<ProjectViewer title="프로젝트 제목" contentJson={validOutputData} />);

      const title = screen.getByRole('heading', { level: 1, name: /프로젝트 제목/ });
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('text-4xl', 'font-bold');
    });

    it('should format timestamp to Korean locale', () => {
      const timestamp = new Date('2024-01-15').getTime();
      const content: OutputData = {
        time: timestamp,
        blocks: [paragraphBlock],
        version: '2.28.0',
      };

      render(<ProjectViewer title="테스트" contentJson={content} />);

      const time = screen.getByText(/2024년/);
      expect(time).toBeInTheDocument();
      expect(time.tagName).toBe('TIME');
      expect(time).toHaveAttribute('datetime');
    });

    it('should display Editor.js version', () => {
      render(<ProjectViewer title="테스트" contentJson={validOutputData} />);

      expect(screen.getByText(/Editor\.js v2\.28\.0/)).toBeInTheDocument();
    });

    it('should display supported block types in footer', () => {
      render(<ProjectViewer title="테스트" contentJson={validOutputData} />);

      expect(screen.getByText(/현재 지원되는 블록 타입/)).toBeInTheDocument();
      expect(screen.getByText(/Paragraph - 일반 텍스트/)).toBeInTheDocument();
      expect(screen.getByText(/Header - 제목/)).toBeInTheDocument();
      expect(screen.getByText(/Image - 이미지 업로드 및 URL/)).toBeInTheDocument();
      expect(screen.getByText(/List - 번호 매기기/)).toBeInTheDocument();
      expect(screen.getByText(/Embed - YouTube, Vimeo 영상/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error message for block rendering errors', () => {
      const corruptedBlock = {
        id: 'corrupted',
        type: 'paragraph',
        data: null, // This should cause rendering error
      };

      const content: OutputData = {
        time: Date.now(),
        blocks: [corruptedBlock],
        version: '2.28.0',
      };

      // Spy on console.error to suppress error output in tests
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<ProjectViewer title="테스트" contentJson={content} />);

      expect(screen.getByText(/블록을 렌더링할 수 없습니다/)).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });

    it('should warn about unsupported block types in console', () => {
      const unsupportedBlock = {
        id: 'unsupported',
        type: 'table',
        data: {},
      };

      const content: OutputData = {
        time: Date.now(),
        blocks: [unsupportedBlock],
        version: '2.28.0',
      };

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      render(<ProjectViewer title="테스트" contentJson={content} />);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Unsupported block type:', 'table');

      consoleWarnSpy.mockRestore();
    });

    it('should handle invalid block data gracefully', () => {
      const invalidBlocks = [
        { id: '1', type: 'paragraph', data: { text: '' } }, // Empty text
        { id: '2', type: 'header', data: { level: 10 } }, // Invalid level
        { id: '3', type: 'list', data: { items: [] } }, // Empty list
      ];

      const content: OutputData = {
        time: Date.now(),
        blocks: invalidBlocks,
        version: '2.28.0',
      };

      render(<ProjectViewer title="테스트" contentJson={content} />);

      // Should not crash, component should render
      expect(screen.getByText('테스트')).toBeInTheDocument();
    });
  });
});
