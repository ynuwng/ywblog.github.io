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

export function Tags({ posts, onTagClick }: TagsProps) {
  const counts = posts.reduce((acc, post) => {
    post.tags.forEach((t) => { acc[t] = (acc[t] || 0) + 1; });
    return acc;
  }, {} as Record<string, number>);

  const sorted = Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));

  return (
    <main className="editorial fade-in">
      <h2 className="rail-label">Tags</h2>
      <p className="hero-tagline" style={{ fontSize: '14px', marginBottom: '24px' }}>
        Browse by topic.
      </p>

      {/* Inline tag cloud — mono, lowercase, `·` separated */}
      <div className="tag-strip" style={{ fontSize: '13px', lineHeight: 2 }}>
        {sorted.map(([tag, count], i) => (
          <React.Fragment key={tag}>
            {i > 0 && <span className="sep">·</span>}
            <button onClick={() => onTagClick(tag)}>
              {tag}
              <span style={{ marginLeft: '3px', opacity: 0.6, fontSize: '11px' }}>{count}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
    </main>
  );
}
