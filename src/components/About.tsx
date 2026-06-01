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
          figure out for work — a derivation that didn't click on the first read,
          a piece of infrastructure that took longer than expected, an
          experiment that produced a result I couldn't yet explain. Writing it
          down is how I make sure I actually understood it.
        </p>
        <p>
          Day-to-day I work on distributed systems, full-stack platforms and
          cloud architecture. The topics here lean toward the parts I find most
          interesting: machine learning theory, time-series and signal
          processing, quantitative methods, and the occasional embedded-systems
          rabbit hole. The bias is toward depth over breadth — when in doubt,
          I'd rather post one careful 3000-word note than five shallow ones.
        </p>
        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          If anything here resonates — disagreement included — I'd love to hear
          from you.
        </p>
      </div>

      {/* Mono signature footer */}
      <div
        style={{
          marginTop: '64px',
          paddingTop: '20px',
          borderTop: '0.5px solid var(--border-faint)',
        }}
      >
        <p className="meta" style={{ margin: 0 }}>
          Yuan's Blog
        </p>
      </div>
    </main>
  );
}
