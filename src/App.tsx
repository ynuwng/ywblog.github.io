import { BlogHeader } from './components/BlogHeader';
import { YearGroupedList } from './components/YearGroupedList';
import { Footer } from './components/Footer';
import { AdminGate } from './components/AdminGate';
import { useState, useEffect, lazy, Suspense } from 'react';
import { Toaster } from 'sonner';
import { useBlogPosts } from './hooks/useBlogPosts';
import { useBlogPost } from './hooks/useBlogPost';
import { useRouter } from './hooks/useRouter';

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

  const { blogPosts, loading, refreshPosts } = useBlogPosts();

  const postInList = blogPosts.find(p => p.id === selectedArticle);
  const hasContent = Boolean(postInList?.content);

  // only fetch individually when the list view didn't already include content
  const { post: fetchedPost, loading: loadingArticle } = useBlogPost(
    currentView === 'article' ? selectedArticle : null,
    { enabled: !hasContent }
  );

  const currentArticle = hasContent ? postInList : fetchedPost;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" />
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

          {loading ? (
            <p className="meta" style={{ textAlign: 'center', padding: '3rem 0' }}>Loading posts…</p>
          ) : blogPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <p className="text-secondary" style={{ marginBottom: '1.25rem' }}>No posts yet.</p>
              {import.meta.env.DEV && (
                <button
                  onClick={() => navigate('admin')}
                  className="accent"
                  style={{ background: 'none', border: 0, cursor: 'pointer', font: 'inherit' }}
                >
                  Create your first post
                </button>
              )}
            </div>
          ) : (
            <YearGroupedList posts={blogPosts} onClick={goArticle} onTagClick={goTag} />
          )}
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
        loadingArticle ? (
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
