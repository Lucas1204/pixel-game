# Pixel Art Quiz Game

這是一個基於 React (Vite) + Google Apps Script (GAS) 搭建的像素風格闖關問答遊戲。

## 功能特色
*   **像素風格 (Pixel Art)**: 濃郁的 2000 年代街機設計，採用 "Press Start 2P" 字型。
*   **動態關主**: 接入 DiceBear API，每一題自動產生獨一無二的像素風格怪物。
*   **無伺服器後端**: 透過 Google Sheets + Google Apps Script 管理題庫與分數，完全免費。
*   **隨機抽題**: 每次遊戲會根據設定的題數從題庫隨機抽取。

---

## 🚀 步驟一：Google Sheets 題庫建立
此遊戲的所有狀態（題目與分數紀錄）皆由 Google Sheets 保存。
1. 建立一個全新的 [Google Sheets 試算表](https://docs.google.com/spreadsheets/)。
2. 建立兩個工作表，分別命名為：
    *   **題目**
    *   **回答**
3. 進入「題目」工作表，在**第一列 (A1~G1)** 建立以下標題：
    *   `題號`  `題目`  `A`  `B`  `C`  `D`  `解答`
4. 進入「回答」工作表，在**第一列 (A1~G1)** 建立以下標題：
    *   `ID`  `闖關次數`  `總分`  `最高分`  `第一次通關分數`  `花了幾次通關`  `最近遊玩時間`

> *註：標題文字無硬性規定，程式碼主要透過 index 抓取，但建議照著建立以利日後維護。*

---

## 🚀 步驟二：Google Apps Script 部署
GAS 是這款遊戲的「後端 API」，你的前端 React 會呼叫它來拿題目和存分數。
1. 在剛剛的 Google Sheets 畫面上方白單，點選 **擴充功能 (Extensions)** > **Apps Script**。
2. 清空畫面中原有的 `myFunction`，將本專案目錄下 `gas/Code.gs` 裡的所有程式碼複製貼上。
3. 點擊上方的「磁碟片」圖示儲存 (`Ctrl+S` / `Cmd+S`)。
4. 點選右上角的 **部署 (Deploy)** > **新增部署作業 (New deployment)**。
5. 點擊「選取類型」旁邊的齒輪圖示 ⚙️，選擇 **網頁應用程式 (Web app)**。
6. 以下設定**非常重要** (避免出現 CORS 跨域阻擋問題)：
    *   **執行身分 (Execute as)**: 選擇 **「我 (你自己的 Gmail)」**
    *   **誰可以存取 (Who has access)**: 選擇 **「所有人 (Anyone)」**
7. 點選 **部署 (Deploy)** (第一次執行會要求授權 Google 帳號，請允許並前往進階設定信任該程式)。
8. 部署成功後，畫面會出現一長串的 **網頁應用程式 URL** (開頭為 `https://script.google.com/macros/s/...`)，請**複製它**。

👉 *注意：未來如果修改了 `Code.gs` 中的任何程式碼，必須重新發佈！(管理部署作業 > 編輯 > 版本選擇 "建立新版本" > 部署)*

---

## 🚀 步驟三：本地端 React 專案設定與啟動
1. 確認你的電腦已安裝 [Node.js](https://nodejs.org/)。
2. 開啟終端機 (Terminal / Command Prompt)，進入此專案目錄。
3. 打開專案根目錄下的 `.env` 檔案，如果你沒有看到，請自己建立一個，內容如下：
   ```env
   # 貼上你在上一個步驟中複製的 GAS 部署 URL
   VITE_GOOGLE_APP_SCRIPT_URL=https://script.google.com/macros/s/你的網址/exec
   
   # 過關門檻 (答對幾題)
   VITE_PASS_THRESHOLD=3
   
   # 每次抽的題目數量
   VITE_QUESTION_COUNT=5
   ```
4. 安裝依賴並啟動伺服器：
   ```bash
   npm install
   npm run dev
   ```
6. 瀏覽器會開啟 `http://localhost:5173/`，即可開始遊戲！

---

## 🚀 步驟四：自動部署至 GitHub Pages (GitHub Actions)
專案已內建 `.github/workflows/deploy.yml` 腳本，只要將程式碼推送到 GitHub，並設定好密鑰，就能自動免費部署成網頁！

1. 在 GitHub 上建立一個新的 Repository，並將你的本地程式碼 `Push` 上去。
2. 進入你的 GitHub Repository 頁面，點選上方的 **Settings** 標籤。
3. 如果是在左邊欄位，展開 **Secrets and variables**，點擊 **Actions**。
4. 點擊畫面右側的 **New repository secret**，請根據你的 `.env.example` 參考檔，依序新增以下三個環境變數（名稱必須完全相同）：
    *   `VITE_GOOGLE_APP_SCRIPT_URL`：填上你的 GAS URL
    *   `VITE_PASS_THRESHOLD`：填上通關門檻 (例如 `3`)
    *   `VITE_QUESTION_COUNT`：填上題數 (例如 `5`)
5. 新增完三個 Secrets 後，前往 **Settings -> Pages**：
    *   將 **Source** 下拉選單改為 **GitHub Actions**。
6. 前往上方的 **Actions** 標籤頁面，點選左側的 **Deploy to GitHub Pages** 腳本，選 **Run workflow** 進行手動觸發（或者之後你每次 `Push` 到 `main` 分支都會自動觸發）。
7. 部署完成後，就可以用 GitHub 產生的專屬網址讓大家一起玩了！

---

## 測試題庫 (iOS 開發者必備技術基礎知識)
你可以將下面這 10 題直接複製，貼上到 Google Sheets 的「題目」工作表中（從 A2 開始貼）：

| 題號 | 題目 | A | B | C | D | 解答 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 下列哪一個是 iOS 開發中宣告常數的關鍵字？ | var | const | let | final | C |
| 2 | 在 Swift 中，什麼機制用來避免 null 導致的閃退？ | Try-Catch | Optional (可選型別) | Assertions | Macros | B |
| 3 | iOS App 生命週期中，App 進入背景時會呼叫哪一個方法？ | viewDidLoad | applicationDidBecomeActive | applicationDidEnterBackground | viewWillDisappear | C |
| 4 | UIKit 中負責管理與切換不同畫面的核心元件為何？ | UIViewController | UINavigationController | UITabBarController | UIView | B |
| 5 | 下列哪種架構模式是蘋果官方最強力推薦且最原始的標準？ | MVVM | VIPER | MVC | Clean Architecture | C |
| 6 | 在 Swift 中，struct 與 class 最大的區別為何？ | struct 是實質型別(Value Type)，class 是參考型別(Reference Type) | struct 支援繼承，class 不行 | struct 不能宣告方法，class 可以 | struct 只能存在堆疊(Stack)，class 只能在堆積(Heap) | A |
| 7 | 下列何者是用於宣告非同步函式 (Concurrency) 最新的 Swift 語法？ | DispatchQueue.main.async | completion handler (閉包) | async / await | OperationQueue | C |
| 8 | SwiftUI 與傳統 UIKit 最主要的設計哲學差異是？ | UIKit 是宣告式(Declarative)，SwiftUI 是命令式(Imperative) | SwiftUI 是宣告式(Declarative)，UIKit 是命令式(Imperative) | 兩者沒有差別，只是語法不同 | SwiftUI 只能做 UI，不能綁定邏輯 | B |
| 9 | 開發者通常用什麼工具來管理第三方套件（如 Alamofire）？ | Xcode Builder / NPM | Homebrew / Apt-get | CocoaPods / Swift Package Manager (SPM) | Make / CMake | C |
| 10| 何謂 ARC (Automatic Reference Counting) 的主要用途？ | 自動對齊 UI 元件 | 自動管理記憶體，釋放沒人參考的物件 | 自動追蹤 Analytics 事件 | 自動修復 Swift 語法錯誤 | B |
