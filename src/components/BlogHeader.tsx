import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Mark } from './Mark';

type View = 'home' | 'about' | 'article' | 'tagged' | 'admin';

interface BlogHeaderProps {
  onNavigate: (view: View) => void;
  currentView: View;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const NAV_ITEMS: { key: View; label: string }[] = [
  { key: 'home',  label: 'Writing' },
  { key: 'about', label: 'About' },
];

function effectiveNav(view: View): View {
  if (view === 'tagged' || view === 'article') return 'home';
  return view;
}

export function BlogHeader({ onNavigate, currentView, theme, onToggleTheme }: BlogHeaderProps) {
  const active = effectiveNav(currentView);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        {/* Wordmark — signal glyph + mono uppercase signature */}
        <button onClick={() => onNavigate('home')} className="wordmark" aria-label="Go home">
          <Mark />
          YUAN'S BLOG
        </button>

        <div className="header-actions">
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
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
