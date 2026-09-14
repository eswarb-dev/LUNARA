export const PAGE_BREAK_SEPARATOR = '\n\n<!-- lunara-page-break -->\n\n';
export const PAGE_BREAK_MARKER = '<!-- lunara-page-break -->';
const PAGE_META_COMMENT_REGEX = /\s*<!--\s*lunara-page-meta:\s*(\{.*?\})\s*-->/;

export const PAGE_TITLE_MAX_LENGTH = 80;

export interface DiaryContentPage {
  id: string;
  content: string;
}

export interface ParsedDiaryContent {
  pageTitles: string[];
  pages: DiaryContentPage[];
}

export function serializeDiaryContent(
  pages: DiaryContentPage[],
  pageTitles: string[]
): string {
  const nonEmptyPages = pages.filter(p => p.content.trim() !== '');
  if (nonEmptyPages.length === 0) return '';

  const titlesToStore = pageTitles.slice(0, nonEmptyPages.length);
  while (titlesToStore.length < nonEmptyPages.length) {
    titlesToStore.push('');
  }

  const hasAnyTitle = titlesToStore.some(t => t.trim() !== '');
  const metaComment = hasAnyTitle
    ? `<!-- lunara-page-meta: ${JSON.stringify({ pageTitles: titlesToStore })} -->\n\n`
    : '';

  const body = nonEmptyPages
    .map(p => p.content)
    .join(PAGE_BREAK_SEPARATOR);

  return metaComment + body;
}

export function parseDiaryContent(rawContent: string): ParsedDiaryContent {
  if (!rawContent) {
    return {
      pageTitles: [''],
      pages: [{ id: crypto.randomUUID(), content: '' }],
    };
  }

  let content = rawContent;
  let extractedTitles: string[] | null = null;

  const metaMatch = content.match(PAGE_META_COMMENT_REGEX);
  if (metaMatch) {
    try {
      const parsed = JSON.parse(metaMatch[1]);
      if (Array.isArray(parsed.pageTitles)) {
        extractedTitles = parsed.pageTitles.map((t: unknown) =>
          typeof t === 'string' ? t : ''
        );
      }
    } catch {
      // Malformed JSON — treat as legacy content
    }
    content = content.replace(PAGE_META_COMMENT_REGEX, '').trim();
  }

  const rawPages = content.split(PAGE_BREAK_MARKER);
  const pages: DiaryContentPage[] = rawPages
    .map(p => ({ id: crypto.randomUUID(), content: p.trim() }))
    .filter(p => p.content.length > 0);

  if (pages.length === 0) {
    return {
      pageTitles:
        extractedTitles && extractedTitles.length > 0 ? extractedTitles : [''],
      pages: [{ id: crypto.randomUUID(), content: '' }],
    };
  }

  let pageTitles: string[];
  if (extractedTitles && extractedTitles.length >= pages.length) {
    pageTitles = extractedTitles.slice(0, pages.length);
  } else if (extractedTitles && extractedTitles.length > 0) {
    pageTitles = [...extractedTitles];
    while (pageTitles.length < pages.length) pageTitles.push('');
  } else {
    pageTitles = pages.map(() => '');
  }

  return { pageTitles, pages };
}

export function normalizePageTitles(
  prev: string[],
  targetLength: number
): string[] {
  if (prev.length === targetLength) return prev;
  if (prev.length < targetLength) {
    return [...prev, ...Array(targetLength - prev.length).fill('')];
  }
  return prev.slice(0, targetLength);
}

export function stripMetadataForDisplay(rawContent: string): string {
  if (!rawContent) return '';
  return rawContent
    .replace(PAGE_META_COMMENT_REGEX, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
}
