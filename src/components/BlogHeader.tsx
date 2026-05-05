import { Github, Linkedin, Mail, Sun, Moon } from 'lucide-react';
import React from 'react';
import { XIcon } from './XIcon';

type View =
  | 'home'
  | 'archives'
  | 'categories'
  | 'tags'
  | 'about'
  | 'article'
  | 'tagged'
  | 'category';

interface BlogHeaderProps {
  onNavigate: (view: View) => void;
  currentView: View;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const NAV_ITEMS: { key: View; label: string }[] = [
  { key: 'home',       label: 'Home' },
  { key: 'archives',   label: 'Archives' },
  { key: 'categories', label: 'Categories' },
  { key: 'tags',       label: 'Tags' },
  { key: 'about',      label: 'About' },
];

// Map sub-views back to the parent nav item that should appear active.
function effectiveNav(view: View): View {
  if (view === 'tagged') return 'tags';
  if (view === 'category') return 'categories';
  return view;
}

export function BlogHeader({ onNavigate, currentView, theme, onToggleTheme }: BlogHeaderProps) {
  const isInside = currentView === 'article';
  const active = effectiveNav(currentView);

  return (
    <header className="site-header">
      <div className="editorial">
        {/* Top row: wordmark + theme toggle. Stays even inside articles. */}
        <div className="flex items-center justify-between" style={{ paddingTop: '1.75rem', paddingBottom: isInside ? '1.25rem' : '0.5rem' }}>
          <button
            onClick={() => onNavigate('home')}
            className="wordmark"
            aria-label="Go home"
            style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0 }}
          >
            Yuan Wang<span className="dot">.</span>
          </button>
          <button
            onClick={onToggleTheme}
            className="icon-btn"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Tagline + social — hidden inside the article view to keep the page focused */}
        {!isInside && (
          <div style={{ paddingBottom: '1.5rem' }}>
            <p className="tagline">Oaks from little acorns grown.</p>
            <div className="flex gap-4" style={{ marginTop: '0.75rem' }}>
              <a href="#" className="social-link" aria-label="GitHub"><Github className="w-[18px] h-[18px]" /></a>
              <a href="#" className="social-link" aria-label="Twitter"><XIcon className="w-[18px] h-[18px]" /></a>
              <a href="#" className="social-link" aria-label="LinkedIn"><Linkedin className="w-[18px] h-[18px]" /></a>
              <a href="#" className="social-link" aria-label="Email"><Mail className="w-[18px] h-[18px]" /></a>
            </div>
          </div>
        )}

        {/* Nav row — restrained, with a thin underline indicator */}
        <nav
          className="flex flex-wrap"
          style={{ gap: '1.5rem', paddingTop: '0.25rem', paddingBottom: '1.25rem' }}
        >
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`nav-link ${active === item.key ? 'is-active' : ''}`}
              style={{ background: 'none', border: 0, cursor: 'pointer' }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
