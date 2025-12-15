import { ImageWithFallback } from './figma/ImageWithFallback';

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
                                       ^""""""""'
  `;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* ASCII Art Panda */}
      <div className="flex justify-center mb-12">
        <pre className="text-gray-900 text-[6px] sm:text-[8px] md:text-xs leading-tight font-mono whitespace-pre overflow-x-auto">
{pandaAscii}
        </pre>
      </div>

      {/* Self Introduction */}
      <div className="space-y-6 text-gray-600 leading-relaxed">
        <p>
          &gt; Hi, I'm Yuan Wang, a software engineer passionate about building scalable systems and elegant solutions to complex problems. <br></br>&gt; With years of experience in distributed systems, full-stack development, and cloud architecture, I've had the privilege of working on projects that serve millions of users and push the boundaries of what's possible with modern technology. <br></br>&gt; My journey in tech has been driven by curiosity and a relentless pursuit of excellence.
        </p>
        <p>
          &gt; When I'm not coding or writing about technology, you'll find me exploring new programming languages, contributing to open-source projects, or diving deep into system design patterns. <br></br>&gt; I believe in the power of sharing knowledge and learning from the community, which is why I maintain this blog to document my experiences, insights, and lessons learned along the way. <br></br>&gt; Feel free to reach out if you'd like to discuss technology, collaborate on interesting projects, or just have a conversation about the future of software engineering.
        </p>
      </div>
    </div>
  );
}