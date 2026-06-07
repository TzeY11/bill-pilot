# 將 Bill Pilot 部署到伺服器

[English](./deployment-server.md) | [简体中文](./deployment-server.zh-CN.md) | 繁體中文

這份文件介紹一種實用的 Linux 伺服器部署方式：Node.js、systemd、Caddy 和 HTTPS。它適用於執行 Debian 或 Ubuntu 的 VPS、VDS、獨立伺服器和家用伺服器。

Bill Pilot 會把使用者帳號和服務/訂閱記錄儲存在伺服器端 SQLite 中。如果你從舊的 localStorage 版本升級，帳號首次開啟應用時會自動把瀏覽器裡的舊服務資料匯入 SQLite。

## 一鍵安裝

把網域解析到一台全新的 Debian/Ubuntu 伺服器後執行：

```bash
curl -fsSL https://raw.githubusercontent.com/TzeY11/bill-pilot/main/scripts/install-vps.sh -o install-vps.sh
sudo bash install-vps.sh
```

安裝腳本會提示你輸入網域。執行腳本之前，需要先在 Cloudflare、網域註冊商或你的 DNS 服務商後台新增一條指向伺服器 IP 的 DNS `A` 記錄。

安裝腳本會自動安裝系統依賴，在需要時安裝 Node.js 22，把 Bill Pilot 複製到 `/opt/bill-pilot`，產生 `.env`，建置應用，建立 systemd 服務，並設定 Caddy 和 HTTPS。

查看安裝腳本選項：

```bash
curl -fsSL https://raw.githubusercontent.com/TzeY11/bill-pilot/main/scripts/install-vps.sh -o install-vps.sh
sudo bash install-vps.sh --help
```

## 環境需求

- 一台可以 SSH 登入的 Debian/Ubuntu Linux 伺服器
- 一個已經透過 `A` 記錄解析到伺服器 IP 的網域
- Node.js 22+ 或 24+
- npm
- Git
- Caddy，用於反向代理和 HTTPS

下面的範例使用 Ubuntu/Debian 風格命令。如果你使用其他發行版，請自行調整套件管理器命令。

## DNS 設定

執行安裝腳本之前，先為你要使用的網域新增 DNS 記錄：

```txt
Type: A
Name: bill-pilot
Value: 你的伺服器 IPv4 位址
Proxy: 建議首次安裝成功前先使用 DNS only
```

例如你的主網域是 `example.com`，這條記錄會建立 `bill-pilot.example.com`。

如果你使用 Cloudflare，需要在 Cloudflare 的 DNS records 頁面手動新增。Bill Pilot 預設不能自動修改 Cloudflare DNS；除非之後單獨接入 Cloudflare API，並由使用者提供自己的 API Token。

## 安裝執行依賴

```bash
sudo apt update
sudo apt install -y git curl caddy
```

安裝 Node.js 22+ 或 24+。例如使用 NodeSource：

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

## 建立應用使用者

使用專用使用者執行應用，後續維護會更清晰。

```bash
sudo useradd --system --create-home --shell /bin/bash bill-pilot
sudo mkdir -p /opt/bill-pilot
sudo chown bill-pilot:bill-pilot /opt/bill-pilot
```

## 複製專案

```bash
sudo -u bill-pilot git clone https://github.com/TzeY11/bill-pilot.git /opt/bill-pilot
cd /opt/bill-pilot
```

## 設定環境變數

建立正式環境設定檔：

```bash
sudo -u bill-pilot cp .env.example .env
sudo -u bill-pilot nano .env
```

至少設定：

```env
AUTH_SECRET="replace-with-a-random-secret-at-least-32-characters"
DATABASE_FILE="data/bill-pilot.db"
```

`AUTH_SECRET` 必須至少 32 個字元。可以這樣產生強隨機值：

```bash
openssl rand -base64 32
```

### 環境變數參考

| 變數 | 必填 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `AUTH_SECRET` | 是 | 無 | 用於簽署 Session Cookie 的密鑰，至少 32 個字元。 |
| `DATABASE_FILE` | 否 | `data/bill-pilot.db` | SQLite 資料庫路徑。相對路徑會按應用目錄解析。 |
| `PORT` | 否 | `3000` | `next start` 和 systemd 服務使用的本機連接埠。 |
| `NODE_ENV` | 否 | systemd 中為 `production` | Next.js 應用執行模式。 |
| `BILL_PILOT_DOMAIN` | 否 | 無 | 安裝腳本可選網域輸入；未設定時腳本會互動式詢問。 |
| `BILL_PILOT_PORT` | 否 | `3000` | 安裝腳本可選本機連接埠輸入。 |
| `BILL_PILOT_APP_DIR` | 否 | `/opt/bill-pilot` | 備份腳本可選應用目錄覆寫。 |
| `BILL_PILOT_DATABASE_FILE` | 否 | 讀取 `.env` | 備份腳本可選資料庫路徑覆寫。 |
| `BILL_PILOT_BACKUP_DIR` | 否 | `/opt/bill-pilot/backups` | 備份目錄覆寫。 |
| `BILL_PILOT_BACKUP_KEEP_DAYS` | 否 | `30` | 舊資料庫備份保留天數。 |

註冊入口限制和登入/註冊限流計畫在後續安全迭代中實作。

## 安裝並建置

```bash
sudo -u bill-pilot npm install
sudo -u bill-pilot npm run build
```

## 使用 systemd 執行

建立 systemd 服務：

```bash
sudo nano /etc/systemd/system/bill-pilot.service
```

寫入：

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

啟用並啟動服務：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now bill-pilot
sudo systemctl status bill-pilot
```

查看日誌：

```bash
sudo journalctl -u bill-pilot -f
```

## 設定 Caddy 和 HTTPS

編輯 Caddyfile：

```bash
sudo nano /etc/caddy/Caddyfile
```

使用你的真實網域：

```caddyfile
bill-pilot.example.com {
  reverse_proxy 127.0.0.1:3000
}
```

重載 Caddy：

```bash
sudo systemctl reload caddy
```

只要網域已經解析到伺服器，並且 80/443 連接埠可存取，Caddy 會自動申請和續期 HTTPS 憑證。

## 首次登入

在瀏覽器開啟你的網域：

```txt
https://bill-pilot.example.com
```

然後從網頁介面註冊第一個帳號。

## 資料和備份

預設 SQLite 資料庫位置：

```txt
/opt/bill-pilot/data/bill-pilot.db
```

備份資料庫：

```bash
sudo bash /opt/bill-pilot/scripts/backup-db.sh
```

恢復備份時，先停止應用，把備份複製回資料庫位置，再啟動應用：

```bash
sudo systemctl stop bill-pilot
sudo -u bill-pilot cp /opt/bill-pilot/backups/bill-pilot-YYYYMMDD-HHMMSS.db /opt/bill-pilot/data/bill-pilot.db
sudo systemctl start bill-pilot
```

這個資料庫包含使用者帳號和服務/訂閱記錄。備份它即可保護主要應用資料。

## 升級

使用升級腳本：

```bash
sudo bash /opt/bill-pilot/scripts/upgrade-server.sh
```

升級腳本會先備份資料庫，然後拉取最新程式碼、安裝依賴、重新建置應用，並重新啟動 systemd 服務。

重啟後查看日誌：

```bash
sudo journalctl -u bill-pilot -f
```

## 常見排查

如果應用無法啟動，檢查：

- `AUTH_SECRET` 是否已設定，並且至少 32 個字元。
- Node.js 是否為 22+ 或 24+。
- `/opt/bill-pilot/data` 是否能被 `bill-pilot` 使用者寫入。
- 使用 `sudo journalctl -u bill-pilot -f` 查看服務日誌。
- Caddy 是否能存取 `127.0.0.1:3000`。
