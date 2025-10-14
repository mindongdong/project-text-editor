'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
// @ts-ignore - Paragraph doesn't have proper types
import Paragraph from '@editorjs/paragraph';
// @ts-ignore - Image doesn't have proper types
import ImageTool from '@editorjs/image';
// @ts-ignore - List doesn't have proper types
import List from '@editorjs/list';
// @ts-ignore - Embed doesn't have proper types
import Embed from '@editorjs/embed';
import { EditorComponentProps } from '@/types/editor';

/**
 * Phase 2 Day 2-3: EditorComponent with extended block types
 *
 * Features:
 * - Editor.js initialization with proper cleanup
 * - Paragraph and Header blocks (Phase 1)
 * - Image block with upload support (Phase 2)
 * - List block (ordered/unordered) (Phase 2)
 * - Embed block (YouTube, Vimeo) (Phase 2)
 * - onChange callback for parent component
 * - Read-only mode support
 * - Imperative save() method via ref
 */
export interface EditorRef {
  save: () => Promise<OutputData>;
}

const EditorComponent = forwardRef<EditorRef, EditorComponentProps>(
  ({ initialData, onChange, readOnly = false }, ref) => {
    const editorRef = useRef<EditorJS | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Expose save method to parent via ref
    useImperativeHandle(ref, () => ({
      save: async (): Promise<OutputData> => {
        if (!editorRef.current) {
          throw new Error('Editor is not initialized');
        }

        try {
          const savedData = await editorRef.current.save();
          return savedData;
        } catch (error) {
          console.error('Saving failed:', error);
          throw error;
        }
      },
    }));

    useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
    }, []);

    useEffect(() => {
      // Only initialize on client side
      if (!mounted) return;

      // Prevent double initialization
      if (editorRef.current) return;

      const initEditor = async () => {
        try {
          const editor = new EditorJS({
            holder: 'editorjs-container',
            readOnly,
            placeholder: '내용을 입력하세요. Tab 또는 /를 눌러 블록을 추가할 수 있습니다.',
            data: initialData,
            minHeight: 400,

            tools: {
              /**
               * Header tool configuration
               * Supports h1-h4 levels for Phase 1
               */
              header: {
                // @ts-ignore
                class: Header,
                config: {
                  placeholder: '제목을 입력하세요',
                  levels: [1, 2, 3, 4],
                  defaultLevel: 2,
                },
                inlineToolbar: true,
              },

              /**
               * Paragraph tool (default)
               * Basic text editing
               */
              paragraph: {
                // @ts-ignore - Paragraph type issues with Editor.js
                class: Paragraph,
                inlineToolbar: true,
              },

              /**
               * Image tool - Phase 2
               * File upload and URL support
               */
              image: {
                // @ts-ignore
                class: ImageTool,
                config: {
                  endpoints: {
                    byFile: '/api/upload-image', // API endpoint from Day 1-2
                  },
                  captionPlaceholder: '이미지 캡션을 입력하세요 (선택사항)',
                  buttonContent: '이미지 선택',
                  uploader: {
                    /**
                     * Upload image by file
                     */
                    async uploadByFile(file: File) {
                      try {
                        // Client-side validation
                        const maxSize = 5 * 1024 * 1024; // 5MB
                        if (file.size > maxSize) {
                          throw new Error('파일 크기는 5MB를 초과할 수 없습니다');
                        }

                        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
                        if (!allowedTypes.includes(file.type)) {
                          throw new Error('지원되지 않는 파일 형식입니다 (JPG, PNG, WebP, GIF만 가능)');
                        }

                        // Create FormData and upload
                        const formData = new FormData();
                        formData.append('image', file);

                        const response = await fetch('/api/upload-image', {
                          method: 'POST',
                          body: formData,
                        });

                        if (!response.ok) {
                          const errorData = await response.json();
                          throw new Error(errorData.error || '이미지 업로드에 실패했습니다');
                        }

                        const result = await response.json();

                        // Return Editor.js compatible format
                        return {
                          success: 1,
                          file: {
                            url: result.file.url,
                            width: result.file.width,
                            height: result.file.height,
                          },
                        };
                      } catch (error) {
                        console.error('Image upload error:', error);
                        alert(error instanceof Error ? error.message : '이미지 업로드 중 오류가 발생했습니다');

                        return {
                          success: 0,
                        };
                      }
                    },

                    /**
                     * Upload image by URL
                     */
                    async uploadByUrl(url: string) {
                      try {
                        // Validate URL format
                        new URL(url);

                        return {
                          success: 1,
                          file: {
                            url,
                          },
                        };
                      } catch (error) {
                        return {
                          success: 0,
                        };
                      }
                    },
                  },
                },
              },

              /**
               * List tool - Phase 2
               * Ordered and unordered lists
               */
              list: {
                // @ts-ignore
                class: List,
                inlineToolbar: true,
                config: {
                  defaultStyle: 'unordered',
                },
              },

              /**
               * Embed tool - Phase 2
               * YouTube and Vimeo support
               */
              embed: {
                // @ts-ignore
                class: Embed,
                config: {
                  services: {
                    youtube: true,
                    vimeo: true,
                    coub: true,
                  },
                },
              },
            },

            /**
             * Called when editor is fully initialized
             */
            onReady: () => {
              console.log('Editor.js is ready to work!');
              setIsReady(true);
            },

            /**
             * Called when content changes
             * Triggers onChange callback with debounce in parent
             */
            onChange: async (api) => {
              if (onChange && !readOnly) {
                try {
                  const data = await api.saver.save();
                  onChange(data);
                } catch (error) {
                  console.error('Error in onChange handler:', error);
                }
              }
            },
          });

          editorRef.current = editor;
        } catch (error) {
          console.error('Failed to initialize Editor.js:', error);
        }
      };

      initEditor();

      // Cleanup function
      return () => {
        if (editorRef.current && editorRef.current.destroy) {
          editorRef.current.destroy();
          editorRef.current = null;
          setIsReady(false);
        }
      };
    }, [initialData, readOnly, onChange, mounted]);

    // Render nothing on server-side to avoid hydration issues
    if (!mounted) {
      return (
        <div className="min-h-[400px] p-4 border rounded-lg bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">에디터를 불러오는 중...</p>
        </div>
      );
    }

    return (
      <div className="editor-wrapper">
        <div
          id="editorjs-container"
          className="prose max-w-none min-h-[400px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isReady && (
          <div className="mt-2 text-sm text-gray-500">
            💡 Tip: Tab 또는 /로 블록 추가 (Paragraph, Header, Image, List, Embed)
          </div>
        )}
      </div>
    );
  }
);

EditorComponent.displayName = 'EditorComponent';

export default EditorComponent;
