import React from 'react';
import { BlogPost } from './BlogPost';

interface Post {
  id: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  readTime: string;
  tags: string[];
  category: string;
}

interface CategoryArticlesProps {
  category: string;
  posts: Post[];
  onBack: () => void;
  onArticleClick: (id: string) => void;
}

export function CategoryArticles({ category, posts, onArticleClick }: CategoryArticlesProps) {
  const filteredPosts = posts.filter(post => post.category === category);

  return (
    <main className="editorial fade-in" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p className="meta" style={{ marginBottom: '4px' }}>Category</p>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
            marginBottom: '6px',
          }}
        >
          {category}
        </h1>
        <p className="meta">
          {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
        </p>
      </div>
      <hr className="rule" style={{ marginBottom: '2.25rem' }} />

      <div>
        {filteredPosts.map((post, i) => (
          <div key={post.id}>
            {i > 0 && <hr className="rule" style={{ margin: '2.5rem 0' }} />}
            <BlogPost post={post} onClick={() => onArticleClick(post.id)} />
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <p className="meta" style={{ textAlign: 'center', padding: '2rem 0' }}>
          No articles in this category.
        </p>
      )}
    </main>
  );
}
