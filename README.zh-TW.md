# Bill Pilot

[![English](https://img.shields.io/badge/lang-English-blue.svg)](./README.md)
[![简体中文](https://img.shields.io/badge/lang-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-red.svg)](./README.zh-CN.md)
[![繁體中文](https://img.shields.io/badge/lang-%E7%B9%81%E9%AB%94%E4%B8%AD%E6%96%87-orange.svg)](./README.zh-TW.md)

Bill Pilot 是一個自託管帳單與續費管理面板，用來管理伺服器、網域、軟體會員、遊戲伺服器和各種週期性訂閱費用。

它適合部署在你自己的 Linux 伺服器上，包括 VPS、VDS、獨立伺服器和家用伺服器，並透過網域和 HTTPS 存取。

![Bill Pilot dashboard screenshot](./docs/assets/bill-pilot-dashboard.png)

## 功能

- Dashboard 顯示預估月支出和年支出
- 顯示 3 天內和 14 天內即將續費的服務
- 服務列表支援搜尋、篩選、排序和響應式檢視
- 支援新增、編輯、刪除週期性服務
- 支援淺色、深色和跟隨系統主題
- 支援統一顯示幣別，並快取匯率
- 內建常用服務圖示，也支援上傳自訂圖示
- 電子郵件/密碼帳號系統，Dashboard、Services 和 Account 頁面受保護

## 伺服器一鍵安裝

把網域解析到一台全新的 Debian/Ubuntu 伺服器後執行：

```bash
curl -fsSL https://raw.githubusercontent.com/TzeY11/bill-pilot/main/scripts/install-vps.sh -o install-vps.sh
sudo bash install-vps.sh
```

安裝腳本會提示你輸入網域。執行腳本之前，需要先在 Cloudflare、網域註冊商或你的 DNS 服務商後台新增一條指向伺服器 IP 的 DNS `A` 記錄。

安裝腳本會自動：

- 安裝系統依賴，並在需要時安裝 Node.js 22
- 把 Bill Pilot 複製到 `/opt/bill-pilot`
- 產生 `.env` 和強隨機 `AUTH_SECRET`
- 建置應用
- 建立 systemd 服務
- 設定 Caddy 和 HTTPS

查看安裝腳本選項：

```bash
curl -fsSL https://raw.githubusercontent.com/TzeY11/bill-pilot/main/scripts/install-vps.sh -o install-vps.sh
sudo bash install-vps.sh --help
```

完整部署文件（簡體中文）：[docs/deployment-vps.zh-CN.md](./docs/deployment-vps.zh-CN.md)

## 資料

使用者帳號和服務/訂閱記錄都儲存在 SQLite：

```txt
data/bill-pilot.db
```

如果你從舊的 localStorage 版本升級，Bill Pilot 會在帳號首次開啟應用時，把瀏覽器裡的舊服務資料匯入 SQLite。

備份 `data/bill-pilot.db` 即可保護帳號和服務記錄。

## 備份

如果你使用一鍵安裝腳本部署在 Linux 伺服器上，執行：

```bash
sudo bash /opt/bill-pilot/scripts/backup-db.sh
```

備份腳本會把資料庫備份儲存到 `/opt/bill-pilot/backups`，預設刪除 30 天以前的舊備份。

## 升級

如果你使用一鍵安裝腳本部署在 Linux 伺服器上，執行：

```bash
sudo bash /opt/bill-pilot/scripts/upgrade-server.sh
```

升級腳本會先備份資料庫，然後拉取最新程式碼、安裝依賴、重新建置應用，並重新啟動 systemd 服務。

## 設定

複製 `.env.example` 到 `.env`，並設定：

```env
AUTH_SECRET="replace-with-a-random-secret-at-least-32-characters"
DATABASE_FILE="data/bill-pilot.db"
```

`AUTH_SECRET` 必須至少 32 個字元。

## 文件

- [伺服器部署（簡體中文）](./docs/deployment-vps.zh-CN.md)
- [一鍵安裝腳本](./scripts/install-vps.sh)
- [備份腳本](./scripts/backup-db.sh)
- [升級腳本](./scripts/upgrade-server.sh)
- [貢獻指南](./CONTRIBUTING.md)
- [安全政策](./SECURITY.md)

## License

MIT

## 技術棧

- Next.js App Router
- TypeScript
- Tailwind CSS
- SQLite via Node's native `node:sqlite`
- bcryptjs
- jose
- react-icons / Simple Icons
