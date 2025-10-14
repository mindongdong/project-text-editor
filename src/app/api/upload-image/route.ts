import { NextRequest, NextResponse } from 'next/server';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

/**
 * Phase 2: Image Upload API Endpoint
 *
 * Features:
 * - Multipart form data parsing with formidable
 * - File size validation (max 5MB)
 * - MIME type validation (JPG, PNG, WebP, GIF)
 * - UUID-based filename generation
 * - Image metadata extraction with sharp
 * - Saves to public/uploads directory
 * - Returns Editor.js compatible JSON response
 */

// Disable Next.js body parsing to handle multipart data manually
export const config = {
  api: {
    bodyParser: false,
  },
};

// Allowed MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Parse multipart form data using formidable
 */
async function parseForm(req: NextRequest): Promise<{ fields: any; files: any }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      maxFileSize: MAX_FILE_SIZE,
      keepExtensions: true,
      uploadDir: path.join(process.cwd(), 'public', 'uploads'),
    });

    // Convert Next.js Request to Node.js IncomingMessage format
    const nodeReq = req as any;

    form.parse(nodeReq, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
}

/**
 * POST /api/upload-image
 *
 * Request: multipart/form-data with 'image' field
 * Response: { success: 1, file: { url, width, height } }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Parse multipart form data
    const { files } = await parseForm(req);

    // 2. Validate file exists
    const image = files.image;
    if (!image) {
      return NextResponse.json(
        { success: 0, error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Handle both single file and array of files
    const file = Array.isArray(image) ? image[0] : image;

    // 3. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
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

    // 5. Generate unique filename with UUID
    const ext = path.extname(file.originalFilename || file.newFilename);
    const uniqueFilename = `${uuidv4()}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const newFilePath = path.join(uploadDir, uniqueFilename);

    // 6. Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // 7. Move file from temp location to uploads directory
    await fs.rename(file.filepath, newFilePath);

    // 8. Extract image metadata using sharp
    const metadata = await sharp(newFilePath).metadata();
    const { width, height } = metadata;

    // 9. Construct public URL
    const fileUrl = `/uploads/${uniqueFilename}`;

    // 10. Return Editor.js compatible response
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
      if (error.message.includes('maxFileSize')) {
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
