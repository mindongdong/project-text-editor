import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectMetadataForm from '@/components/forms/ProjectMetadataForm';

/**
 * Integration tests for ProjectMetadataForm Component
 *
 * Tests form integration including:
 * - Required field validation
 * - Form submission with complete data
 * - Field interactions (thumbnails, checkboxes)
 * - TagInput integration
 * - Accessibility compliance
 * - User experience (loading states, help text)
 */

describe('ProjectMetadataForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  describe('Required Field Validation', () => {
    it('should show errors when submitting without required fields', async () => {
      const user = userEvent.setup();
      render(<ProjectMetadataForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: '저장하기' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/제목을 입력해주세요/)).toBeInTheDocument();
      });
    });

    it('should show error when title is missing', async () => {
      const user = userEvent.setup();
      render(<ProjectMetadataForm onSubmit={mockOnSubmit} />);

      // Fill other fields but not title
      const startDateInput = screen.getByLabelText(/시작일/);
      const endDateInput = screen.getByLabelText(/종료일/);
      await user.type(startDateInput, '2024-01-01');
      await user.type(endDateInput, '2024-12-31');

      const submitButton = screen.getByRole('button', { name: '저장하기' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/제목을 입력해주세요/)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when dates are missing', async () => {
      const user = userEvent.setup();
      render(<ProjectMetadataForm onSubmit={mockOnSubmit} />);

      // Fill title but not dates (which are required for summary)
      const titleInput = screen.getByRole('textbox', { name: /^제목/ });
      await user.type(titleInput, '테스트 프로젝트');

      const submitButton = screen.getByRole('button', { name: '저장하기' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/시작일을 입력해주세요/)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should display all errors simultaneously', async () => {
      const user = userEvent.setup();
      render(<ProjectMetadataForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: '저장하기' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/제목을 입력해주세요/)).toBeInTheDocument();
        expect(screen.getByText(/시작일을 입력해주세요/)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with valid data', async () => {
      const user = userEvent.setup();
      render(<ProjectMetadataForm onSubmit={mockOnSubmit} />);

      // Fill required fields
      const titleInput = screen.getByRole('textbox', { name: /^제목/ });
      await user.type(titleInput, '테스트 프로젝트');

      // Fill structured summary fields (required)
      const startDateInput = screen.getByLabelText(/시작일/);
      const endDateInput = screen.getByLabelText(/종료일/);
      await user.type(startDateInput, '2024-01-01');
      await user.type(endDateInput, '2024-12-31');

      // Add at least one tag (required)
      const tagInput = screen.getByLabelText('새 태그 입력');
      await user.type(tagInput, 'react');
      await user.keyboard('{Enter}');

      const submitButton = screen.getByRole('button', { name: '저장하기' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.title).toBe('테스트 프로젝트');
      expect(submittedData.startDate).toBe('2024-01-01');
      expect(submittedData.endDate).toBe('2024-12-31');
      expect(submittedData.summary).toContain('2024.01.01~2024.12.31');
      expect(submittedData.hashTag).toEqual(['react']);
    });

    it('should submit all 6 fields correctly', async () => {
      const user = userEvent.setup();
      render(<ProjectMetadataForm onSubmit={mockOnSubmit} />);

      // Fill all fields
      await user.type(screen.getByRole('textbox', { name: /^제목/ }), '완전한 테스트');
      await user.type(screen.getByRole('textbox', { name: /부제목/ }), '부제목 테스트');

      const tagInput = screen.getByLabelText('새 태그 입력');
      await user.type(tagInput, 'react');
      await user.keyboard('{Enter}');
      await user.type(tagInput, 'nextjs');
      await user.keyboard('{Enter}');

      // Fill structured summary fields
      const startDateInput = screen.getByLabelText(/시작일/);
      const endDateInput = screen.getByLabelText(/종료일/);
      await user.type(startDateInput, '2024-01-01');
      await user.type(endDateInput, '2024-12-31');

      await user.click(screen.getByRole('button', { name: '저장하기' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const data = mockOnSubmit.mock.calls[0][0];
      expect(data.title).toBe('완전한 테스트');
      expect(data.subTitle).toBe('부제목 테스트');
      expect(data.hashTag).toEqual(['react', 'nextjs']);
      expect(data.startDate).toBe('2024-01-01');
      expect(data.endDate).toBe('2024-12-31');
      expect(data.summary).toContain('2024.01.01~2024.12.31');
    });

    it('should work with partial validation schema', async () => {
      const user = userEvent.setup();
      render(<ProjectMetadataForm onSubmit={mockOnSubmit} />);

      // Fill only required fields
      await user.type(screen.getByRole('textbox', { name: /^제목/ }), '부분 데이터');

      const tagInput = screen.getByLabelText('새 태그 입력');
      await user.type(tagInput, 'test');
      await user.keyboard('{Enter}');

      const startDateInput = screen.getByLabelText(/시작일/);
      const endDateInput = screen.getByLabelText(/종료일/);
      await user.type(startDateInput, '2024-01-01');
      await user.type(endDateInput, '2024-12-31');

      await user.click(screen.getByRole('button', { name: '저장하기' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const data = mockOnSubmit.mock.calls[0][0];
      expect(data.title).toBe('부분 데이터');
      expect(data.subTitle).toBe(''); // Optional field
      expect(data.summary).toContain('2024.01.01~2024.12.31');
    });
  });

  describe('Field Interactions', () => {
    it('should have ImageUploadField component for thumbnail', () => {
      render(<ProjectMetadataForm onSubmit={mockOnSubmit} />);

      // ImageUploadField should be present (use getAllByLabelText for file inputs)
      const thumbnail = screen.getAllByLabelText(/썸네일/);
      expect(thumbnail.length).toBeGreaterThan(0);
    });

    it('should propagate disabled state to all fields', () => {
      render(<ProjectMetadataForm onSubmit={mockOnSubmit} isSubmitting={true} />);

      expect(screen.getByRole('textbox', { name: /^제목/ })).toBeDisabled();
      expect(screen.getByRole('textbox', { name: /부제목/ })).toBeDisabled();
      expect(screen.getByLabelText(/시작일/)).toBeDisabled();
      expect(screen.getByLabelText(/종료일/)).toBeDisabled();
    });
  });

  describe('TagInput Integration', () => {
    it('should update form state when tags change', async () => {
      const user = userEvent.setup();
      render(<ProjectMetadataForm onSubmit={mockOnSubmit} />);

      const tagInput = screen.getByLabelText('새 태그 입력');

      await user.type(tagInput, 'react');
      await user.keyboard('{Enter}');

      await user.type(tagInput, 'typescript');
      await user.keyboard('{Enter}');

      // Verify tags are displayed (getAllByText because they appear in both main area and preview)
      const reactTags = screen.getAllByText('#react');
      const typescriptTags = screen.getAllByText('#typescript');
      expect(reactTags.length).toBeGreaterThan(0);
      expect(typescriptTags.length).toBeGreaterThan(0);
    });

    it('should display TagInput validation errors', async () => {
      const user = userEvent.setup();
      render(<ProjectMetadataForm onSubmit={mockOnSubmit} />);

      const tagInput = screen.getByLabelText('새 태그 입력');

      await user.type(tagInput, 'react');
      await user.keyboard('{Enter}');

      // Try to add duplicate
      await user.type(tagInput, 'react');
      await user.keyboard('{Enter}');

      expect(screen.getByRole('alert')).toHaveTextContent('이미 추가된 태그입니다');
    });

    it('should respect form disabled state in TagInput', () => {
      render(<ProjectMetadataForm onSubmit={mockOnSubmit} isSubmitting={true} />);

      const tagInput = screen.getByLabelText('새 태그 입력');
      expect(tagInput).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have labels for all form fields', () => {
      render(<ProjectMetadataForm onSubmit={mockOnSubmit} />);

      expect(screen.getByRole('textbox', { name: /^제목/ })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /부제목/ })).toBeInTheDocument();
      expect(screen.getByLabelText(/시작일/)).toBeInTheDocument();
      expect(screen.getByLabelText(/종료일/)).toBeInTheDocument();
    });

    it('should mark required fields with aria-required', () => {
      render(<ProjectMetadataForm onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByRole('textbox', { name: /^제목/ });
      const startDateInput = screen.getByLabelText(/시작일/);
      const endDateInput = screen.getByLabelText(/종료일/);

      expect(titleInput).toHaveAttribute('aria-required', 'true');
      expect(startDateInput).toHaveAttribute('aria-required', 'true');
      expect(endDateInput).toHaveAttribute('aria-required', 'true');
    });

    it('should have error messages with proper ARIA attributes', async () => {
      const user = userEvent.setup();
      render(<ProjectMetadataForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: '저장하기' });
      await user.click(submitButton);

      await waitFor(() => {
        const errors = screen.getAllByRole('alert');
        expect(errors.length).toBeGreaterThan(0);

        errors.forEach(error => {
          expect(error).toHaveAttribute('id');
        });
      });
    });

    it('should have form with aria-label', () => {
      render(<ProjectMetadataForm onSubmit={mockOnSubmit} />);

      const form = screen.getByRole('form', { name: /프로젝트 메타데이터 입력 폼/ });
      expect(form).toBeInTheDocument();
    });
  });

  describe('User Experience', () => {
    it('should navigate back when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const mockBack = jest.fn();
      window.history.back = mockBack;

      render(<ProjectMetadataForm onSubmit={mockOnSubmit} />);

      const cancelButton = screen.getByRole('button', { name: '취소' });
      await user.click(cancelButton);

      expect(mockBack).toHaveBeenCalled();
    });

    it('should show loading state with spinner during submission', () => {
      render(<ProjectMetadataForm onSubmit={mockOnSubmit} isSubmitting={true} />);

      const submitButton = screen.getByRole('button', { name: /저장 중/ });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveAttribute('aria-busy', 'true');

      // Spinner should be present
      const spinner = submitButton.querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should display help text correctly', () => {
      render(<ProjectMetadataForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/제목, 해시태그, 프로젝트 기간\(시작일\/종료일\)은 필수 입력 항목입니다/)).toBeInTheDocument();
      expect(screen.getByText(/썸네일은 JPG, PNG, WebP, GIF 형식을 지원하며/)).toBeInTheDocument();
      expect(screen.getByText(/프로젝트 요약 정보는 기간, 지도교수, 참여학생 정보로부터 자동 생성됩니다/)).toBeInTheDocument();
      expect(screen.getByText(/참여학생은 최대 20명까지 입력할 수 있으며/)).toBeInTheDocument();
    });
  });
});
