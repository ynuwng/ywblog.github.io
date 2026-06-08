import { BlogHeader } from './components/BlogHeader';
import { YearGroupedList } from './components/YearGroupedList';
import { Footer } from './components/Footer';
import { AdminGate } from './components/AdminGate';
import { useState, useEffect, lazy, Suspense } from 'react';
import { useBlogPosts } from './hooks/useBlogPosts';
import { useBlogPost } from './hooks/useBlogPost';
import { useRouter } from './hooks/useRouter';
import { articlePath, findPostByArticleKey } from './lib/articleSlugs';

// Sonner is only needed for admin toasts — exclude from production bundle entirely.
const DevToaster = import.meta.env.DEV
  ? lazy(() => import('sonner').then(m => ({ default: m.Toaster })))
  : null;

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const Archives        = lazy(() => import('./components/Archives').then(m => ({ default: m.Archives })));
const Tags            = lazy(() => import('./components/Tags').then(m => ({ default: m.Tags })));
const About           = lazy(() => import('./components/About').then(m => ({ default: m.About })));
const Article         = lazy(() => import('./components/Article').then(m => ({ default: m.Article })));
const TaggedArticles  = lazy(() => import('./components/TaggedArticles').then(m => ({ default: m.TaggedArticles })));
const Categories      = lazy(() => import('./components/Categories').then(m => ({ default: m.Categories })));
const CategoryArticles = lazy(() => import('./components/CategoryArticles').then(m => ({ default: m.CategoryArticles })));
const Admin           = lazy(() => import('./components/Admin').then(m => ({ default: m.Admin })));

// Quiet loading fallback — matches editorial tone.
const LoadingSpinner = () => (
  <div className="editorial" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
    <p className="meta" style={{ textAlign: 'center' }}>Loading…</p>
  </div>
);

export default function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const {
    currentView, selectedArticle, selectedTag, selectedCategory,
    navigate, goArticle, goTag, goCategory, goHome, goTags, goCategories,
  } = useRouter();

  const { blogPosts, refreshPosts, loading: loadingPosts } = useBlogPosts();

  const postInList = findPostByArticleKey(blogPosts, selectedArticle);
  const articleId = postInList?.id ?? selectedArticle;

  const initialArticle = postInList?.content ? postInList : null;

  const { post: fetchedPost, loading: loadingArticle } = useBlogPost(
    currentView === 'article' ? articleId : null,
    initialArticle,
  );

  // fetchedPost has full content; fall back to list metadata when API is down
  const currentArticle = fetchedPost ?? postInList ?? null;

  useEffect(() => {
    if (currentView !== 'article' || !currentArticle || selectedArticle !== currentArticle.id) return;
    window.history.replaceState(null, '', articlePath(currentArticle));
  }, [currentView, currentArticle, selectedArticle]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {DevToaster && (
        <Suspense fallback={null}><DevToaster position="top-right" /></Suspense>
      )}
      <BlogHeader
        onNavigate={navigate}
        currentView={currentView}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      />

      {/* Admin access button — dev only */}
      {import.meta.env.DEV && (
        <button
          onClick={() => navigate('admin')}
          title="Admin Panel"
          style={{
            position: 'fixed', bottom: '20px', right: '20px',
            width: '34px', height: '34px',
            borderRadius: '999px',
            background: 'var(--bg-surface)',
            color: 'var(--text-tertiary)',
            border: '0.5px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 50,
            fontFamily: 'var(--font-mono)', fontSize: '16px', lineHeight: 1,
          }}
        >
          +
        </button>
      )}

      {currentView === 'home' ? (
        <main className="editorial fade-in">
          <h1 className="hero">Yuan Wang</h1>
          <p className="hero-tagline">
            Writing on AI, quantitative research, and signal processing —
            notes, derivations, and the occasional dead end.
          </p>

          <YearGroupedList posts={blogPosts} onClick={goArticle} onTagClick={goTag} />
        </main>
      ) : currentView === 'archives' ? (
        <Suspense fallback={<LoadingSpinner />}>
          <Archives posts={blogPosts} onNavigateHome={goHome} onArticleClick={goArticle} />
        </Suspense>
      ) : currentView === 'tags' ? (
        <Suspense fallback={<LoadingSpinner />}>
          <Tags posts={blogPosts} onTagClick={goTag} />
        </Suspense>
      ) : currentView === 'about' ? (
        <Suspense fallback={<LoadingSpinner />}>
          <About />
        </Suspense>
      ) : currentView === 'article' ? (
        (loadingPosts || loadingArticle) && !currentArticle?.content ? (
          <div className="editorial" style={{ padding: '4rem 0', textAlign: 'center' }}>
            <p className="meta">Loading article…</p>
          </div>
        ) : currentArticle ? (
          <Suspense fallback={<LoadingSpinner />}>
            <Article
              post={currentArticle}
              onBack={goHome}
              onCategoryClick={goCategory}
              onTagClick={goTag}
            />
          </Suspense>
        ) : (
          <div className="editorial" style={{ padding: '4rem 0', textAlign: 'center' }}>
            <p className="meta">Article not found.</p>
          </div>
        )
      ) : currentView === 'tagged' && selectedTag ? (
        <Suspense fallback={<LoadingSpinner />}>
          <TaggedArticles tag={selectedTag} posts={blogPosts} onBack={goTags} onArticleClick={goArticle} />
        </Suspense>
      ) : currentView === 'categories' ? (
        <Suspense fallback={<LoadingSpinner />}>
          <Categories posts={blogPosts} onCategoryClick={goCategory} />
        </Suspense>
      ) : currentView === 'category' && selectedCategory ? (
        <Suspense fallback={<LoadingSpinner />}>
          <CategoryArticles category={selectedCategory} posts={blogPosts} onBack={goCategories} onArticleClick={goArticle} />
        </Suspense>
      ) : currentView === 'admin' ? (
        <AdminGate>
          <Suspense fallback={<LoadingSpinner />}>
            <Admin refreshPosts={refreshPosts} />
          </Suspense>
        </AdminGate>
      ) : null}

      <Footer />
    </div>
  );
}
