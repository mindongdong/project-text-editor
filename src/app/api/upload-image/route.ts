import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

/**
 * Phase 2: Image Upload API Endpoint
 *
 * Features:
 * - Native multipart form data parsing with Web API FormData
 * - File size validation (max 5MB)
 * - MIME type validation (JPG, PNG, WebP, GIF)
 * - UUID-based filename generation
 * - Image metadata extraction with sharp
 * - Saves to public/uploads directory
 * - Returns Editor.js compatible JSON response
 *
 * Note: Uses Next.js 15 App Router compatible Web API instead of formidable
 */

// Allowed MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * POST /api/upload-image
 *
 * Request: multipart/form-data with 'image' field
 * Response: { success: 1, file: { url, width, height } }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Parse multipart form data using native Web API
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    // 2. Validate file exists
    if (!file) {
      return NextResponse.json(
        { success: 0, error: 'No image file provided' },
        { status: 400 }
      );
    }

    // 3. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: 0,
          error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: 0,
          error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    // 5. Convert File to Buffer for processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. Generate unique filename with UUID
    const ext = path.extname(file.name);
    const uniqueFilename = `${uuidv4()}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, uniqueFilename);

    // 7. Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // 8. Save file to disk
    await fs.writeFile(filePath, buffer);

    // 9. Extract image metadata using sharp
    const metadata = await sharp(filePath).metadata();
    const { width, height } = metadata;

    // 10. Construct public URL
    const fileUrl = `/uploads/${uniqueFilename}`;

    // 11. Return Editor.js compatible response
    return NextResponse.json({
      success: 1,
      file: {
        url: fileUrl,
        width,
        height,
      },
    });
  } catch (error) {
    console.error('Image upload error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('size') || error.message.includes('large')) {
        return NextResponse.json(
          { success: 0, error: 'File size exceeds maximum limit (5MB)' },
          { status: 400 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { success: 0, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload-image
 *
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Image upload API is ready',
    maxFileSize: `${MAX_FILE_SIZE / 1024 / 1024}MB`,
    allowedTypes: ALLOWED_MIME_TYPES,
  });
}
