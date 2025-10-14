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
  thumbnail2: z
    .string()
    .url('올바른 URL 형식이 아닙니다')
    .optional()
    .or(z.literal('')),
  hashTag: z
    .array(z.string())
    .max(10, '해시태그는 최대 10개까지 입력 가능합니다')
    .default([]),
  summary: z.string().min(1, '요약 정보를 입력해주세요'),
  isOnMain: z.boolean().default(false),
  isGroup: z.boolean().default(false),
  contentJson: z.object({
    time: z.number(),
    blocks: z.array(z.any()).min(1, '내용을 입력해주세요'),
    version: z.string(),
  }),
  editorVersion: z.string(),
});

export type ProjectFormDataSimple = z.infer<typeof projectFormSchemaSimple>;
export type ProjectFormData = z.infer<typeof projectFormSchema>;
