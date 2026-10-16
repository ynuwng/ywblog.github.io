import React, { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Copy, Check } from 'lucide-react';

import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';
import cssLang from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import markdown from 'react-syntax-highlighter/dist/esm/languages/hljs/markdown';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('shell', bash);
SyntaxHighlighter.registerLanguage('css', cssLang);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('jsx', javascript);
SyntaxHighlighter.registerLanguage('tsx', typescript);

interface CodeBlockProps {
  language: string;
  children: string;
}

const syntaxColors: Record<string, string> = {
  '#a0a1a7': 'var(--code-comment)',
  '#a626a4': 'var(--code-keyword)',
  '#e45649': 'var(--code-red)',
  '#0184bb': 'var(--code-cyan)',
  '#50a14f': 'var(--code-green)',
  '#c18401': 'var(--code-number)',
  '#986801': 'var(--code-number)',
  '#4078f2': 'var(--code-blue)',
};

const editorialTheme = {
  ...Object.fromEntries(Object.entries(atomOneLight).map(([selector, rules]) => [
    selector,
    { ...rules, ...(rules.color ? { color: syntaxColors[rules.color] ?? 'var(--text-primary)' } : {}) },
  ])),
  // Give names their own semantic colors instead of sharing number colors.
  'hljs-title': { color: 'var(--code-blue)' },
  'hljs-variable': { color: 'var(--code-variable)' },
  'hljs-template-variable': { color: 'var(--code-variable)' },
  'hljs-attr': { color: 'var(--code-variable)' },
  'hljs-params': { color: 'var(--code-parameter)' },
  'hljs-type': { color: 'var(--code-type)' },
  hljs: {
    ...atomOneLight['hljs'],
    color: 'var(--code-text)',
    background: 'transparent',
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    lineHeight: 1.55,
    padding: '14px 18px',
    margin: 0,
    overflow: 'auto',
    borderRadius: 0,
  },
};

const languageDisplayMap: Record<string, string> = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
  bash: 'sh',
  shell: 'sh',
  css: 'css',
  json: 'json',
  markdown: 'md',
  sql: 'sql',
  tsx: 'tsx',
  jsx: 'jsx',
};

export function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const display = languageDisplayMap[language?.toLowerCase()] || language || 'code';

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="cb-bar">
        <span>{display}</span>
        <button onClick={handleCopy} className="cb-copy" aria-label="Copy code">
          {copied ? (
            <>
              <Check size={12} />
              <span>copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>copy</span>
            </>
          )}
        </button>
      </div>

      <SyntaxHighlighter
        language={language}
        style={editorialTheme}
        showLineNumbers={true}
        customStyle={{ margin: 0, borderRadius: 0, background: 'transparent' }}
        lineNumberStyle={{
          minWidth: '2.5em',
          paddingRight: '1em',
          color: 'var(--text-tertiary)',
          userSelect: 'none',
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}
