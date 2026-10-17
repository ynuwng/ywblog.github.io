# 安全修复上线记录

日期：2026-10-17。发布目标：GitHub `ynuwng/ywblog.github.io`、网站 `https://ynuwng.com/`、Supabase 项目 `qmocohsuzslotpuaazlk`。

## 已完成的后端与数据库操作

- 应用数据库迁移 `20261017004208_harden_blog_database_permissions`。anon/authenticated 对文章表仅保留 SELECT，管理员表没有这些角色的表授权；保留服务端写权限，文章数仍为 6。
- 轮换 `BLOG_ADMIN_KEY` 为随机生成的 64 字符密钥，设置管理浏览器来源为 localhost:3000 和 127.0.0.1:3000。原管理密钥已失效。
- 密钥仅设置为 Supabase 服务端 secret，并在本机忽略文件 `.env.admin.local` 中留存一份，文件权限为 0600。没有写入前端、Git 提交或报告。建议保存到密码管理器。需要管理文章时启动本地开发站点，输入该文件中的 `BLOG_ADMIN_KEY` 值。
- 部署 Edge Function `make-server-860c354e` 第 5 版，保留 `verify_jwt = true`。另发现保留旧代码的重复函数 `quick-handler`，已保留其路由与服务状态并同步升级至第 5 版，源码复用主函数，未执行停用。
- 线上探测通过：公开文章列表 200；无密钥/错误密钥创建请求 401；新密钥通过鉴权后，空文章请求按预期返回 400；匿名直接数据库更新与管理员表读取均返回 401。测试没有创建或修改文章。
- 修复后的 Supabase security advisor 返回 0 条告警。

## 前端发布内容

本次提交包含更新后的生产资源、生产环境移除管理面板、依赖安全升级、安全回归测试，以及收紧权限的 GitHub Actions 工作流。已通过 GitHub Pages 工作流发布，发布提交为 `a1c03cd73d839243cb64d9caa0a21e29a3ea47ab`；[Actions 运行记录](https://github.com/ynuwng/ywblog.github.io/actions/runs/38987738865) 中 build 与 deploy 均成功。线上首页返回 200 并引用新版入口资源，该资源与 RSS 均返回 200。

发布前验证：12 项安全测试通过；完整 npm audit 0 个已知漏洞；生产构建成功并获取最新 RSS；dist 不包含 Admin 模块。

## 范围

本次处理仓库安全审计中的上线事项。未修改 Cloudflare DNS、HSTS、DMARC 或账户 MFA；这些属于另一组账户与域名配置事项。
