import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Folder, Copy, Check } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { BlogPost } from '../types';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

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

/* Slugify heading text for anchor IDs (used for TOC + KaTeX equation hash links) */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

/* Extract h2 outline from markdown source so the TOC can pre-render
   alongside the article (no DOM scrape, no flash). */
function extractH2s(md: string): { id: string; text: string }[] {
  const lines = md.split('\n');
  const out: { id: string; text: string }[] = [];
  let inFence = false;
  for (const ln of lines) {
    const fence = /^```/.test(ln);
    if (fence) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = /^##\s+(.+?)\s*$/.exec(ln);
    if (m) {
      const text = m[1].replace(/\s*#*\s*$/, '');
      out.push({ id: slugify(text), text });
    }
  }
  return out;
}

export function Article({ post, onCategoryClick, onTagClick }: ArticleProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => { loadKatexCSS(); }, []);

  const outline = useMemo(() => extractH2s(post.content || ''), [post.content]);
  const showRails = outline.length >= 2;

  return (
    <div className={showRails ? 'layout fade-in' : 'fade-in'}>
      {/* Left rail: TOC */}
      {showRails && (
        <aside className="left-rail">
          <div className="rail-section">
            <h3 className="rail-label">Contents</h3>
            <div className="rail-body">
              {outline.map((h, i) => (
                <div key={h.id} style={{ marginBottom: '6px', display: 'flex', gap: '8px' }}>
                  <span className="mono" style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <a
                    href={`#${h.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(h.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    {h.text}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}

      <article className={showRails ? 'main-col' : 'editorial main-col-narrow'}>
        {/* Header */}
        <header className="article-head">
          <h1 className="article-title">{post.title}</h1>
          <div className="article-meta">
            <span>{formatDate(post.date)}</span>
            <span className="sep">·</span>
            <span>by <em>{post.author}</em></span>
            <span className="sep">·</span>
            <span>{post.readTime}</span>
          </div>
        </header>

        <hr className="rule" style={{ marginBottom: '24px' }} />

        {/* Body */}
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
                    // In-page TOC anchor — smooth-scroll.
                    e.preventDefault();
                    const el = document.getElementById(href.slice(1));
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else if (isInternalArticle) {
                    // Internal article link — clean URL via history API.
                    e.preventDefault();
                    let path = href.startsWith('/') ? href : '/' + href;
                    if (!/^\/article\//.test(path)) path = '/article' + path; // bare ID → /article/<id>
                    window.history.pushState(null, '', path);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                };

                // For internal links, present the canonical clean URL in the href attribute
                // so middle-click / "open in new tab" still works.
                let displayHref = href;
                if (isInternalArticle) {
                  let path = href.startsWith('/') ? href : '/' + href;
                  if (!/^\/article\//.test(path)) path = '/article' + path;
                  displayHref = path;
                }

                return (
                  <a
                    {...props}
                    href={displayHref}
                    onClick={handleClick}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                  >
                    {children}
                  </a>
                );
              },
              h2({ children }) {
                const text = typeof children === 'string'
                  ? children
                  : Array.isArray(children) ? children.join('') : '';
                const id = slugify(text);
                return <h2 id={id}>{children}</h2>;
              },
              h3({ children }) {
                const text = typeof children === 'string'
                  ? children
                  : Array.isArray(children) ? children.join('') : '';
                const id = slugify(text);
                return <h3 id={id}>{children}</h3>;
              },
              /* Render images as proper <figure>s — alt-text becomes the caption.
                 Absolute paths (`/figures/...`) are rewritten to respect Vite's
                 deploy base, so subpath deploys (GitHub Pages, etc.) work. */
              img({ src, alt, ...rest }) {
                const base = (import.meta as any).env?.BASE_URL || '/';
                const resolved =
                  typeof src === 'string' && src.startsWith('/') && !src.startsWith('//')
                    ? base.replace(/\/$/, '') + src
                    : src;
                return (
                  <figure>
                    <img src={resolved} alt={alt} {...rest} />
                    {alt && <figcaption>{alt}</figcaption>}
                  </figure>
                );
              },
              /* Markdown wraps lone-image paragraphs in <p>; unwrap so the figure
                 doesn't sit inside a paragraph (which is invalid HTML). */
              p({ node, children, ...props }) {
                const onlyChild = (node?.children?.length === 1 && node.children[0]) as any;
                if (onlyChild && onlyChild.type === 'element' && onlyChild.tagName === 'img') {
                  return <>{children}</>;
                }
                return <p {...props}>{children}</p>;
              },
            }}
          >
            {post.content || ''}
          </ReactMarkdown>
        </div>

        {/* Tail */}
        <div className="article-tail">
          {post.category && (
            <div className="article-tail-row">
              <span className="label">Category</span>
              <button
                className="accent-link"
                onClick={() => onCategoryClick && onCategoryClick(post.category)}
              >
                {post.category}
              </button>
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="article-tail-row" style={{ alignItems: 'center' }}>
              <span className="label">Tags</span>
              <span className="tag-strip">
                {post.tags.map((tag, i) => (
                  <React.Fragment key={tag}>
                    {i > 0 && <span className="sep">·</span>}
                    <button onClick={() => onTagClick && onTagClick(tag)}>{tag}</button>
                  </React.Fragment>
                ))}
              </span>
            </div>
          )}

          <div
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              gap: '14px', flexWrap: 'wrap',
              paddingTop: '14px', marginTop: '16px',
              borderTop: '0.5px solid var(--border-faint)',
            }}
          >
            <p className="meta" style={{ margin: 0, textTransform: 'none' }}>
              <span style={{ textTransform: 'uppercase' }}>License </span>
              <a
                href="https://creativecommons.org/licenses/by-nc/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent)', textDecoration: 'none', borderBottom: '0.5px solid var(--accent)' }}
              >
                CC BY-NC 4.0
              </a>
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="cb-copy"
              style={{ font: 'inherit', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.04em', color: 'var(--text-tertiary)' }}
              aria-label="Copy link to this article"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'copied' : 'copy link'}</span>
            </button>
          </div>
        </div>
      </article>

      {/* Right rail — empty stub; reserved for footnotes / references */}
      {showRails && <aside className="right-rail" />}
    </div>
  );
}

function formatDate(s: string): string {
  const d = new Date(s);
  // mono uppercase, e.g. "APR 28, 2026"
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
