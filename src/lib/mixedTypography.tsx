import React from 'react';

const CJK_RE = /[\u3400-\u9FFF\uF900-\uFAFF]/;
const CJK = '[\\u3400-\\u9FFF\\uF900-\\uFAFF]';
const WESTERN = '[A-Za-z0-9@#$%&+=]';

const cjkBeforeWestern = new RegExp(`(${CJK})(${WESTERN})`, 'g');
const westernBeforeCjk = new RegExp(`(${WESTERN})(${CJK})`, 'g');
const skipChildTags = new Set(['code', 'pre', 'kbd', 'samp']);
const skipChildClasses = new Set([
  'katex',
  'katex-display',
  'katex-html',
  'math',
  'math-display',
  'math-inline',
]);

export function hasCjkText(text: string | null | undefined): boolean {
  return Boolean(text && CJK_RE.test(text));
}

export function textLang(text: string | null | undefined): 'zh-CN' | undefined {
  return hasCjkText(text) ? 'zh-CN' : undefined;
}

export function formatMixedText(text: string): string {
  if (!hasCjkText(text)) return text;

  return text
    .replace(/\s+([，。！？；：、）】》」』])/g, '$1')
    .replace(/([（【《「『“‘])\s+/g, '$1')
    .replace(cjkBeforeWestern, '$1 $2')
    .replace(westernBeforeCjk, '$1 $2')
    .replace(/\s{2,}/g, ' ');
}

export function childrenText(children: React.ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(childrenText).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return childrenText(children.props.children);
  }
  return '';
}

export function formatMixedChildren(children: React.ReactNode): React.ReactNode {
  if (typeof children === 'string') return formatMixedText(children);
  if (typeof children === 'number') return children;
  if (Array.isArray(children)) return children.map(formatMixedChildren);
  if (!React.isValidElement<{ children?: React.ReactNode }>(children)) return children;

  if (typeof children.type === 'string' && skipChildTags.has(children.type)) {
    return children;
  }

  const className = children.props.className;
  const classNames = Array.isArray(className) ? className : String(className || '').split(/\s+/);
  if (classNames.some(name => skipChildClasses.has(name))) {
    return children;
  }

  return React.cloneElement(children, {
    children: formatMixedChildren(children.props.children),
  });
}
