import React from 'react';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="editorial" style={{ paddingTop: '1.5rem', paddingBottom: '1.75rem' }}>
        <p className="copy" style={{ textAlign: 'center', margin: 0 }}>
          © {year} Yuan Wang &nbsp;·&nbsp; Oaks from little acorns grown.
        </p>
      </div>
    </footer>
  );
}
