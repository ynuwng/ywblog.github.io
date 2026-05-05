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
  const categoryCount = posts.reduce((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.entries(categoryCount).sort(([a], [b]) => a.localeCompare(b));

  return (
    <main className="editorial fade-in" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <h1 className="year-head" style={{ marginBottom: '1rem' }}>Categories</h1>
      <hr className="rule" />
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {categories.map(([name, count]) => (
          <li key={name}>
            <button
              onClick={() => onCategoryClick(name)}
              className="list-row"
              style={{ width: '100%', background: 'none', border: 0, cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--rule)' }}
            >
              <span className="list-row-title">{name}</span>
              <span className="list-row-meta">{count} {count === 1 ? 'post' : 'posts'}</span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
