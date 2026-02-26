import ReactMarkdown from 'react-markdown';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Folder, Tag, Copy, Check } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { BlogPost } from '../types';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Lazy load KaTeX CSS only when Article component is rendered (reduces initial bundle)
const loadKatexCSS = () => {
  if (typeof document !== 'undefined' && !document.querySelector('link[href*="katex"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
    link.integrity = 'sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
};

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

  // Load KaTeX CSS on component mount (lazy loading)
  useEffect(() => {
    loadKatexCSS();
  }, []);

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
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            code({ node, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const codeString = String(children).replace(/\n$/, '');
              const isInline = !match && !(node?.properties?.className as string[] | undefined)?.length;

              return !isInline && match ? (
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
              const href = props.href || '';
              const isExternal = href.startsWith('http://') || href.startsWith('https://');
              const isHashOnly = href.startsWith('#') && !href.includes('/');
              // Treat any non-external, non-hash-only link as an internal article link
              const isInternalArticle = !isExternal && !isHashOnly && href.length > 0;
              
              // Handle different types of links
              const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                if (isHashOnly) {
                  // Table of contents link - scroll to section
                  e.preventDefault();
                  const targetId = href.slice(1);
                  const element = document.getElementById(targetId);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                } else if (isInternalArticle) {
                  // Internal article link - use hash routing
                  e.preventDefault();
                  console.log('Internal link clicked:', href);
                  
                  // If it's already in the format /article/123, use it directly
                  if (href.startsWith('/article/') || href.startsWith('article/')) {
                    const articlePath = href.startsWith('/') ? href.slice(1) : href;
                    window.location.hash = `#/${articlePath}`;
                  } else {
                    // Otherwise, treat it as an article ID
                    const articleId = href.startsWith('/') ? href.slice(1) : href;
                    window.location.hash = `#/article/${articleId}`;
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                // External links will behave normally with target="_blank"
              };
              
              return (
                <a
                  {...props}
                  href={href}
                  onClick={handleClick}
                  style={{ color: '#002fa7' }}
                  className="hover:underline"
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
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
                <blockquote className="my-6 pl-4 border-l-4 border-gray-300 text-gray-600 italic text-[15px] leading-[1.8]" {...props}>
                  {children}
                </blockquote>
              );
            },
            h2({ node, children, ...props }) {
              // Generate ID from heading text for table of contents
              const text = typeof children === 'string' ? children : 
                           Array.isArray(children) ? children.join('') : '';
              const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
              
              return (
                <h2 id={id} className="mt-10 mb-5 text-[18px]" {...props}>
                  {children}
                </h2>
              );
            },
            h3({ node, children, ...props }) {
              // Generate ID from heading text for table of contents
              const text = typeof children === 'string' ? children : 
                           Array.isArray(children) ? children.join('') : '';
              const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
              
              return (
                <h3 id={id} className="mt-8 mb-4 text-[16px]" {...props}>
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
            table({ node, children, ...props }) {
              return (
                <div className="overflow-x-auto my-6">
                  <table className="min-w-full border border-gray-200 rounded-lg" {...props}>
                    {children}
                  </table>
                </div>
              );
            },
            thead({ node, children, ...props }) {
              return (
                <thead className="bg-gray-50" {...props}>
                  {children}
                </thead>
              );
            },
            tbody({ node, children, ...props }) {
              return (
                <tbody className="bg-white" {...props}>
                  {children}
                </tbody>
              );
            },
            tr({ node, children, ...props }) {
              return (
                <tr className="border-b border-gray-200" {...props}>
                  {children}
                </tr>
              );
            },
            th({ node, children, ...props }) {
              return (
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300" {...props}>
                  {children}
                </th>
              );
            },
            td({ node, children, ...props }) {
              return (
                <td className="px-4 py-3 text-sm text-gray-800" {...props}>
                  {children}
                </td>
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
