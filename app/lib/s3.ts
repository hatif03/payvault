export interface UploadResult { url: string; key: string; size: number; }

export async function uploadFileToS3(
  file: File,
  fileName: string,
  userId: string
): Promise<UploadResult> {
  const key = `uploads/${userId}/${Date.now()}_${fileName}`;
  // Return a local public icon as fake URL
  return { url: `/file.svg`, key, size: file.size };
}

export async function deleteFileFromS3(_key: string): Promise<void> {
  return;
}

export async function deleteFileFromS3ByUrl(_url: string): Promise<void> {
  return;
}

export function extractKeyFromS3Url(_url: string): string | null { return null; }

export async function cleanupOrphanedS3File(_uploadResult: UploadResult): Promise<void> { return; }

export async function generatePresignedUrl(_key: string, _expiresIn: number = 3600): Promise<string> {
  return `/file.svg`;
}

export async function downloadFileFromS3(_url: string): Promise<Buffer> {
  return Buffer.from([]);
}

export { validateS3Config } from './config';
