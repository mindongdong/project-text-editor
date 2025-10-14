'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { ProjectFormData, projectFormSchema } from '@/schemas/project.schema';
import ImageUploadField from '@/components/forms/ImageUploadField';
import TagInput from '@/components/forms/TagInput';
import SummaryFieldGroup from '@/components/forms/SummaryFieldGroup';
import { formatSummary } from '@/utils/formatSummary';

/**
 * Phase 2 Day 8-10: ProjectMetadataForm Component
 *
 * Complete metadata form integrating all Phase 2 components:
 * - ImageUploadField (Day 4-5): thumbnail upload with drag & drop
 * - TagInput (Day 6-7): hashtag management with keyboard shortcuts
 * - SummaryFieldGroup: structured summary inputs (period, advisor, participants)
 *
 * Features:
 * - 6 form fields: title, subTitle, thumbnail1, hashTag, summary (auto-generated), structured fields
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
      hashTag: defaultValues?.hashTag || [],
      startDate: defaultValues?.startDate || '',
      endDate: defaultValues?.endDate || '',
      advisor: defaultValues?.advisor || '',
      participants: defaultValues?.participants || [],
      summary: defaultValues?.summary || '',
    },
  });

  // Auto-generate summary when structured fields change
  useEffect(() => {
    const startDate = watch('startDate');
    const endDate = watch('endDate');
    const advisor = watch('advisor');
    const participants = watch('participants');

    // Only generate if required fields are present
    if (startDate && endDate) {
      const formattedSummary = formatSummary({
        startDate,
        endDate,
        advisor: advisor || '',
        participants: participants || [],
      });
      setValue('summary', formattedSummary, { shouldValidate: true });
    }
  }, [watch('startDate'), watch('endDate'), watch('advisor'), watch('participants'), setValue, watch]);

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

      {/* Thumbnail Field (Day 4-5 Integration) */}
      <div>
        <ImageUploadField
          label="썸네일"
          name="thumbnail1"
          register={register}
          setValue={setValue}
          currentValue={watch('thumbnail1')}
          error={errors.thumbnail1}
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

      {/* Summary Field Group (Structured Inputs) */}
      <SummaryFieldGroup
        register={register}
        errors={errors}
        disabled={isSubmitting}
        setValue={setValue}
        watch={watch}
      />

      {/* Hidden summary field for form submission */}
      <input type="hidden" {...register('summary')} />

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
          <li>제목, 해시태그, 프로젝트 기간(시작일/종료일)은 필수 입력 항목입니다</li>
          <li>썸네일은 JPG, PNG, WebP, GIF 형식을 지원하며 최대 5MB까지 업로드 가능합니다</li>
          <li>해시태그는 Enter 키로 추가하고 Backspace로 삭제할 수 있습니다</li>
          <li>프로젝트 요약 정보는 기간, 지도교수, 참여학생 정보로부터 자동 생성됩니다</li>
          <li>참여학생은 최대 20명까지 입력할 수 있으며, Enter 키로 추가하고 X 버튼으로 삭제할 수 있습니다</li>
        </ul>
      </div>
    </form>
  );
}
