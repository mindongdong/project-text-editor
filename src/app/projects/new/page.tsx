'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { OutputData } from '@editorjs/editorjs';
import ProjectMetadataForm from '@/components/forms/ProjectMetadataForm';
import { ProjectFormData, projectFormSchema } from '@/schemas/project.schema';
import { EditorRef } from '@/components/editor/EditorComponent';

// Dynamic import to avoid SSR issues with Editor.js
const EditorComponent = dynamic(
  () => import('@/components/editor/EditorComponent'),
  { ssr: false }
);

/**
 * Phase 2 Complete: Project Editor Page
 *
 * Features:
 * - Full metadata input via ProjectMetadataForm (8 fields)
 * - Content editing via EditorComponent (Image, List, Embed support)
 * - Form validation with Zod
 * - Mock API save (console.log for Phase 2)
 * - Success/error handling
 */
export default function NewProjectPage() {
  const router = useRouter();
  const editorRef = useRef<EditorRef>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /**
   * Handle editor content changes
   */
  const handleEditorChange = (data: OutputData) => {
    setHasUnsavedChanges(true);
    console.log('Editor content changed:', data);
  };

  /**
   * Handle form submission
   * Combines metadata with editor content
   */
  const handleSave = async (metaData: Partial<ProjectFormData>) => {
    if (!editorRef.current) {
      alert('에디터가 준비되지 않았습니다');
      return;
    }

    setIsSaving(true);

    try {
      // 1. Get editor data
      const editorData = await editorRef.current.save();

      // 2. Combine metadata + content
      const finalPostData: ProjectFormData = {
        title: metaData.title || '',
        subTitle: metaData.subTitle || '',
        thumbnail1: metaData.thumbnail1 || '',
        thumbnail2: metaData.thumbnail2 || '',
        hashTag: metaData.hashTag || [],
        summary: metaData.summary || '',
        isOnMain: metaData.isOnMain || false,
        isGroup: metaData.isGroup || false,
        contentJson: {
          ...editorData,
          time: editorData.time || Date.now(),
          version: editorData.version || '2.31.0',
        },
        editorVersion: '2.31.0',
      };

      // 3. Validate with Zod schema
      const validatedData = projectFormSchema.parse(finalPostData);

      // 4. Mock API call - Phase 2: Log all data to console
      console.log('=== Saving Complete Project Data ===');
      console.log('Title:', validatedData.title);
      console.log('SubTitle:', validatedData.subTitle);
      console.log('Thumbnail 1:', validatedData.thumbnail1);
      console.log('Thumbnail 2:', validatedData.thumbnail2);
      console.log('HashTags:', validatedData.hashTag);
      console.log('Summary:', validatedData.summary);
      console.log('Is On Main:', validatedData.isOnMain);
      console.log('Is Group:', validatedData.isGroup);
      console.log('Content JSON:', JSON.stringify(validatedData.contentJson, null, 2));
      console.log('Editor Version:', validatedData.editorVersion);
      console.log('====================================');

      // 5. Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 6. Save to localStorage for Phase 1 MVP
      localStorage.setItem('last-project-data', JSON.stringify(validatedData));

      // 7. Mock successful response
      const mockProjectId = 'mock-' + Date.now();

      // 8. Success handling
      alert('저장되었습니다!\n\n콘솔에서 JSON 데이터를 확인하세요.');
      setHasUnsavedChanges(false);

      // 9. Navigate to viewer page
      router.push(`/projects/${mockProjectId}`);
    } catch (error) {
      console.error('Save error:', error);

      if (error instanceof Error) {
        alert(`저장 중 오류가 발생했습니다:\n${error.message}`);
      } else {
        alert('저장 중 오류가 발생했습니다');
      }
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle cancel button
   */
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm(
        '저장하지 않은 변경사항이 있습니다.\n정말로 나가시겠습니까?'
      );
      if (!confirm) return;
    }

    router.push('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">프로젝트 생성</h1>
        <p className="text-gray-600">
          프로젝트 정보와 본문 내용을 입력하여 새 프로젝트를 작성하세요.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Metadata Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">프로젝트 정보</h2>
          <ProjectMetadataForm onSubmit={handleSave} isSubmitting={isSaving} />
        </div>

        {/* Editor */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">프로젝트 내용</h2>
          <EditorComponent ref={editorRef} onChange={handleEditorChange} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            취소
          </button>

          <button
            type="submit"
            form="metadata-form"
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                     flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                저장 중...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                저장
              </>
            )}
          </button>
        </div>
      </div>

      {/* Development Info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">✅ Phase 2 Complete</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>메타데이터</strong>: 제목, 부제목, 썸네일, 해시태그, 요약 정보, 체크박스</li>
          <li>• <strong>에디터 블록</strong>: Paragraph, Header, Image, List, Embed</li>
          <li>• <strong>Mock API</strong>: 저장 버튼을 누르면 데이터가 콘솔에 출력됩니다</li>
          <li>• 브라우저 개발자 도구의 콘솔 탭에서 전체 JSON 데이터를 확인하세요</li>
        </ul>
      </div>
    </div>
  );
}
