import React from 'react';

interface Post {
  id: string;
  title: string;
  category: string;
}

interface CategoriesProps {
  posts: Post[];
  onCategoryClick: (category: string) => void;
}

export function Categories({ posts, onCategoryClick }: CategoriesProps) {
  const counts = posts.reduce((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));

  return (
    <main className="editorial fade-in">
      <h2 className="rail-label">Categories</h2>
      <p className="hero-tagline" style={{ fontSize: '14px', marginBottom: '24px' }}>
        Posts grouped by topic.
      </p>
      <ul className="list-rows">
        {categories.map(([name, count]) => (
          <li key={name}>
            <button onClick={() => onCategoryClick(name)} className="list-row">
              <span className="list-row-title">{name}</span>
              <span className="list-row-meta">
                {count} {count === 1 ? 'post' : 'posts'}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
