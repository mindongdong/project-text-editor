'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { FieldError } from 'react-hook-form';

/**
 * Phase 2 Day 6-7: TagInput Component
 *
 * Features:
 * - Enter key to add new tags
 * - Backspace to remove last tag (when input is empty)
 * - Click X button to delete specific tag
 * - Duplicate tag prevention
 * - Maximum tag limit (default: 10)
 * - Korean IME (Input Method Editor) composition event handling
 * - React Hook Form integration
 * - Accessibility compliant (ARIA labels, keyboard navigation)
 * - No external dependencies (pure React implementation)
 *
 * Props:
 * - value: Current array of tags
 * - onChange: Callback when tags change
 * - placeholder: Input placeholder text
 * - maxTags: Maximum number of tags allowed (default: 10)
 * - error: Validation error from React Hook Form
 * - disabled: Whether input is disabled
 */

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  error?: FieldError;
  disabled?: boolean;
}

export default function TagInput({
  value = [],
  onChange,
  placeholder = 'Enter를 눌러 태그 추가',
  maxTags = 10,
  error,
  disabled = false,
}: TagInputProps) {
  // State for current input value
  const [inputValue, setInputValue] = useState('');

  // State for validation error
  const [validationError, setValidationError] = useState<string | null>(null);

  // State for Korean IME composition tracking
  const [isComposing, setIsComposing] = useState(false);

  // Input ref for focus management
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Validate tag before adding
   */
  const validateTag = (tag: string): string | null => {
    // Check if empty
    if (!tag.trim()) {
      return '태그를 입력해주세요';
    }

    // Check if duplicate
    if (value.includes(tag.trim())) {
      return '이미 추가된 태그입니다';
    }

    // Check max limit
    if (value.length >= maxTags) {
      return `태그는 최대 ${maxTags}개까지 추가할 수 있습니다`;
    }

    // Check character limit (optional, reasonable limit)
    if (tag.trim().length > 30) {
      return '태그는 최대 30자까지 입력 가능합니다';
    }

    return null;
  };

  /**
   * Add new tag
   */
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();

    // Validate
    const error = validateTag(trimmedTag);
    if (error) {
      setValidationError(error);
      return;
    }

    // Add tag
    onChange([...value, trimmedTag]);

    // Clear input and error
    setInputValue('');
    setValidationError(null);

    // Focus back to input
    inputRef.current?.focus();
  };

  /**
   * Remove tag by index
   */
  const removeTag = (index: number) => {
    const newTags = value.filter((_, i) => i !== index);
    onChange(newTags);
    setValidationError(null);
    inputRef.current?.focus();
  };

  /**
   * Remove last tag (called when backspace on empty input)
   */
  const removeLastTag = () => {
    if (value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  /**
   * Handle key down events
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Enter: Add tag (but not during Korean IME composition)
    if (e.key === 'Enter') {
      e.preventDefault();

      // Skip tag addition if IME is still composing (Korean input)
      if (isComposing) {
        return;
      }

      if (inputValue) {
        addTag(inputValue);
      }
    }

    // Backspace: Remove last tag if input is empty
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      e.preventDefault();
      removeLastTag();
    }

    // Escape: Clear input
    if (e.key === 'Escape') {
      setInputValue('');
      setValidationError(null);
    }
  };

  /**
   * Handle input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    // Clear validation error on input change
    if (validationError) {
      setValidationError(null);
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

  /**
   * Handle container click to focus input
   */
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      {/* Tags container with input */}
      <div
        onClick={handleContainerClick}
        className={`
          flex flex-wrap gap-2 items-center
          min-h-[44px] px-3 py-2
          border rounded-lg
          cursor-text transition-colors
          ${error || validationError
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        role="group"
        aria-label="해시태그 입력"
      >
        {/* Render existing tags */}
        {value.map((tag, index) => (
          <span
            key={index}
            className="
              inline-flex items-center gap-1
              px-3 py-1
              bg-blue-100 text-blue-700
              rounded-full text-sm font-medium
              transition-all duration-200
              hover:bg-blue-200
            "
            role="listitem"
          >
            <span>#{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              disabled={disabled}
              aria-label={`${tag} 태그 삭제`}
              className="
                ml-1 p-0.5
                hover:bg-blue-300 rounded-full
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500
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

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          disabled={disabled || value.length >= maxTags}
          placeholder={value.length === 0 ? placeholder : ''}
          aria-label="새 태그 입력"
          aria-describedby={error || validationError ? 'tag-error' : undefined}
          aria-invalid={!!(error || validationError)}
          className="
            flex-1 min-w-[120px]
            outline-none bg-transparent
            text-sm text-gray-900
            placeholder:text-gray-400
            disabled:cursor-not-allowed
          "
        />
      </div>

      {/* Help text and tag count */}
      <div className="flex justify-between items-center text-xs">
        <p className="text-gray-500">
          Enter 키로 태그 추가 • Backspace로 마지막 태그 삭제
        </p>
        <p
          className={`
            font-medium
            ${value.length >= maxTags ? 'text-red-600' : 'text-gray-500'}
          `}
        >
          {value.length} / {maxTags}
        </p>
      </div>

      {/* Error messages */}
      {(validationError || error) && (
        <p id="tag-error" className="text-sm text-red-600" role="alert">
          {validationError || error?.message}
        </p>
      )}

      {/* Tag preview (optional) */}
      {value.length > 0 && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">미리보기:</p>
          <div className="flex flex-wrap gap-2">
            {value.map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 bg-white text-gray-700 text-xs rounded border border-gray-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
