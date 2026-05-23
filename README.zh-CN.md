# Bill Pilot

Bill Pilot 是一个个人账单与续费管理面板，用来管理 VPS、服务器、域名、软件会员、游戏服务和各种周期性订阅费用。

当前版本是本地优先版本，并已加入账号登录：

- Next.js App Router
- TypeScript
- Tailwind CSS
- localStorage 本地持久化
- 原生 SQLite 用户数据库
- 邮箱和密码注册 / 登录

## 功能

- Dashboard 显示预计月支出和年支出
- 支持浅色、深色和跟随系统主题
- 支持在常见国际货币中选择统一显示币种，并使用缓存汇率进行换算
- 显示 3 天内和 14 天内即将续费的服务
- 显示已过期或暂停、需要检查的服务数量
- 按分类统计月支出
- 服务列表支持搜索、筛选、排序和响应式展示
- 支持添加、编辑、删除服务
- 内置常用服务图标，也支持上传自定义图标
- 可用品牌图标由 `react-icons` / Simple Icons 提供
- 续费状态标签：Expired、Urgent、Soon、Normal
- 内置示例数据，启动后可以直接查看效果
- Dashboard、Services 和 Account 页面会受到登录保护

## 项目结构

```txt
bill-pilot/
  src/
    app/
      account/page.tsx
      api/auth/login/route.ts
      api/auth/logout/route.ts
      api/auth/me/route.ts
      api/auth/register/route.ts
      layout.tsx
      login/page.tsx
      page.tsx
      register/page.tsx
      services/page.tsx
      globals.css
    components/
      AccountView.tsx
      AppShell.tsx
      AuthForm.tsx
      CategoryBreakdown.tsx
      DashboardView.tsx
      MetricCard.tsx
      RenewalList.tsx
      ServiceFormModal.tsx
      ServiceIcon.tsx
      ServiceTable.tsx
      ServiceToolbar.tsx
      ServicesView.tsx
      StatusBadge.tsx
      UserMenu.tsx
    data/
      sample-services.ts
    hooks/
      useExchangeRates.ts
      useServices.ts
    lib/
      auth-constants.ts
      billing.ts
      exchange-rates.ts
      server/auth.ts
      server/db.ts
      service-icons.ts
      storage.ts
    types/
      billing.ts
  next.config.ts
  tailwind.config.ts
  postcss.config.mjs
  tsconfig.json
  package.json
```

## 安装依赖

```bash
cd bill-pilot
npm install
cp .env.example .env
```

如果你的电脑没有 `npm`，请先从 https://nodejs.org 安装 Node.js，或者使用兼容的包管理器，例如 `pnpm` 或 `yarn`。

当前后端使用 Node 原生 SQLite 模块，建议使用 Node.js 22+ 或 24+。

## 启动开发服务器

```bash
npm run dev
```

然后打开：

```txt
http://localhost:3000
```

## 构建生产版本

```bash
npm run build
npm run start
```

## 数据存储

用户账号会存储在本地 SQLite 数据库中，默认位置：

```txt
data/bill-pilot.db
```

服务数据目前仍然存储在浏览器 localStorage 中，key 为：

```txt
bill-pilot-services
```

首次打开时，Bill Pilot 会使用 `src/data/sample-services.ts` 中的示例数据初始化 localStorage。

Dashboard 的汇率数据和用户选择的显示币种也会缓存在 localStorage 中。

## 汇率

Bill Pilot 使用免费的 Frankfurter API 获取汇率，并在本地缓存 6 小时。如果网络请求失败，应用会优先使用上一次缓存的汇率。

## 后续接入数据库的建议

如果你之后要把服务数据也迁移到后端，优先从这些文件开始改：

- `src/types/billing.ts`：保留或扩展服务数据模型。
- `src/lib/server/db.ts`：新增服务表和数据库查询逻辑。
- `src/lib/storage.ts`：把 localStorage 读写替换成 API 调用。
- `src/hooks/useServices.ts`：改成通过后端获取、创建、更新和删除服务。
- `src/lib/exchange-rates.ts`：把汇率获取迁移到服务端 API 或定时缓存。
- `src/data/sample-services.ts`：改成数据库 seed 脚本或 demo fixture。
- `src/app/services/page.tsx` 和 `src/app/page.tsx`：如果 hook API 保持稳定，页面本身基本不用大改。

下一步可以把服务数据迁移进 SQLite/PostgreSQL，并补充部署文档和自动备份。
