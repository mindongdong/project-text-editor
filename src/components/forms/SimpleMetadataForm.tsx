'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectFormSchemaSimple, ProjectFormDataSimple } from '@/schemas/project.schema';

interface SimpleMetadataFormProps {
  defaultValues?: Partial<ProjectFormDataSimple>;
  onSubmit: (data: Partial<ProjectFormDataSimple>) => void;
  isSubmitting?: boolean;
}

/**
 * Phase 1 MVP: Simple metadata form with only title field
 *
 * Features:
 * - Title input with validation
 * - React Hook Form integration
 * - Zod schema validation
 * - Error message display
 */
export default function SimpleMetadataForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: SimpleMetadataFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Partial<ProjectFormDataSimple>>({
    resolver: zodResolver(projectFormSchemaSimple.partial()),
    defaultValues,
  });

  return (
    <form id="metadata-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 제목 입력 필드 */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          disabled={isSubmitting}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="프로젝트 제목을 입력하세요"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.title.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          최대 200자까지 입력 가능합니다
        </p>
      </div>

      {/* 안내 메시지 */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Phase 1 MVP: 제목과 본문 내용만 입력 가능합니다.
              추가 필드(썸네일, 해시태그 등)는 Phase 2에서 구현됩니다.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
