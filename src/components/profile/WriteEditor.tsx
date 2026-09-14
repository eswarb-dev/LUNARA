import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { storage } from '@/lib/storage';
import {
  serializeDiaryContent,
  parseDiaryContent,
  normalizePageTitles,
  PAGE_TITLE_MAX_LENGTH,
} from '@/lib/diaryContent';
import { useResolvedImages } from '@/hooks/useResolvedImages';
import { Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Badge } from '@/components/ui';
import DiaryPageNavigation from './DiaryPageNavigation';
import ShareDiaryDialog from './ShareDiaryDialog';
import {
  Save, Smile, Tag, Send, Bold, Italic, Underline, List, Quote,
  Heading1, Heading2, Link, ListOrdered, Code, Minus, Type,
  Highlighter, CheckSquare, Share2, ImagePlus, BookOpen,
} from 'lucide-react';

const AUTOSAVE_DELAY_MS = 2000;
const PULLBACK_DEBOUNCE_MS = 300;

const diaryQuotes = [
  "Every page holds a memory, every word tells a story.",
  "Write what you feel, not what you think you should.",
  "The moon sees what the heart whispers.",
  "Let your thoughts wander freely on this page.",
  "This page is a safe place for your feelings.",
  "Some words are meant only for the night.",
  "Your journal knows you better than anyone.",
  "Stillness is where writing begins.",
];

interface DiaryPage {
  id: string;
  content: string;
}

function joinPagesForSave(pages: DiaryPage[], pageTitles?: string[]): string {
  return serializeDiaryContent(pages, pageTitles || pages.map(() => ''));
}

function removeEmptyTrailingPages(pages: DiaryPage[]): DiaryPage[] {
  const result = [...pages];
  while (result.length > 1 && result[result.length - 1].content.trim() === '') {
    result.pop();
  }
  return result;
}

function splitTextToFitPage(
  text: string,
  measureEl: HTMLDivElement,
  maxHeight: number
): { fittingText: string; overflowText: string } {
  if (!measureEl || text.length === 0) return { fittingText: text, overflowText: '' };

  let low = 0;
  let high = text.length;
  let bestFit = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    measureEl.textContent = text.substring(0, mid);
    if (measureEl.scrollHeight <= maxHeight) {
      bestFit = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (bestFit >= text.length) return { fittingText: text, overflowText: '' };

  const searchFrom = Math.max(0, bestFit - 2);
  const lastSpace = text.lastIndexOf(' ', bestFit);
  const lastNewline = text.lastIndexOf('\n', bestFit);
  const candidates = [lastSpace, lastNewline, bestFit].filter(i => i > searchFrom);
  const splitAt = candidates.length > 0 ? Math.max(...candidates) : bestFit;

  if (splitAt <= 0) return { fittingText: text.substring(0, 1), overflowText: text.substring(1) };

  return {
    fittingText: text.substring(0, splitAt).trimEnd(),
    overflowText: text.substring(splitAt).trimStart(),
  };
}

function paginateContent(
  content: string,
  measureEl: HTMLDivElement,
  maxHeight: number
): string[] {
  if (!content) return [''];
  const result: string[] = [];
  let remaining = content;
  let safety = 0;

  while (remaining.length > 0 && safety < 200) {
    safety++;
    const { fittingText, overflowText } = splitTextToFitPage(remaining, measureEl, maxHeight);
    result.push(fittingText);
    if (!overflowText) break;
    remaining = overflowText;
  }

  return result.length > 0 ? result : [''];
}

function normalizePagesAfterDelete(
  pages: DiaryPage[],
  pageIndex: number,
  measureEl: HTMLDivElement,
  maxHeight: number
): DiaryPage[] {
  if (pageIndex >= pages.length - 1) return pages;

  const currentContent = pages[pageIndex].content;
  const nextContent = pages[pageIndex + 1]?.content || '';

  if (!nextContent) {
    const result = pages.filter((_, i) => i !== pageIndex + 1);
    return result.length > 0 ? result : [{ id: crypto.randomUUID(), content: '' }];
  }

  const combined = currentContent + (currentContent && nextContent ? '\n\n' : '') + nextContent;
  measureEl.textContent = combined;

  if (measureEl.scrollHeight <= maxHeight) {
    const result = [...pages];
    result[pageIndex] = { ...result[pageIndex], content: combined };
    result.splice(pageIndex + 1, 1);
    return result.length > 0 ? result : [{ id: crypto.randomUUID(), content: '' }];
  }

  const { fittingText, overflowText } = splitTextToFitPage(combined, measureEl, maxHeight);
  const result = [...pages];
  result[pageIndex] = { ...result[pageIndex], content: fittingText };

  if (overflowText) {
    result[pageIndex + 1] = { ...result[pageIndex + 1], content: overflowText };
  } else {
    result.splice(pageIndex + 1, 1);
  }

  return result.length > 0 ? result : [{ id: crypto.randomUUID(), content: '' }];
}

interface WriteEditorProps {
  initialDiaryId?: string;
  initialTitle?: string;
  initialDescription?: string;
  onInvalidDiary?: () => void;
}

const WriteEditor: React.FC<WriteEditorProps> = ({ initialDiaryId, initialTitle, initialDescription, onInvalidDiary }) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const draftId = initialDiaryId || searchParams.get('draftId') || searchParams.get('diaryId');

  const [diaryTitle, setDiaryTitle] = useState(initialTitle || '');
  const [pageTitles, setPageTitles] = useState<string[]>(['']);
  const [pages, setPages] = useState<DiaryPage[]>([{ id: crypto.randomUUID(), content: '' }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [mood, setMood] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [excerpt, setExcerpt] = useState(initialDescription || '');

  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [pageTransition, setPageTransition] = useState<'none' | 'forward-exit' | 'forward-enter' | 'backward-exit' | 'backward-enter'>('none');
  const [tabTransition, setTabTransition] = useState<'none' | 'exit' | 'enter'>('none');
  const [showPageFullPrompt, setShowPageFullPrompt] = useState(false);
  const [bookOpen, setBookOpen] = useState(true);
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isMobile, setIsMobile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [detailsTitle, setDetailsTitle] = useState('');
  const [detailsDescription, setDetailsDescription] = useState('');
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [diaryLoadError, setDiaryLoadError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const pageBodyRef = useRef<HTMLDivElement>(null);
  const rightPageRef = useRef<HTMLDivElement>(null);
  const leftPageRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const pagesRef = useRef(pages);
  const pageTitlesRef = useRef(pageTitles);
  const currentPageIndexRef = useRef(currentPageIndex);
  const autoTurnPendingRef = useRef(false);
  const pullbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedContentRef = useRef('');
  const cursorPositionsRef = useRef<Map<number, number>>(new Map());

  const moods = ['Peaceful', 'Excited', 'Contemplative', 'Joyful', 'Melancholy', 'Reflective', 'Energetic', 'Calm', 'Anxious', 'Hopeful'];

  useEffect(() => { pagesRef.current = pages; }, [pages]);
  useEffect(() => { pageTitlesRef.current = pageTitles; }, [pageTitles]);
  useEffect(() => { currentPageIndexRef.current = currentPageIndex; }, [currentPageIndex]);

  useEffect(() => {
    setPageTitles(prev => normalizePageTitles(prev, pages.length));
  }, [pages.length]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const hasUnsavedContent = useMemo(() => {
    const currentFull = serializeDiaryContent(removeEmptyTrailingPages(pages), pageTitles);
    return currentFull !== lastSavedContentRef.current && (diaryTitle || currentFull);
  }, [pages, diaryTitle, pageTitles]);

  useEffect(() => {
    if (!hasUnsavedContent) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedContent]);

  useEffect(() => {
    if (draftId && user) {
      setDiaryLoadError(null);
      const fetchDiary = async () => {
        try {
          const { data, error } = await supabase
            .from('diary_entries')
            .select('*')
            .eq('id', draftId)
            .single();

          if (error) throw error;
          if (!data) {
            setDiaryLoadError('Diary not found.');
            return;
          }
          setDiaryTitle(data.title || '');
          const parsed = parseDiaryContent(data.content || '');
          setPages(parsed.pages);
          setPageTitles(parsed.pageTitles);
          setMood(data.mood || '');
          setTags([...(data.mood_tags || []), ...(data.emotion_tags || []), ...(data.life_balance_tags || [])]);
          setExcerpt(data.description || data.content?.substring(0, 160) || '');
          lastSavedContentRef.current = data.content || '';
        } catch (error) {
          console.error('Failed to load diary:', error);
          setDiaryLoadError('Could not load this diary. It may have been removed or you may not have access.');
        }
      };
      fetchDiary();
    }
  }, [draftId, user]);

  const currentPageContent = pages[currentPageIndex]?.content || '';
  const previousPageContent = currentPageIndex > 0 ? pages[currentPageIndex - 1]?.content : null;

  const { resolvedContent: resolvedCurrentContent } = useResolvedImages(
    currentPageContent,
    user?.id
  );
  const { resolvedContent: resolvedPreviousContent } = useResolvedImages(
    previousPageContent || '',
    user?.id
  );

  const totalPages = pages.length;
  const fullContent = useMemo(() => serializeDiaryContent(pages, pageTitles), [pages, pageTitles]);

  useEffect(() => {
    if (showPageFullPrompt) {
      const timer = setTimeout(() => setShowPageFullPrompt(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showPageFullPrompt]);

  useEffect(() => {
    if (mode === 'write' && textareaRef.current && autoTurnPendingRef.current) {
      autoTurnPendingRef.current = false;
      const ta = textareaRef.current;
      ta.focus();
      const savedPos = cursorPositionsRef.current.get(currentPageIndex);
      const pos = savedPos !== undefined ? savedPos : 0;
      ta.setSelectionRange(pos, pos);
    }
  }, [currentPageIndex, mode]);

  const triggerPageTurn = useCallback((direction: 'forward' | 'backward', targetIndex: number, afterTurn?: () => void) => {
    const exitClass = direction === 'forward' ? 'forward-exit' : 'backward-exit';
    const enterClass = direction === 'forward' ? 'forward-enter' : 'backward-enter';

    setPageTransition(exitClass);
    setTimeout(() => {
      setCurrentPageIndex(targetIndex);
      setPageTransition(enterClass);
      setTimeout(() => {
        setPageTransition('none');
        afterTurn?.();
      }, 700);
    }, 700);
  }, []);

  const findSplitPoint = useCallback((text: string, maxHeight: number): number => {
    if (!measureRef.current || text.length === 0) return text.length;

    let low = 0;
    let high = text.length;
    let bestFit = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      measureRef.current.textContent = text.substring(0, mid);
      if (measureRef.current.scrollHeight <= maxHeight) {
        bestFit = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    const lastSpace = text.lastIndexOf(' ', bestFit);
    const lastNewline = text.lastIndexOf('\n', bestFit);
    const lastBoundary = Math.max(lastSpace, lastNewline);
    return lastBoundary > 0 ? lastBoundary : bestFit;
  }, []);

  const handleContentChange = useCallback((newValue: string) => {
    const idx = currentPageIndexRef.current;
    const currentPages = pagesRef.current;

    const newPages = [...currentPages];
    newPages[idx] = { ...newPages[idx], content: newValue };

    if (measureRef.current && pageBodyRef.current) {
      const pageBodyHeight = pageBodyRef.current.clientHeight;

      const pagesAfterIdx = newPages.slice(idx).map(p => p.content).join('\n\n');
      const paginated = paginateContent(pagesAfterIdx, measureRef.current, pageBodyHeight);

      const pagesBefore = newPages.slice(0, idx);
      const newPagesArray = paginated.map((content, i) => ({
        id: i === 0 ? newPages[idx].id : crypto.randomUUID(),
        content,
      }));
      const merged = [...pagesBefore, ...newPagesArray];

      setPages(merged.length > 0 ? merged : [{ id: crypto.randomUUID(), content: '' }]);

      if (paginated.length > 1) {
        setShowPageFullPrompt(true);
        autoTurnPendingRef.current = true;
        const targetIdx = Math.min(idx + 1, merged.length - 1);
        setPageTransition('forward-exit');
        setTimeout(() => {
          setCurrentPageIndex(targetIdx);
          setPageTransition('forward-enter');
          setTimeout(() => setPageTransition('none'), 700);
        }, 700);
        return;
      }
    } else {
      setPages(newPages);
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    cursorPositionsRef.current.set(currentPageIndexRef.current, ta.selectionStart);

    if (e.key === 'Backspace' || e.key === 'Delete') {
      const idx = currentPageIndexRef.current;
      const currentPages = pagesRef.current;

      if (ta.value.length < currentPages[idx]?.content.length) {
        if (pullbackTimerRef.current) clearTimeout(pullbackTimerRef.current);
        pullbackTimerRef.current = setTimeout(() => {
          if (measureRef.current && pageBodyRef.current) {
            const pageBodyHeight = pageBodyRef.current.clientHeight;
            const currentPagesNow = pagesRef.current;
            const idxNow = currentPageIndexRef.current;

            if (idxNow < currentPagesNow.length - 1) {
              const normalized = normalizePagesAfterDelete(currentPagesNow, idxNow, measureRef.current, pageBodyHeight);
              if (normalized !== currentPagesNow) {
                setPages(normalized);
                const savedPos = cursorPositionsRef.current.get(idxNow);
                const cursorAfter = savedPos !== undefined ? savedPos : 0;
                requestAnimationFrame(() => {
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                    textareaRef.current.setSelectionRange(cursorAfter, cursorAfter);
                  }
                });
              }
            }
          }
        }, PULLBACK_DEBOUNCE_MS);
      }
    }
  }, []);

  const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(e.clipboardData.files);
    const imageFile = files.find(f => f.type.startsWith('image/'));

    if (imageFile && user) {
      e.preventDefault();
      try {
        const imageUrl = await storage.uploadDiaryImage(user.id, imageFile, draftId || undefined);
        const imageMarkdown = `\n![${imageFile.name}](${imageUrl})\n`;
        const idx = currentPageIndexRef.current;
        const currentContent = pagesRef.current[idx]?.content || '';
        const ta = e.currentTarget;
        const cursorPos = ta.selectionStart;
        const before = currentContent.substring(0, cursorPos);
        const after = currentContent.substring(cursorPos);
        handleContentChange(before + imageMarkdown + after);
      } catch (error) {
        console.error('Failed to upload pasted image:', error);
      }
      return;
    }

    const pastedText = e.clipboardData.getData('text');
    if (!pastedText || pastedText.length < 50) return;

    e.preventDefault();

    const idx = currentPageIndexRef.current;
    const currentPages = pagesRef.current;
    const currentContent = currentPages[idx]?.content || '';
    const ta = e.currentTarget;
    const cursorPos = ta.selectionStart;

    const before = currentContent.substring(0, cursorPos);
    const after = currentContent.substring(cursorPos);
    const combined = before + pastedText + after;

    if (!measureRef.current || !pageBodyRef.current) {
      setPages(prev => {
        const newPages = [...prev];
        newPages[idx] = { ...newPages[idx], content: combined };
        return newPages;
      });
      return;
    }

    const pageBodyHeight = pageBodyRef.current.clientHeight;
    const paginated = paginateContent(combined, measureRef.current, pageBodyHeight);

    setPages(prev => {
      const newPages = [...prev];
      paginated.forEach((pageContent, i) => {
        if (i < newPages.length) {
          newPages[i] = { ...newPages[i], content: pageContent };
        } else {
          newPages.push({ id: crypto.randomUUID(), content: pageContent });
        }
      });

      if (paginated.length < newPages.length) {
        newPages.splice(paginated.length, newPages.length - paginated.length);
      }

      return newPages.length > 0 ? newPages : [{ id: crypto.randomUUID(), content: '' }];
    });

    if (paginated.length > 1) {
      const lastPageIndex = Math.min(idx + paginated.length - 1, paginated.length - 1);
      autoTurnPendingRef.current = true;
      triggerPageTurn('forward', lastPageIndex, () => {
        autoTurnPendingRef.current = false;
      });
    }
  }, [user, triggerPageTurn, handleContentChange]);

  const addNewPage = useCallback(() => {
    if (textareaRef.current) {
      cursorPositionsRef.current.set(currentPageIndexRef.current, textareaRef.current.selectionStart);
    }
    setPageTransition('forward-exit');
    setTimeout(() => {
      setPages(prev => [...prev, { id: crypto.randomUUID(), content: '' }]);
      const nextIdx = currentPageIndexRef.current + 1;
      cursorPositionsRef.current.set(nextIdx, 0);
      setCurrentPageIndex(nextIdx);
      setPageTransition('forward-enter');
      setTimeout(() => {
        setPageTransition('none');
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(0, 0);
        }
      }, 700);
    }, 700);
  }, []);

  const goToPage = useCallback((direction: 'prev' | 'next') => {
    if (textareaRef.current) {
      cursorPositionsRef.current.set(currentPageIndexRef.current, textareaRef.current.selectionStart);
    }
    if (direction === 'next') {
      if (currentPageIndex < totalPages - 1) {
        triggerPageTurn('forward', currentPageIndex + 1, () => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            const pos = cursorPositionsRef.current.get(currentPageIndex + 1) || 0;
            textareaRef.current.setSelectionRange(pos, pos);
          }
        });
      } else {
        addNewPage();
      }
    } else {
      if (currentPageIndex > 0) {
        triggerPageTurn('backward', currentPageIndex - 1, () => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            const pos = cursorPositionsRef.current.get(currentPageIndex - 1) || 0;
            textareaRef.current.setSelectionRange(pos, pos);
          }
        });
      }
    }
  }, [currentPageIndex, totalPages, addNewPage, triggerPageTurn]);

  const goToPageIndex = useCallback((targetIndex: number) => {
    if (targetIndex === currentPageIndex) return;
    if (targetIndex < 0 || targetIndex >= totalPages) return;
    if (textareaRef.current) {
      cursorPositionsRef.current.set(currentPageIndexRef.current, textareaRef.current.selectionStart);
    }
    const direction = targetIndex > currentPageIndex ? 'forward' : 'backward';
    triggerPageTurn(direction, targetIndex, () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const pos = cursorPositionsRef.current.get(targetIndex) || 0;
        textareaRef.current.setSelectionRange(pos, pos);
      }
    });
  }, [currentPageIndex, totalPages, triggerPageTurn]);

  const handleModeSwitch = useCallback((newMode: 'write' | 'preview') => {
    if (newMode === mode) return;
    setTabTransition('exit');
    setTimeout(() => {
      setMode(newMode);
      setTabTransition('enter');
      setTimeout(() => setTabTransition('none'), 600);
    }, 600);
  }, [mode]);

  const addTag = useCallback(() => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  }, [newTag, tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  }, []);

  const handleFormatText = useCallback((format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentPageContent.substring(start, end);
    let formattedText = '';
    let newCursorPos = start;

    switch (format) {
      case 'bold': formattedText = `**${selectedText}**`; newCursorPos = selectedText ? start + formattedText.length : start + 2; break;
      case 'italic': formattedText = `*${selectedText}*`; newCursorPos = selectedText ? start + formattedText.length : start + 1; break;
      case 'underline': formattedText = `<u>${selectedText}</u>`; newCursorPos = selectedText ? start + formattedText.length : start + 3; break;
      case 'highlight': formattedText = `==${selectedText}==`; newCursorPos = selectedText ? start + formattedText.length : start + 2; break;
      case 'h1': formattedText = `# ${selectedText}`; newCursorPos = selectedText ? start + formattedText.length : start + 2; break;
      case 'h2': formattedText = `## ${selectedText}`; newCursorPos = selectedText ? start + formattedText.length : start + 3; break;
      case 'h3': formattedText = `### ${selectedText}`; newCursorPos = selectedText ? start + formattedText.length : start + 4; break;
      case 'list': formattedText = `- ${selectedText}`; newCursorPos = selectedText ? start + formattedText.length : start + 2; break;
      case 'ordered-list': formattedText = `1. ${selectedText}`; newCursorPos = selectedText ? start + formattedText.length : start + 3; break;
      case 'todo': formattedText = `- [ ] ${selectedText}`; newCursorPos = selectedText ? start + formattedText.length : start + 6; break;
      case 'quote': formattedText = `> ${selectedText}`; newCursorPos = selectedText ? start + formattedText.length : start + 2; break;
      case 'code': formattedText = `\`${selectedText}\``; newCursorPos = selectedText ? start + formattedText.length : start + 1; break;
      case 'divider': formattedText = `\n---\n`; newCursorPos = start + formattedText.length; break;
      case 'link': formattedText = `[${selectedText || 'link text'}](url)`; newCursorPos = selectedText ? start + formattedText.length - 5 : start + 1; break;
      default: return;
    }

    const newContent = currentPageContent.substring(0, start) + formattedText + currentPageContent.substring(end);
    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [currentPageContent, handleContentChange]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setImageUploadStatus('uploading');
    try {
      const imageUrl = await storage.uploadDiaryImage(user.id, file, draftId || undefined);
      const imageMarkdown = `\n![${file.name}](${imageUrl})\n`;
      handleContentChange(currentPageContent + imageMarkdown);
      setImageUploadStatus('done');
      setTimeout(() => setImageUploadStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to upload image:', error);
      setImageUploadStatus('error');
      setTimeout(() => setImageUploadStatus('idle'), 3000);
    }
    if (e.target) e.target.value = '';
  };

  const performAutosave = useCallback(async () => {
    if (!user) return;
    const cleanedPages = removeEmptyTrailingPages(pagesRef.current);
    const currentFull = serializeDiaryContent(cleanedPages, pageTitlesRef.current);
    if (currentFull === lastSavedContentRef.current) return;
    if (!diaryTitle && !currentFull) return;

    setAutosaveStatus('saving');
    try {
      if (draftId) {
        const { error } = await supabase
          .from('diary_entries')
          .update({ title: diaryTitle || 'Untitled diary', content: currentFull, description: excerpt || null, mood, mood_tags: mood ? [mood] : [], emotion_tags: tags.filter(t => t !== mood), life_balance_tags: [], updated_at: new Date().toISOString() })
          .eq('id', draftId);
        if (error) throw error;
      } else {
        const mood_tags = mood ? [mood] : [];
        const emotion_tags = tags.filter(t => !mood_tags.includes(t));
        const { data, error } = await supabase
          .from('diary_entries')
          .insert({ user_id: user.id, title: diaryTitle || 'Untitled diary', content: currentFull, description: excerpt || null, mood, mood_tags, emotion_tags, life_balance_tags: [] })
          .select('id')
          .single();
        if (error) throw error;
        if (data) {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('diaryId', data.id);
          window.history.replaceState({}, '', newUrl.toString());
        }
      }
      lastSavedContentRef.current = currentFull;
      setAutosaveStatus('saved');
      setTimeout(() => setAutosaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Autosave failed:', error);
      setAutosaveStatus('error');
      setTimeout(() => setAutosaveStatus('idle'), 3000);
    }
  }, [user, draftId, diaryTitle, mood, tags, excerpt]);

  useEffect(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    const cleanedPages = removeEmptyTrailingPages(pagesRef.current);
    const currentFull = serializeDiaryContent(cleanedPages, pageTitlesRef.current);
    const prevLength = lastSavedContentRef.current.length;
    const crossedThreshold = (prevLength < 50 && currentFull.length >= 50) ||
      (prevLength < 200 && currentFull.length >= 200) ||
      (prevLength < 500 && currentFull.length >= 500);

    if (crossedThreshold && currentFull !== lastSavedContentRef.current) {
      performAutosave();
    } else {
      autosaveTimerRef.current = setTimeout(() => {
        performAutosave();
      }, AUTOSAVE_DELAY_MS);
    }
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [diaryTitle, fullContent, pageTitles, performAutosave]);

  const handleSaveDiary = async () => {
    if (!user) return;
    try {
      const cleanedPages = removeEmptyTrailingPages(pages);
      const savedContent = serializeDiaryContent(cleanedPages, pageTitles);
      const mood_tags = mood ? [mood] : [];
      const emotion_tags = tags.filter(t => !mood_tags.includes(t));

      if (draftId) {
        const { error } = await supabase.from('diary_entries').update({
          title: diaryTitle || 'Untitled diary',
          content: savedContent,
          description: excerpt || null,
          mood,
          mood_tags,
          emotion_tags,
          life_balance_tags: [],
          updated_at: new Date().toISOString(),
        }).eq('id', draftId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('diary_entries').insert({
          user_id: user.id,
          title: diaryTitle || 'Untitled diary',
          content: savedContent,
          description: excerpt || null,
          mood,
          mood_tags,
          emotion_tags,
          life_balance_tags: [],
        }).select('id').single();
        if (error) throw error;
        if (data) {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('diaryId', data.id);
          window.history.replaceState({}, '', newUrl.toString());
        }
      }
      lastSavedContentRef.current = savedContent;
      setAutosaveStatus('saved');
      setTimeout(() => setAutosaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save diary:', error);
      alert('Failed to save diary.');
    }
  };

  const openDetailsDialog = () => {
    setDetailsTitle(diaryTitle);
    setDetailsDescription(excerpt);
    setShowDetailsDialog(true);
  };

  const saveDetails = async () => {
    if (!draftId || !user) return;
    const trimmedTitle = detailsTitle.trim();
    if (!trimmedTitle) return;

    setDetailsSaving(true);
    try {
      const { error } = await supabase
        .from('diary_entries')
        .update({
          title: trimmedTitle,
          description: detailsDescription.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', draftId);
      if (error) throw error;
      setDiaryTitle(trimmedTitle);
      setExcerpt(detailsDescription.trim());
      setShowDetailsDialog(false);
    } catch (error) {
      console.error('Failed to update diary details:', error);
    } finally {
      setDetailsSaving(false);
    }
  };

  const getPageTransitionClass = () => {
    switch (pageTransition) {
      case 'forward-exit': return 'page-turn-forward-exit';
      case 'forward-enter': return 'page-turn-forward-enter';
      case 'backward-exit': return 'page-turn-backward-exit';
      case 'backward-enter': return 'page-turn-backward-enter';
      default: return '';
    }
  };

  const getTabTransitionClass = () => {
    if (tabTransition === 'exit') return 'diary-tab-turn-exit';
    if (tabTransition === 'enter') return 'diary-tab-turn-enter';
    return '';
  };

  function shouldIgnorePageClick(event: React.MouseEvent): boolean {
    const target = event.target as HTMLElement;
    return Boolean(
      target.closest(
        'textarea, input, select, button, a, [contenteditable="true"], .diary-toolbar-zone, .diary-toolbar, .journal-side-note, .diary-page-bookmark, .diary-page-controls, .diary-title-zone, .diary-writing-surface'
      )
    );
  }

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleFocusIn = useCallback(() => setIsEditing(true), []);
  const handleFocusOut = useCallback((e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsEditing(false);
    }
  }, []);
  const handlePointerUp = useCallback((e: React.PointerEvent, side: 'left' | 'right') => {
    if (isMobile) return;
    if (!pointerStartRef.current) return;
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    pointerStartRef.current = null;

    if (dx > 5 || dy > 5) return;
    if (shouldIgnorePageClick(e as unknown as React.MouseEvent)) return;

    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) return;

    if (side === 'left') {
      if (currentPageIndex > 0) {
        goToPage('prev');
      }
    } else {
      if (currentPageIndex < totalPages - 1) {
        goToPage('next');
      } else if (currentPageContent.trim().length > 0) {
        addNewPage();
      }
    }
  }, [isMobile, currentPageIndex, totalPages, currentPageContent, goToPage, addNewPage]);

  const randomQuote = useMemo(() => diaryQuotes[Math.floor(Math.random() * diaryQuotes.length)], []);

  const autosaveStatusText = useMemo(() => {
    switch (autosaveStatus) {
      case 'saving': return 'Saving your page...';
      case 'saved': return 'Your thoughts are safely held.';
      case 'error': return 'Could not save this page yet.';
      default: return null;
    }
  }, [autosaveStatus]);

  return (
    <div className="diary-book-perspective">
      {diaryLoadError && (
        <div className="lunara-dark-empty-card text-center py-16 px-6 max-w-md mx-auto">
          <div className="ornamental-divider mb-8"></div>
          <BookOpen className="w-12 h-12 text-lunara-silver/50 mx-auto mb-4" />
          <p className="font-garamond text-lg text-pearl-mist italic leading-relaxed mb-2">
            {diaryLoadError}
          </p>
          <p className="font-garamond text-sm text-lunara-silver/60 italic mb-6">
            This diary may have been removed or you may not have access.
          </p>
          <button
            onClick={onInvalidDiary}
            className="lunara-button text-pearl-mist font-garamond px-6 py-2 rounded-lg"
          >
            Back to My Diaries
          </button>
          <div className="ornamental-divider mt-8"></div>
        </div>
      )}

      {!diaryLoadError && (
      <>
      <div className="flex justify-center mb-6">
        <div className="diary-tab-bookmark-strip">
          <button
            onClick={() => handleModeSwitch('write')}
            className={`diary-tab-bookmark ${mode === 'write' ? 'diary-tab-bookmark-active' : ''}`}
          >
            Write
          </button>
          <button
            onClick={() => handleModeSwitch('preview')}
            className={`diary-tab-bookmark ${mode === 'preview' ? 'diary-tab-bookmark-active' : ''}`}
          >
            Preview
          </button>
        </div>
      </div>

      {autosaveStatusText && (
        <div className="text-center mb-4">
          <span className={`font-garamond text-[0.85rem] italic ${
            autosaveStatus === 'error' ? 'text-muted-brown/70' : 'text-muted-brown/55'
          }`}>
            {autosaveStatusText}
          </span>
        </div>
      )}

      <div className="flex gap-8 items-start">
        <div className={`flex-1 min-w-0 diary-book ${bookOpen ? 'diary-book-open' : ''}`}>
          <div className="diary-book-stack"></div>

          {totalPages > 1 && (
            <div className="diary-bookmark-strip hidden lg:flex">
              {pages.map((page, index) => (
                <button
                  key={page.id}
                  onClick={() => goToPageIndex(index)}
                  className={`diary-bookmark-tab ${index === currentPageIndex ? 'active' : ''}`}
                  title={`Page ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}

          <div className={`diary-spread ${getTabTransitionClass()}`}>
            <div
              ref={leftPageRef}
              className="diary-page-surface diary-page-left hidden lg:block"
              onPointerDown={handlePointerDown}
              onPointerUp={(e) => handlePointerUp(e, 'left')}
            >
              <div className="h-full flex flex-col" style={{ padding: 'clamp(2rem, 3vw, 3rem)' }}>
                {currentPageIndex === 0 ? (
                  <>
                    <div className="flex-shrink-0">
                      <p className="font-garamond text-[0.85rem] text-muted-brown/60 italic">
                        {new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date())}
                      </p>
                      {mood && (
                        <Badge className="mt-2 bg-sepia/30 text-ink-blue border-muted-brown/20 font-garamond text-[0.85rem]">
                          {mood}
                        </Badge>
                      )}
                    </div>

                    <div className="flex-1 flex items-center justify-center px-6">
                      <div className="text-center">
                        {diaryTitle ? (
                          <>
                            <p className="font-garamond text-[0.8rem] text-muted-brown/45 uppercase tracking-widest mb-1">Inside</p>
                            <p className="font-garamond text-lg text-ink-blue/70 italic leading-relaxed">
                              {diaryTitle}
                            </p>
                          </>
                        ) : (
                          <p className="font-garamond text-lg text-muted-brown/65 italic leading-relaxed">
                            "{randomQuote}"
                          </p>
                        )}
                        <div className="ornamental-divider mt-6"></div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {tags.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="outline" className="font-garamond text-[10px] border-muted-brown/15 text-muted-brown/60 rounded-full px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                          {tags.length > 3 && (
                            <span className="font-garamond text-[10px] text-muted-brown/45">+{tags.length - 3}</span>
                          )}
                        </div>
                      )}
                      <p className="font-garamond text-[10px] text-muted-brown/40 mt-2 italic">
                        {excerpt ? excerpt.substring(0, 60) + '...' : 'A quiet page in your journal'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-shrink-0">
                      <p className="font-garamond text-[0.85rem] text-muted-brown/60 italic">
                        Page {currentPageIndex} — previous page
                      </p>
                    </div>

                    <div className="flex-1 overflow-hidden px-2">
                      <div className="diary-page-previous-content">
                        {pageTitles[currentPageIndex - 1]?.trim() && (
                          <h3 className="font-garamond font-medium text-ink-blue/70 mb-2" style={{ fontSize: 'clamp(1rem, 2vw, 1.3rem)' }}>
                            {pageTitles[currentPageIndex - 1]}
                          </h3>
                        )}
                        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                          {resolvedPreviousContent || 'A quiet page in your journal'}
                        </ReactMarkdown>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <p className="font-garamond text-[10px] text-muted-brown/40 italic">
                        {currentPageIndex} of {totalPages}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="diary-spine hidden lg:block"></div>

            <div
              ref={rightPageRef}
              className={`diary-page-surface diary-page-right ${isEditing ? 'diary-page-focused' : ''}`}
              onPointerDown={handlePointerDown}
              onPointerUp={(e) => handlePointerUp(e, 'right')}
              onFocus={handleFocusIn}
              onBlur={handleFocusOut}
            >
              <div className={`diary-writing-surface ${getPageTransitionClass()}`}>
                <div className="diary-page-date">
                  <span className="font-garamond text-[0.85rem] text-muted-brown/60 italic">
                    {new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date())}
                  </span>
                </div>

                <div className="diary-title-zone">
                  <input
                    value={pageTitles[currentPageIndex] ?? ''}
                    onChange={(e) => {
                      const newTitles = [...pageTitles];
                      while (newTitles.length <= currentPageIndex) newTitles.push('');
                      newTitles[currentPageIndex] = e.target.value.slice(0, PAGE_TITLE_MAX_LENGTH);
                      setPageTitles(newTitles);
                    }}
                    maxLength={PAGE_TITLE_MAX_LENGTH}
                    placeholder="Title this page..."
                    className="diary-title-input"
                  />
                </div>

                {mode === 'write' && (
                  <div className="diary-toolbar-zone">
                    <button
                      onClick={() => setToolbarOpen(!toolbarOpen)}
                      className="font-garamond text-[0.8rem] text-muted-brown/55 hover:text-muted-brown/75 transition-colors italic"
                    >
                      {toolbarOpen ? 'hide writing tools' : 'writing tools'}
                    </button>
                    {toolbarOpen && (
                      <div className="stationery-toolbar p-1 mt-1.5 flex flex-wrap items-center gap-0.5">
                        <div className="flex items-center gap-0.5 pr-2 border-r border-muted-brown/10">
                          <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 rounded" onClick={() => handleFormatText('bold')}><Bold className="w-3 h-3" /></Button>
                          <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 rounded" onClick={() => handleFormatText('italic')}><Italic className="w-3 h-3" /></Button>
                          <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 rounded" onClick={() => handleFormatText('underline')}><Underline className="w-3 h-3" /></Button>
                          <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 rounded" onClick={() => handleFormatText('highlight')}><Highlighter className="w-3 h-3" /></Button>
                        </div>
                        <div className="flex items-center gap-0.5 px-2 border-r border-muted-brown/10">
                          <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 rounded" onClick={() => handleFormatText('h1')}><Heading1 className="w-3 h-3" /></Button>
                          <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 rounded" onClick={() => handleFormatText('h2')}><Heading2 className="w-3 h-3" /></Button>
                          <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 rounded" onClick={() => handleFormatText('h3')}><Type className="w-3 h-3" /></Button>
                        </div>
                        <div className="flex items-center gap-0.5 px-2 border-r border-muted-brown/10">
                          <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 rounded" onClick={() => handleFormatText('list')}><List className="w-3 h-3" /></Button>
                          <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 rounded" onClick={() => handleFormatText('ordered-list')}><ListOrdered className="w-3 h-3" /></Button>
                          <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 rounded" onClick={() => handleFormatText('todo')}><CheckSquare className="w-3 h-3" /></Button>
                        </div>
                        <div className="flex items-center gap-0.5 pl-2">
                          <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 rounded" onClick={() => handleFormatText('quote')}><Quote className="w-3 h-3" /></Button>
                          <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 rounded" onClick={() => handleFormatText('code')}><Code className="w-3 h-3" /></Button>
                          <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 rounded" onClick={() => handleFormatText('divider')}><Minus className="w-3 h-3" /></Button>
                          <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 rounded" onClick={() => handleFormatText('link')}><Link className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div ref={pageBodyRef} className="diary-page-body">
                  {mode === 'write' ? (
                    <>
                      <div ref={measureRef} className="diary-page-measure" aria-hidden="true">
                        {currentPageContent}
                      </div>
                      <textarea
                        ref={textareaRef}
                        value={currentPageContent}
                        onChange={(e) => handleContentChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        placeholder="Begin softly. This page is yours."
                        className="diary-writing-textarea"
                      />
                    </>
                  ) : (
                    <div className="diary-page-preview">
                      {pageTitles[currentPageIndex]?.trim() && (
                        <h2 className="font-garamond font-medium text-ink-blue mb-3" style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)' }}>
                          {pageTitles[currentPageIndex]}
                        </h2>
                      )}
                      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                        {resolvedCurrentContent}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                <div className="diary-page-footer">
                  <span className="font-garamond text-[0.85rem] text-muted-brown/45 italic">
                    Page {currentPageIndex + 1} of {totalPages}
                  </span>
                  {showPageFullPrompt && (
                    <span className="font-garamond text-[0.85rem] text-muted-brown/60 italic">
                      This page is full. Turn to a fresh page.
                    </span>
                  )}
                </div>

                <div className="diary-page-curl"></div>
              </div>
            </div>
          </div>

          <DiaryPageNavigation
            currentPageIndex={currentPageIndex}
            totalPages={totalPages}
            pages={pages}
            onPrev={() => goToPage('prev')}
            onNext={() => goToPage('next')}
            onGoToPage={goToPageIndex}
            isMobile={isMobile}
          />
        </div>

        <div className="hidden md:block w-56 flex-shrink-0 space-y-3 sticky top-8">
          <div className="diary-side-slip p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Smile className="w-3.5 h-3.5 text-muted-brown/60" />
              <span className="font-garamond text-[0.85rem] text-muted-brown/80">Mood</span>
            </div>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger className="bg-transparent border-0 h-7 text-[0.85rem] font-garamond text-ink-blue p-0 focus:ring-0">
                <SelectValue placeholder="How do you feel?" />
              </SelectTrigger>
              <SelectContent className="bg-moon-paper border-lunara-silver/15">
                {moods.map((m) => (
                  <SelectItem key={m} value={m} className="font-garamond text-[0.85rem]">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="diary-side-slip p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Tag className="w-3.5 h-3.5 text-muted-brown/60" />
              <span className="font-garamond text-[0.85rem] text-muted-brown/80">Tags</span>
            </div>
            <div className="flex gap-1">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="add..."
                className="flex-1 bg-transparent border-0 text-[0.85rem] font-garamond text-ink-blue p-0 focus:outline-none placeholder:text-muted-brown/45"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              />
              <button onClick={addTag} className="text-muted-brown/50 hover:text-muted-brown/80 text-[0.85rem]">+</button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="font-garamond text-[10px] border-muted-brown/15 text-muted-brown/60 cursor-pointer hover:bg-sepia/20 rounded-full px-1.5 py-0"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="diary-side-slip p-3">
            <span className="font-garamond text-[0.85rem] text-muted-brown/80 block mb-1.5">Excerpt</span>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief summary..."
              className="w-full bg-transparent border-0 text-[0.85rem] font-garamond text-ink-blue resize-none focus:outline-none placeholder:text-muted-brown/45"
              rows={2}
            />
          </div>

          <div className="diary-image-slip">
            <div className="flex items-center gap-1.5 mb-2">
              <ImagePlus className="w-3.5 h-3.5 text-muted-brown/70" />
              <span className="diary-image-slip-title">Attach an image</span>
            </div>
            <p className="mb-3">Add a quiet memory to this diary.</p>
            <input type="file" accept="image/*" id="image-upload-desktop" className="hidden" onChange={handleImageUpload} />
            <button
              onClick={() => document.getElementById('image-upload-desktop')?.click()}
              className="diary-image-button"
              disabled={imageUploadStatus === 'uploading'}
            >
              {imageUploadStatus === 'uploading' ? 'Adding image...' :
               imageUploadStatus === 'done' ? 'Image placed on this page.' :
               imageUploadStatus === 'error' ? 'Could not add image.' :
               'Choose image'}
            </button>
          </div>

          <div className="space-y-2">
            {draftId && (
              <button
                onClick={openDetailsDialog}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-lunara-silver/15 text-muted-brown/75 hover:bg-lunara-silver/5 font-garamond text-[0.85rem] transition-colors"
              >
                <BookOpen className="w-3 h-3" />
                Diary details
              </button>
            )}
            <button
              onClick={handleSaveDiary}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-lunara-silver/15 text-muted-brown/75 hover:bg-lunara-silver/5 font-garamond text-[0.85rem] transition-colors"
            >
              <Save className="w-3 h-3" />
              Save diary
            </button>
            {draftId && (
              <button
                onClick={() => setShowShareDialog(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-lunara-silver/15 text-muted-brown/75 hover:bg-lunara-silver/5 font-garamond text-[0.85rem] transition-colors"
              >
                <Share2 className="w-3 h-3" />
                Share diary
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden mt-6 space-y-3">
        <div className="diary-side-slip p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Smile className="w-3.5 h-3.5 text-muted-brown/60" />
            <span className="font-garamond text-[0.85rem] text-muted-brown/80">Mood</span>
          </div>
          <Select value={mood} onValueChange={setMood}>
            <SelectTrigger className="bg-transparent border-0 h-7 text-[0.85rem] font-garamond text-ink-blue p-0 focus:ring-0">
              <SelectValue placeholder="How do you feel?" />
            </SelectTrigger>
              <SelectContent className="bg-moon-paper border-lunara-silver/15">
              {moods.map((m) => (
                <SelectItem key={m} value={m} className="font-garamond text-[0.85rem]">{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-3">
          <div className="diary-side-slip p-3 flex-1">
            <div className="flex items-center gap-1.5 mb-2">
              <Tag className="w-3.5 h-3.5 text-muted-brown/60" />
              <span className="font-garamond text-[0.85rem] text-muted-brown/80">Tags</span>
            </div>
            <div className="flex gap-1">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="add..."
                className="flex-1 bg-transparent border-0 text-[0.85rem] font-garamond text-ink-blue p-0 focus:outline-none placeholder:text-muted-brown/45"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              />
              <button onClick={addTag} className="text-muted-brown/50 hover:text-muted-brown/80 text-[0.85rem]">+</button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="font-garamond text-[10px] border-muted-brown/15 text-muted-brown/60 rounded-full px-1.5 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="diary-side-slip p-3 flex-1">
            <span className="font-garamond text-[0.85rem] text-muted-brown/80 block mb-1.5">Excerpt</span>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary..."
              className="w-full bg-transparent border-0 text-[0.85rem] font-garamond text-ink-blue resize-none focus:outline-none placeholder:text-muted-brown/45"
              rows={2}
            />
          </div>
        </div>
        <div className="diary-image-slip">
          <div className="flex items-center gap-1.5 mb-2">
            <ImagePlus className="w-3.5 h-3.5 text-muted-brown/70" />
            <span className="diary-image-slip-title">Attach an image</span>
          </div>
          <p className="mb-3">Add a quiet memory to this diary.</p>
          <input type="file" accept="image/*" id="image-upload-mobile" className="hidden" onChange={handleImageUpload} />
          <button
            onClick={() => document.getElementById('image-upload-mobile')?.click()}
            className="diary-image-button"
            disabled={imageUploadStatus === 'uploading'}
          >
            {imageUploadStatus === 'uploading' ? 'Adding image...' :
             imageUploadStatus === 'done' ? 'Image placed on this page.' :
             imageUploadStatus === 'error' ? 'Could not add image.' :
             'Choose image'}
          </button>
        </div>
        <div className="flex gap-2">
          {draftId && (
            <button
              onClick={openDetailsDialog}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-lunara-silver/15 text-muted-brown/75 hover:bg-lunara-silver/5 font-garamond text-[0.85rem] transition-colors"
            >
              <BookOpen className="w-3 h-3" />
              Details
            </button>
          )}
          <button
            onClick={handleSaveDiary}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-lunara-silver/15 text-muted-brown/75 hover:bg-lunara-silver/5 font-garamond text-[0.85rem] transition-colors"
          >
            <Save className="w-3 h-3" />
            Save
          </button>
          <button
            onClick={handleSaveDiary}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg lunara-button text-cream font-garamond text-[0.85rem]"
          >
            <Send className="w-3 h-3" />
            Save privately
          </button>
        </div>
      </div>

      {draftId && (
        <ShareDiaryDialog
          diaryId={draftId}
          open={showShareDialog}
          onClose={() => setShowShareDialog(false)}
        />
      )}

      {showDetailsDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-blue/20 backdrop-blur-sm">
          <div className="lunara-panel-card p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-garamond font-medium text-ink-blue mb-4">Diary details</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="details-title" className="block font-garamond text-[0.85rem] text-muted-brown/80 mb-1.5">
                  Name this diary
                </label>
                <input
                  id="details-title"
                  type="text"
                  value={detailsTitle}
                  onChange={(e) => setDetailsTitle(e.target.value)}
                  placeholder="Diary name"
                  maxLength={80}
                  className="w-full bg-moon-paper/90 border border-lunara-silver/30 rounded-lg px-3 py-2 font-garamond text-ink-blue text-[0.9rem] focus:outline-none focus:border-ink-blue/30 placeholder:text-muted-brown/60"
                />
              </div>

              <div>
                <label htmlFor="details-description" className="block font-garamond text-[0.85rem] text-muted-brown/80 mb-1.5">
                  What will this diary hold?
                </label>
                <textarea
                  id="details-description"
                  value={detailsDescription}
                  onChange={(e) => setDetailsDescription(e.target.value)}
                  placeholder="A short description…"
                  maxLength={240}
                  rows={3}
                  className="w-full bg-moon-paper/90 border border-lunara-silver/30 rounded-lg px-3 py-2 font-garamond text-ink-blue text-[0.9rem] focus:outline-none focus:border-ink-blue/30 resize-none placeholder:text-muted-brown/60"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowDetailsDialog(false)}
                className="px-4 py-1.5 rounded-lg border border-lunara-silver/15 text-muted-brown/75 hover:bg-lunara-silver/5 font-garamond text-[0.85rem] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveDetails}
                disabled={detailsSaving || !detailsTitle.trim()}
                className="px-4 py-1.5 rounded-lg lunara-button text-cream font-garamond text-[0.85rem] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {detailsSaving ? 'Saving…' : 'Save cover'}
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default WriteEditor;
