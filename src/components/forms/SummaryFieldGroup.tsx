'use client';

import { useState } from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { ProjectFormData } from '@/schemas/project.schema';

/**
 * SummaryFieldGroup Component
 *
 * Structured summary input component that collects:
 * - Period (startDate ~ endDate)
 * - Advisor (string)
 * - Participants (string array)
 *
 * Features:
 * - Date range picker with validation
 * - Dynamic participant list management (add/remove)
 * - Korean IME (Input Method Editor) composition event handling
 * - React Hook Form integration
 * - Accessibility compliant
 */

interface SummaryFieldGroupProps {
  register: UseFormRegister<ProjectFormData>;
  errors: FieldErrors<ProjectFormData>;
  disabled?: boolean;
  setValue: UseFormSetValue<ProjectFormData>;
  watch: UseFormWatch<ProjectFormData>;
}

export default function SummaryFieldGroup({
  register,
  errors,
  disabled = false,
  setValue,
  watch,
}: SummaryFieldGroupProps) {
  const [newParticipant, setNewParticipant] = useState('');
  const [participantError, setParticipantError] = useState<string | null>(null);

  // State for Korean IME composition tracking
  const [isComposing, setIsComposing] = useState(false);

  // Watch current participants
  const participants = watch('participants') || [];

  /**
   * Add new participant
   */
  const addParticipant = () => {
    const trimmed = newParticipant.trim();

    // Validate
    if (!trimmed) {
      setParticipantError('참여학생 이름을 입력해주세요');
      return;
    }

    if (participants.includes(trimmed)) {
      setParticipantError('이미 추가된 학생입니다');
      return;
    }

    if (participants.length >= 20) {
      setParticipantError('참여학생은 최대 20명까지 입력 가능합니다');
      return;
    }

    // Add to list
    setValue('participants', [...participants, trimmed], { shouldValidate: true });
    setNewParticipant('');
    setParticipantError(null);
  };

  /**
   * Remove participant by index
   */
  const removeParticipant = (index: number) => {
    const updated = participants.filter((_, i) => i !== index);
    setValue('participants', updated, { shouldValidate: true });
    setParticipantError(null);
  };

  /**
   * Handle Enter key in participant input
   */
  const handleParticipantKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      // Skip participant addition if IME is still composing (Korean input)
      if (isComposing) {
        return;
      }

      addParticipant();
    }
  };

  /**
   * Handle composition start (Korean IME starts)
   */
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  /**
   * Handle composition end (Korean IME completes)
   */
  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          프로젝트 요약 정보
        </h3>
        <p className="text-sm text-gray-500">
          프로젝트 기간, 지도교수, 참여학생 정보를 입력하세요
        </p>
      </div>

      {/* Period (Date Range) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
            시작일 <span className="text-red-500">*</span>
          </label>
          <input
            id="startDate"
            type="date"
            {...register('startDate')}
            disabled={disabled}
            aria-required="true"
            aria-invalid={!!errors.startDate}
            aria-describedby={errors.startDate ? 'startDate-error' : undefined}
            className={`
              w-full px-4 py-2
              border rounded-lg
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${errors.startDate
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          />
          {errors.startDate && (
            <p id="startDate-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.startDate.message}
            </p>
          )}
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
            종료일 <span className="text-red-500">*</span>
          </label>
          <input
            id="endDate"
            type="date"
            {...register('endDate')}
            disabled={disabled}
            aria-required="true"
            aria-invalid={!!errors.endDate}
            aria-describedby={errors.endDate ? 'endDate-error' : undefined}
            className={`
              w-full px-4 py-2
              border rounded-lg
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${errors.endDate
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          />
          {errors.endDate && (
            <p id="endDate-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      {/* Advisor */}
      <div>
        <label htmlFor="advisor" className="block text-sm font-medium text-gray-700 mb-2">
          지도교수
        </label>
        <input
          id="advisor"
          type="text"
          {...register('advisor')}
          disabled={disabled}
          placeholder="예: 홍길동 교수"
          aria-invalid={!!errors.advisor}
          aria-describedby={errors.advisor ? 'advisor-error' : undefined}
          className={`
            w-full px-4 py-2
            border rounded-lg
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${errors.advisor
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        />
        {errors.advisor && (
          <p id="advisor-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.advisor.message}
          </p>
        )}
      </div>

      {/* Participants */}
      <div>
        <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-2">
          참여학생
        </label>

        {/* Participant Input */}
        <div className="flex gap-2 mb-3">
          <input
            id="participants"
            type="text"
            value={newParticipant}
            onChange={(e) => {
              setNewParticipant(e.target.value);
              if (participantError) setParticipantError(null);
            }}
            onKeyDown={handleParticipantKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            disabled={disabled || participants.length >= 20}
            placeholder="학생 이름 입력 후 Enter 또는 추가 버튼 클릭"
            aria-label="참여학생 이름 입력"
            aria-invalid={!!participantError}
            aria-describedby={participantError ? 'participants-error' : undefined}
            className={`
              flex-1 px-4 py-2
              border rounded-lg
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${participantError
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          />
          <button
            type="button"
            onClick={addParticipant}
            disabled={disabled || participants.length >= 20}
            className="
              px-4 py-2
              bg-blue-600 text-white
              font-medium rounded-lg
              hover:bg-blue-700
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-colors
            "
            aria-label="참여학생 추가"
          >
            추가
          </button>
        </div>

        {/* Error Message */}
        {participantError && (
          <p id="participants-error" className="mb-3 text-sm text-red-600" role="alert">
            {participantError}
          </p>
        )}

        {/* Participant List */}
        {participants.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">
              {participants.length} / 20 명
            </p>
            <div className="flex flex-wrap gap-2">
              {participants.map((participant, index) => (
                <span
                  key={index}
                  className="
                    inline-flex items-center gap-1
                    px-3 py-1
                    bg-green-100 text-green-700
                    rounded-full text-sm font-medium
                    transition-all duration-200
                    hover:bg-green-200
                  "
                >
                  <span>{participant}</span>
                  <button
                    type="button"
                    onClick={() => removeParticipant(index)}
                    disabled={disabled}
                    aria-label={`${participant} 삭제`}
                    className="
                      ml-1 p-0.5
                      hover:bg-green-300 rounded-full
                      transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-green-500
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        <p className="mt-2 text-xs text-gray-500">
          Enter 키로 학생 추가 • 최대 20명까지 입력 가능
        </p>
      </div>

      {/* Preview */}
      {(watch('startDate') || watch('endDate') || watch('advisor') || participants.length > 0) && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-2">미리보기:</p>
          <div className="text-sm text-gray-800 space-y-1">
            {watch('startDate') && watch('endDate') && (
              <p>
                <span className="font-medium">기간:</span>{' '}
                {watch('startDate').replace(/-/g, '.')}~{watch('endDate').replace(/-/g, '.')}
              </p>
            )}
            {watch('advisor') && watch('advisor').trim() && (
              <p>
                <span className="font-medium">지도교수:</span> {watch('advisor')}
              </p>
            )}
            {participants.length > 0 && (
              <p>
                <span className="font-medium">참여학생:</span> {participants.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
