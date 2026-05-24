import { useState, useEffect, useCallback } from 'react';

export type ViewType =
  | 'home' | 'archives' | 'categories' | 'tags' | 'about'
  | 'article' | 'tagged' | 'category' | 'admin';

function parsePath(): { view: ViewType; articleId?: string; tag?: string; category?: string } {
  const parts = window.location.pathname
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean);

  if (parts.length === 0)                    return { view: 'home' };
  if (parts[0] === 'article' && parts[1])    return { view: 'article',  articleId: decodeURIComponent(parts[1]) };
  if (parts[0] === 'tag'     && parts[1])    return { view: 'tagged',   tag:       decodeURIComponent(parts[1]) };
  if (parts[0] === 'category' && parts[1])   return { view: 'category', category:  decodeURIComponent(parts[1]) };
  if (parts[0] === 'archives')               return { view: 'archives' };
  if (parts[0] === 'categories')             return { view: 'categories' };
  if (parts[0] === 'tags')                   return { view: 'tags' };
  if (parts[0] === 'about')                  return { view: 'about' };
  if (parts[0] === 'admin')                  return { view: 'admin' };
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initial.category ?? null);

  const syncFromLocation = useCallback(() => {
    const s = parsePath();
    setCurrentView(s.view);
    setSelectedArticle(s.articleId ?? null);
    setSelectedTag(s.tag ?? null);
    setSelectedCategory(s.category ?? null);
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
    selectedCategory,
    navigate:     (view: ViewType) => go(view === 'home' ? '/' : `/${view}`),
    goArticle:    (id: string)     => go(`/article/${encodeURIComponent(id)}`, true),
    goTag:        (tag: string)    => go(`/tag/${encodeURIComponent(tag)}`),
    goCategory:   (cat: string)    => go(`/category/${encodeURIComponent(cat)}`),
    goHome:       ()               => go('/'),
    goTags:       ()               => go('/tags'),
    goCategories: ()               => go('/categories'),
  };
}
