import React from 'react';
import { Sun, Moon } from 'lucide-react';

type View =
  | 'home'
  | 'archives'
  | 'categories'
  | 'tags'
  | 'about'
  | 'article'
  | 'tagged'
  | 'category'
  | 'admin';

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

function effectiveNav(view: View): View {
  if (view === 'tagged')   return 'tags';
  if (view === 'category') return 'categories';
  return view;
}

export function BlogHeader({ onNavigate, currentView, theme, onToggleTheme }: BlogHeaderProps) {
  const active = effectiveNav(currentView);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        {/* Wordmark — mono uppercase signature with em-dash tagline */}
        <button onClick={() => onNavigate('home')} className="wordmark" aria-label="Go home">
          YUAN WANG
          <span className="em-dash">—</span>
          <span className="domains">ai · quant · signal</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <nav className="site-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`nav-link ${active === item.key ? 'is-active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <button
            onClick={onToggleTheme}
            className="icon-btn"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
