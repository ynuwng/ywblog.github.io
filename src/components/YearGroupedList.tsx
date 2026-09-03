import React, { useMemo } from 'react';
import { BlogPost as BlogPostType } from '../types';
import { BlogPost } from './BlogPost';
import { articleSlug } from '../lib/articleSlugs';

interface YearGroupedListProps {
  posts: BlogPostType[];
  onClick: (id: string) => void;
  onTagClick?: (tag: string) => void;
  collapsible?: boolean;
}

/**
 * Year-grouped post list shared by Home and Archives.
 * Year header in mono uppercase; rows in BlogPost.
 */
export function YearGroupedList({ posts, onClick, onTagClick, collapsible = false }: YearGroupedListProps) {
  const { byYear, years } = useMemo(() => {
    const grouped = posts.reduce((acc, p) => {
      const y = new Date(p.date).getFullYear();
      (acc[y] ||= []).push(p);
      return acc;
    }, {} as Record<number, BlogPostType[]>);

    const sortedYears = Object.keys(grouped).map(Number).sort((a, b) => b - a);
    sortedYears.forEach((y) => {
      grouped[y] = [...grouped[y]].sort((a, b) => +new Date(b.date) - +new Date(a.date));
    });

    return { byYear: grouped, years: sortedYears };
  }, [posts]);

  const renderPosts = (year: number) => (
    <div>
      {byYear[year].map((post) => (
        <BlogPost
          key={post.id}
          post={post}
          onClick={() => onClick(articleSlug(post))}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  );

  return (
    <div>
      {years.map((year, yi) => {
        const sectionStyle = { marginTop: yi === 0 ? '8px' : '36px' };

        if (collapsible) {
          return (
            <details key={year} className="archive-year" style={sectionStyle} open={yi === 0}>
              <summary className="archive-year-toggle">
                <span className="year-head archive-year-label">{year}</span>
                <span className="archive-year-meta">
                  {byYear[year].length} {byYear[year].length === 1 ? 'post' : 'posts'}
                  <span className="archive-year-chevron" aria-hidden="true">⌄</span>
                </span>
              </summary>
              {renderPosts(year)}
            </details>
          );
        }

        return (
          <section key={year} style={sectionStyle}>
            <h3 className="year-head">{year}</h3>
            {renderPosts(year)}
          </section>
        );
      })}
    </div>
  );
}
