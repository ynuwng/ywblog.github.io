import React from 'react';

export function About() {
  return (
    <main className="editorial fade-in">
      <h2 className="rail-label">About</h2>
      <h1 className="hero" style={{ fontSize: '28px', marginBottom: '14px' }}>
        Yuan Wang
      </h1>
      <p className="hero-tagline" style={{ marginBottom: '36px' }}>
        Software engineer working at the intersection of AI, quantitative
        research, and signal processing.
      </p>

      <div className="prose">
        <p>
          I write here to think out loud. Most posts start as something I had to
          figure out — a derivation that didn't click on the first read, an
          experiment that produced a result I couldn't yet explain. Writing it
          down is how I make sure I actually understood it.
        </p>
        <p>
          The topics lean toward machine learning theory, time-series and
          signal processing, and quantitative methods. The bias is toward depth
          over breadth — when in doubt, I'd rather post one careful 3000-word
          note than five shallow ones.
        </p>
        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          If anything here resonates — disagreement included — I'd love to hear
          from you.
        </p>
      </div>
    </main>
  );
}
