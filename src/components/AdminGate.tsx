import React, { useState } from 'react';
import { ADMIN_SESSION_KEY, setAdminKey } from '../lib/adminSession';

function isAuthed(): boolean {
  return Boolean(sessionStorage.getItem(ADMIN_SESSION_KEY));
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(isAuthed);
  const [input, setInput]   = useState('');
  const [error, setError]   = useState(false);

  if (authed) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const key = input.trim();
    if (key) {
      setAdminKey(key);
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
