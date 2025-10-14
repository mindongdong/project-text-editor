'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProjectFormData, projectFormSchema } from '@/schemas/project.schema';
import ImageUploadField from '@/components/forms/ImageUploadField';
import TagInput from '@/components/forms/TagInput';

/**
 * Phase 2 Day 8-10: ProjectMetadataForm Component
 *
 * Complete metadata form integrating all Phase 2 components:
 * - ImageUploadField (Day 4-5): thumbnail uploads with drag & drop
 * - TagInput (Day 6-7): hashtag management with keyboard shortcuts
 *
 * Features:
 * - 8 form fields: title, subTitle, thumbnail1, thumbnail2, hashTag, summary, isOnMain, isGroup
 * - React Hook Form integration with Zod validation
 * - Full accessibility compliance (WCAG 2.1 AA)
 * - Responsive design with Tailwind CSS
 * - Real-time validation and error display
 * - Integration with existing form submission workflow
 */

interface ProjectMetadataFormProps {
  defaultValues?: Partial<ProjectFormData>;
  onSubmit: (data: Partial<ProjectFormData>) => void;
  isSubmitting?: boolean;
}

export default function ProjectMetadataForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: ProjectMetadataFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Partial<ProjectFormData>>({
    resolver: zodResolver(projectFormSchema.partial()),
    defaultValues: {
      title: defaultValues?.title || '',
      subTitle: defaultValues?.subTitle || '',
      thumbnail1: defaultValues?.thumbnail1 || '',
      thumbnail2: defaultValues?.thumbnail2 || '',
      hashTag: defaultValues?.hashTag || [],
      summary: defaultValues?.summary || '',
      isOnMain: defaultValues?.isOnMain || false,
      isGroup: defaultValues?.isGroup || false,
    },
  });

  return (
    <form
      id="metadata-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      aria-label="프로젝트 메타데이터 입력 폼"
    >
      {/* Title Field (Required) */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          disabled={isSubmitting}
          placeholder="프로젝트 제목을 입력하세요 (최대 200자)"
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
          className={`
            w-full px-4 py-2
            border rounded-lg
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${errors.title
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        />
        {errors.title && (
          <p id="title-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* SubTitle Field (Optional) */}
      <div>
        <label htmlFor="subTitle" className="block text-sm font-medium text-gray-700 mb-2">
          부제목
        </label>
        <input
          id="subTitle"
          type="text"
          {...register('subTitle')}
          disabled={isSubmitting}
          placeholder="프로젝트 부제목을 입력하세요 (최대 300자)"
          aria-invalid={!!errors.subTitle}
          aria-describedby={errors.subTitle ? 'subTitle-error' : undefined}
          className={`
            w-full px-4 py-2
            border rounded-lg
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${errors.subTitle
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        />
        {errors.subTitle && (
          <p id="subTitle-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.subTitle.message}
          </p>
        )}
      </div>

      {/* Thumbnail Fields (Day 4-5 Integration) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ImageUploadField
          label="썸네일 1"
          name="thumbnail1"
          register={register}
          setValue={setValue}
          currentValue={watch('thumbnail1')}
          error={errors.thumbnail1}
        />
        <ImageUploadField
          label="썸네일 2"
          name="thumbnail2"
          register={register}
          setValue={setValue}
          currentValue={watch('thumbnail2')}
          error={errors.thumbnail2}
        />
      </div>

      {/* HashTag Field (Day 6-7 Integration) */}
      <div>
        <label htmlFor="hashTag" className="block text-sm font-medium text-gray-700 mb-2">
          해시태그 <span className="text-red-500">*</span>
        </label>
        <TagInput
          value={watch('hashTag') || []}
          onChange={(tags) => setValue('hashTag', tags, { shouldValidate: true, shouldDirty: true })}
          placeholder="Enter를 눌러 태그 추가"
          maxTags={10}
          error={errors.hashTag as any}
          disabled={isSubmitting}
        />
      </div>

      {/* Summary Field (Required) */}
      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
          요약 정보 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="summary"
          {...register('summary')}
          disabled={isSubmitting}
          placeholder="프로젝트 요약 정보를 입력하세요"
          rows={4}
          aria-required="true"
          aria-invalid={!!errors.summary}
          aria-describedby={errors.summary ? 'summary-error' : undefined}
          className={`
            w-full px-4 py-2
            border rounded-lg
            transition-colors resize-vertical
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${errors.summary
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        />
        {errors.summary && (
          <p id="summary-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.summary.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          프로젝트의 핵심 내용을 간단히 설명해주세요
        </p>
      </div>

      {/* Checkbox Fields */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-3">표시 설정</p>

        {/* isOnMain Checkbox */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="isOnMain"
              type="checkbox"
              {...register('isOnMain')}
              disabled={isSubmitting}
              aria-describedby="isOnMain-description"
              className="
                w-4 h-4
                text-blue-600
                border-gray-300 rounded
                focus:ring-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            />
          </div>
          <div className="ml-3">
            <label htmlFor="isOnMain" className="text-sm font-medium text-gray-700 cursor-pointer">
              메인 페이지에 표시
            </label>
            <p id="isOnMain-description" className="text-xs text-gray-500 mt-1">
              이 프로젝트를 메인 페이지에서 강조 표시합니다
            </p>
          </div>
        </div>

        {/* isGroup Checkbox */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="isGroup"
              type="checkbox"
              {...register('isGroup')}
              disabled={isSubmitting}
              aria-describedby="isGroup-description"
              className="
                w-4 h-4
                text-blue-600
                border-gray-300 rounded
                focus:ring-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            />
          </div>
          <div className="ml-3">
            <label htmlFor="isGroup" className="text-sm font-medium text-gray-700 cursor-pointer">
              그룹 프로젝트
            </label>
            <p id="isGroup-description" className="text-xs text-gray-500 mt-1">
              이 프로젝트가 팀 또는 그룹으로 진행된 경우 체크하세요
            </p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
          className="
            px-6 py-2
            border border-gray-300 rounded-lg
            text-gray-700 font-medium
            hover:bg-gray-50
            focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="
            px-6 py-2
            bg-blue-600 text-white rounded-lg font-medium
            hover:bg-blue-700
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              저장 중...
            </span>
          ) : (
            '저장하기'
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">💡 작성 가이드:</span>
        </p>
        <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
          <li>제목, 해시태그, 요약 정보는 필수 입력 항목입니다</li>
          <li>썸네일은 JPG, PNG, WebP, GIF 형식을 지원하며 최대 5MB까지 업로드 가능합니다</li>
          <li>해시태그는 Enter 키로 추가하고 Backspace로 삭제할 수 있습니다</li>
          <li>요약 정보는 프로젝트 목록에서 표시됩니다</li>
        </ul>
      </div>
    </form>
  );
}
