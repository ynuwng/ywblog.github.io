import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';
import { BlogPost } from '../types';
import remarkGfm from 'remark-gfm';
import {
  childrenText,
  formatMixedChildren,
  formatMixedText,
  textLang,
} from '../lib/mixedTypography';

/* Heavy renderers are pulled in only when the article content actually needs them:
   - KaTeX (remark-math + rehype-katex + local CSS chunk) only when $...$ or $$...$$ is present.
   - Syntax highlighter (react-syntax-highlighter + hljs themes) only when ``` fences exist.
   This keeps math-free / code-free posts cheap. */

const HAS_MATH = /(^|[^\\])\$[^$\n]+\$|^\$\$|\n\$\$/;
const HAS_CODE = /^```|\n```/;

let katexCssPromise: Promise<unknown> | null = null;
const loadKatexCSS = () => {
  katexCssPromise ||= import('katex/dist/katex.min.css');
  return katexCssPromise;
};

type MathPlugins = { remark: any; rehype: any };
type CodeBlockComp = React.ComponentType<{ language: string; children: string }>;

interface ArticleProps {
  post: BlogPost;
  onBack: () => void;
  onCategoryClick?: (category: string) => void;
  onTagClick?: (tag: string) => void;
}

/* Slugify heading text for anchor IDs (used for TOC + KaTeX equation hash links) */
function slugify(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}_-]/gu, '');
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
      const text = formatMixedText(m[1].replace(/\s*#*\s*$/, ''));
      out.push({ id: slugify(text), text });
    }
  }
  return out;
}

function escapeCurrencyDollars(md: string): string {
  const lines = md.split('\n');
  let inFence = false;
  let inDisplayMath = false;

  return lines.map(line => {
    if (/^```/.test(line)) {
      inFence = !inFence;
      return line;
    }

    if (!inFence && /^\s*\$\$\s*$/.test(line)) {
      inDisplayMath = !inDisplayMath;
      return line;
    }

    if (inFence || inDisplayMath) return line;

    return line.replace(/(^|[^\\])\$(?=\d+(?:[.,，。！？；：、\s]|$))/g, '$1\\$');
  }).join('\n');
}

export function Article({ post, onCategoryClick, onTagClick }: ArticleProps) {
  const [copied, setCopied] = useState(false);

  const content = useMemo(() => escapeCurrencyDollars(post.content || ''), [post.content]);
  const hasMath = useMemo(() => HAS_MATH.test(content), [content]);
  const hasCode = useMemo(() => HAS_CODE.test(content), [content]);

  const [mathPlugins, setMathPlugins] = useState<MathPlugins | null>(null);
  const [CodeBlock, setCodeBlock] = useState<CodeBlockComp | null>(null);

  useEffect(() => {
    if (!hasMath) return;
    Promise.all([import('remark-math'), import('rehype-katex'), loadKatexCSS()]).then(([r, h]) => {
      setMathPlugins({ remark: r.default, rehype: h.default });
    });
  }, [hasMath]);

  useEffect(() => {
    if (!hasCode) return;
    import('./CodeBlock').then(m => setCodeBlock(() => m.CodeBlock));
  }, [hasCode]);

  const remarkPlugins = useMemo(
    () => (mathPlugins ? [remarkGfm, mathPlugins.remark] : [remarkGfm]),
    [mathPlugins]
  );
  const rehypePlugins = useMemo(
    () => (mathPlugins ? [mathPlugins.rehype] : []),
    [mathPlugins]
  );

  const outline = useMemo(() => extractH2s(content), [content]);
  const showRails = outline.length >= 2;
  const title = formatMixedText(post.title);

  return (
    <div className={showRails ? 'layout fade-in' : 'fade-in'}>
      {/* Left rail — empty stub; reserved for future use */}
      {showRails && <aside className="left-rail" />}

      <article className={showRails ? 'main-col' : 'editorial main-col-narrow'}>
        {/* Header */}
        <header className="article-head">
          <h1 className="article-title" lang={textLang(title)}>{title}</h1>
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
            remarkPlugins={remarkPlugins}
            rehypePlugins={rehypePlugins}
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');
                const isInline = !match && !(node?.properties?.className as string[] | undefined)?.length;
                if (isInline || !match) {
                  return <code {...props}>{children}</code>;
                }
                // Fenced block: render via lazy-loaded highlighter once available,
                // otherwise fall back to a styled <pre> so the page paints immediately.
                return CodeBlock ? (
                  <CodeBlock language={match[1]}>{codeString}</CodeBlock>
                ) : (
                  <div className="code-block-wrapper code-block-plain">
                    <pre>
                      <code>{codeString}</code>
                    </pre>
                  </div>
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
                    lang={textLang(childrenText(children))}
                  >
                    {formatMixedChildren(children)}
                  </a>
                );
              },
              h2({ children }) {
                const text = formatMixedText(childrenText(children));
                const id = slugify(text);
                return <h2 id={id} lang={textLang(text)}>{formatMixedChildren(children)}</h2>;
              },
              h3({ children }) {
                const text = formatMixedText(childrenText(children));
                const id = slugify(text);
                return <h3 id={id} lang={textLang(text)}>{formatMixedChildren(children)}</h3>;
              },
              li({ children, ...props }) {
                const text = childrenText(children);
                return <li {...props} lang={textLang(text)}>{formatMixedChildren(children)}</li>;
              },
              strong({ children, ...props }) {
                const text = childrenText(children);
                return <strong {...props} lang={textLang(text)}>{formatMixedChildren(children)}</strong>;
              },
              em({ children, ...props }) {
                const text = childrenText(children);
                return <em {...props} lang={textLang(text)}>{formatMixedChildren(children)}</em>;
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
                const text = childrenText(children);
                return <p {...props} lang={textLang(text)}>{formatMixedChildren(children)}</p>;
              },
            }}
          >
            {content}
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

      {/* Right rail: TOC */}
      {showRails && (
        <aside className="right-rail">
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
    </div>
  );
}

function formatDate(s: string): string {
  const d = new Date(s);
  // mono uppercase, e.g. "APR 28, 2026"
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
