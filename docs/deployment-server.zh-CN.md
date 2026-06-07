# 将 Bill Pilot 部署到服务器

[English](./deployment-server.md) | 简体中文 | [繁體中文](./deployment-server.zh-TW.md)

这份文档介绍一种实用的 Linux 服务器部署方式：Node.js、systemd、Caddy 和 HTTPS。它适用于运行 Debian 或 Ubuntu 的 VPS、VDS、独立服务器和家用服务器。

Bill Pilot 会把用户账号和服务/订阅记录存储在服务器端 SQLite 中。如果你从旧的 localStorage 版本升级，账号首次打开应用时会自动把浏览器里的旧服务数据导入 SQLite。

## 一键安装

把域名解析到一台全新的 Debian/Ubuntu 服务器后运行：

```bash
curl -fsSL https://raw.githubusercontent.com/TzeY11/bill-pilot/main/scripts/install-vps.sh -o install-vps.sh
sudo bash install-vps.sh
```

安装脚本会提示你输入域名。运行脚本之前，需要先在 Cloudflare、域名注册商或你的 DNS 服务商后台添加一条指向服务器 IP 的 DNS `A` 记录。

安装脚本会自动安装系统依赖，在需要时安装 Node.js 22，把 Bill Pilot 克隆到 `/opt/bill-pilot`，生成 `.env`，构建应用，创建 systemd 服务，并配置 Caddy 和 HTTPS。

查看安装脚本选项：

```bash
curl -fsSL https://raw.githubusercontent.com/TzeY11/bill-pilot/main/scripts/install-vps.sh -o install-vps.sh
sudo bash install-vps.sh --help
```

## 环境要求

- 一台可以 SSH 登录的 Debian/Ubuntu Linux 服务器
- 一个已经通过 `A` 记录解析到服务器 IP 的域名
- Node.js 22+ 或 24+
- npm
- Git
- Caddy，用于反向代理和 HTTPS

下面的示例使用 Ubuntu/Debian 风格命令。如果你使用其他发行版，请自行调整包管理器命令。

## DNS 设置

运行安装脚本之前，先为你要使用的域名添加 DNS 记录：

```txt
Type: A
Name: bill-pilot
Value: 你的服务器 IPv4 地址
Proxy: 建议首次安装成功前先使用 DNS only
```

例如你的主域名是 `example.com`，这条记录会创建 `bill-pilot.example.com`。

如果你使用 Cloudflare，需要在 Cloudflare 的 DNS records 页面手动添加。Bill Pilot 默认不能自动修改 Cloudflare DNS；除非之后单独接入 Cloudflare API，并由用户提供自己的 API Token。

## 安装运行依赖

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

## 创建应用用户

使用专用用户运行应用，后续维护会更清晰。

```bash
sudo useradd --system --create-home --shell /bin/bash bill-pilot
sudo mkdir -p /opt/bill-pilot
sudo chown bill-pilot:bill-pilot /opt/bill-pilot
```

## 克隆项目

```bash
sudo -u bill-pilot git clone https://github.com/TzeY11/bill-pilot.git /opt/bill-pilot
cd /opt/bill-pilot
```

## 配置环境变量

创建生产环境配置文件：

```bash
sudo -u bill-pilot cp .env.example .env
sudo -u bill-pilot nano .env
```

至少设置：

```env
AUTH_SECRET="replace-with-a-random-secret-at-least-32-characters"
DATABASE_FILE="data/bill-pilot.db"
ALLOW_REGISTRATION="false"
```

`AUTH_SECRET` 必须至少 32 个字符。可以这样生成强随机值：

```bash
openssl rand -base64 32
```

### 环境变量参考

| 变量 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `AUTH_SECRET` | 是 | 无 | 用于签名会话 Cookie 的密钥，至少 32 个字符。 |
| `DATABASE_FILE` | 否 | `data/bill-pilot.db` | SQLite 数据库路径。相对路径会按应用目录解析。 |
| `ALLOW_REGISTRATION` | 否 | `false` | 为 `false` 时只允许第一个账号注册。如需开放更多账号注册，改为 `true` 并重启服务。 |
| `PORT` | 否 | `3000` | `next start` 和 systemd 服务使用的本地端口。 |
| `NODE_ENV` | 否 | systemd 中为 `production` | Next.js 应用运行模式。 |
| `BILL_PILOT_DOMAIN` | 否 | 无 | 安装脚本可选域名输入；未设置时脚本会交互式询问。 |
| `BILL_PILOT_PORT` | 否 | `3000` | 安装脚本可选本地端口输入。 |
| `BILL_PILOT_APP_DIR` | 否 | `/opt/bill-pilot` | 备份脚本可选应用目录覆盖。 |
| `BILL_PILOT_DATABASE_FILE` | 否 | 读取 `.env` | 备份脚本可选数据库路径覆盖。 |
| `BILL_PILOT_BACKUP_DIR` | 否 | `/opt/bill-pilot/backups` | 备份目录覆盖。 |
| `BILL_PILOT_BACKUP_KEEP_DAYS` | 否 | `30` | 旧数据库备份保留天数。 |

默认只允许第一个账号注册。如需允许更多用户创建账号，在 `.env` 中设置 `ALLOW_REGISTRATION=true` 并重启服务。登录限流为 5 分钟内 10 次尝试，注册限流为 1 小时内 5 次尝试。

## 安装并构建

```bash
sudo -u bill-pilot npm install
sudo -u bill-pilot npm run build
```

## 使用 systemd 运行

创建 systemd 服务：

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

启用并启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now bill-pilot
sudo systemctl status bill-pilot
```

查看日志：

```bash
sudo journalctl -u bill-pilot -f
```

## 配置 Caddy 和 HTTPS

编辑 Caddyfile：

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

只要域名已经解析到服务器，并且 80/443 端口可访问，Caddy 会自动申请和续期 HTTPS 证书。

## 首次登录

在浏览器打开你的域名：

```txt
https://bill-pilot.example.com
```

然后从网页界面注册第一个账号。

## 数据和备份

默认 SQLite 数据库位置：

```txt
/opt/bill-pilot/data/bill-pilot.db
```

备份数据库：

```bash
sudo bash /opt/bill-pilot/scripts/backup-db.sh
```

恢复备份时，先停止应用，把备份复制回数据库位置，再启动应用：

```bash
sudo systemctl stop bill-pilot
sudo -u bill-pilot cp /opt/bill-pilot/backups/bill-pilot-YYYYMMDD-HHMMSS.db /opt/bill-pilot/data/bill-pilot.db
sudo systemctl start bill-pilot
```

这个数据库包含用户账号和服务/订阅记录。备份它即可保护主要应用数据。

## 升级

使用升级脚本：

```bash
sudo bash /opt/bill-pilot/scripts/upgrade-server.sh
```

升级脚本会先备份数据库，然后拉取最新代码、安装依赖、重新构建应用，并重启 systemd 服务。

重启后查看日志：

```bash
sudo journalctl -u bill-pilot -f
```

## 常见排查

如果应用无法启动，检查：

- `AUTH_SECRET` 是否已设置，并且至少 32 个字符。
- Node.js 是否为 22+ 或 24+。
- `/opt/bill-pilot/data` 是否能被 `bill-pilot` 用户写入。
- 使用 `sudo journalctl -u bill-pilot -f` 查看服务日志。
- Caddy 是否能访问 `127.0.0.1:3000`。
