import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

/**
 * MSW Server Setup for Testing
 *
 * Mocks API endpoints for testing:
 * - POST /api/upload-image - Image upload endpoint
 */

export const handlers = [
  // Mock successful image upload
  http.post('/api/upload-image', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return HttpResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return HttpResponse.json(
        { success: false, error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return HttpResponse.json(
        { success: false, error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Mock successful response
    return HttpResponse.json({
      success: true,
      file: {
        url: 'https://example.com/mock-image.jpg',
        width: 800,
        height: 600,
      },
    });
  }),

  // Mock GET /api/upload-image - Status endpoint
  http.get('/api/upload-image', () => {
    return HttpResponse.json({
      status: 'ready',
      message: 'Image upload API is ready',
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      maxSize: '5MB',
    });
  }),
];

// Setup MSW server
export const server = setupServer(...handlers);
