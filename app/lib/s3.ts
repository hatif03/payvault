import { getStorageInstance } from './firebase';
import { secrets } from './config';

export interface UploadResult { 
  url: string; 
  key: string; 
  size: number; 
}

export async function uploadFileToS3(
  file: File,
  fileName: string,
  userId: string
): Promise<UploadResult> {
  try {
    const storage = getStorageInstance();
    if (!storage) {
      // Fallback to mock mode
      const key = `uploads/${userId}/${Date.now()}_${fileName}`;
      return { url: `/file.svg`, key, size: file.size };
    }

    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `uploads/${userId}/${timestamp}_${sanitizedFileName}`;

    const bucket = storage.bucket();
    const fileRef = bucket.file(key);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          originalName: fileName,
          uploadedBy: userId,
          uploadedAt: timestamp.toString(),
        },
      },
    });

    // Make file publicly accessible
    await fileRef.makePublic();

    const url = `https://storage.googleapis.com/${secrets.FIREBASE_STORAGE_BUCKET}/${key}`;

    return {
      url,
      key,
      size: file.size,
    };
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    // Fallback to mock mode
    const key = `uploads/${userId}/${Date.now()}_${fileName}`;
    return { url: `/file.svg`, key, size: file.size };
  }
}

export async function deleteFileFromS3(key: string): Promise<void> {
  try {
    const storage = getStorageInstance();
    if (!storage) {
      return;
    }

    const bucket = storage.bucket();
    const fileRef = bucket.file(key);
    await fileRef.delete();
  } catch (error) {
    console.error('Error deleting file from Firebase Storage:', error);
  }
}

export async function deleteFileFromS3ByUrl(url: string): Promise<void> {
  try {
    const key = extractKeyFromS3Url(url);
    if (key) {
      await deleteFileFromS3(key);
    }
  } catch (error) {
    console.error('Error deleting file by URL:', error);
  }
}

export function extractKeyFromS3Url(url: string): string | null {
  try {
    const bucketName = secrets.FIREBASE_STORAGE_BUCKET;
    const pattern = new RegExp(`https://storage\\.googleapis\\.com/${bucketName}/(.+)`);
    const match = url.match(pattern);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting key from URL:', error);
    return null;
  }
}

export async function cleanupOrphanedS3File(uploadResult: UploadResult): Promise<void> {
  try {
    await deleteFileFromS3(uploadResult.key);
  } catch (error) {
    console.error('Error cleaning up orphaned file:', error);
  }
}

export async function generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const storage = getStorageInstance();
    if (!storage) {
      return `/file.svg`;
    }

    const bucket = storage.bucket();
    const fileRef = bucket.file(key);
    
    const [signedUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn * 1000,
    });

    return signedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return `/file.svg`;
  }
}

export async function downloadFileFromS3(url: string): Promise<Buffer> {
  try {
    const key = extractKeyFromS3Url(url);
    if (!key) {
      return Buffer.from([]);
    }

    const storage = getStorageInstance();
    if (!storage) {
      return Buffer.from([]);
    }

    const bucket = storage.bucket();
    const fileRef = bucket.file(key);
    const [buffer] = await fileRef.download();
    
    return buffer;
  } catch (error) {
    console.error('Error downloading file:', error);
    return Buffer.from([]);
  }
}

export { validateS3Config } from './config';
