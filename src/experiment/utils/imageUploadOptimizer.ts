import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';

const MAX_IMAGE_WIDTH = 1600;
const JPEG_QUALITY = 0.75;

export async function optimizeImageForUpload(localUri: string): Promise<string> {
  const optimized = await manipulateAsync(
    localUri,
    [{ resize: { width: MAX_IMAGE_WIDTH } }],
    { compress: JPEG_QUALITY, format: SaveFormat.JPEG },
  );

  return optimized.uri;
}
