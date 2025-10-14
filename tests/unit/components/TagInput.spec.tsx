import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagInput from '@/components/forms/TagInput';

/**
 * Unit tests for TagInput Component
 *
 * Tests tag management functionality including:
 * - Tag addition with Enter key
 * - Duplicate prevention
 * - Tag removal (Backspace and X button)
 * - Limits and validation (max 10 tags, 30 chars per tag)
 * - Keyboard shortcuts
 * - Accessibility compliance
 * - React Hook Form integration
 */

describe('TagInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Tag Addition (Enter Key)', () => {
    it('should add tag and clear input when Enter is pressed', async () => {
      const user = userEvent.setup();
      render(<TagInput value={[]} onChange={mockOnChange} />);

      const input = screen.getByLabelText('새 태그 입력');
      await user.type(input, 'react');
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith(['react']);
      expect(input).toHaveValue('');
    });

    it('should show error when trying to add only whitespace tag', async () => {
      const user = userEvent.setup();
      render(<TagInput value={[]} onChange={mockOnChange} />);

      const input = screen.getByLabelText('새 태그 입력');
      await user.type(input, '   ');
      await user.keyboard('{Enter}');

      expect(screen.getByRole('alert')).toHaveTextContent('태그를 입력해주세요');
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should trim whitespace before adding tag', async () => {
      const user = userEvent.setup();
      render(<TagInput value={[]} onChange={mockOnChange} />);

      const input = screen.getByLabelText('새 태그 입력');
      await user.type(input, '  typescript  ');
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith(['typescript']);
    });

    it('should focus back to input after adding tag', async () => {
      const user = userEvent.setup();
      render(<TagInput value={[]} onChange={mockOnChange} />);

      const input = screen.getByLabelText('새 태그 입력');
      await user.type(input, 'nextjs');
      await user.keyboard('{Enter}');

      expect(input).toHaveFocus();
    });

    it('should clear validation error on input change', async () => {
      const user = userEvent.setup();
      render(<TagInput value={['react']} onChange={mockOnChange} />);

      const input = screen.getByLabelText('새 태그 입력');

      // Trigger duplicate error
      await user.type(input, 'react');
      await user.keyboard('{Enter}');
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Type to clear error
      await user.clear(input);
      await user.type(input, 'vue');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Duplicate Prevention', () => {
    it('should show error when adding duplicate tag', async () => {
      const user = userEvent.setup();
      render(<TagInput value={['react']} onChange={mockOnChange} />);

      const input = screen.getByLabelText('새 태그 입력');
      await user.type(input, 'react');
      await user.keyboard('{Enter}');

      expect(screen.getByRole('alert')).toHaveTextContent('이미 추가된 태그입니다');
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should perform case-sensitive duplicate detection', async () => {
      const user = userEvent.setup();
      render(<TagInput value={['React']} onChange={mockOnChange} />);

      const input = screen.getByLabelText('새 태그 입력');
      await user.type(input, 'react');
      await user.keyboard('{Enter}');

      // Should allow different case
      expect(mockOnChange).toHaveBeenCalledWith(['React', 'react']);
    });

    it('should clear error when input changes after duplicate error', async () => {
      const user = userEvent.setup();
      render(<TagInput value={['react']} onChange={mockOnChange} />);

      const input = screen.getByLabelText('새 태그 입력');
      await user.type(input, 'react');
      await user.keyboard('{Enter}');

      expect(screen.getByRole('alert')).toBeInTheDocument();

      await user.type(input, 'x');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Tag Removal', () => {
    it('should remove last tag when Backspace is pressed on empty input', async () => {
      const user = userEvent.setup();
      render(<TagInput value={['react', 'typescript']} onChange={mockOnChange} />);

      const input = screen.getByLabelText('새 태그 입력');
      await user.click(input);
      await user.keyboard('{Backspace}');

      expect(mockOnChange).toHaveBeenCalledWith(['react']);
    });

    it('should not remove tag when Backspace is pressed with text in input', async () => {
      const user = userEvent.setup();
      render(<TagInput value={['react', 'typescript']} onChange={mockOnChange} />);

      const input = screen.getByLabelText('새 태그 입력');
      await user.type(input, 'next');
      await user.keyboard('{Backspace}');

      // Should only remove character from input, not tag
      expect(mockOnChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('nex');
    });

    it('should remove specific tag when X button is clicked', async () => {
      const user = userEvent.setup();
      render(<TagInput value={['react', 'typescript', 'nextjs']} onChange={mockOnChange} />);

      const deleteButton = screen.getByLabelText('typescript 태그 삭제');
      await user.click(deleteButton);

      expect(mockOnChange).toHaveBeenCalledWith(['react', 'nextjs']);
    });

    it('should focus back to input after removing tag', async () => {
      const user = userEvent.setup();
      render(<TagInput value={['react', 'typescript']} onChange={mockOnChange} />);

      const deleteButton = screen.getByLabelText('react 태그 삭제');
      await user.click(deleteButton);

      const input = screen.getByLabelText('새 태그 입력');
      expect(input).toHaveFocus();
    });
  });

  describe('Limits and Validation', () => {
    it('should enforce maximum 10 tags limit', async () => {
      const user = userEvent.setup();
      const tenTags = Array.from({ length: 10 }, (_, i) => `tag${i + 1}`);
      render(<TagInput value={tenTags} onChange={mockOnChange} />);

      const input = screen.getByLabelText('새 태그 입력');

      // Input should be disabled when at max tags
      expect(input).toBeDisabled();

      // Tag counter should show 10/10
      expect(screen.getByText('10 / 10')).toBeInTheDocument();
    });

    it('should enforce 30 character limit per tag', async () => {
      const user = userEvent.setup();
      render(<TagInput value={[]} onChange={mockOnChange} />);

      const input = screen.getByLabelText('새 태그 입력');
      const longTag = 'a'.repeat(31);
      await user.type(input, longTag);
      await user.keyboard('{Enter}');

      expect(screen.getByRole('alert')).toHaveTextContent('태그는 최대 30자까지 입력 가능합니다');
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should display tag counter correctly', () => {
      const { rerender } = render(<TagInput value={[]} onChange={mockOnChange} />);
      expect(screen.getByText('0 / 10')).toBeInTheDocument();

      rerender(<TagInput value={['tag1', 'tag2', 'tag3']} onChange={mockOnChange} />);
      expect(screen.getByText('3 / 10')).toBeInTheDocument();

      const tenTags = Array.from({ length: 10 }, (_, i) => `tag${i + 1}`);
      rerender(<TagInput value={tenTags} onChange={mockOnChange} />);
      expect(screen.getByText('10 / 10')).toBeInTheDocument();
    });

    it('should disable input when at max tags', () => {
      const tenTags = Array.from({ length: 10 }, (_, i) => `tag${i + 1}`);
      render(<TagInput value={tenTags} onChange={mockOnChange} />);

      const input = screen.getByLabelText('새 태그 입력');
      expect(input).toBeDisabled();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should clear input and errors when Escape is pressed', async () => {
      const user = userEvent.setup();
      render(<TagInput value={['react']} onChange={mockOnChange} />);

      const input = screen.getByLabelText('새 태그 입력');

      // Add text and trigger error
      await user.type(input, 'react');
      await user.keyboard('{Enter}');
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Press Escape
      await user.keyboard('{Escape}');
      expect(input).toHaveValue('');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should not add tag when Enter is pressed on disabled input', async () => {
      const user = userEvent.setup();
      render(<TagInput value={[]} onChange={mockOnChange} disabled={true} />);

      const input = screen.getByLabelText('새 태그 입력');
      await user.type(input, 'react');
      await user.keyboard('{Enter}');

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<TagInput value={['react', 'typescript']} onChange={mockOnChange} />);

      expect(screen.getByLabelText('새 태그 입력')).toBeInTheDocument();
      expect(screen.getByLabelText('해시태그 입력')).toBeInTheDocument();
      expect(screen.getByLabelText('react 태그 삭제')).toBeInTheDocument();
      expect(screen.getByLabelText('typescript 태그 삭제')).toBeInTheDocument();
    });

    it('should mark error messages with role="alert"', async () => {
      const user = userEvent.setup();
      render(<TagInput value={['react']} onChange={mockOnChange} />);

      const input = screen.getByLabelText('새 태그 입력');
      await user.type(input, 'react');
      await user.keyboard('{Enter}');

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('id', 'tag-error');
    });

    it('should have aria-invalid when there is an error', async () => {
      const user = userEvent.setup();
      render(<TagInput value={['react']} onChange={mockOnChange} />);

      const input = screen.getByLabelText('새 태그 입력');
      expect(input).toHaveAttribute('aria-invalid', 'false');

      await user.type(input, 'react');
      await user.keyboard('{Enter}');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-describedby pointing to error', async () => {
      const user = userEvent.setup();
      render(<TagInput value={['react']} onChange={mockOnChange} />);

      const input = screen.getByLabelText('새 태그 입력');
      await user.type(input, 'react');
      await user.keyboard('{Enter}');

      expect(input).toHaveAttribute('aria-describedby', 'tag-error');
    });
  });

  describe('React Hook Form Integration', () => {
    it('should call onChange with updated tag array', async () => {
      const user = userEvent.setup();
      render(<TagInput value={['existing']} onChange={mockOnChange} />);

      const input = screen.getByLabelText('새 태그 입력');
      await user.type(input, 'new');
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith(['existing', 'new']);
    });

    it('should display external error prop', () => {
      const error = { type: 'manual', message: '해시태그는 필수입니다' };
      render(<TagInput value={[]} onChange={mockOnChange} error={error as any} />);

      expect(screen.getByRole('alert')).toHaveTextContent('해시태그는 필수입니다');
    });

    it('should respect disabled prop', async () => {
      const user = userEvent.setup();
      render(<TagInput value={['react']} onChange={mockOnChange} disabled={true} />);

      const input = screen.getByLabelText('새 태그 입력');
      const deleteButton = screen.getByLabelText('react 태그 삭제');

      expect(input).toBeDisabled();
      expect(deleteButton).toBeDisabled();

      await user.type(input, 'new');
      await user.keyboard('{Enter}');
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });
});
