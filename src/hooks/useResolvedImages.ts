import { useState, useEffect, useRef, useCallback } from 'react';
import {
  isStorageUrl,
  resolveDiaryImageUrls,
  replaceStorageUrls,
} from '@/services/diaryImageService';

export function useResolvedImages(content: string, userId: string | undefined) {
  const [resolvedContent, setResolvedContent] = useState(content);
  const [resolving, setResolving] = useState(false);
  const cacheRef = useRef(new Map<string, string>());

  const resolveUrls = useCallback(
    async (text: string) => {
      if (!userId || !text.includes('storage://')) {
        setResolvedContent(text);
        return;
      }

      const unresolvedPaths = new Set<string>();
      const imgRegex = /\!\[.*?\]\((storage:\/\/[^)]+)\)/g;
      let match;
      while ((match = imgRegex.exec(text)) !== null) {
        const url = match[1];
        if (!cacheRef.current.has(url)) {
          unresolvedPaths.add(url);
        }
      }

      if (unresolvedPaths.size === 0) {
        setResolvedContent(replaceStorageUrls(text, cacheRef.current));
        return;
      }

      setResolving(true);
      try {
        const newUrls = await resolveDiaryImageUrls(text, userId);
        for (const [key, value] of newUrls) {
          cacheRef.current.set(key, value);
        }
        setResolvedContent(replaceStorageUrls(text, cacheRef.current));
      } catch (err) {
        console.error('Failed to resolve diary image URLs:', err);
        setResolvedContent(text);
      } finally {
        setResolving(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    resolveUrls(content);
  }, [content, resolveUrls]);

  return { resolvedContent, resolving };
}
