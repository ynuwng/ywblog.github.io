import React from 'react';

interface Post {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  readTime: string;
  tags: string[];
}

interface ArchivesProps {
  posts: Post[];
  onNavigateHome: () => void;
  onArticleClick: (articleId: string) => void;
}

export function Archives({ posts, onArticleClick }: ArchivesProps) {
  const postsByYear = posts.reduce((acc, post) => {
    const year = new Date(post.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {} as Record<number, Post[]>);

  const sortedYears = Object.keys(postsByYear).map(Number).sort((a, b) => b - a);

  // Sort posts within each year by date desc
  sortedYears.forEach((y) => {
    postsByYear[y].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  });

  const formatShort = (s: string) => {
    const d = new Date(s);
    const day = String(d.getDate()).padStart(2, '0');
    const mon = d.toLocaleDateString('en-US', { month: 'short' });
    return `${mon} ${day}`;
  };

  return (
    <main className="editorial fade-in" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <h1 className="year-head" style={{ marginBottom: '1.5rem' }}>Archives</h1>

      {sortedYears.map((year, idx) => (
        <section key={year} style={{ marginTop: idx === 0 ? 0 : '2.25rem' }}>
          <div
            className="flex items-baseline justify-between"
            style={{ marginBottom: '0.5rem' }}
          >
            <h2 className="year-head">{year}</h2>
            <span className="meta">
              {postsByYear[year].length} {postsByYear[year].length === 1 ? 'post' : 'posts'}
            </span>
          </div>
          <hr className="rule" />
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {postsByYear[year].map((post) => (
              <li key={post.id}>
                <a
                  href="#"
                  className="list-row"
                  onClick={(e) => { e.preventDefault(); onArticleClick(post.id); }}
                  style={{ textDecoration: 'none' }}
                >
                  <span className="list-row-title">{post.title}</span>
                  <span className="list-row-meta">{formatShort(post.date)}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
