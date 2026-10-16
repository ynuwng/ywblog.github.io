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
          <a href="https://github.com/ynuwng" className="social-link" aria-label="GitHub"><Github size={16} /></a>
          <a href="https://x.com/ynuwng" className="social-link" aria-label="X"><XIcon size={16} /></a>
          <a href="/rss.xml" className="social-link" aria-label="RSS"><Rss size={16} /></a>
          <a href="mailto:ynuwng@gmail.com" className="social-link" aria-label="Email"><Mail size={16} /></a>
        </div>
      </div>
    </footer>
  );
}
