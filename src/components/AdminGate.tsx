import React, { useState } from 'react';

const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY;
const SESSION_KEY = 'blog_admin_authed';

function isAuthed(): boolean {
  if (import.meta.env.DEV) return true;
  if (!ADMIN_KEY) return false;
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(isAuthed);
  const [input, setInput]   = useState('');
  const [error, setError]   = useState(false);

  if (authed) return <>{children}</>;

  // Production with no key configured — admin is inaccessible by design.
  if (!ADMIN_KEY) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === ADMIN_KEY) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setAuthed(true);
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <main className="editorial" style={{ paddingTop: '6rem', textAlign: 'center' }}>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'inline-flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}
      >
        <p className="meta">Admin access required</p>
        <input
          type="password"
          value={input}
          autoFocus
          onChange={(e) => { setInput(e.target.value); setError(false); }}
          placeholder="Enter admin key"
          style={{
            padding: '0.5rem 1rem',
            border: `1px solid ${error ? 'var(--color-red-600)' : 'var(--border-default)'}`,
            borderRadius: '4px',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.875rem',
          }}
        />
        <button
          type="submit"
          className="accent"
          style={{ background: 'none', border: 0, cursor: 'pointer', font: 'inherit' }}
        >
          Unlock
        </button>
      </form>
    </main>
  );
}
