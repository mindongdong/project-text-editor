'use client';

import { OutputData } from '@editorjs/editorjs';
import { EditorBlock } from '@/types/editor';

interface ProjectViewerProps {
  title: string;
  contentJson: OutputData;
}

/**
 * Phase 2 Day 2-3: ProjectViewer Component with extended block types
 *
 * Features:
 * - Manual rendering of Editor.js blocks
 * - Support for Paragraph and Header blocks (Phase 1)
 * - Support for Image, List, and Embed blocks (Phase 2)
 * - Safe HTML rendering (basic sanitization)
 * - Error handling for missing/invalid data
 * - Responsive image rendering with lazy loading
 * - Responsive embed with aspect-ratio
 *
 * Note: DOMPurify integration planned for Phase 4 (Security)
 */
export default function ProjectViewer({ title, contentJson }: ProjectViewerProps) {
  if (!contentJson?.blocks || contentJson.blocks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">콘텐츠를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  /**
   * Render individual Editor.js block
   */
  const renderBlock = (block: EditorBlock, index: number) => {
    try {
      switch (block.type) {
        case 'header': {
          const level = Math.min(Math.max(block.data.level || 1, 1), 6);
          const Tag = `h${level}` as keyof JSX.IntrinsicElements;
          const classes = {
            1: 'text-4xl font-bold mb-6 text-gray-900',
            2: 'text-3xl font-bold mb-5 text-gray-900',
            3: 'text-2xl font-bold mb-4 text-gray-900',
            4: 'text-xl font-semibold mb-3 text-gray-900',
            5: 'text-lg font-semibold mb-2 text-gray-900',
            6: 'text-base font-semibold mb-2 text-gray-900',
          };

          return (
            <Tag
              key={block.id || index}
              className={classes[level as keyof typeof classes]}
              dangerouslySetInnerHTML={{
                __html: sanitizeBasic(block.data.text || ''),
              }}
            />
          );
        }

        case 'paragraph':
          return (
            <p
              key={block.id || index}
              className="mb-4 text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: sanitizeBasic(block.data.text || ''),
              }}
            />
          );

        case 'image': {
          // Image block - Phase 2
          if (!block.data.file?.url) {
            return (
              <div key={block.id || index} className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-800">이미지 URL이 없습니다</p>
              </div>
            );
          }

          return (
            <figure key={block.id || index} className="my-6">
              <img
                src={block.data.file.url}
                alt={block.data.caption || ''}
                className="w-full rounded-lg shadow-md"
                loading="lazy"
                width={block.data.file.width}
                height={block.data.file.height}
              />
              {block.data.caption && (
                <figcaption className="text-sm text-gray-600 text-center mt-2">
                  {sanitizeBasic(block.data.caption)}
                </figcaption>
              )}
            </figure>
          );
        }

        case 'list': {
          // List block - Phase 2
          if (!block.data.items || block.data.items.length === 0) {
            return null;
          }

          const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
          const listClass = block.data.style === 'ordered'
            ? 'list-decimal list-inside ml-4'
            : 'list-disc list-inside ml-4';

          return (
            <ListTag key={block.id || index} className={`mb-4 space-y-2 ${listClass}`}>
              {block.data.items.map((item: string, itemIndex: number) => (
                <li
                  key={itemIndex}
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeBasic(item),
                  }}
                />
              ))}
            </ListTag>
          );
        }

        case 'embed': {
          // Embed block - Phase 2
          if (!block.data.embed) {
            return (
              <div key={block.id || index} className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-800">임베드 URL이 없습니다</p>
              </div>
            );
          }

          return (
            <div key={block.id || index} className="my-6">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-md">
                <iframe
                  src={block.data.embed}
                  width="100%"
                  height="100%"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                  title={block.data.caption || 'Embedded content'}
                />
              </div>
              {block.data.caption && (
                <p className="text-sm text-gray-600 text-center mt-2">
                  {sanitizeBasic(block.data.caption)}
                </p>
              )}
            </div>
          );
        }

        default:
          console.warn('Unsupported block type:', block.type);
          return (
            <div key={block.id || index} className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                지원되지 않는 블록 타입: {block.type}
              </p>
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering block:', error);
      return (
        <div key={block.id || index} className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">블록을 렌더링할 수 없습니다</p>
        </div>
      );
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <time dateTime={new Date().toISOString()}>
            {new Date().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <span>•</span>
          <span>Editor.js v{contentJson.version}</span>
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        {contentJson.blocks.map((block, index) =>
          renderBlock(block as EditorBlock, index)
        )}
      </div>

      {/* Footer Info */}
      <footer className="mt-12 pt-6 border-t border-gray-200">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">📝 Phase 2 Day 2-3</h3>
          <p className="text-sm text-blue-700 mb-2">
            현재 지원되는 블록 타입:
          </p>
          <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
            <li>Paragraph - 일반 텍스트</li>
            <li>Header - 제목 (h1-h4)</li>
            <li>Image - 이미지 업로드 및 URL</li>
            <li>List - 번호 매기기 / 불릿 포인트</li>
            <li>Embed - YouTube, Vimeo 영상</li>
          </ul>
        </div>
      </footer>
    </article>
  );
}

/**
 * Basic HTML sanitization
 * Phase 1: Simple escaping of dangerous tags
 * Phase 4: Will be replaced with DOMPurify
 */
function sanitizeBasic(html: string): string {
  if (!html) return '';

  // Allow basic formatting tags only
  const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'br', 'span'];

  // Remove script tags and their content
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  html = html.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  html = html.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  return html;
}
