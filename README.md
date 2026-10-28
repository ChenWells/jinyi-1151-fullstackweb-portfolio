# 全端網站開發實務 · 學員作品動態

React + Vite + Firebase Firestore，部署於 GitHub Pages。

## 功能
1. 學員自行註冊（姓名、身分證字號；身分證僅存加鹽雜湊，用於防重複）
2. 註冊後產生隨機碼（畫面顯示一次，可選擇 EmailJS 寄送），日後以姓名＋隨機碼登入修改
3. 兩項作業：個人線上 CV、Web App（解決特定問題）
4. 即時動態牆（Firestore onSnapshot）
5. GitHub Actions 自動部署

## 設定
1. Firebase Console 建立專案 → 建立 Firestore（正式模式）→ 把 [firestore.rules](firestore.rules) 貼到「規則」並發布 → 新增網頁應用程式取得設定值。
2. 本機：`copy .env.example .env` 填入設定，`npm install`、`npm run dev`。
3. GitHub：repo → Settings → Pages → Source 選 **GitHub Actions**；Settings → Secrets → Actions 新增 `.env.example` 內所有 `VITE_*` 變數。推送 `main` 即自動部署。
4. （選用）EmailJS 建立範本，變數為 `to_email`、`to_name`、`code`。

## 安全說明
- 隨機碼只存雜湊，遺失無法找回，需講師於 Firebase Console 刪除該學員的 `members`/`secrets`/`ids` 文件後重新註冊。
- 純前端的雜湊無法完全防止暴力破解；`VITE_ID_SALT` 會公開在前端程式中。若要更高安全性，請改用 Cloud Functions。
- 講師評分與同儕互評為第二階段移植。
