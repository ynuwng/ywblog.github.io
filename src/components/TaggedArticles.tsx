import React from 'react';
import { YearGroupedList } from './YearGroupedList';
import { BlogPost } from '../types';

interface TaggedArticlesProps {
  tag: string;
  posts: BlogPost[];
  onBack: () => void;
  onArticleClick: (articleId: string) => void;
}

export function TaggedArticles({ tag, posts, onArticleClick }: TaggedArticlesProps) {
  const filtered = posts.filter((p) => p.tags.includes(tag));

  return (
    <main className="editorial fade-in">
      <h2 className="rail-label">Tag</h2>
      <h1
        className="hero"
        style={{ fontSize: '24px', marginBottom: '4px' }}
      >
        {tag}
      </h1>
      <p className="hero-tagline" style={{ fontSize: '13px', marginBottom: '32px' }}>
        {filtered.length} {filtered.length === 1 ? 'article' : 'articles'} tagged <em>{tag}</em>.
      </p>

      {filtered.length > 0 ? (
        <YearGroupedList posts={filtered} onClick={onArticleClick} />
      ) : (
        <p className="meta" style={{ textAlign: 'center', padding: '32px 0' }}>
          No articles with this tag.
        </p>
      )}
    </main>
  );
}
