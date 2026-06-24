# 禅悦国际瑜伽 · 电子合同系统

> **技术栈**：Next.js 15 · TypeScript · TailwindCSS · Supabase · Prisma

---

## 项目简介

为禅悦国际瑜伽量身定制的电子合同签署系统，支持管理员在后台创建合同并生成分享链接，学员通过微信/手机浏览器打开链接，完成阅读、手写签名后一键签署。合同签署记录包含时间戳和IP地址，具备基本电子存证能力。

---

## 功能清单

| 功能 | 说明 |
|------|------|
| 🔐 管理员登录 | 密码验证，Cookie 鉴权，24小时有效 |
| 📋 新建合同 | 填写学员信息，自动生成合同编号、到期日 |
| 🔗 分享签署链接 | 一键复制链接，可发送至微信 |
| 📄 合同预览 | 完整合同条款展示，含双方信息 |
| ✍️ 手写签名 | Canvas 触屏签名，支持手机和PC |
| 🪪 上传身份证 | 支持拍照上传，存储至 Supabase Storage |
| 🔒 签署锁定 | 签署后自动锁定，无法重复签署 |
| 📊 后台管理 | 查看所有合同、状态统计 |
| 📥 导出 Excel | 一键导出全部合同数据为 xlsx 文件 |
| 🖨️ 打印/PDF | 独立打印页，浏览器直接另存为 PDF |

---

## 目录结构

```
zenyue-yoga-contract/
├── app/
│   ├── page.tsx                         # 首页（跳转后台登录）
│   ├── layout.tsx                       # 根布局
│   ├── globals.css                      # 全局样式
│   ├── contract/
│   │   └── [id]/
│   │       ├── page.tsx                 # 合同查看页（学员）
│   │       ├── sign/page.tsx            # 签名页（学员）
│   │       ├── complete/page.tsx        # 签署完成页
│   │       └── print/page.tsx          # 打印/PDF页
│   ├── admin/
│   │   ├── login/page.tsx               # 管理员登录
│   │   ├── page.tsx                     # 合同列表/Dashboard
│   │   └── contracts/
│   │       ├── new/page.tsx             # 新建合同
│   │       └── [id]/page.tsx            # 合同详情
│   └── api/
│       ├── contracts/
│       │   ├── route.ts                 # POST (创建) / GET (列表)
│       │   └── [id]/
│       │       ├── route.ts             # GET / PATCH
│       │       └── sign/route.ts        # POST 签署
│       ├── export/route.ts              # GET Excel 导出
│       ├── upload/route.ts              # POST 文件上传
│       └── auth/admin/route.ts          # POST 登录 / GET 登出
├── components/
│   ├── ContractDocument.tsx             # 合同正文组件
│   ├── SignatureCanvas.tsx              # 手写签名画布
│   └── ui/
│       ├── Button.tsx                   # 按钮组件
│       └── Badge.tsx                    # 状态徽章
├── lib/
│   ├── prisma.ts                        # Prisma 客户端
│   ├── supabase.ts                      # Supabase 客户端 + 上传工具
│   └── utils.ts                         # 工具函数（合同号、格式化等）
├── types/
│   └── index.ts                         # 类型定义 + 业务常量
├── prisma/
│   └── schema.prisma                    # 数据库模型
├── middleware.ts                        # 管理后台路由守卫
├── .env.example                         # 环境变量模板
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 快速开始

### 1. 克隆项目 & 安装依赖

```bash
git clone <your-repo>
cd zenyue-yoga-contract
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
# 编辑 .env.local，填写以下必要项：
```

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | Supabase PostgreSQL 连接串（带 pgbouncer） |
| `DIRECT_URL` | Supabase 直连地址（Prisma migrate 用） |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key（服务端上传） |
| `ADMIN_PASSWORD` | 管理后台登录密码 |
| `NEXT_PUBLIC_APP_URL` | 部署后的域名（生产环境） |

### 3. 初始化数据库

```bash
npm run db:generate   # 生成 Prisma Client
npm run db:push       # 推送 Schema 到 Supabase PostgreSQL
```

### 4. 配置 Supabase Storage

在 Supabase Dashboard → Storage 中创建以下两个 **Public Bucket**：

| Bucket 名称 | 说明 |
|------------|------|
| `signatures` | 签名图片 |
| `id-cards` | 身份证照片 |

> ⚠️ 设为 Public 后，文件可通过 URL 直接访问。如需私有，需调整 `uploadFile` 逻辑改用 signed URL。

### 5. 启动开发服务器

```bash
npm run dev
# 访问 http://localhost:3000
```

---

## 使用流程

```
管理员                                    学员（手机）
   │                                          │
   ▼                                          │
打开 /admin/login 登录                       │
   │                                          │
   ▼                                          │
/admin → 新建合同                            │
   │  填写学员姓名/手机/身份证               │
   │                                          │
   ▼                                          │
生成合同编号 → 复制分享链接 ──────────────→ 打开链接
                                              │
                                              ▼
                                        阅读合同全文
                                              │
                                              ▼
                                        手指手写签名
                                              │
                                              ▼
                                        上传身份证（可选）
                                              │
                                              ▼
                                        提交签署 ✅
                                              │
   ◀── 后台状态更新为"已签署" ─────────────────┘
   │
   ▼
导出 Excel / 打印合同
```

---

## API 接口说明

### 创建合同
```
POST /api/contracts
Body: { customerName, customerPhone, customerIdCard, customerWechat?, emergencyContact?, emergencyPhone?, notes? }
Response: { success: true, data: Contract }
```

### 获取合同
```
GET /api/contracts/:id
Response: { success: true, data: Contract }
```

### 签署合同
```
POST /api/contracts/:id/sign
Body: { signatureData: "data:image/png;base64,...", idCardFrontData?, idCardBackData? }
Response: { success: true, data: Contract }
```

### 更新合同状态
```
PATCH /api/contracts/:id
Body: { status?: "CANCELLED", notes?: string }
Response: { success: true, data: Contract }
```

### 导出 Excel
```
GET /api/export
Response: .xlsx 文件下载
```

### 管理员登录
```
POST /api/auth/admin
Body: { password: string }
Response: 设置 Cookie 并返回 { success: true }
```

---

## 合同条款内容

合同共包含 **10条条款**：
1. 服务内容（50节私教课程）
2. 课程期限（签约起12个月）
3. 预约规则（提前24小时）
4. 取消规则（12小时前可免费取消）
5. 退款规则（签约后不退款）
6. 健康声明
7. 风险告知
8. 隐私保护
9. 争议处理
10. 电子合同效力声明

---

## 部署建议

### Vercel 部署（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 在 Vercel Dashboard → Settings → Environment Variables 填写 .env.local 的所有变量
```

### 微信分享优化

1. 在 `app/contract/[id]/page.tsx` 的 `metadata` 中添加 Open Graph 图片
2. 配置微信公众号 JS-SDK 可实现更友好的分享卡片（可选）
3. 直接复制链接发送给学员在微信中打开即可，**无需开发小程序**

---

## 安全说明

- 管理员 Token 为 24 小时有效的签名 Cookie
- 生产环境务必设置强密码并启用 HTTPS
- 身份证照片建议设置 Supabase Storage 为私有 Bucket，改用 signed URL 访问
- 建议定期备份 Supabase PostgreSQL 数据库

---

## 技术依赖

| 包 | 版本 | 用途 |
|----|------|------|
| next | 15.1.0 | 框架 |
| @prisma/client | ^5.22 | ORM |
| @supabase/supabase-js | ^2.45 | 后端存储 |
| tailwindcss | ^3.4 | 样式 |
| xlsx | ^0.18 | Excel 导出 |
| zod | ^3.23 | 数据校验 |
| dayjs | ^1.11 | 日期处理 |
| uuid | ^10 | 唯一ID |

---

## License

MIT · 禅悦国际瑜伽 内部系统
