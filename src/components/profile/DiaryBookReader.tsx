import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { parseDiaryContent } from '@/lib/diaryContent';
import { useResolvedImages } from '@/hooks/useResolvedImages';
import { useAuth } from '@/context/AuthContext';
import DiaryPageNavigation from './DiaryPageNavigation';

const diaryQuotes = [
  "Every page holds a memory, every word tells a story.",
  "The moon sees what the heart whispers.",
  "Some words are meant only for the night.",
  "Your journal knows you better than anyone.",
  "Stillness is where reading begins.",
  "A quiet page from your journal.",
];

interface DiaryBookReaderProps {
  content: string;
  date?: string;
  mood?: string;
  tags?: string[];
  excerpt?: string;
}

export default function DiaryBookReader({
  content,
  date,
  mood,
  tags,
  excerpt,
}: DiaryBookReaderProps) {
  const { user } = useAuth();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageTransition, setPageTransition] = useState<'none' | 'forward-exit' | 'forward-enter' | 'backward-exit' | 'backward-enter'>('none');
  const [isMobile, setIsMobile] = useState(false);

  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const parsed = useMemo(() => parseDiaryContent(content), [content]);
  const pages = parsed.pages;
  const pageTitles = parsed.pageTitles;
  const totalPages = pages.length;
  const currentPageContent = pages[currentPageIndex]?.content || '';
  const currentPageTitle = pageTitles[currentPageIndex] || '';

  const previousPageContent = currentPageIndex > 0 ? pages[currentPageIndex - 1]?.content : null;

  const { resolvedContent: resolvedCurrentContent } = useResolvedImages(
    currentPageContent,
    user?.id
  );
  const { resolvedContent: resolvedPreviousContent } = useResolvedImages(
    previousPageContent || '',
    user?.id
  );
  const previousPageTitle = currentPageIndex > 0 ? pageTitles[currentPageIndex - 1] || '' : '';

  const randomQuote = useMemo(() => diaryQuotes[Math.floor(Math.random() * diaryQuotes.length)], []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  const animatePageTurn = useCallback((direction: 'forward' | 'backward') => {
    if (pageTransition !== 'none') return;

    const exitClass = direction === 'forward' ? 'forward-exit' : 'backward-exit';
    const enterClass = direction === 'forward' ? 'forward-enter' : 'backward-enter';

    setPageTransition(exitClass);
    transitionTimerRef.current = setTimeout(() => {
      setPageTransition(enterClass);
      transitionTimerRef.current = setTimeout(() => {
        setPageTransition('none');
      }, 200);
    }, 200);
  }, [pageTransition]);

  const goToPage = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'next' && currentPageIndex < totalPages - 1) {
      animatePageTurn('forward');
      setTimeout(() => setCurrentPageIndex(prev => prev + 1), 200);
    } else if (direction === 'prev' && currentPageIndex > 0) {
      animatePageTurn('backward');
      setTimeout(() => setCurrentPageIndex(prev => prev - 1), 200);
    }
  }, [currentPageIndex, totalPages, animatePageTurn]);

  const goToPageIndex = useCallback((index: number) => {
    if (index === currentPageIndex) return;
    const direction = index > currentPageIndex ? 'forward' : 'backward';
    animatePageTurn(direction);
    setTimeout(() => setCurrentPageIndex(index), 200);
  }, [currentPageIndex, animatePageTurn]);

  const getPageTransitionClass = () => {
    switch (pageTransition) {
      case 'forward-exit': return 'page-turn-forward-exit';
      case 'forward-enter': return 'page-turn-forward-enter';
      case 'backward-exit': return 'page-turn-backward-exit';
      case 'backward-enter': return 'page-turn-backward-enter';
      default: return '';
    }
  };

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent, side: 'left' | 'right') => {
    if (isMobile) return;
    if (!pointerStartRef.current) return;
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    pointerStartRef.current = null;

    if (dx > 5 || dy > 5) return;

    const target = e.target as HTMLElement;
    if (target.closest('a, button, [role="tab"]')) return;

    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) return;

    if (side === 'left' && currentPageIndex > 0) {
      goToPage('prev');
    } else if (side === 'right' && currentPageIndex < totalPages - 1) {
      goToPage('next');
    }
  }, [isMobile, currentPageIndex, totalPages, goToPage]);

  const formattedDate = date
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(date))
    : null;

  return (
    <div className="diary-book-perspective">
      <div className="diary-book diary-book-open">
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

        <div className="diary-spread">
          <div
            className="diary-page-surface diary-page-left hidden lg:block"
            onPointerDown={handlePointerDown}
            onPointerUp={(e) => handlePointerUp(e, 'left')}
          >
            <div className="h-full flex flex-col" style={{ padding: 'clamp(2rem, 3vw, 3rem)' }}>
              {currentPageIndex === 0 ? (
                <>
                  <div className="flex-shrink-0">
                    {formattedDate && (
                      <p className="font-garamond text-xs text-muted-brown/50 italic">
                        {formattedDate}
                      </p>
                    )}
                    {mood && (
                      <p className="font-garamond text-xs text-muted-brown/40 italic mt-1">
                        Mood: {mood}
                      </p>
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-center px-6">
                    <div className="text-center">
                      <p className="font-garamond text-lg text-muted-brown/60 italic leading-relaxed">
                        "{randomQuote}"
                      </p>
                      <div className="ornamental-divider mt-6"></div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {tags && tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="font-garamond text-[10px] text-muted-brown/50 border border-muted-brown/15 rounded-full px-1.5 py-0">
                            {tag}
                          </span>
                        ))}
                        {tags.length > 3 && (
                          <span className="font-garamond text-[10px] text-muted-brown/40">+{tags.length - 3}</span>
                        )}
                      </div>
                    )}
                    {excerpt && (
                      <p className="font-garamond text-[10px] text-muted-brown/30 mt-2 italic">
                        {excerpt.substring(0, 60)}...
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-shrink-0">
                    <p className="font-garamond text-xs text-muted-brown/50 italic">
                      Page {currentPageIndex} — previous page
                    </p>
                  </div>

                  <div className="flex-1 overflow-hidden px-2">
                    <div className="diary-page-previous-content">
                      {previousPageTitle && (
                        <h3 className="font-garamond font-medium text-ink-blue/70 mb-2" style={{ fontSize: 'clamp(1rem, 2vw, 1.3rem)' }}>
                          {previousPageTitle}
                        </h3>
                      )}
                      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                        {resolvedPreviousContent || ''}
                      </ReactMarkdown>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <p className="font-garamond text-[10px] text-muted-brown/30 italic">
                      {currentPageIndex} of {totalPages}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="diary-spine hidden lg:block"></div>

          <div
            className="diary-page-surface diary-page-right"
            onPointerDown={handlePointerDown}
            onPointerUp={(e) => handlePointerUp(e, 'right')}
          >
            <div className={`diary-writing-surface ${getPageTransitionClass()}`}>
              <div className="diary-page-date">
                <span className="font-garamond text-xs text-muted-brown/50 italic">
                  {formattedDate || 'A quiet page'}
                </span>
              </div>

              {currentPageTitle && (
                <div className="diary-title-zone">
                  <h2 className="font-garamond font-medium text-ink-blue" style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)' }}>
                    {currentPageTitle}
                  </h2>
                </div>
              )}

              <div className="diary-page-body">
                <div className="diary-page-preview">
                  <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                    {resolvedCurrentContent}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="diary-page-footer">
                <span className="font-garamond text-xs text-muted-brown/30 italic">
                  Page {currentPageIndex + 1} of {totalPages}
                </span>
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
    </div>
  );
}
