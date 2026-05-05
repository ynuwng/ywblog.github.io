import React from 'react';

export function About() {
  const pandaAscii = `
                              _,add8ba,
                            ,d888888888b,
                           d8888888888888b                        _,ad8ba,_
                          d888888888888888)                     ,d888888888b,
                          I8888888888888888 _________          ,8888888888888b
                __________\`Y88888888888888P"""""""""""baaa,__ ,888888888888888,
            ,adP"""""""""""9888888888P""^                 ^""Y8888888888888888I
         ,a8"^           ,d888P"888P^                           ^"Y8888888888P'
       ,a8^            ,d8888'                                     ^Y8888888P'
      a88'           ,d8888P'                                        I88P"^
    ,d88'           d88888P'                                          "b,
   ,d88'           d888888'                                            \`b,
  ,d88'           d888888I                                              \`b,
  d88I           ,8888888'            ___                                \`b,
 ,888'           d8888888          ,d88888b,              ____            \`b,
 d888           ,8888888I         d88888888b,           ,d8888b,           \`b
,8888           I8888888I        d8888888888I          ,88888888b           8,
I8888           88888888b       d88888888888'          8888888888b          8I
d8886           888888888       Y888888888P'           Y8888888888,        ,8b
88888b          I88888888b      \`Y8888888^             \`Y888888888I        d88,
Y88888b         \`888888888b,      \`""""^                \`Y8888888P'       d888I
\`888888b         88888888888b,                           \`Y8888P^        d88888
 Y888888b       ,8888888888888ba,_          _______        \`""^        ,d888888
 I8888888b,    ,888888888888888888ba,_     d88888888b               ,ad8888888I
 \`888888888b,  I8888888888888888888888b,    ^"Y888P"^      ____.,ad88888888888I
  88888888888b,\`888888888888888888888888b,     ""      ad888888888888888888888'
  8888888888888698888888888888888888888888b_,ad88ba,_,d88888888888888888888888
  88888888888888888888888888888888888888888b,\`"""^ d8888888888888888888888888I
  888888888888888888888888888888888888888888baaad888888888888888888888888888'
  Y8888888888888888888888888888888888888888888888888888888888888888888888888P
  I888888888888888888888888888888888888888888888P^  ^Y8888888888888888888888'
  \`Y88888888888888888P88888888888888888888888888'     ^88888888888888888888I
   \`Y8888888888888888 \`8888888888888888888888888       8888888888888888888P'
    \`Y888888888888888  \`888888888888888888888888,     ,888888888888888888P'
     \`Y88888888888888b  \`88888888888888888888888I     I888888888888888888'
       "Y8888888888888b  \`8888888888888888888888I     I88888888888888888'
         "Y88888888888P   \`888888888888888888888b     d8888888888888888'
            ^""""""""^     \`Y88888888888888888888,    888888888888888P'
                              "8888888888888888888b,   Y888888888888P^
                              \`Y888888888888888888b   \`Y8888888P"^
                                "Y8888888888888888P     \`""""^
                                  \`"YY88888888888P'
                                       ^""""""""'`;

  return (
    <main className="editorial fade-in" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <h1 className="year-head" style={{ marginBottom: '1.25rem' }}>About</h1>
      <hr className="rule" style={{ marginBottom: '2rem' }} />

      <div className="prose">
        <p>
          Hi, I'm <strong>Yuan Wang</strong> — a software engineer drawn to scalable systems
          and elegant solutions to messy problems. Over the years I've worked across distributed
          systems, full-stack development, and cloud architecture, on products serving millions of
          users.
        </p>
        <p>
          When I'm not coding or writing here, you'll find me poking at new languages, reading
          system-design papers, or contributing back to the open-source projects I depend on.
          This blog is a kind of working notebook — a place to think out loud, distill what I've
          learned, and trade notes with anyone walking the same path.
        </p>
        <p style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>
          If any of this resonates, drop me a line.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem', opacity: 0.45 }}>
        <pre
          className="font-mono whitespace-pre overflow-x-auto"
          style={{
            fontSize: '6px',
            lineHeight: 1.05,
            color: 'var(--ink-faint)',
          }}
        >
          {pandaAscii}
        </pre>
      </div>
    </main>
  );
}
