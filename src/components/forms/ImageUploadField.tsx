'use client';

import { useState, useRef } from 'react';
import { UseFormRegister, UseFormSetValue, FieldError } from 'react-hook-form';

/**
 * Phase 2 Day 4-5: ImageUploadField Component
 *
 * Features:
 * - Drag & Drop file upload support
 * - Image preview (before and after upload)
 * - Delete functionality
 * - React Hook Form integration
 * - Client-side validation (type, size)
 * - Accessibility compliant (ARIA labels, keyboard navigation)
 * - Uses existing /api/upload-image endpoint
 *
 * Props:
 * - label: Field label text
 * - name: Form field name
 * - register: React Hook Form register function
 * - setValue: React Hook Form setValue function
 * - currentValue: Current form value (image URL)
 * - error: Validation error from React Hook Form
 * - required: Whether field is required
 */

interface ImageUploadFieldProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  currentValue?: string;
  error?: FieldError;
  required?: boolean;
}

// Validation constants matching API endpoint
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

export default function ImageUploadField({
  label,
  name,
  register,
  setValue,
  currentValue,
  error,
  required = false,
}: ImageUploadFieldProps) {
  // State management
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentValue || null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // File input ref for programmatic click
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validate file before upload
   */
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return `지원되지 않는 파일 형식입니다. (${ALLOWED_EXTENSIONS.join(', ')}만 가능)`;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `파일 크기는 ${MAX_FILE_SIZE / 1024 / 1024}MB를 초과할 수 없습니다`;
    }

    return null;
  };

  /**
   * Generate preview using FileReader
   */
  const generatePreview = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Upload image to API endpoint
   * Reuses logic from EditorComponent.tsx
   */
  const uploadImage = async (file: File): Promise<string> => {
    // Create FormData
    const formData = new FormData();
    formData.append('image', file);

    // Upload to API
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '이미지 업로드에 실패했습니다');
    }

    const result = await response.json();
    return result.file.url;
  };

  /**
   * Handle file selection (from input or drop)
   */
  const handleFileSelect = async (file: File) => {
    // Reset error state
    setUploadError(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    // Generate preview immediately
    generatePreview(file);

    // Upload file
    setIsUploading(true);

    try {
      const imageUrl = await uploadImage(file);

      // Update React Hook Form value
      setValue(name, imageUrl, {
        shouldValidate: true,
        shouldDirty: true,
      });

      // Update preview with uploaded URL
      setPreviewUrl(imageUrl);

      console.log(`Image uploaded successfully: ${imageUrl}`);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handle file input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Handle drag over
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  /**
   * Handle drag leave
   */
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  /**
   * Handle drop
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = () => {
    const confirmDelete = window.confirm('이미지를 삭제하시겠습니까?');

    if (confirmDelete) {
      // Clear form value
      setValue(name, '', {
        shouldValidate: true,
        shouldDirty: true,
      });

      // Clear preview
      setPreviewUrl(null);
      setUploadError(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * Handle click on upload area
   */
  const handleClick = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        id={name}
        accept={ALLOWED_MIME_TYPES.join(',')}
        onChange={handleInputChange}
        className="sr-only"
        aria-label={label}
        disabled={isUploading}
      />

      {/* Upload area or Preview */}
      {!previewUrl ? (
        // Upload area (no image selected)
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-label={`${label} 업로드 영역. 클릭하거나 이미지를 드래그하여 업로드하세요.`}
          className={`
            relative flex flex-col items-center justify-center
            w-full h-48 px-4 py-6
            border-2 border-dashed rounded-lg
            cursor-pointer transition-colors
            ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
        >
          {/* Upload icon */}
          <svg
            className="w-12 h-12 text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          {/* Upload text */}
          <p className="text-sm text-gray-600 text-center mb-2">
            <span className="font-semibold text-blue-600">클릭하여 업로드</span> 또는 드래그 &amp; 드롭
          </p>
          <p className="text-xs text-gray-500 text-center">
            {ALLOWED_EXTENSIONS.map(ext => ext.toUpperCase()).join(', ')} (최대 {MAX_FILE_SIZE / 1024 / 1024}MB)
          </p>

          {/* Loading spinner */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-600">업로드 중...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Preview area (image selected/uploaded)
        <div className="relative group">
          <img
            src={previewUrl}
            alt={`${label} 미리보기`}
            className="w-full h-48 object-cover rounded-lg shadow-md"
            loading="lazy"
          />

          {/* Delete button */}
          {!isUploading && (
            <button
              type="button"
              onClick={handleDelete}
              aria-label={`${label} 삭제`}
              className="
                absolute top-2 right-2
                p-2 bg-red-600 text-white rounded-full
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
                hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
              "
            >
              <svg
                className="w-5 h-5"
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
          )}

          {/* Loading overlay */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                <p className="mt-2 text-sm text-white">업로드 중...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error messages */}
      {(uploadError || error) && (
        <p className="text-sm text-red-600" role="alert">
          {uploadError || error?.message}
        </p>
      )}

      {/* Help text */}
      {!uploadError && !error && (
        <p className="text-xs text-gray-500">
          {ALLOWED_EXTENSIONS.map(ext => ext.toUpperCase()).join(', ')} 형식, 최대 {MAX_FILE_SIZE / 1024 / 1024}MB
        </p>
      )}
    </div>
  );
}
