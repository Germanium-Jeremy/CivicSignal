import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { put } from "@vercel/blob";
import sharp from "sharp";

/**
 * POST /api/issues/upload
 * Upload media for issue reporting
 * Supports both base64 and multipart/form-data
 * Compresses images automatically
 */

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = [
     "image/jpeg", "image/jpg", "image/png", 
     "audio/mpeg", "audio/wav", "audio/m4a", "audio/aac",
     "video/mp4", "video/quicktime", "video/webm"
];

export async function POST(request: NextRequest) {
     try {
          // Verify authentication
          const authResult = await requireAuth(request);
          if (!authResult.success || !authResult.user?.userId) {
               return NextResponse.json({ success: false, error: authResult.error || "Authentication required" }, { status: authResult.status || 401 });
          }

          const contentType = request.headers.get("content-type");

          if (contentType?.includes("application/json")) {
               // Handle base64 image upload (from mobile apps)
               return handleBase64Upload(request, authResult.user.userId);
          } else if (contentType?.includes("multipart/form-data")) {
               // Handle form data upload (from web)
               return handleFormDataUpload(request, authResult.user.userId);
          } else {
               return NextResponse.json(
                    {
                         success: false,
                         error: "Unsupported content type",
                         message: "Please send images as base64 JSON or multipart/form-data",
                    },
                    { status: 415 },
               );
          }
     } catch (error) {
          console.error("Image upload error:", error);
          return NextResponse.json(
               {
                    success: false,
                    error: "Failed to upload image",
                    message: "An error occurred while uploading the image",
               },
               { status: 500 },
          );
     }
}

/**
 * Handle base64 image upload (typical from mobile apps)
 */
async function handleBase64Upload(request: NextRequest, userId: string) {
     console.log("Image is recieved 2");
     try {
          const body = await request.json();
          const { images } = body; // Array of {data: base64String, mimeType: string}

          if (!images || !Array.isArray(images) || images.length === 0) {
               return NextResponse.json(
                    {
                         success: false,
                         error: "No images provided",
                         message: "Please provide at least one media file",
                    },
                    { status: 400 },
               );
          }

          // Limit to 5 images per upload
          if (images.length > 5) {
               return NextResponse.json(
                    {
                         success: false,
                         error: "Too many images",
                         message: "Maximum 5 images allowed per upload",
                    },
                    { status: 400 },
               );
          }

          const uploadedImages = [];

          for (const image of images) {
               if (!image.data || !image.mimeType) {
                    continue;
               }

               // Validate MIME type
               if (!ALLOWED_MIME_TYPES.includes(image.mimeType.toLowerCase())) {
                    return NextResponse.json(
                         {
                              success: false,
                              error: "Invalid file type",
                              message: "Only JPEG, JPG, and PNG images are allowed",
                         },
                         { status: 400 },
                    );
               }

               // Remove data URL prefix if present (data:<mime>;base64,...)
               const base64Data = String(image.data).includes('base64,')
                    ? String(image.data).substring(String(image.data).indexOf('base64,') + 7)
                    : String(image.data);
               const buffer = Buffer.from(base64Data, "base64");

               // Check file size (max 10MB)
               if (buffer.length > 10 * 1024 * 1024) {
                    return NextResponse.json(
                         {
                              success: false,
                              error: "Image too large",
                              message: "Maximum image size is 10MB",
                         },
                         { status: 400 },
                    );
               }

               const result = await processAndSaveMedia(buffer, userId, image.mimeType);
               uploadedImages.push(result);
          }

          return NextResponse.json({
               success: true,
               message: "Images uploaded successfully",
               data: {
                    images: uploadedImages,
               },
          });
     } catch (error) {
          console.error("Base64 upload error:", error);
          throw error;
     }
}

/**
 * Handle multipart form data upload (typical from web browsers)
 */
async function handleFormDataUpload(request: NextRequest, userId: string) {
     try {
          const formData = await request.formData();
          const files = formData.getAll("images");

          if (!files || files.length === 0) {
               return NextResponse.json(
                    {
                         success: false,
                         error: "No files provided",
                         message: "Please select at least one media file",
                    },
                    { status: 400 },
               );
          }

          // Limit to 5 images per upload
          if (files.length > 5) {
               return NextResponse.json(
                    {
                         success: false,
                         error: "Too many files",
                         message: "Maximum 5 images allowed per upload",
                    },
                    { status: 400 },
               );
          }

          const uploadedImages = [];

          for (const file of files) {
               if (!(file instanceof File)) {
                    continue;
               }

               // Validate MIME type
               if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
                    return NextResponse.json(
                         {
                              success: false,
                              error: "Invalid file type",
                         message: `File ${file.name} is not a valid media type`,
                         },
                         { status: 400 },
                    );
               }

               // Check file size (max 10MB)
               if (file.size > 10 * 1024 * 1024) {
                    return NextResponse.json(
                         {
                              success: false,
                              error: "File too large",
                              message: `${file.name} is too large. Maximum size is 10MB`,
                         },
                         { status: 400 },
                    );
               }

               const buffer = Buffer.from(await file.arrayBuffer());
               const result = await processAndSaveMedia(buffer, userId, file.type);
               uploadedImages.push(result);
          }

          return NextResponse.json({
               success: true,
               message: "Images uploaded successfully",
               data: {
                    images: uploadedImages,
               },
          });
     } catch (error) {
          console.error("Form data upload error:", error);
          throw error;
     }
}

/**
 * Process, compress, and save image to Vercel Blob Storage
 */
async function processAndSaveMedia(buffer: Buffer, userId: string, mimeType: string) {
     try {
          // Generate unique filename
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(7);
          const extension = mimeType.split('/')[1] || 'bin';
          const filename = `${userId}-${timestamp}-${random}.${extension}`;

          const isImage = mimeType.startsWith("image/");
          
          // Process and compress image only if it's an image
          let processedBuffer: Buffer = buffer;
          if (isImage) {
               try {
                    processedBuffer = await sharp(buffer)
                         .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
                         .jpeg({ quality: 80 })
                         .toBuffer();
               } catch (e) {
                    console.warn("sharp failed, storing original buffer as-is:", e);
               }
          }

          // Upload to Vercel Blob Storage
          const { url } = await put(`issues/${filename}`, processedBuffer, { contentType: mimeType, access: "public" });

          return { 
               url, 
               size: processedBuffer.length, 
               mimeType,
               mediaType: isImage ? "image" : mimeType.startsWith("audio/") ? "audio" : "video"
          };
     } catch (error) {
          console.error("Image processing error:", error);
          throw new Error("Failed to process image");
     }
}
