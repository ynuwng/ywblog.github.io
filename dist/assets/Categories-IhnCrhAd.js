import{j as e}from"./markdown-vendor-DiBYG1S_.js";import{F as t}from"./folder-ISPMT_3-.js";import{c as s}from"./index-Dq9GetHC.js";import"./react-vendor-DJcYfsJ3.js";import"./syntax-vendor-DsKRSHuS.js";import"./ui-vendor-0n-_plnJ.js";
/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const r=s("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);function a({posts:s,onCategoryClick:a}){const n=s.reduce((e,t)=>(e[t.category]=(e[t.category]||0)+1,e),{}),o=Object.entries(n).map(([e,t])=>({name:e,count:t}));return e.jsx("main",{className:"max-w-3xl mx-auto px-6 py-16",children:e.jsx("div",{className:"space-y-4",children:o.map(s=>e.jsxs("button",{onClick:()=>a(s.name),className:"w-full flex items-center gap-3 p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left group text-[15px]",children:[e.jsx(t,{className:"w-5 h-5 text-gray-400 flex-shrink-0"}),e.jsx("span",{className:"text-[#002fa7] flex-1 text-[15px]",children:s.name}),e.jsxs("span",{className:"text-gray-500 text-sm mr-2",children:[s.count," post",s.count>1?"s":""]}),e.jsx(r,{className:"w-5 h-5 text-gray-400 flex-shrink-0"})]},s.name))})})}export{a as Categories};
