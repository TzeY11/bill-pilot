# Bill Pilot

[![English](https://img.shields.io/badge/lang-English-blue.svg)](./README.md)
[![简体中文](https://img.shields.io/badge/lang-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-red.svg)](./README.zh-CN.md)

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

## 自托管部署

这是在自己的 VPS 上运行 Bill Pilot 的推荐生产部署方式。

Bill Pilot 目前有一个重要的本地优先限制：用户账号存储在服务器端 SQLite 中，但服务/订阅记录仍然存储在每个用户浏览器的 localStorage 中。在服务数据迁移到后端之前，SQLite 备份只保护账号数据，服务数据需要手动从浏览器侧导出或迁移。

### 一键安装

把域名解析到 VPS 后，在一台全新的 Debian/Ubuntu VPS 上运行：

```bash
curl -fsSL https://raw.githubusercontent.com/TzeY11/bill-pilot/main/scripts/install-vps.sh | sudo bash -s -- --domain bill-pilot.example.com
```

把 `bill-pilot.example.com` 替换成你的真实域名。安装脚本会自动安装系统依赖，在需要时安装 Node.js 22，把 Bill Pilot 克隆到 `/opt/bill-pilot`，生成 `.env`，构建应用，创建 systemd 服务，并配置 Caddy 和 HTTPS。

### 环境要求

- 一台可以 SSH 登录的 Linux VPS
- 一个已经解析到 VPS 的域名
- Node.js 22+ 或 24+
- npm
- Git
- Caddy，用于反向代理和 HTTPS

### 安装依赖

```bash
sudo apt update
sudo apt install -y git curl caddy
```

安装 Node.js 22+ 或 24+。例如使用 NodeSource：

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

### 创建应用用户

```bash
sudo useradd --system --create-home --shell /bin/bash bill-pilot
sudo mkdir -p /opt/bill-pilot
sudo chown bill-pilot:bill-pilot /opt/bill-pilot
```

### 克隆项目

```bash
sudo -u bill-pilot git clone https://github.com/TzeY11/bill-pilot.git /opt/bill-pilot
cd /opt/bill-pilot
```

### 配置环境变量

```bash
sudo -u bill-pilot cp .env.example .env
sudo -u bill-pilot nano .env
```

至少设置：

```env
AUTH_SECRET="replace-with-a-random-secret-at-least-32-characters"
DATABASE_FILE="data/bill-pilot.db"
```

可以这样生成强随机 `AUTH_SECRET`：

```bash
openssl rand -base64 32
```

### 安装并构建

```bash
sudo -u bill-pilot npm install
sudo -u bill-pilot npm run build
```

### 使用 systemd 运行

创建服务文件：

```bash
sudo nano /etc/systemd/system/bill-pilot.service
```

写入：

```ini
[Unit]
Description=Bill Pilot
After=network.target

[Service]
Type=simple
User=bill-pilot
Group=bill-pilot
WorkingDirectory=/opt/bill-pilot
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

启动应用：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now bill-pilot
sudo systemctl status bill-pilot
```

查看日志：

```bash
sudo journalctl -u bill-pilot -f
```

### 配置 Caddy 和 HTTPS

编辑 Caddy 配置：

```bash
sudo nano /etc/caddy/Caddyfile
```

使用你的真实域名：

```caddyfile
bill-pilot.example.com {
  reverse_proxy 127.0.0.1:3000
}
```

重载 Caddy：

```bash
sudo systemctl reload caddy
```

只要域名已经解析到 VPS，并且 80/443 端口可访问，Caddy 会自动申请和续期 HTTPS 证书。

### 首次登录

打开你的域名：

```txt
https://bill-pilot.example.com
```

然后在网页界面注册第一个账号。

### 数据和备份

默认 SQLite 账号数据库位置：

```txt
/opt/bill-pilot/data/bill-pilot.db
```

创建备份目录：

```bash
sudo mkdir -p /opt/bill-pilot/backups
sudo chown bill-pilot:bill-pilot /opt/bill-pilot/backups
```

备份数据库：

```bash
sudo -u bill-pilot cp /opt/bill-pilot/data/bill-pilot.db /opt/bill-pilot/backups/bill-pilot-$(date +%F).db
```

恢复备份：

```bash
sudo systemctl stop bill-pilot
sudo -u bill-pilot cp /opt/bill-pilot/backups/bill-pilot-YYYY-MM-DD.db /opt/bill-pilot/data/bill-pilot.db
sudo systemctl start bill-pilot
```

注意：服务/订阅记录目前存储在浏览器 localStorage 中，不在 SQLite 数据库里。SQLite 备份可以保护账号数据，但暂时不会备份服务列表。

### 升级

先备份数据库，然后执行：

```bash
cd /opt/bill-pilot
sudo -u bill-pilot git pull
sudo -u bill-pilot npm install
sudo -u bill-pilot npm run build
sudo systemctl restart bill-pilot
```

### 常见排查

- `AUTH_SECRET` 必须设置，并且至少 32 个字符。
- Node.js 必须是 22+ 或 24+。
- `/opt/bill-pilot/data` 必须能被 `bill-pilot` 用户写入。
- 使用 `sudo journalctl -u bill-pilot -f` 查看日志。
- 确认 Caddy 可以访问 `127.0.0.1:3000`。

安装脚本：[scripts/install-vps.sh](./scripts/install-vps.sh)。

独立部署文档见 [docs/deployment-vps.md](./docs/deployment-vps.md)。

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
