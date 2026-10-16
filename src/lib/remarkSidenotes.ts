/* Turns GFM footnotes into Tufte-style sidenotes: each `[^id]` reference is
   replaced in place by a numbered marker plus the note body, and the
   footnote definitions are dropped. CSS floats the body into the right
   margin on wide screens and shows it inline under the paragraph otherwise.
   Runs after remark-gfm (and remark-math, so math inside notes still works). */

const el = (tag: string, className: string, children: any[]) => ({
  type: 'sidenotePart',
  data: { hName: tag, hProperties: { className: [className] } },
  children,
});

export function remarkSidenotes() {
  return (tree: any) => {
    const defs = new Map<string, any>();
    tree.children = tree.children.filter((node: any) => {
      if (node.type !== 'footnoteDefinition') return true;
      defs.set(node.identifier, node);
      return false;
    });

    let count = 0;
    const visit = (node: any) => {
      if (!node.children) return;
      node.children = node.children.map((child: any) => {
        if (child.type !== 'footnoteReference' || !defs.has(child.identifier)) {
          visit(child);
          return child;
        }
        const n = String(++count);
        // Note body must be inline (it sits inside a <p>): unwrap paragraphs,
        // separating them with line breaks.
        const body = defs.get(child.identifier).children.flatMap((block: any, i: number) => [
          ...(i > 0 ? [{ type: 'break' }] : []),
          ...(block.type === 'paragraph' ? block.children : [block]),
        ]);
        return el('span', 'sidenote-wrap', [
          el('sup', 'sidenote-ref', [{ type: 'text', value: n }]),
          el('span', 'sidenote', [el('span', 'sidenote-num', [{ type: 'text', value: n }]), ...body]),
        ]);
      });
    };
    visit(tree);
  };
}
