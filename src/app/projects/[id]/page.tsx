'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OutputData } from '@editorjs/editorjs';
import ProjectViewer from '@/components/viewer/ProjectViewer';
import Link from 'next/link';

/**
 * Mock data for Phase 1 MVP
 * In Phase 2, this will be replaced with actual API calls
 */
const MOCK_PROJECT_DATA = {
  title: 'Editor.js 기반 프로젝트 샘플',
  contentJson: {
    time: Date.now(),
    blocks: [
      {
        id: '1',
        type: 'header',
        data: {
          text: 'Welcome to Project Editor',
          level: 1,
        },
      },
      {
        id: '2',
        type: 'paragraph',
        data: {
          text: 'This is a sample project created with Editor.js. You can create rich, structured content using various blocks.',
        },
      },
      {
        id: '3',
        type: 'header',
        data: {
          text: 'Phase 1 Features',
          level: 2,
        },
      },
      {
        id: '4',
        type: 'paragraph',
        data: {
          text: '✓ Title input<br>✓ Paragraph blocks<br>✓ Header blocks (h1-h4)<br>✓ JSON-based storage',
        },
      },
    ],
    version: '2.31.0',
  } as OutputData,
};

/**
 * Phase 1 MVP: Project Detail Page
 *
 * Features:
 * - Dynamic routing with [id] parameter
 * - Mock data loading (console check)
 * - ProjectViewer component integration
 * - Loading and error states
 * - Back navigation
 */
export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<{
    title: string;
    contentJson: OutputData;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true);

        // Phase 1: Check if there's saved data in localStorage
        const savedData = localStorage.getItem('last-project-data');

        if (savedData) {
          const parsed = JSON.parse(savedData);
          setProject(parsed);
          console.log('=== Loaded Project from localStorage ===');
          console.log('Project ID:', params.id);
          console.log('Data:', parsed);
        } else {
          // Use mock data as fallback
          setProject(MOCK_PROJECT_DATA);
          console.log('=== Using Mock Project Data ===');
          console.log('Project ID:', params.id);
          console.log('Data:', MOCK_PROJECT_DATA);
        }

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        console.error('Error loading project:', err);
        setError('프로젝트를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [params.id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <svg
              className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
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
            <p className="text-gray-600">프로젝트를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg
              className="h-6 w-6 text-red-400 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-1">오류 발생</h3>
              <p className="text-red-700">{error || '프로젝트를 찾을 수 없습니다.'}</p>
              <Link
                href="/"
                className="mt-4 inline-block text-red-600 hover:text-red-800 font-medium"
              >
                ← 홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div>
      {/* Back Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            뒤로 가기
          </Link>
        </div>
      </div>

      {/* Project Content */}
      <ProjectViewer title={project.title} contentJson={project.contentJson} />

      {/* Development Info */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">🚧 Phase 1 MVP 안내</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 저장 직후: localStorage에 저장된 데이터를 표시합니다</li>
            <li>• 직접 URL 접근: 샘플 Mock 데이터를 표시합니다</li>
            <li>• 실제 데이터베이스 연동은 Phase 2에서 구현됩니다</li>
            <li>• 프로젝트 ID: {params.id as string}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
