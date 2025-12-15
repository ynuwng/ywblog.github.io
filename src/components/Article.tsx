import ReactMarkdown from 'react-markdown';
import React, { useState } from 'react';
import { ArrowLeft, Share2, Folder, Tag, Copy, Check } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { BlogPost } from '../types';

interface ArticleProps {
  post: BlogPost;
  onBack: () => void;
  onCategoryClick?: (category: string) => void;
  onTagClick?: (tag: string) => void;
}

// Morandi color palette - same as BlogPost
const morandiColors = [
  { bg: '#E8D5C4', text: '#6B5D54' },
  { bg: '#C9D5C0', text: '#5A6152' },
  { bg: '#D4C5D0', text: '#635A60' },
  { bg: '#C8D5D5', text: '#546366' },
  { bg: '#E0D5C8', text: '#6B6158' },
  { bg: '#D5CFD0', text: '#625E5F' },
  { bg: '#D9D0C7', text: '#66605A' },
  { bg: '#C5D0D8', text: '#535F66' },
];

function getTagColor(tag: string): { bg: string; text: string } {
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return morandiColors[hash % morandiColors.length];
}

export function Article({ post, onBack, onCategoryClick, onTagClick }: ArticleProps) {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      
      {/* Article Header */}
      <header className="mb-12">
        <h1 className="mb-4 text-[24px] font-bold">{post.title}</h1>
        
        {/* Post metadata */}
        <div className="text-sm text-gray-500 space-y-2">
          <div className="flex items-center gap-2">
            <span>Posted {formatDate(post.date)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>
              Written by <em>{post.author}</em>
            </span>
            
            <span>{post.readTime}</span>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <div className="content mb-16">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const codeString = String(children).replace(/\n$/, '');
              
              return !inline && match ? (
                <CodeBlock language={match[1]}>
                  {codeString}
                </CodeBlock>
              ) : (
                <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm" {...props}>
                  {children}
                </code>
              );
            },
            a({ node, children, ...props }) {
              return (
                <a
                  {...props}
                  style={{ color: '#002fa7' }}
                  className="hover:underline"
                >
                  {children}
                </a>
              );
            },
            p({ node, children, ...props }) {
              return (
                <p className="mb-6 text-gray-800 leading-[1.8] text-[16px]" {...props}>
                  {children}
                </p>
              );
            },
            blockquote({ node, children, ...props }) {
              return (
                <blockquote className="my-6 pl-0 border-l-0 text-gray-500 italic text-[15px] leading-[1.8]" {...props}>
                  {children}
                </blockquote>
              );
            },
            h2({ node, children, ...props }) {
              return (
                <h2 className="mt-10 mb-5 text-[18px]" {...props}>
                  {children}
                </h2>
              );
            },
            h3({ node, children, ...props }) {
              return (
                <h3 className="mt-8 mb-4 text-[16px]" {...props}>
                  {children}
                </h3>
              );
            },
            ul({ node, children, ...props }) {
              return (
                <ul className="mb-6 ml-6 list-disc text-gray-800 leading-[1.8]" {...props}>
                  {children}
                </ul>
              );
            },
            ol({ node, children, ...props }) {
              return (
                <ol className="mb-6 ml-6 list-decimal text-gray-800 leading-[1.8]" {...props}>
                  {children}
                </ol>
              );
            },
            li({ node, children, ...props }) {
              return (
                <li className="mb-2" {...props}>
                  {children}
                </li>
              );
            },
            strong({ node, children, ...props }) {
              return (
                <strong className="font-semibold text-gray-900" {...props}>
                  {children}
                </strong>
              );
            },
          }}
        >
          {post.content || ''}
        </ReactMarkdown>
      </div>

      {/* Post tail wrapper */}
      <div className="post-tail-wrapper text-gray-600">
        {/* Categories */}
        {post.category && (
          <div className="post-meta mb-4">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-gray-400" />
              <a
                href="#"
                style={{ color: '#002fa7' }}
                className="hover:underline text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  onCategoryClick && onCategoryClick(post.category);
                }}
              >
                {post.category}
              </a>
            </div>
          </div>
        )}
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags mb-8">
            <div className="flex items-start gap-2">
              <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <a
                    key={tag}
                    href="#"
                    style={{ color: '#002fa7' }}
                    className="hover:underline text-sm no-underline"
                    onClick={(e) => {
                      e.preventDefault();
                      onTagClick && onTagClick(tag);
                    }}
                  >
                    {tag}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom section: License and Share */}
        <div className="post-tail-bottom flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8 pt-5 border-t border-gray-200">
          <div className="license-wrapper">
            <p className="text-sm text-gray-600">
              This post is licensed under{' '}
              <a
                href="https://creativecommons.org/licenses/by-nc/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#002fa7' }}
                className="hover:underline"
              >
                CC BY-NC 4.0
              </a>
              {' '}by the author.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Share:</span>
            <button 
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
              }}
              aria-label="Share this article"
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
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
