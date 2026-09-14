export type AudioCacheSource = 'default' | 'user';
export type AudioCacheStatus = 'cached' | 'streaming' | 'not-cached' | 'caching' | 'failed';

export interface CachedAudioBlob {
  trackId: string;
  source: AudioCacheSource;
  title: string;
  moodLabel: string;
  blob: Blob;
  contentType: string;
  sizeBytes: number;
  cachedAt: string;
}

export interface AudioCacheInfo {
  trackId: string;
  title: string;
  source: AudioCacheSource;
  sizeBytes: number;
  cachedAt: string;
}

export interface CacheAudioTrackParams {
  trackId: string;
  source: AudioCacheSource;
  title: string;
  moodLabel: string;
  url: string;
  contentType?: string;
}

const DB_NAME = 'lunara-audio-cache';
const STORE_NAME = 'audio-blobs';
const DB_VERSION = 1;
const MAX_CACHE_SIZE_BYTES = 300 * 1024 * 1024;

function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== 'undefined';
}

function openAudioCacheDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDbAvailable()) {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'trackId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open audio cache.'));
  });
}

function runStoreRequest<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openAudioCacheDb().then((db) => new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = action(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Audio cache request failed.'));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error || new Error('Audio cache transaction failed.'));
    };
  }));
}

function isQuotaError(error: unknown): boolean {
  return error instanceof DOMException && (
    error.name === 'QuotaExceededError' ||
    error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
  );
}

export const audioCacheService = {
  maxCacheSizeBytes: MAX_CACHE_SIZE_BYTES,

  async getCachedAudio(trackId: string): Promise<Blob | null> {
    try {
      const cached = await runStoreRequest<CachedAudioBlob | undefined>('readonly', (store) =>
        store.get(trackId)
      );
      return cached?.blob ?? null;
    } catch {
      return null;
    }
  },

  async cacheAudioTrack(params: CacheAudioTrackParams): Promise<void> {
    const response = await fetch(params.url);
    if (!response.ok) {
      throw new Error(`Could not download audio: ${response.status}`);
    }

    const blob = await response.blob();
    const sizeBytes = blob.size;
    const currentCache = await this.getAudioCacheInfo();
    const existing = currentCache.find((item) => item.trackId === params.trackId);
    const currentSize = currentCache.reduce((total, item) => total + item.sizeBytes, 0);
    const nextSize = currentSize - (existing?.sizeBytes ?? 0) + sizeBytes;

    if (nextSize > MAX_CACHE_SIZE_BYTES) {
      throw new DOMException('Cache limit reached.', 'QuotaExceededError');
    }

    const cached: CachedAudioBlob = {
      trackId: params.trackId,
      source: params.source,
      title: params.title,
      moodLabel: params.moodLabel,
      blob,
      contentType: params.contentType || blob.type || 'audio/mpeg',
      sizeBytes,
      cachedAt: new Date().toISOString(),
    };

    try {
      await runStoreRequest<IDBValidKey>('readwrite', (store) => store.put(cached));
    } catch (error) {
      if (isQuotaError(error)) {
        throw new DOMException('Storage is full.', 'QuotaExceededError');
      }
      throw error;
    }
  },

  async deleteCachedAudio(trackId: string): Promise<void> {
    await runStoreRequest<undefined>('readwrite', (store) => store.delete(trackId));
  },

  async clearAudioCache(): Promise<void> {
    await runStoreRequest<undefined>('readwrite', (store) => store.clear());
  },

  async getAudioCacheInfo(): Promise<AudioCacheInfo[]> {
    try {
      const rows = await runStoreRequest<CachedAudioBlob[]>('readonly', (store) => store.getAll());
      return rows.map(({ trackId, title, source, sizeBytes, cachedAt }) => ({
        trackId,
        title,
        source,
        sizeBytes,
        cachedAt,
      }));
    } catch {
      return [];
    }
  },

  async createCachedObjectUrl(trackId: string): Promise<string | null> {
    const blob = await this.getCachedAudio(trackId);
    return blob ? URL.createObjectURL(blob) : null;
  },

  isQuotaError,
};
