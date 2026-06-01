import React from 'react';
import { Github, Rss, Mail } from 'lucide-react';
import { XIcon } from './XIcon';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="copy">
          © {year} Yuan Wang
        </p>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <a href="#" className="social-link" aria-label="GitHub"><Github className="w-4 h-4" /></a>
          <a href="#" className="social-link" aria-label="Twitter"><XIcon className="w-4 h-4" /></a>
          <a href="/rss.xml" className="social-link" aria-label="RSS"><Rss className="w-4 h-4" /></a>
          <a href="#" className="social-link" aria-label="Email"><Mail className="w-4 h-4" /></a>
        </div>
      </div>
    </footer>
  );
}
