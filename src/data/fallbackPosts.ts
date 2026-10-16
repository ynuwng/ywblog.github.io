import { BlogPost } from '../types';

export const fallbackPosts: BlogPost[] = [
  {
    id: '0dte-options-guide',
    title: '0DTE期权：当日到期合约的交易逻辑与风险结构',
    date: '2026-06-07',
    author: 'Yuan Wang',
    excerpt:
      '0DTE期权在散户和机构中同时爆炸式增长。本文拆解它的Gamma结构、做市商对冲流、常见策略，以及为什么它对市场微观结构的影响远比看上去深远。',
    readTime: '14 min read',
    tags: ['options', 'vol', 'quant', 'derivatives', '期权'],
    category: 'Quant',
  },
  {
    id: 'vol-surface',
    title: 'Reading the volatility surface',
    date: '2026-05-05',
    author: 'Yuan Wang',
    excerpt:
      "A walk through what implied volatility actually means, why the smile and term structure refuse to flatten, and a practical SVI parameterization that fits market quotes well enough to trade against.",
    readTime: '11 min read',
    tags: ['vol', 'options', 'quant', 'math'],
    category: 'Quant',
  },
];
