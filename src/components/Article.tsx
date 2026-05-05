import ReactMarkdown from 'react-markdown';
import React, { useState, useEffect } from 'react';
import { Folder, Tag as TagIcon, Copy, Check } from 'lucide-react';
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

export function Article({ post, onBack, onCategoryClick, onTagClick }: ArticleProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => { loadKatexCSS(); }, []);

  return (
    <article className="editorial fade-in" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '2.5rem' }}>
        <h1
          style={{
            fontSize: '32px',
            lineHeight: 1.25,
            fontWeight: 700,
            letterSpacing: '-0.015em',
            color: 'var(--ink)',
            marginBottom: '14px',
          }}
        >
          {post.title}
        </h1>

        <div className="meta">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span className="meta-sep" />
          <span>by <em style={{ fontStyle: 'italic', color: 'var(--ink-muted)' }}>{post.author}</em></span>
          <span className="meta-sep" />
          <span>{post.readTime}</span>
        </div>
      </header>

      <hr className="rule" style={{ marginBottom: '2.25rem' }} />

      {/* Content */}
      <div className="prose">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            code({ node, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const codeString = String(children).replace(/\n$/, '');
              const isInline = !match && !(node?.properties?.className as string[] | undefined)?.length;

              return !isInline && match ? (
                <CodeBlock language={match[1]}>{codeString}</CodeBlock>
              ) : (
                <code {...props}>{children}</code>
              );
            },
            a({ node, children, ...props }) {
              const href = props.href || '';
              const isExternal = href.startsWith('http://') || href.startsWith('https://');
              const isHashOnly = href.startsWith('#') && !href.includes('/');
              const isInternalArticle = !isExternal && !isHashOnly && href.length > 0;

              const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                if (isHashOnly) {
                  e.preventDefault();
                  const targetId = href.slice(1);
                  const element = document.getElementById(targetId);
                  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else if (isInternalArticle) {
                  e.preventDefault();
                  if (href.startsWith('/article/') || href.startsWith('article/')) {
                    const articlePath = href.startsWith('/') ? href.slice(1) : href;
                    window.location.hash = `#/${articlePath}`;
                  } else {
                    const articleId = href.startsWith('/') ? href.slice(1) : href;
                    window.location.hash = `#/article/${articleId}`;
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              };

              return (
                <a
                  {...props}
                  href={href}
                  onClick={handleClick}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                >
                  {children}
                </a>
              );
            },
            h2({ children, ...props }) {
              const text = typeof children === 'string'
                ? children
                : Array.isArray(children) ? children.join('') : '';
              const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
              return <h2 id={id} {...props}>{children}</h2>;
            },
            h3({ children, ...props }) {
              const text = typeof children === 'string'
                ? children
                : Array.isArray(children) ? children.join('') : '';
              const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
              return <h3 id={id} {...props}>{children}</h3>;
            },
          }}
        >
          {post.content || ''}
        </ReactMarkdown>
      </div>

      {/* Tail: category + tags + share */}
      <div style={{ marginTop: '3.5rem' }}>
        {post.category && (
          <div className="flex items-center" style={{ gap: '8px', marginBottom: '10px' }}>
            <Folder className="w-[14px] h-[14px]" style={{ color: 'var(--ink-faint)' }} />
            <a
              href="#"
              className="link-accent"
              style={{ fontSize: '14px' }}
              onClick={(e) => { e.preventDefault(); onCategoryClick && onCategoryClick(post.category); }}
            >
              {post.category}
            </a>
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center flex-wrap" style={{ gap: '6px', marginBottom: '1.5rem' }}>
            <TagIcon className="w-[14px] h-[14px]" style={{ color: 'var(--ink-faint)', marginRight: '2px' }} />
            {post.tags.map((tag) => (
              <button
                key={tag}
                className="tag-pill"
                onClick={() => onTagClick && onTagClick(tag)}
                style={{
                  backgroundColor: 'var(--tag-light-bg)',
                  color: 'var(--tag-light-text)',
                  border: 0,
                  cursor: 'pointer',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <hr className="rule" style={{ margin: '1.75rem 0' }} />

        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between"
          style={{ gap: '0.75rem' }}
        >
          <p className="meta" style={{ margin: 0 }}>
            Licensed under{' '}
            <a
              href="https://creativecommons.org/licenses/by-nc/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="link-accent"
            >
              CC BY-NC 4.0
            </a>
          </p>

          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 2000);
            }}
            className="meta flex items-center"
            style={{ gap: '6px', background: 'none', border: 0, cursor: 'pointer' }}
            aria-label="Copy link to this article"
          >
            {isCopied ? <Check className="w-[14px] h-[14px]" /> : <Copy className="w-[14px] h-[14px]" />}
            <span>{isCopied ? 'Copied' : 'Copy link'}</span>
          </button>
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
    year: 'numeric',
  });
}
