import React from 'react';
import { YearGroupedList } from './YearGroupedList';
import { BlogPost } from '../types';

interface CategoryArticlesProps {
  category: string;
  posts: BlogPost[];
  onBack: () => void;
  onArticleClick: (id: string) => void;
}

export function CategoryArticles({ category, posts, onArticleClick }: CategoryArticlesProps) {
  const filtered = posts.filter((p) => p.category === category);

  return (
    <main className="editorial fade-in">
      <h2 className="rail-label">Category</h2>
      <h1 className="hero" style={{ fontSize: '24px', marginBottom: '4px' }}>{category}</h1>
      <p className="hero-tagline" style={{ fontSize: '13px', marginBottom: '32px' }}>
        {filtered.length} {filtered.length === 1 ? 'article' : 'articles'} in <em>{category}</em>.
      </p>

      {filtered.length > 0 ? (
        <YearGroupedList posts={filtered} onClick={onArticleClick} />
      ) : (
        <p className="meta" style={{ textAlign: 'center', padding: '32px 0' }}>
          No articles in this category.
        </p>
      )}
    </main>
  );
}
