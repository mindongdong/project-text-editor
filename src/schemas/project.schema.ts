import { z } from 'zod';

/**
 * Phase 1 MVP: Simplified validation schema
 * Only validates title and contentJson
 */
export const projectFormSchemaSimple = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(200, '제목은 200자를 초과할 수 없습니다'),
  contentJson: z.object({
    time: z.number(),
    blocks: z.array(z.any()).min(1, '내용을 입력해주세요'),
    version: z.string(),
  }),
});

/**
 * Complete validation schema for future phases
 * Includes all Project model fields
 *
 * Note: summary field is now generated from structured fields (startDate, endDate, advisor, participants)
 */
export const projectFormSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(200, '제목은 200자를 초과할 수 없습니다'),
  subTitle: z
    .string()
    .max(300, '부제목은 300자를 초과할 수 없습니다')
    .optional()
    .or(z.literal('')),
  thumbnail1: z
    .string()
    .url('올바른 URL 형식이 아닙니다')
    .optional()
    .or(z.literal('')),
  hashTag: z
    .array(z.string())
    .max(10, '해시태그는 최대 10개까지 입력 가능합니다')
    .default([]),
  // Structured summary fields
  startDate: z
    .string()
    .min(1, '시작일을 입력해주세요')
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)'),
  endDate: z
    .string()
    .min(1, '종료일을 입력해주세요')
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)'),
  advisor: z
    .string()
    .max(100, '지도교수 이름은 100자를 초과할 수 없습니다')
    .optional()
    .or(z.literal('')),
  participants: z
    .array(z.string())
    .max(20, '참여학생은 최대 20명까지 입력 가능합니다')
    .default([]),
  // Auto-generated summary field (for backward compatibility and storage)
  summary: z.string().min(1, '요약 정보를 입력해주세요'),
  contentJson: z.object({
    time: z.number(),
    blocks: z.array(z.any()).min(1, '내용을 입력해주세요'),
    version: z.string(),
  }),
  editorVersion: z.string(),
})
  .refine(
    (data) => {
      // Validate end date is after start date
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: '종료일은 시작일보다 이후여야 합니다',
      path: ['endDate'],
    }
  );

export type ProjectFormDataSimple = z.infer<typeof projectFormSchemaSimple>;
export type ProjectFormData = z.infer<typeof projectFormSchema>;
