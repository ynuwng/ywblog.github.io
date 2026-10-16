import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';
import { BlogPost } from '../types';
import remarkGfm from 'remark-gfm';
import { remarkSidenotes } from '../lib/remarkSidenotes';
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
const HAS_NOTES = /^\[\^[^\]]+\]:/m;

let katexCssPromise: Promise<unknown> | null = null;
const loadKatexCSS = () => {
  katexCssPromise ||= import('katex/dist/katex.min.css');
  return katexCssPromise;
};

type MathPlugins = { remark: any; rehype: any };
type CodeBlockComp = React.ComponentType<{ language: string; children: string }>;

interface ArticleProps {
  post: BlogPost;
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

export function Article({ post, onTagClick }: ArticleProps) {
  const [copied, setCopied] = useState(false);

  const content = useMemo(() => escapeCurrencyDollars(post.content || ''), [post.content]);
  const hasMath = useMemo(() => HAS_MATH.test(content), [content]);
  const hasCode = useMemo(() => HAS_CODE.test(content), [content]);
  const hasNotes = useMemo(() => HAS_NOTES.test(content), [content]);

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
    () => (mathPlugins ? [remarkGfm, mathPlugins.remark, remarkSidenotes] : [remarkGfm, remarkSidenotes]),
    [mathPlugins]
  );
  const rehypePlugins = useMemo(
    () => (mathPlugins ? [mathPlugins.rehype] : []),
    [mathPlugins]
  );

  const proseRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLElement>(null);
  const [tocHidden, setTocHidden] = useState(false);
  const [outline, setOutline] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeHeading, setActiveHeading] = useState('');
  const [tocOpen, setTocOpen] = useState(() => window.matchMedia('(min-width: 769px)').matches);

  useEffect(() => {
    const headings = Array.from(proseRef.current?.querySelectorAll('h2, h3') ?? []);
    const used = new Set<string>();
    const items = headings.map(heading => {
      const text = heading.textContent ?? '';
      const base = slugify(text) || 'section';
      let id = base;
      for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
      used.add(id);
      heading.id = id;
      return { id, text, level: Number(heading.tagName.slice(1)) };
    });
    setOutline(items);
    const updateActive = () => {
      let active = items[0]?.id ?? '';
      proseRef.current?.querySelectorAll('h2, h3').forEach(heading => {
        if (heading.getBoundingClientRect().top <= Math.max(200, window.innerHeight * 0.38 + 2)) active = heading.id;
      });
      setActiveHeading(active);
    };
    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    // Resolve direct chapter links only after the article has rendered.
    if (window.location.hash) {
      try { document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView(); } catch {}
    }
    return () => window.removeEventListener('scroll', updateActive);
  }, [content, mathPlugins]);

  useEffect(() => {
    setTocOpen(window.matchMedia('(min-width: 769px)').matches);
  }, [post.id]);
  useEffect(() => {
    setTocHidden(false);
    let directionStart = window.scrollY;
    let previousY = window.scrollY;
    let direction = 0;
    const updateVisibility = () => {
      const y = Math.max(0, window.scrollY);
      const nextDirection = Math.sign(y - previousY);
      if (nextDirection && nextDirection !== direction) {
        directionStart = previousY;
        direction = nextDirection;
      }
      previousY = y;
      const toc = tocRef.current;
      if (!toc || y <= 0 || toc.getBoundingClientRect().top > 0) {
        setTocHidden(false);
        return;
      }
      // Ignore small scroll movements so the directory does not flicker.
      if (Math.abs(y - directionStart) >= 12) {
        setTocHidden(direction > 0);
      }
    };
    window.addEventListener('scroll', updateVisibility, { passive: true });
    return () => window.removeEventListener('scroll', updateVisibility);
  }, [post.id, outline.length >= 2]);

  const title = formatMixedText(post.title);
  // Keep IDs deterministic on every render, including repeated headings.
  const headingIds = new Set<string>();
  const headingId = (text: string) => {
    const base = slugify(text) || 'section';
    let id = base;
    for (let n = 2; headingIds.has(id); n++) id = `${base}-${n}`;
    headingIds.add(id);
    return id;
  };

  return (
    <div className={`article-page fade-in${hasNotes ? ' has-sidenotes' : ''}`}>
      <article>
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

        {/* Contents — inline, so the right margin stays free for sidenotes */}
        {outline.length >= 2 && (
          <nav ref={tocRef} className={`article-toc${tocHidden ? ' is-hidden' : ''}`}
            aria-label="Contents" aria-hidden={tocHidden}
            {...(tocHidden ? { inert: '' } : {})}>
            <details open={tocOpen} onToggle={(e) => setTocOpen(e.currentTarget.open)}>
              <summary>Contents <span>{outline.length} sections</span></summary>
              <ol>
                {outline.map((h, i) => (
                  <li key={h.id} className={h.level === 3 ? 'toc-subsection' : undefined}>
                    <span className="toc-num">{String(i + 1).padStart(2, '0')}</span>
                    <a href={`#${encodeURIComponent(h.id)}`} lang={textLang(h.text)}
                      aria-current={activeHeading === h.id ? 'location' : undefined}
                      onClick={(e) => {
                        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                        if (window.matchMedia('(max-width: 768px)').matches) setTocOpen(false);
                      }}>{h.text}</a>
                  </li>
                ))}
              </ol>
            </details>
          </nav>
        )}

        {/* Body */}
        <div className="prose" ref={proseRef}>
          <ReactMarkdown
            remarkPlugins={remarkPlugins}
            rehypePlugins={rehypePlugins}
            components={{
              pre({ node, children, ...props }) {
                const code = node?.children?.[0];
                const classes = code?.type === 'element' ? code.properties?.className : undefined;
                // Highlighted blocks supply their own pre and themed wrapper.
                if (Array.isArray(classes) && classes.some(name => String(name).startsWith('language-'))) {
                  return <>{children}</>;
                }
                return <pre {...props}>{children}</pre>;
              },
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
                const isExternal = /^(https?:)?\/\//i.test(href);
                const isHashOnly = href.startsWith('#');
                const isBareId = /^[\w-]+$/.test(href);
                const isInternalArticle = href.startsWith('/article/') || isBareId;
                const displayHref = isBareId ? `/article/${encodeURIComponent(href)}` : href;
                const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                  if (isInternalArticle && !isHashOnly) {
                    e.preventDefault();
                    window.history.pushState(null, '', displayHref);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    // Article loading resolves any chapter hash after rendering.
                    if (!displayHref.includes('#')) window.scrollTo({ top: 0 });
                  }
                };

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
                const id = headingId(text);
                return <h2 id={id} lang={textLang(text)}>{formatMixedChildren(children)}</h2>;
              },
              h3({ children }) {
                const text = formatMixedText(childrenText(children));
                const id = headingId(text);
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
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'copied' : 'copy link'}</span>
            </button>
          </div>
        </div>
      </article>

    </div>
  );
}

function formatDate(s: string): string {
  const d = new Date(s);
  // mono uppercase, e.g. "APR 28, 2026"
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
