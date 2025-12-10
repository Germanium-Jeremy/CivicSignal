import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/utils/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';

/**
 * POST /api/issues/upload
 * Upload images for issue reporting
 * Supports both base64 and multipart/form-data
 * Compresses images automatically
 * Generates thumbnails
 */

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return authResult.error || NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      // Handle base64 image upload (from mobile apps)
      return handleBase64Upload(request, authResult.userId ? authResult.userId : '');
    } else if (contentType?.includes('multipart/form-data')) {
      // Handle form data upload (from web)
      return handleFormDataUpload(request, authResult.userId ? authResult.userId : '');
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Unsupported content type',
          message: 'Please send images as base64 JSON or multipart/form-data',
        },
        { status: 415 }
      );
    }
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload image',
        message: 'An error occurred while uploading the image',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle base64 image upload (typical from mobile apps)
 */
async function handleBase64Upload(request: NextRequest, userId: string) {
  console.log("Image is recieved 2")
  try {
    const body = await request.json();
    const { images } = body; // Array of {data: base64String, mimeType: string}

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No images provided',
          message: 'Please provide at least one image',
        },
        { status: 400 }
      );
    }

    // Limit to 5 images per upload
    if (images.length > 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many images',
          message: 'Maximum 5 images allowed per upload',
        },
        { status: 400 }
      );
    }

    const uploadedImages = [];

    for (const image of images) {
      if (!image.data || !image.mimeType) {
        continue;
      }

      // Remove data URL prefix if present (data:image/jpeg;base64,...)
      const base64Data = image.data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Check file size (max 10MB)
      if (buffer.length > 10 * 1024 * 1024) {
        return NextResponse.json(
          {
            success: false,
            error: 'Image too large',
            message: 'Maximum image size is 10MB',
          },
          { status: 400 }
        );
      }

      // Process and compress image
      const result = await processAndSaveImage(buffer, userId, image.mimeType);
      uploadedImages.push(result);
    }

    return NextResponse.json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        images: uploadedImages,
      },
    });
  } catch (error) {
    console.error('Base64 upload error:', error);
    throw error;
  }
}

/**
 * Handle multipart form data upload (typical from web browsers)
 */
async function handleFormDataUpload(request: NextRequest, userId: string) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images');

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No files provided',
          message: 'Please select at least one image',
        },
        { status: 400 }
      );
    }

    // Limit to 5 images per upload
    if (files.length > 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many files',
          message: 'Maximum 5 images allowed per upload',
        },
        { status: 400 }
      );
    }

    const uploadedImages = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        continue;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        continue;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          {
            success: false,
            error: 'File too large',
            message: `${file.name} is too large. Maximum size is 10MB`,
          },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await processAndSaveImage(buffer, userId, file.type);
      uploadedImages.push(result);
    }

    return NextResponse.json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        images: uploadedImages,
      },
    });
  } catch (error) {
    console.error('Form data upload error:', error);
    throw error;
  }
}

/**
 * Process, compress, and save image
 * Creates both full-size (compressed) and thumbnail versions
 */
async function processAndSaveImage(buffer: Buffer, userId: string, mimeType: string) {
  console.log("Image is recieved")
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const filename = `${userId}-${timestamp}-${random}`;
    const extension = mimeType.split('/')[1] || 'jpg';

    // Directories under Next public: /public/media/issues
    const uploadDir = join(process.cwd(), 'public', 'media', 'issues');
    const thumbnailDir = join(process.cwd(), 'public', 'media', 'issues', 'thumbnails');

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
      console.log('Created dir:', uploadDir);
    }
    if (!existsSync(thumbnailDir)) {
      await mkdir(thumbnailDir, { recursive: true });
      console.log('Created dir:', thumbnailDir);
    }

    // Try sharp first, fallback to original buffer if it fails
    let compressedImage: Buffer;
    let thumbnail: Buffer;
    try {
      compressedImage = await sharp(buffer)
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      thumbnail = await sharp(buffer)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 70 })
        .toBuffer();
    } catch (e) {
      console.warn('sharp failed, storing original buffer as-is:', e);
      compressedImage = buffer;
      thumbnail = buffer;
    }

    const imagePath = join(uploadDir, `${filename}.jpg`);
    const thumbnailPath = join(thumbnailDir, `${filename}.jpg`);

    await writeFile(imagePath, compressedImage);
    await writeFile(thumbnailPath, thumbnail);
    console.log('Saved image:', imagePath);
    console.log('Saved thumbnail:', thumbnailPath);

    // URLs relative to Next public (serve as https://<host>/media/issues/...)
    return {
      url: `/media/issues/${filename}.jpg`,
      thumbnailUrl: `/media/issues/thumbnails/${filename}.jpg`,
      size: compressedImage.length,
      mimeType: 'image/jpeg',
    };
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
}

/**
 * Configuration for cloud storage (S3, Cloudinary, etc.)
 * Uncomment and configure when moving to production
 */
/*
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadToS3(buffer: Buffer, filename: string, mimeType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET,
    Key: `issues/${filename}`,
    Body: buffer,
    ContentType: mimeType,
    ACL: 'public-read',
  });

  await s3Client.send(command);
  
  return {
    url: `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/issues/${filename}`,
  };
}
*/
