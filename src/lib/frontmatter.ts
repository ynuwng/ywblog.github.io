import { BlogPost } from '../types';

export type ParsedFrontmatter = {
  meta: Partial<BlogPost & { tagsString: string }>;
  body: string;
};

// Recognized keys: title, date, author, category, tags, readTime, excerpt.
// Tags accept "a, b, c" or YAML "[a, b, c]".
export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const fmMatch = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/m.exec(raw);
  if (!fmMatch) return { meta: {}, body: raw };
  const [, fmRaw, body] = fmMatch;

  const meta: ParsedFrontmatter['meta'] = {};
  fmRaw.split('\n').forEach((line) => {
    const m = /^([\w-]+)\s*:\s*(.*)$/.exec(line);
    if (!m) return;
    const key = m[1].trim().toLowerCase();
    let val = m[2].trim();

    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    switch (key) {
      case 'title':    meta.title = val; break;
      case 'date':     meta.date = val; break;
      case 'author':   meta.author = val; break;
      case 'category': meta.category = val; break;
      case 'readtime': meta.readTime = val; break;
      case 'excerpt':  meta.excerpt = val; break;
      case 'tags': {
        const stripped = val.replace(/^\[|\]$/g, '');
        meta.tagsString = stripped
          .split(/[,\s]+/)
          .map((t) => t.replace(/['"]/g, '').trim())
          .filter(Boolean)
          .join(', ');
        break;
      }
    }
  });

  return { meta, body: body.trim() };
}
