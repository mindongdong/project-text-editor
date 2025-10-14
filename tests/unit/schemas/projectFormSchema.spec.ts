import { projectFormSchema, projectFormSchemaSimple } from '@/schemas/project.schema';
import {
  validSimpleMetadata,
  validCompleteMetadata,
  minimalValidMetadata,
  metadataWithMaxHashtags,
  missingTitle,
  missingSummary,
  titleTooLong,
  subTitleTooLong,
  invalidThumbnailUrl,
  tooManyHashtags,
  emptyContentBlocks,
  missingEditorVersion,
  multipleErrors,
} from '@/../tests/fixtures/metadata';

/**
 * Unit tests for Project Form Schema validation
 *
 * Tests both simple schema (Phase 1) and complete schema (Phase 2)
 */

describe('projectFormSchemaSimple (Phase 1)', () => {
  describe('valid data', () => {
    it('should validate correct simple metadata', () => {
      const result = projectFormSchemaSimple.safeParse(validSimpleMetadata);
      expect(result.success).toBe(true);
    });

    it('should accept title within 200 characters', () => {
      const data = {
        ...validSimpleMetadata,
        title: 'a'.repeat(200),
      };
      const result = projectFormSchemaSimple.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('title validation', () => {
    it('should reject empty title', () => {
      const result = projectFormSchemaSimple.safeParse(missingTitle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('제목을 입력해주세요');
      }
    });

    it('should reject title longer than 200 characters', () => {
      const result = projectFormSchemaSimple.safeParse(titleTooLong);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('제목은 200자를 초과할 수 없습니다');
      }
    });
  });

  describe('contentJson validation', () => {
    it('should reject empty blocks array', () => {
      const data = {
        ...validSimpleMetadata,
        contentJson: {
          time: Date.now(),
          blocks: [],
          version: '2.28.0',
        },
      };
      const result = projectFormSchemaSimple.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('내용을 입력해주세요');
      }
    });

    it('should require contentJson structure', () => {
      const data = {
        title: 'Test',
        contentJson: {
          blocks: [{ type: 'paragraph', data: { text: 'test' } }],
          // missing time and version
        },
      };
      const result = projectFormSchemaSimple.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

describe('projectFormSchema (Phase 2)', () => {
  describe('valid data', () => {
    it('should validate complete metadata', () => {
      const result = projectFormSchema.safeParse(validCompleteMetadata);
      expect(result.success).toBe(true);
    });

    it('should validate minimal required fields', () => {
      const result = projectFormSchema.safeParse(minimalValidMetadata);
      expect(result.success).toBe(true);
    });

    it('should accept maximum hashtags (10)', () => {
      const result = projectFormSchema.safeParse(metadataWithMaxHashtags);
      expect(result.success).toBe(true);
    });

    it('should accept empty string for optional fields', () => {
      const data = {
        ...validCompleteMetadata,
        subTitle: '',
        thumbnail1: '',
      };
      const result = projectFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('title validation', () => {
    it('should reject empty title', () => {
      const result = projectFormSchema.safeParse({
        ...validCompleteMetadata,
        title: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.message === '제목을 입력해주세요')).toBe(
          true
        );
      }
    });

    it('should reject title longer than 200 characters', () => {
      const result = projectFormSchema.safeParse({
        ...validCompleteMetadata,
        title: 'a'.repeat(201),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => issue.message === '제목은 200자를 초과할 수 없습니다')
        ).toBe(true);
      }
    });
  });

  describe('subTitle validation', () => {
    it('should reject subtitle longer than 300 characters', () => {
      const result = projectFormSchema.safeParse(subTitleTooLong);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => issue.message === '부제목은 300자를 초과할 수 없습니다')
        ).toBe(true);
      }
    });

    it('should accept subtitle up to 300 characters', () => {
      const data = {
        ...validCompleteMetadata,
        subTitle: 'a'.repeat(300),
      };
      const result = projectFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('thumbnail URL validation', () => {
    it('should reject invalid thumbnail1 URL', () => {
      const result = projectFormSchema.safeParse(invalidThumbnailUrl);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => issue.message === '올바른 URL 형식이 아닙니다')
        ).toBe(true);
      }
    });

    it('should accept valid thumbnail URL', () => {
      const data = {
        ...validCompleteMetadata,
        thumbnail1: 'https://example.com/thumb1.jpg',
      };
      const result = projectFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('hashTag validation', () => {
    it('should reject more than 10 hashtags', () => {
      const result = projectFormSchema.safeParse(tooManyHashtags);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) => issue.message === '해시태그는 최대 10개까지 입력 가능합니다'
          )
        ).toBe(true);
      }
    });

    it('should accept empty hashtag array', () => {
      const data = {
        ...validCompleteMetadata,
        hashTag: [],
      };
      const result = projectFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should default to empty array if not provided', () => {
      const data = {
        ...validCompleteMetadata,
      };
      delete (data as any).hashTag;
      const result = projectFormSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.hashTag).toEqual([]);
      }
    });
  });

  describe('summary validation', () => {
    it('should reject empty summary', () => {
      const result = projectFormSchema.safeParse(missingSummary);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => issue.message === '요약 정보를 입력해주세요')
        ).toBe(true);
      }
    });

    it('should accept non-empty summary', () => {
      const data = {
        ...validCompleteMetadata,
        summary: 'Valid summary text',
      };
      const result = projectFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('contentJson validation', () => {
    it('should reject empty blocks', () => {
      const result = projectFormSchema.safeParse(emptyContentBlocks);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.message === '내용을 입력해주세요')).toBe(
          true
        );
      }
    });

    it('should require time, blocks, and version', () => {
      const data = {
        ...validCompleteMetadata,
        contentJson: {
          blocks: [{ type: 'paragraph', data: { text: 'test' } }],
          // missing time and version
        },
      };
      const result = projectFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('editorVersion validation', () => {
    it('should reject missing editorVersion', () => {
      const result = projectFormSchema.safeParse(missingEditorVersion);
      expect(result.success).toBe(false);
    });

    it('should accept valid editorVersion', () => {
      const data = {
        ...validCompleteMetadata,
        editorVersion: '2.28.0',
      };
      const result = projectFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('multiple errors', () => {
    it('should report all validation errors', () => {
      const result = projectFormSchema.safeParse(multipleErrors);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should have multiple issues
        expect(result.error.issues.length).toBeGreaterThan(1);

        // Check for specific error messages
        const messages = result.error.issues.map((issue) => issue.message);
        expect(messages).toContain('제목을 입력해주세요');
        expect(messages).toContain('부제목은 300자를 초과할 수 없습니다');
      }
    });
  });
});
