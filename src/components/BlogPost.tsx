import React from 'react';
import { BlogPost as BlogPostType } from '../types';

interface BlogPostProps {
  post: BlogPostType;
  onClick?: () => void;
  /** Kept for prop compatibility with previous design; tags are now inline mono */
  tagFrequencies?: Record<string, number>;
  maxTagCount?: number;
  onTagClick?: (tag: string) => void;
}

/**
 * Flat post row used on Home, Archives, TaggedArticles, CategoryArticles.
 * 56px mono date column · serif title + description · `·`-separated mono meta strip.
 */
export function BlogPost({ post, onClick, onTagClick }: BlogPostProps) {
  const { day, month } = formatDate(post.date);
  const meta: React.ReactNode[] = [];

  post.tags?.forEach((tag, i) => {
    if (i > 0) meta.push(<span className="sep" key={`s-${i}`}>·</span>);
    meta.push(
      onTagClick ? (
        <button
          key={`t-${tag}`}
          onClick={(e) => { e.stopPropagation(); onTagClick(tag); }}
          style={{ background: 'none', border: 0, padding: 0, font: 'inherit', color: 'inherit', cursor: 'pointer' }}
        >
          {tag}
        </button>
      ) : (
        <span key={`t-${tag}`}>{tag}</span>
      )
    );
  });
  if (post.readTime) {
    if (meta.length) meta.push(<span className="sep" key="s-rt">·</span>);
    meta.push(<span key="rt">{post.readTime}</span>);
  }

  return (
    <article className="post-row fade-in" onClick={onClick}>
      <div className="post-date">
        {month} {day}
      </div>
      <div>
        <h2 className="post-title">{post.title}</h2>
        {post.excerpt && <p className="post-desc">{post.excerpt}</p>}
        {meta.length > 0 && (
          <div className="post-meta-row">{meta}</div>
        )}
      </div>
    </article>
  );
}

function formatDate(s: string) {
  const d = new Date(s);
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
  const day = String(d.getDate()).padStart(2, '0');
  return { day, month };
}
