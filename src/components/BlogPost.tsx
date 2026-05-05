import React from 'react';
import { BlogPost as BlogPostType } from '../types';

interface BlogPostProps {
  post: BlogPostType;
  onClick?: () => void;
  tagFrequencies?: Record<string, number>;
  maxTagCount?: number;
}

// Unified 3-tier monochrome tag system, driven by CSS variables so that
// Home, Tags page, Article footer and TaggedArticles all match.
const tagTierColors = [
  { bg: 'var(--tag-light-bg)', text: 'var(--tag-light-text)' },
  { bg: 'var(--tag-mid-bg)',   text: 'var(--tag-mid-text)'   },
  { bg: 'var(--tag-dark-bg)',  text: 'var(--tag-dark-text)'  },
];

function getTagColor(tag: string, frequencies?: Record<string, number>, maxCount?: number) {
  const count = frequencies?.[tag] ?? 1;
  const max = maxCount ?? 1;
  if (count === 1)   return tagTierColors[0];
  if (count >= max)  return tagTierColors[2];
  return tagTierColors[1];
}

export function BlogPost({ post, onClick, tagFrequencies, maxTagCount }: BlogPostProps) {
  return (
    <article className="group cursor-pointer fade-in" onClick={onClick}>
      <h2
        className="transition-colors"
        style={{
          fontSize: '22px',
          lineHeight: 1.35,
          fontWeight: 600,
          letterSpacing: '-0.005em',
          color: 'var(--ink)',
          marginBottom: '8px',
        }}
      >
        <span className="group-hover:opacity-70 transition-opacity">{post.title}</span>
      </h2>

      <div className="meta" style={{ marginBottom: '14px' }}>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span className="meta-sep" />
        <span>{post.readTime}</span>
      </div>

      <p
        className="body-text"
        style={{ marginBottom: '18px' }}
      >
        {post.excerpt}
      </p>

      {post.tags.length > 0 && (
        <div className="flex flex-wrap" style={{ gap: '6px' }}>
          {post.tags.map((tag) => {
            const c = getTagColor(tag, tagFrequencies, maxTagCount);
            return (
              <span
                key={tag}
                className="tag-pill"
                style={{ backgroundColor: c.bg, color: c.text }}
              >
                {tag}
              </span>
            );
          })}
        </div>
      )}
    </article>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
