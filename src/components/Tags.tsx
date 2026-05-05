import React from 'react';

interface Post {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  readTime: string;
  tags: string[];
}

interface TagsProps {
  posts: Post[];
  onTagClick: (tag: string) => void;
}

const tagTierColors = [
  { bg: 'var(--tag-light-bg)', text: 'var(--tag-light-text)' },
  { bg: 'var(--tag-mid-bg)',   text: 'var(--tag-mid-text)'   },
  { bg: 'var(--tag-dark-bg)',  text: 'var(--tag-dark-text)'  },
];

function getTagColor(count: number, maxCount: number) {
  if (count === 1)        return tagTierColors[0];
  if (count >= maxCount)  return tagTierColors[2];
  return tagTierColors[1];
}

export function Tags({ posts, onTagClick }: TagsProps) {
  const tagCounts = posts.reduce((acc, post) => {
    post.tags.forEach(tag => { acc[tag] = (acc[tag] || 0) + 1; });
    return acc;
  }, {} as Record<string, number>);

  const maxCount = Math.max(1, ...Object.values(tagCounts));
  const sortedTags = Object.entries(tagCounts).sort(([a], [b]) => a.localeCompare(b));

  return (
    <main className="editorial fade-in" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <h1 className="year-head" style={{ marginBottom: '1.25rem' }}>Tags</h1>
      <div className="flex flex-wrap" style={{ gap: '8px' }}>
        {sortedTags.map(([tag, count]) => {
          const c = getTagColor(count, maxCount);
          return (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="tag-pill"
              style={{ backgroundColor: c.bg, color: c.text, border: 0, cursor: 'pointer' }}
            >
              <span>{tag}</span>
              <span className="tag-count">{count}</span>
            </button>
          );
        })}
      </div>
    </main>
  );
}
