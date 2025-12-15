import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { BlogPost as BlogPostType } from '../types';

interface BlogPostProps {
  post: BlogPostType;
  onClick?: () => void;
}

// Morandi color palette - muted, desaturated colors
const morandiColors = [
  { bg: '#E8D5C4', text: '#6B5D54' }, // Muted terracotta
  { bg: '#C9D5C0', text: '#5A6152' }, // Sage green
  { bg: '#D4C5D0', text: '#635A60' }, // Dusty rose
  { bg: '#C8D5D5', text: '#546366' }, // Powder blue
  { bg: '#E0D5C8', text: '#6B6158' }, // Warm beige
  { bg: '#D5CFD0', text: '#625E5F' }, // Cool gray
  { bg: '#D9D0C7', text: '#66605A' }, // Mushroom
  { bg: '#C5D0D8', text: '#535F66' }, // Soft blue-gray
];

function getTagColor(tag: string): { bg: string; text: string } {
  // Generate a consistent index based on tag name
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return morandiColors[hash % morandiColors.length];
}

export function BlogPost({ post, onClick }: BlogPostProps) {
  return (
    <article className="group cursor-pointer" onClick={onClick}>
      <h2 className="mb-3 font-bold group-hover:text-gray-600 transition-colors">
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
      
      <div className="bg-gray-50 rounded-lg p-6 mb-4 border border-gray-100">
        <p className="text-gray-600 leading-relaxed text-[16px]">
          {post.excerpt}
        </p>
      </div>
      
      <div className="flex gap-2">
        {post.tags.map((tag) => {
          const colors = getTagColor(tag);
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
