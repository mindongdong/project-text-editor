import { ProjectFormData, ProjectFormDataSimple } from '@/schemas/project.schema';
import { validOutputData, emptyOutputData } from './editorOutput';

/**
 * Test fixtures for Project Metadata
 *
 * Includes valid and invalid test cases for:
 * - Simple metadata (Phase 1)
 * - Complete metadata (Phase 2)
 * - Error scenarios
 */

// Valid simple metadata (Phase 1)
export const validSimpleMetadata: ProjectFormDataSimple = {
  title: 'Test Project Title',
  contentJson: validOutputData,
};

// Valid complete metadata (Phase 2)
export const validCompleteMetadata: ProjectFormData = {
  title: 'Complete Test Project',
  subTitle: 'This is a test subtitle',
  thumbnail1: 'https://example.com/thumbnail1.jpg',
  hashTag: ['react', 'typescript', 'nextjs'],
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  advisor: '홍길동 교수',
  participants: ['김철수', '이영희'],
  summary: '기간 : 2024.01.01~2024.12.31<br>지도교수 : 홍길동 교수<br>참여학생 : 김철수, 이영희',
  contentJson: validOutputData,
  editorVersion: '2.28.0',
};

// Metadata with minimal required fields
export const minimalValidMetadata: ProjectFormData = {
  title: 'Minimal Project',
  subTitle: '',
  thumbnail1: '',
  hashTag: [],
  startDate: '2024-01-01',
  endDate: '2024-06-30',
  advisor: '',
  participants: [],
  summary: '기간 : 2024.01.01~2024.06.30',
  contentJson: validOutputData,
  editorVersion: '2.28.0',
};

// Metadata with maximum hashtags (10)
export const metadataWithMaxHashtags: ProjectFormData = {
  title: 'Project with Max Tags',
  subTitle: '',
  thumbnail1: '',
  hashTag: [
    'tag1',
    'tag2',
    'tag3',
    'tag4',
    'tag5',
    'tag6',
    'tag7',
    'tag8',
    'tag9',
    'tag10',
  ],
  startDate: '2024-03-01',
  endDate: '2024-09-30',
  advisor: '박지성 교수',
  participants: ['최민수'],
  summary: '기간 : 2024.03.01~2024.09.30<br>지도교수 : 박지성 교수<br>참여학생 : 최민수',
  contentJson: validOutputData,
  editorVersion: '2.28.0',
};

// === ERROR CASES ===

// Missing title
export const missingTitle = {
  title: '',
  contentJson: validOutputData,
};

// Missing summary (Phase 2)
export const missingSummary = {
  title: 'Test Project',
  subTitle: '',
  thumbnail1: '',
  hashTag: [],
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  advisor: '',
  participants: [],
  summary: '',
  contentJson: validOutputData,
  editorVersion: '2.28.0',
};

// Title too long (>200 characters)
export const titleTooLong = {
  title: 'a'.repeat(201),
  contentJson: validOutputData,
};

// Subtitle too long (>300 characters)
export const subTitleTooLong: Partial<ProjectFormData> = {
  title: 'Test Project',
  subTitle: 'a'.repeat(301),
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  advisor: '',
  participants: [],
  summary: '기간 : 2024.01.01~2024.12.31',
  contentJson: validOutputData,
  editorVersion: '2.28.0',
};

// Invalid thumbnail URL
export const invalidThumbnailUrl: Partial<ProjectFormData> = {
  title: 'Test Project',
  subTitle: '',
  thumbnail1: 'not-a-valid-url',
  hashTag: [],
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  advisor: '',
  participants: [],
  summary: '기간 : 2024.01.01~2024.12.31',
  contentJson: validOutputData,
  editorVersion: '2.28.0',
};

// Too many hashtags (>10)
export const tooManyHashtags: Partial<ProjectFormData> = {
  title: 'Test Project',
  subTitle: '',
  thumbnail1: '',
  hashTag: [
    'tag1',
    'tag2',
    'tag3',
    'tag4',
    'tag5',
    'tag6',
    'tag7',
    'tag8',
    'tag9',
    'tag10',
    'tag11', // 11th tag - exceeds limit
  ],
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  advisor: '',
  participants: [],
  summary: '기간 : 2024.01.01~2024.12.31',
  contentJson: validOutputData,
  editorVersion: '2.28.0',
};

// Empty content blocks
export const emptyContentBlocks: Partial<ProjectFormData> = {
  title: 'Test Project',
  subTitle: '',
  thumbnail1: '',
  hashTag: [],
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  advisor: '',
  participants: [],
  summary: '기간 : 2024.01.01~2024.12.31',
  contentJson: emptyOutputData,
  editorVersion: '2.28.0',
};

// Missing editorVersion
export const missingEditorVersion: Partial<ProjectFormData> = {
  title: 'Test Project',
  subTitle: '',
  thumbnail1: '',
  hashTag: [],
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  advisor: '',
  participants: [],
  summary: '기간 : 2024.01.01~2024.12.31',
  contentJson: validOutputData,
  // editorVersion is missing
};

// Multiple validation errors
export const multipleErrors: Partial<ProjectFormData> = {
  title: '', // Missing title
  subTitle: 'a'.repeat(301), // Too long
  thumbnail1: 'invalid-url', // Invalid URL
  hashTag: [
    'tag1',
    'tag2',
    'tag3',
    'tag4',
    'tag5',
    'tag6',
    'tag7',
    'tag8',
    'tag9',
    'tag10',
    'tag11', // Too many tags
  ],
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  advisor: '',
  participants: [],
  summary: '', // Missing summary
  contentJson: emptyOutputData, // Empty blocks
  // Missing editorVersion
};

// === FORM INPUT HELPERS ===

/**
 * Helper to create form data for testing
 */
export function createFormData(overrides: Partial<ProjectFormData> = {}): ProjectFormData {
  return {
    ...validCompleteMetadata,
    ...overrides,
  };
}

/**
 * Helper to create simple form data for testing
 */
export function createSimpleFormData(
  overrides: Partial<ProjectFormDataSimple> = {}
): ProjectFormDataSimple {
  return {
    ...validSimpleMetadata,
    ...overrides,
  };
}
