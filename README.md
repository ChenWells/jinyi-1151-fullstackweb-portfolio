# 全端網站開發實務 · 學員作品動態

React + Vite + Firebase（Firestore + Auth），部署於 GitHub Pages。

## 功能
1. 學員自行註冊（姓名、身分證字號；身分證僅存加鹽雜湊，用於防重複）
2. 註冊後產生隨機碼（畫面顯示一次，可選擇 EmailJS 寄送）；以姓名＋隨機碼登入後修改作業
3. 兩項作業：個人線上 CV、Web App（解決特定問題）
4. 即時動態牆（Firestore onSnapshot），含講師分數與同儕平均
5. 講師評分：Google 登入，限定講師帳號（五項加權，滿分 100，評語公開）
6. 同儕互評：三項加權，滿分 100；不能評自己；可重複修改；公開只顯示平均與人數，評語僅講師可見
7. GitHub Actions 自動部署

## 設定
1. Firebase Console 建立專案 → 建立 Firestore（正式模式）→ 把 [firestore.rules](firestore.rules) 貼到「規則」並發布。
2. Firebase → Authentication → Sign-in method：啟用 **匿名** 與 **Google**；Settings → Authorized domains 新增 `chenwells.github.io`。
3. 本機：`copy .env.example .env` 填入設定，`npm install`、`npm run dev`。
4. GitHub：Settings → Pages → Source 選 **GitHub Actions**；Settings → Secrets and variables → Actions 新增 `.env.example` 內所有 `VITE_*`（Variables 或 Secrets 皆可）。修改後需重新執行部署。
5. （選用）EmailJS 建立範本，變數為 `to_email`、`to_name`、`code`。

講師帳號寫在 [firestore.rules](firestore.rules) 的 `teacher()` 與 `src/lib/db.js` 的 `TEACHER_EMAIL`，換講師時兩處都要改。

## 安全設計
- 登入時，隨機碼雜湊必須與 `secrets` 相符才寫得進 `sessions/{uid}`；之後作業與評分都以此身分判斷，雜湊不會出現在公開文件。
- `stats`（公開統計）只能隨「自己的評分」在同一筆交易中增減，規則會核對差額。
- 隨機碼遺失無法找回：講師可在 Firebase Console 重設 `secrets/{memberId}.codeHash`，或刪除該學員的 `members`/`secrets`/`ids` 後重新註冊。
- 純前端無法完全防暴力破解；`VITE_ID_SALT` 會公開在前端。更高安全性請改用 Cloud Functions。
