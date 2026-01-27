import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/utils/auth';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * POST /api/user/profile/upload
 * Upload profile image for user
 * Supports both base64 and multipart/form-data
 * Compresses images automatically
 * Only accepts jpeg, jpg, png formats
 */

export const runtime = 'nodejs';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

    const userId = authResult.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found' },
        { status: 401 }
      );
    }

    await connectDB();

    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      // Handle base64 image upload (from mobile apps)
      return handleBase64Upload(request, userId);
    } else if (contentType?.includes('multipart/form-data')) {
      // Handle form data upload (from web)
      return handleFormDataUpload(request, userId);
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
    console.error('Profile image upload error:', error);
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
  try {
    const body = await request.json();
    const { image } = body; // {data: base64String, mimeType: string}

    if (!image || !image.data || !image.mimeType) {
      return NextResponse.json(
        {
          success: false,
          error: 'No image provided',
          message: 'Please provide an image with data and mimeType',
        },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(image.mimeType.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type',
          message: 'Only JPEG, JPG, and PNG images are allowed',
        },
        { status: 400 }
      );
    }

    // Remove data URL prefix if present (data:image/jpeg;base64,...)
    const base64Data = image.data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Check file size
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: 'Image too large',
          message: 'Maximum image size is 10MB',
        },
        { status: 400 }
      );
    }

    // Process and save image
    const result = await processAndSaveImage(buffer, userId, image.mimeType);

    // Update user profile with new image path
    const user = await User.findById(userId);
    if (user && user.profileImage) {
      // Delete old profile image if it exists
      try {
        const oldImagePath = join(process.cwd(), 'public', user.profileImage);
        if (existsSync(oldImagePath)) {
          await unlink(oldImagePath);
        }
      } catch (err) {
        console.warn('Failed to delete old profile image:', err);
      }
    }

    // Update user profile
    await User.findByIdAndUpdate(userId, { profileImage: result.url });

    return NextResponse.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        url: result.url,
        size: result.size,
        mimeType: result.mimeType,
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
    const file = formData.get('image');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided',
          message: 'Please select an image',
        },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type',
          message: 'Only JPEG, JPG, and PNG images are allowed',
        },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
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

    // Update user profile with new image path
    const user = await User.findById(userId);
    if (user && user.profileImage) {
      // Delete old profile image if it exists
      try {
        const oldImagePath = join(process.cwd(), 'public', user.profileImage);
        if (existsSync(oldImagePath)) {
          await unlink(oldImagePath);
        }
      } catch (err) {
        console.warn('Failed to delete old profile image:', err);
      }
    }

    // Update user profile
    await User.findByIdAndUpdate(userId, { profileImage: result.url });

    return NextResponse.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        url: result.url,
        size: result.size,
        mimeType: result.mimeType,
      },
    });
  } catch (error) {
    console.error('Form data upload error:', error);
    throw error;
  }
}

/**
 * Process, compress, and save profile image
 */
async function processAndSaveImage(buffer: Buffer, userId: string, mimeType: string) {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const filename = `${userId}-${timestamp}-${random}`;
    
    // Determine extension based on mime type
    let extension = 'jpg';
    if (mimeType.includes('png')) {
      extension = 'png';
    } else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      extension = 'jpg';
    }

    // Directory: /public/media/user_profiles
    const uploadDir = join(process.cwd(), 'public', 'media', 'user_profiles');

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
      console.log('Created dir:', uploadDir);
    }

    // Process image with sharp
    let processedImage: Buffer;
    try {
      if (extension === 'png') {
        // For PNG, preserve transparency but compress
        processedImage = await sharp(buffer)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .png({ quality: 85, compressionLevel: 9 })
          .toBuffer();
      } else {
        // For JPEG, convert and compress
        processedImage = await sharp(buffer)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
        extension = 'jpg'; // Always save as jpg for JPEG
      }
    } catch (e) {
      console.warn('sharp failed, storing original buffer as-is:', e);
      processedImage = buffer;
    }

    const imagePath = join(uploadDir, `${filename}.${extension}`);
    await writeFile(imagePath, processedImage);
    console.log('Saved profile image:', imagePath);

    // URL relative to Next public (serve as https://<host>/media/user_profiles/...)
    return {
      url: `/media/user_profiles/${filename}.${extension}`,
      size: processedImage.length,
      mimeType: extension === 'png' ? 'image/png' : 'image/jpeg',
    };
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
}
