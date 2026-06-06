# 将 Bill Pilot 部署到 VPS

[English](./deployment-vps.md) | 简体中文

这份文档介绍一种实用的 VPS 部署方式：Node.js、systemd、Caddy 和 HTTPS。

Bill Pilot 目前有一个重要的本地优先限制：用户账号存储在服务器端 SQLite 中，但服务/订阅记录仍然存储在每个用户浏览器的 localStorage 中。在服务数据迁移到后端之前，请备份 SQLite 数据库来保护账号数据，并手动导出或迁移浏览器中的服务数据。

## 一键安装

把域名解析到一台全新的 Debian/Ubuntu VPS 后运行：

```bash
curl -fsSL https://raw.githubusercontent.com/TzeY11/bill-pilot/main/scripts/install-vps.sh | sudo bash -s -- --domain bill-pilot.example.com
```

把 `bill-pilot.example.com` 替换成你的真实域名。安装脚本会自动安装系统依赖，在需要时安装 Node.js 22，把 Bill Pilot 克隆到 `/opt/bill-pilot`，生成 `.env`，构建应用，创建 systemd 服务，并配置 Caddy 和 HTTPS。

查看安装脚本选项：

```bash
curl -fsSL https://raw.githubusercontent.com/TzeY11/bill-pilot/main/scripts/install-vps.sh | sudo bash -s -- --help
```

## 环境要求

- 一台可以 SSH 登录的 Linux VPS
- 一个已经解析到 VPS 的域名
- Node.js 22+ 或 24+
- npm
- Git
- Caddy，用于反向代理和 HTTPS

下面的示例使用 Ubuntu/Debian 风格命令。如果你使用其他发行版，请自行调整包管理器命令。

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
```

`AUTH_SECRET` 必须至少 32 个字符。可以这样生成强随机值：

```bash
openssl rand -base64 32
```

`DATABASE_FILE` 默认会按项目目录解析；如果你提供绝对路径，则使用绝对路径。

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

只要域名已经解析到 VPS，并且 80/443 端口可访问，Caddy 会自动申请和续期 HTTPS 证书。

## 首次登录

在浏览器打开你的域名：

```txt
https://bill-pilot.example.com
```

然后从网页界面注册第一个账号。

## 数据和备份

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

恢复备份时，先停止应用，把备份复制回数据库位置，再启动应用：

```bash
sudo systemctl stop bill-pilot
sudo -u bill-pilot cp /opt/bill-pilot/backups/bill-pilot-YYYY-MM-DD.db /opt/bill-pilot/data/bill-pilot.db
sudo systemctl start bill-pilot
```

注意：服务/订阅记录目前存储在浏览器 localStorage 中，不在 SQLite 数据库里。SQLite 备份可以保护账号数据，但暂时不会备份服务列表。

## 升级

升级前先备份数据库。

```bash
cd /opt/bill-pilot
sudo -u bill-pilot git pull
sudo -u bill-pilot npm install
sudo -u bill-pilot npm run build
sudo systemctl restart bill-pilot
```

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
