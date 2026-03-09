import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { BlogPost as BlogPostType } from '../types';

interface BlogPostProps {
  post: BlogPostType;
  onClick?: () => void;
  tagFrequencies?: Record<string, number>;
  maxTagCount?: number;
}

// 3-tier grey: most frequent = deepest, once = lightest
const tagTierColors = [
  { bg: 'var(--tag-light-bg)', text: 'var(--tag-light-text)' }, // light — appears once
  { bg: 'var(--tag-mid-bg)',   text: 'var(--tag-mid-text)'   }, // medium — in between
  { bg: 'var(--tag-dark-bg)',  text: 'var(--tag-dark-text)'  }, // deepest — most frequent
];

function getTagColor(tag: string, frequencies?: Record<string, number>, maxCount?: number): { bg: string; text: string } {
  const count = frequencies?.[tag] ?? 1;
  const max = maxCount ?? 1;
  if (count === 1) return tagTierColors[0];
  if (count >= max) return tagTierColors[2];
  return tagTierColors[1];
}

export function BlogPost({ post, onClick, tagFrequencies, maxTagCount }: BlogPostProps) {
  return (
    <article className="group cursor-pointer" onClick={onClick}>
      <h2 className="mb-3 text-2xl font-bold text-foreground group-hover:text-gray-500 transition-colors">
        {post.title}
      </h2>
      
      <div className="flex items-center gap-4 mb-4 text-gray-500 text-sm">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{post.readTime}</span>
        </div>
      </div>
      
      <div className="bg-muted rounded-lg p-6 mb-4 border border-border">
        <p className="text-gray-600 leading-relaxed text-[16px]">
          {post.excerpt}
        </p>
      </div>
      
      <div className="flex gap-2">
        {post.tags.map((tag) => {
          const colors = getTagColor(tag, tagFrequencies, maxTagCount);
          return (
            <span 
              key={tag}
              className="px-3 py-1 text-sm rounded-full"
              style={{ 
                backgroundColor: colors.bg,
                color: colors.text
              }}
            >
              {tag}
            </span>
          );
        })}
      </div>
    </article>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}
