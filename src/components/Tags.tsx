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

// 3-tier grey: most frequent = deepest, once = lightest
const tagTierColors = [
  { bg: '#EBEBEB', text: '#909090' }, // light grey  — appears once
  { bg: '#909090', text: '#FFFFFF' }, // medium grey — in between
  { bg: '#3D3D3D', text: '#FFFFFF' }, // deepest grey — most frequent
];

function getTagColor(count: number, maxCount: number): { bg: string; text: string } {
  if (count === 1) return tagTierColors[0];
  if (count >= maxCount) return tagTierColors[2];
  return tagTierColors[1];
}

export function Tags({ posts, onTagClick }: TagsProps) {
  // Count tags
  const tagCounts = posts.reduce((acc, post) => {
    post.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const maxCount = Math.max(1, ...Object.values(tagCounts));

  // Sort tags alphabetically
  const sortedTags = Object.entries(tagCounts).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="flex flex-wrap gap-3">
        {sortedTags.map(([tag, count]) => {
          const colors = getTagColor(count, maxCount);
          return (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="px-3 py-1 text-sm rounded-full transition-opacity hover:opacity-80"
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
              }}
            >
              <span>{tag}</span>
              <span className="ml-1.5 text-gray-400">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}