# Icon Studio

一个面向个人使用的轻量级在线图标工作台，保留原版 Iconce 的核心编辑体验，同时移除了登录、会员、计费、数据库等 SaaS 逻辑。

## 功能

- 原版三栏工作流：左侧素材、中央实时预览、右侧样式参数
- 完整 Lucide 图标搜索、分页与选择
- 文字图标、完整 Emoji 选择器、本地 SVG 上传
- Undo / Redo / Reset All，支持 `Ctrl/Cmd + Z`、`Ctrl/Cmd + Shift + Z` 与 `Ctrl + Y`
- Linear / Solid 填充、双颜色渐变、角度、16 组预设
- SVG 渐变动画与 Clip
- Radial glare、Noise texture 与透明度控制
- 图标颜色、字体、尺寸与画布尺寸
- 边框宽度、颜色、透明度与圆角
- SVG / PNG 下载、复制 SVG、复制 PNG、分享链接
- `/api/svg` 动态 SVG 接口，支持 HTML / Markdown URL
- 桌面端与移动端响应式布局

## 技术栈

- Next.js 16
- React 19
- TypeScript 5
- Lucide

项目采用 local-first 设计，不需要数据库、Redis、OAuth、支付服务，也不需要环境变量。

## 本地运行

```bash
npm install
npm run dev
```

质量检查与生产构建：

```bash
npm run typecheck
npm run build
npm start
```

## Vercel

直接将仓库导入 Vercel：

- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: Next.js 默认值
- Environment Variables: 无
- Production Branch: `main`

非 `main` 分支会继续作为 Preview Deployment 使用。

## SVG API

示例：

```text
/api/svg?type=svg&value=Sparkles&totalSize=256&fillType=Linear&primaryColor=%23FC466B&secondaryColor=%233F5EFB&angle=45&radius=64&color=%23FFFFFF&size=128
```

常用参数包括：`type`、`value`、`totalSize`、`fillType`、`primaryColor`、`secondaryColor`、`angle`、`animate`、`clip`、`radialGlare`、`noiseTexture`、`noiseOpacity`、`radius`、`strokeSize`、`strokeColor`、`strokeOpacity`、`color`、`size`、`family`。

## 已移除

- 登录 / OAuth / NextAuth
- 用户、会员、积分与额度系统
- Prisma / PostgreSQL
- Redis / Upstash
- LemonSqueezy 支付与 Billing
- Dashboard
- Feedback / Contact / Discord 等 SaaS 入口
- Contentlayer / MDX 旧文档系统

## License

保留原项目 LICENSE。
