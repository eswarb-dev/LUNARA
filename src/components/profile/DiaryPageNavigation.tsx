import React from 'react';

interface DiaryPageNavigationProps {
  currentPageIndex: number;
  totalPages: number;
  pages: Array<{ id: string; content: string }>;
  onPrev: () => void;
  onNext: () => void;
  onGoToPage: (index: number) => void;
  isMobile: boolean;
}

export default function DiaryPageNavigation({
  currentPageIndex,
  totalPages,
  pages,
  onPrev,
  onNext,
  onGoToPage,
  isMobile,
}: DiaryPageNavigationProps) {
  const hasPrev = currentPageIndex > 0;

  return (
    <div className="diary-bottom-navigation" role="navigation" aria-label="Page navigation">
      <button
        type="button"
        className="diary-page-arrow"
        onClick={onPrev}
        disabled={!hasPrev}
        aria-label="Previous page"
      >
        &#8592;
      </button>

      <div className="diary-page-count-group">
        <span className="diary-page-count">
          Page {currentPageIndex + 1} of {totalPages}
        </span>

        {isMobile && totalPages > 1 && (
          <div className="diary-page-dots" role="tablist" aria-label="Page selection">
            {pages.map((page, index) => (
              <button
                key={page.id}
                type="button"
                role="tab"
                aria-selected={index === currentPageIndex}
                aria-label={`Go to page ${index + 1}`}
                onClick={() => onGoToPage(index)}
                className={`diary-page-dot ${index === currentPageIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        className="diary-page-arrow"
        onClick={onNext}
        aria-label={currentPageIndex < totalPages - 1 ? 'Next page' : 'Add new page'}
      >
        &#8594;
      </button>
    </div>
  );
}
