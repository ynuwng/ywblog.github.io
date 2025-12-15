import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';
import { MigratePosts } from './MigratePosts';
import { BlogPost } from '../types';

interface AdminProps {
  refreshPosts: () => Promise<void>;
}

export function Admin({ refreshPosts }: AdminProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [author, setAuthor] = useState('Yuan Wang');
  const [excerpt, setExcerpt] = useState('');
  const [readTime, setReadTime] = useState('5 min read');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Article list management
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [showArticleList, setShowArticleList] = useState(true);

  // Fetch articles on mount
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoadingArticles(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-860c354e/posts`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setArticles(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setLoadingArticles(false);
    }
  };

  const handleEdit = async (article: BlogPost) => {
    // If content is missing (optimized list view), fetch the full post
    let fullContent = article.content;
    
    if (!fullContent) {
      const loadingToast = toast.loading('Loading article content...');
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-860c354e/posts/${article.id}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );
        
        const data = await response.json();
        if (data.success && data.post) {
          fullContent = data.post.content;
          toast.dismiss(loadingToast);
        } else {
          toast.error('Failed to load article content');
          return;
        }
      } catch (error) {
        console.error('Error fetching full article:', error);
        toast.error('Failed to load article content');
        return;
      }
    }

    setEditingId(article.id);
    setTitle(article.title);
    setDate(article.date);
    setAuthor(article.author);
    setExcerpt(article.excerpt);
    setReadTime(article.readTime);
    setTags(article.tags.join(', '));
    setCategory(article.category);
    setContent(fullContent || '');
    setShowArticleList(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-860c354e/posts/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Article deleted successfully!');
        await fetchArticles();
        await refreshPosts();
      } else {
        toast.error(`Failed to delete: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Failed to delete article');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDate('');
    setAuthor('Yuan Wang');
    setExcerpt('');
    setReadTime('5 min read');
    setTags('');
    setCategory('');
    setContent('');
    setShowArticleList(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingId
        ? `https://${projectId}.supabase.co/functions/v1/make-server-860c354e/posts/${editingId}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-860c354e/posts`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          title,
          date,
          author,
          excerpt,
          readTime,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          category,
          content,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingId ? 'Article updated successfully!' : 'Article published successfully!');
        await refreshPosts();
        await fetchArticles();
        // Clear form
        setEditingId(null);
        setTitle('');
        setDate('');
        setExcerpt('');
        setReadTime('5 min read');
        setTags('');
        setCategory('');
        setContent('');
        setShowArticleList(true);
      } else {
        toast.error(`Failed to ${editingId ? 'update' : 'publish'}: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save article. Check console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl">
          {editingId ? 'Edit Article' : 'Article Management'}
        </h1>
        {!showArticleList && (
          <button
            onClick={() => setShowArticleList(true)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ← Back to List
          </button>
        )}
      </div>

      {/* Migration section */}
      {showArticleList && (
        <div className="mb-12">
          <MigratePosts />
        </div>
      )}

      {/* Article List */}
      {showArticleList && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">Published Articles</h2>
            <button
              onClick={() => {
                // Clear form fields
                setEditingId(null);
                setTitle('');
                setDate('');
                setAuthor('Yuan Wang');
                setExcerpt('');
                setReadTime('5 min read');
                setTags('');
                setCategory('');
                setContent('');
                // Show the form
                setShowArticleList(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              + New Article
            </button>
          </div>

          {loadingArticles ? (
            <div className="text-center py-8 text-gray-500">Loading articles...</div>
          ) : articles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No articles yet. Create your first article or migrate existing posts.
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl mb-2">{article.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{article.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{article.date}</span>
                        <span>·</span>
                        <span>{article.category}</span>
                        <span>·</span>
                        <span>{article.tags.join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(article)}
                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(article.id, article.title)}
                        className="px-4 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Article Form */}
      {!showArticleList && (
        <>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="Building Scalable Systems"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm mb-2">
                  Date *
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-sm mb-2">
                  Author *
                </label>
                <input
                  id="author"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="Yuan Wang"
                />
              </div>
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-sm mb-2">
                Excerpt *
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="A brief summary of your article..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="readTime" className="block text-sm mb-2">
                  Read Time
                </label>
                <input
                  id="readTime"
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="5 min read"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm mb-2">
                  Category *
                </label>
                <input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="Engineering"
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  id="tags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="systems, architecture"
                />
              </div>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm mb-2">
                Content * (Markdown supported)
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={20}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 font-mono text-sm"
                placeholder="Your article content in markdown format..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? (editingId ? 'Updating...' : 'Publishing...') : (editingId ? 'Update Article' : 'Publish Article')}
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl mb-4">Markdown Tips</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p><code className="bg-white px-2 py-1 rounded">## Heading</code> - Creates a heading</p>
              <p><code className="bg-white px-2 py-1 rounded">**bold**</code> - Bold text</p>
              <p><code className="bg-white px-2 py-1 rounded">*italic*</code> - Italic text</p>
              <p><code className="bg-white px-2 py-1 rounded">`code`</code> - Inline code</p>
              <p><code className="bg-white px-2 py-1 rounded">```language\ncode block\n```</code> - Code block</p>
              <p><code className="bg-white px-2 py-1 rounded">- item</code> - Bullet list</p>
              <p><code className="bg-white px-2 py-1 rounded">1. item</code> - Numbered list</p>
              <p><code className="bg-white px-2 py-1 rounded">[text](url)</code> - Link</p>
              <p><code className="bg-white px-2 py-1 rounded">&gt; quote</code> - Blockquote (with left border)</p>
              <p><code className="bg-white px-2 py-1 rounded">| Header | Header |\n| --- | --- |\n| Cell | Cell |</code> - Table</p>
              <p><code className="bg-white px-2 py-1 rounded">$E = mc^2$</code> - Inline math equation</p>
              <p><code className="bg-white px-2 py-1 rounded">$$\n\int_0^\infty x^2 dx\n$$</code> - Block math equation</p>
              <p><code className="bg-white px-2 py-1 rounded">~~strikethrough~~</code> - Strikethrough text</p>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
