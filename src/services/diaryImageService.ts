import { supabase } from '../lib/supabaseClient';

const STORAGE_URL_MARKER = 'storage://';
const SIGNED_URL_EXPIRY = 3600;

export function isStorageUrl(url: string): boolean {
  return url.startsWith(STORAGE_URL_MARKER);
}

export function extractStoragePath(url: string): string {
  return url.slice(STORAGE_URL_MARKER.length);
}

function extractDiaryIdFromPath(path: string): string | null {
  const parts = path.split('/');
  return parts.length >= 2 ? parts[1] : null;
}

async function getAccessibleDiaryIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('diary_entries')
    .select('id')
    .eq('user_id', userId);

  const { data: sharedData } = await supabase
    .from('diary_shares')
    .select('diary_id')
    .eq('shared_with_user_id', userId);

  const ids = new Set<string>();
  if (data) data.forEach(d => ids.add(d.id));
  if (sharedData) sharedData.forEach(s => ids.add(s.diary_id));
  return ids;
}

export async function getSignedImageUrl(
  storagePath: string,
  userId: string
): Promise<string | null> {
  const diaryId = extractDiaryIdFromPath(storagePath);
  if (!diaryId) return null;

  const accessibleIds = await getAccessibleDiaryIds(userId);
  if (!accessibleIds.has(diaryId)) return null;

  const { data, error } = await supabase.storage
    .from('diary-images')
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function resolveDiaryImageUrls(
  content: string,
  userId: string
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();
  const storagePaths: { fullUrl: string; path: string; diaryId: string }[] = [];

  const imgRegex = /\!\[.*?\]\((storage:\/\/[^)]+)\)/g;
  let match;

  while ((match = imgRegex.exec(content)) !== null) {
    const fullUrl = match[1];
    const path = extractStoragePath(fullUrl);
    const diaryId = extractDiaryIdFromPath(path);
    if (diaryId) {
      storagePaths.push({ fullUrl, path, diaryId });
    }
  }

  if (storagePaths.length === 0) return urlMap;

  const uniqueDiaryIds = [...new Set(storagePaths.map(p => p.diaryId))];
  const accessibleIds = await getAccessibleDiaryIds(userId);
  const accessibleDiaryIds = uniqueDiaryIds.filter(id => accessibleIds.has(id));

  const signedUrls = await Promise.all(
    accessibleDiaryIds.map(async (diaryId) => {
      const paths = storagePaths.filter(p => p.diaryId === diaryId);
      return Promise.all(
        paths.map(async (p) => {
          const { data, error } = await supabase.storage
            .from('diary-images')
            .createSignedUrl(p.path, SIGNED_URL_EXPIRY);
          if (!error && data?.signedUrl) {
            urlMap.set(p.fullUrl, data.signedUrl);
          }
          return null;
        })
      );
    })
  );

  return urlMap;
}

export function replaceStorageUrls(
  content: string,
  urlMap: Map<string, string>
): string {
  let result = content;
  for (const [storageUrl, signedUrl] of urlMap) {
    result = result.replaceAll(storageUrl, signedUrl);
  }
  return result;
}
