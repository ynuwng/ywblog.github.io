# 安全审计报告

> 下文记录初次审计时的状态。2026-10-17 后续已执行线上修复，最新部署与验证情况见 [DEPLOYMENT.md](DEPLOYMENT.md)。

审计日期：2026-10-17（Europe/Rome）。范围：当前 Git 仓库、可达 Git 历史、npm 锁定依赖，以及与仓库对应的 Supabase `Blog` 项目。线上检查仅读取权限、策略和已部署函数代码，未发布服务、修改线上授权或写入文章。

## 结论

未发现服务端密钥已泄漏的证据，也未发现匿名用户可绕过当前 RLS 直接写入文章的证据。线上 `posts`、`admins` 均开启 RLS，Supabase 安全顾问返回 0 条告警。但线上仍有多余的表级权限；本地建库脚本原本缺失保护措施；线上旧函数仍存在输入校验和错误信息泄漏问题。本地修复不会自动改变这些线上状态。

## 发现与处理

| 优先级 | 发现与证据 | 本次处理 / 剩余工作 |
| --- | --- | --- |
| 高 | 原始 npm 扫描：18 个受影响依赖节点（11 高、3 中、4 低）。包括 Vite 6.3.5 的开发服务器文件读取漏洞及 Hono 4.11.1 的多项漏洞；具体可利用性取决于使用的功能，并非全部直接影响线上页面。 | 更新兼容依赖、Vite 至 6.4.4、Hono 至 4.13.13；移除未使用的 cssnano；修复后的完整 npm audit 为 0。固定 Supabase 和通配符直接依赖版本。 |
| 高 | `migration.sql` 原本既无 RLS，也无撤销默认角色授权。重建环境时，保护措施可能缺失。当前线上已开启 RLS，因此不能把脚本缺陷等同于线上已失守。 | 建库脚本增加 RLS、显式只读授权和服务端写权限。既有线上库需另行审核并运行 `harden-database.sql`。 |
| 中 | 线上 `posts` 对 anon/authenticated 仍授予 INSERT、UPDATE、DELETE、TRUNCATE、TRIGGER、REFERENCES；`admins` 两角色仍有 TRUNCATE、TRIGGER、REFERENCES。匿名写入受现有 RLS 限制，但 TRUNCATE 不受 RLS 约束。未发现暴露 TRUNCATE 的 RPC，也未尝试执行破坏性操作。 | 已准备撤销多余授权的 SQL。尚未应用线上。默认授权问题应通过 grants 和 RLS 两层处理，参见 [Supabase 官方说明](https://supabase.com/docs/guides/api/securing-your-api)。 |
| 中 | PUT 原本把任意额外 JSON 字段传给高权限数据库客户端；详情查询和写入响应原本使用 `select(*)`，未来新增内部列可能自动对外暴露。 | 两份函数源码均加入字段白名单、类型/长度/日期/标签校验、显式读取列和响应白名单。尚需部署函数。 |
| 中 | 线上及原仓库函数直接返回数据库异常详情；请求体无限制。 | 统一脱敏错误、错误/写入响应禁止缓存，限制请求体 1 MiB，鉴权先于请求体解析与数据库访问。尚需部署函数。 |
| 中 | 管理面板原本只隐藏生产环境的入口按钮，`/admin` 仍可访问且生成管理模块。浏览器 sessionStorage 原本持久保存共享管理密钥。后端本身仍要求密钥，面板可见并不等于可越权写入。 | 生产路由与管理模块同时关闭；管理密钥改为内存保存，刷新后重新输入；清理旧 sessionStorage 记录。已重建 dist，确认无 Admin 模块。 |
| 低 | 管理写请求原本允许任意来源跨域；管理密钥无最低长度要求，直接字符串比较。 | 写请求 CORS 改为可配置来源列表；密钥要求至少 32 字符，比较前先计算固定长度摘要。CORS 不是鉴权，非浏览器客户端仍必须靠密钥限制。 |
| 低 | KaTeX 0.16.x 存在已有原型污染下绕过 trust 限制的问题。未在仓库中发现可触发的原型污染入口。 | 更新并统一依赖树中的 KaTeX 至已修复版本 0.18.2；公式渲染与恶意链接回归测试通过。参见 [KaTeX 官方公告](https://github.com/KaTeX/KaTeX/security/advisories/GHSA-238p-pmpm-9mq7)。 |
| 低 | 部署工作流原本让安装/构建步骤持有 Pages 写权限与 OIDC 权限。 | 这些权限仅授予 deploy job；构建增加依赖漏洞检查和安全回归检查。 |

## 线上权限核查

- `posts` 与 `admins`：`relrowsecurity = true`。
- `posts`：公开 SELECT 策略为 true，符合公开博客设计。匿名角色只读计数查询返回 6 篇文章，未读取文章正文。
- 匿名角色没有适用的写入策略；表级 INSERT 授权本身并不绕过 RLS。
- `admins`：anon/authenticated 均没有 SELECT 表权限，未读取管理员记录。
- `Admins can read admins` 策略自引用 `admins`；文章管理员写策略也查询该表，而 authenticated 没有该表 SELECT 权限。这是存在递归/权限错误的潜在功能问题，不构成已确认的越权路径。当前仓库通过 Edge Function 的共享密钥写入，未使用该直接数据库管理员通道。硬化脚本关闭直接客户端写入；若未来采用 Supabase Auth 管理后台，应重新设计并测试管理员策略。
- `service_role` 仍拥有文章写权限；服务端钥匙应只保存在 Edge Function secrets 中。
- 已部署函数版本为 3，`verify_jwt = true`。浏览器公开 anon JWT 可以通过网关的 JWT 检查，所以每一个写路由仍必须独立验证管理密钥。
- Supabase 安全顾问返回 0 条告警。此结果不能替代上述实际授权检查。

## 密钥扫描

扫描了初始工作区的 169 个已跟踪文件，以及所有可达分支历史中的 875 个 blob；检查 service_role JWT、Supabase secret key、私钥及常见云/GitHub/OpenAI token 格式。没有发现匹配的敏感凭据。扫描不输出凭据原文，也不能证明任意自定义口令从未泄漏。

生成文件中的 project ID 和 anon key 是公开客户端配置，本次未改动。其可见不等于数据库管理权限泄漏；真正的访问边界在 grants、RLS 和服务端鉴权。

`.gitignore` 已增加环境文件、私钥和 Supabase 临时目录规则；忽略规则不会移除历史上已经提交的文件。本次未改写 Git 历史。

## 验证与限制

- `npm audit`：修复前 18，修复后 0 个已知受影响依赖节点。
- `npm run test:security`：12 项通过。覆盖匿名/错误凭据拒绝、弱密钥失败关闭、字段越权、畸形 JSON、日期与类型校验、响应字段隔离、异常脱敏、已知/未知 Content-Length 的超大请求拒绝、管理跨域预检、合法创建与更新、两份函数源码一致、数学渲染及恶意链接拒绝。
- 后端测试运行真实 Hono 路由和处理器，模拟数据库；没有向线上发送创建、更新或删除请求。没有安装 Deno，因此未验证真实 Supabase Edge Runtime 的部署与启动。
- `npm run build` 通过；生产包没有 Admin 模块。RSS 网络请求受当前环境网络限制失败，按原有逻辑复用原 dist/rss.xml。
- `git diff --check` 通过。
- SQL 硬化脚本已按线上角色与表结构审阅，尚未在数据库执行验证，不能视为线上权限已修复。
- 仍使用共享管理密钥，没有独立管理员身份、会话失效机制或分布式速率限制。建议在网关配置写接口速率限制；后续需要多人管理时改用经过服务端验证的 Supabase Auth + 明确管理员授权。
- GitHub Pages 不执行 `public/_headers`；仓库也未配置 CSP。未发现 Markdown 启用原始 HTML 或不安全链接协议。若加上 CSP、frame-ancestors 等响应头，应在支持它们的托管/代理层配置并检查实际 HTTP 响应；现有内联路由脚本需要 hash/nonce 兼容。

## 部署步骤（尚未执行）

1. 确认网站通过当前 Edge Function 写入，不依赖直接 Data API 管理员写入。审核 `security/harden-database.sql`，在 Supabase SQL Editor 中执行，并检查脚本末尾的角色授权及 RLS 查询。该脚本保留数据，撤销客户端直接写入权限，锁住可选的管理员与旧 KV 表。
2. 在 Supabase Edge Function secrets 中设置随机生成、至少 32 字符的 `BLOG_ADMIN_KEY`；已有短密钥需先轮换，否则新版函数将返回 503 并拒绝写入。按实际开发地址设置 `BLOG_ADMIN_ORIGINS`。默认只允许 localhost:3000 与 127.0.0.1:3000 的浏览器管理请求。不要用 VITE_ 前缀保存秘密。
3. 部署 `supabase/functions/make-server-860c354e/index.ts`，保持 JWT 网关验证开启。两份后端源码已经同步。GitHub Pages 的部署不会发布该函数。
4. 发布更新后的前端与 dist。检查公开列表/详情、无密钥写入被拒绝、合法管理密钥可以正常保存文章、生产 `/admin` 不显示管理面板。
5. 再运行 Supabase security advisor、角色权限查询与 `npm audit`。本次未修改线上任何配置，不应将本地修复视为部署完成。
