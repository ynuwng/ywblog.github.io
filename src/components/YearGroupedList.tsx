import React from 'react';
import { BlogPost as BlogPostType } from '../types';
import { BlogPost } from './BlogPost';

interface YearGroupedListProps {
  posts: BlogPostType[];
  onClick: (id: string) => void;
  onTagClick?: (tag: string) => void;
}

/**
 * Year-grouped post list shared by Home and Archives.
 * Year header in mono uppercase; rows in BlogPost.
 */
export function YearGroupedList({ posts, onClick, onTagClick }: YearGroupedListProps) {
  const byYear = posts.reduce((acc, p) => {
    const y = new Date(p.date).getFullYear();
    (acc[y] ||= []).push(p);
    return acc;
  }, {} as Record<number, BlogPostType[]>);

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  years.forEach((y) => byYear[y].sort((a, b) => +new Date(b.date) - +new Date(a.date)));

  return (
    <div>
      {years.map((year, yi) => (
        <section key={year} style={{ marginTop: yi === 0 ? '8px' : '36px' }}>
          <h3 className="year-head">{year}</h3>
          <div>
            {byYear[year].map((post) => (
              <BlogPost
                key={post.id}
                post={post}
                onClick={() => onClick(post.id)}
                onTagClick={onTagClick}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
