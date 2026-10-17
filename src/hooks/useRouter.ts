import { useState, useEffect, useCallback } from 'react';

export type ViewType = 'home' | 'about' | 'article' | 'tagged' | 'admin';

// Retired routes (/archives, /categories, /tags, /category/*) fall through to home.
function parsePath(): { view: ViewType; articleId?: string; tag?: string } {
  const parts = window.location.pathname
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean);

  if (parts.length === 0)                    return { view: 'home' };
  if (parts[0] === 'article' && parts[1])    return { view: 'article',  articleId: decodeURIComponent(parts[1]) };
  if (parts[0] === 'tag'     && parts[1])    return { view: 'tagged',   tag:       decodeURIComponent(parts[1]) };
  if (parts[0] === 'about')                  return { view: 'about' };
  if (import.meta.env.DEV && parts[0] === 'admin') return { view: 'admin' };
  return { view: 'home' };
}

function pushPath(path: string) {
  if (path !== window.location.pathname + window.location.search) {
    window.history.pushState(null, '', path);
  }
}

export function useRouter() {
  const initial = parsePath();
  const [currentView,      setCurrentView]      = useState<ViewType>(initial.view);
  const [selectedArticle,  setSelectedArticle]  = useState<string | null>(initial.articleId ?? null);
  const [selectedTag,      setSelectedTag]      = useState<string | null>(initial.tag ?? null);

  const syncFromLocation = useCallback(() => {
    const s = parsePath();
    setCurrentView(s.view);
    setSelectedArticle(s.articleId ?? null);
    setSelectedTag(s.tag ?? null);
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', syncFromLocation);
    return () => window.removeEventListener('popstate', syncFromLocation);
  }, [syncFromLocation]);

  /* Single navigation primitive — push URL then re-parse state.
     Used by both direct navigation and browser back/forward (popstate). */
  const go = useCallback((path: string, scrollTop = false) => {
    pushPath(path);
    syncFromLocation();
    if (scrollTop) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [syncFromLocation]);

  return {
    currentView,
    selectedArticle,
    selectedTag,
    navigate:     (view: ViewType) => go(view === 'home' ? '/' : `/${view}`),
    goArticle:    (id: string)     => go(`/article/${encodeURIComponent(id)}`, true),
    goTag:        (tag: string)    => go(`/tag/${encodeURIComponent(tag)}`),
  };
}
