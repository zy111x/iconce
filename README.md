# Icon Studio

一个为个人使用重新整理的轻量级在线图标工作台，基于 Next.js 和 Lucide。

## 功能

- Lucide 图标搜索与实时预览
- 文字与 Emoji 图标
- 双颜色渐变、角度与预设
- 图标颜色、尺寸与画布尺寸
- 圆角、边框与径向高光
- SVG / PNG 本地导出
- 复制 SVG 源码
- `/api/svg` 动态 SVG 接口
- 响应式桌面与移动端布局

## 已移除

为了自用和低维护成本，项目不再包含：

- 登录 / OAuth / NextAuth
- 用户、会员、积分与额度系统
- Prisma / PostgreSQL
- Redis / Upstash
- LemonSqueezy 支付与 Billing
- Dashboard
- 反馈 / Contact / Discord 等 SaaS 入口
- Contentlayer 文档系统

因此部署不需要数据库，也不需要环境变量。

## 本地运行

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm start
```

## Vercel

直接将仓库导入 Vercel 即可：

- Framework Preset: Next.js
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: 使用 Next.js 默认值
- Environment Variables: 无

建议先部署 `feat/icon-studio-vercel` 分支作为 Preview，验证后再合并到 `main`。

## SVG API

示例：

```text
/api/svg?type=svg&value=Sparkles&totalSize=256&primaryColor=%23FC466B&secondaryColor=%233F5EFB&angle=45&radius=64&color=%23FFFFFF&size=128
```

## License

保留原项目 LICENSE。
