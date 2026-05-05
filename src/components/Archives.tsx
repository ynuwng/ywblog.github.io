import React from 'react';
import { YearGroupedList } from './YearGroupedList';
import { BlogPost } from '../types';

interface ArchivesProps {
  posts: BlogPost[];
  onNavigateHome: () => void;
  onArticleClick: (articleId: string) => void;
}

export function Archives({ posts, onArticleClick }: ArchivesProps) {
  return (
    <main className="editorial fade-in">
      <h2 className="rail-label">Archives</h2>
      <p className="hero-tagline" style={{ fontSize: '14px', marginBottom: '32px' }}>
        Everything I've written here, ordered by date.
      </p>
      <YearGroupedList posts={posts} onClick={onArticleClick} />
    </main>
  );
}
