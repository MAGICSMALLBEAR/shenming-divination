# 工作日誌 - 神明占卜 App

---

## 2026-05-31

### Commit `d89f97f` — 四大核心差距補完

#### 生辰八字整合
| 檔案 | 內容 |
|------|------|
| `src/services/bazi.ts`（新建） | 生肖/天干地支/五行/相合相沖/守護神明計算；支援西元或民國年份輸入 |
| `src/app/settings.tsx` | 生辰改為年份輸入 → 即時顯示八字卡（五行色標、本命年紅框警示）；偏好神明自動 🌟 標示守護神 |
| `src/components/GodSelector.tsx` | 讀取生辰設定後給守護神顯示「守護」金徽章；神明漢字大字肖像（關/觀/媽/王/保/土/娘/文/孔）取代 emoji |

#### 每日運勢面板
| 檔案 | 內容 |
|------|------|
| `src/services/dailyFortune.ts`（新建） | 財/事/愛/康五維評分（1–5星）、幸運色、方位、數字、吉時、五行 — 依日期確定性生成 |
| `src/app/index.tsx` | 首頁 GodSelector 上方加折疊卡，預設收起，點擊展開五維評分詳情 |

#### 音效系統升級
| 檔案 | 內容 |
|------|------|
| `src/services/proceduralSound.ts` | expo-av 架構就位（音檔放 assets/sounds/ 即啟用）；合成音升級：木魚(上香)、清磬(聖筊)、竹片(擲筊)、銅鑼(結果) |
| `src/components/IncenseRitual.tsx` | 插香時觸發木魚聲 |
| `src/app/index.tsx` | 結果揭曉時觸發銅鑼聲 |

---

### Commit `0229510` — 補完 6 項功能缺口

| # | 功能 | 實作 |
|---|------|------|
| 1 | **許願按鈕** | 結果頁 action bar 加 🙏 許願，一鍵呼叫 `addWish`；已許願顯示 ✅ |
| 2 | **農民曆補齊** | 2026-06 ~ 12 共 7 個月×30天，含節氣、神明聖誕（中元、中秋、重陽等） |
| 3 | **Settings 孔明神數** | 偏好神明選單補上 id:9 孔明神數 |
| 4 | **Stats 週圖** | 直立柱狀圖，高度依最大值等比縮放 |
| 5 | **圖卡分享** | PoemCard 加「🖼️ 圖卡分享」，Native 截圖；Web 降級複製文字 |
| 6 | **Chat 籤詩上下文** | 求完籤自動存最後籤詩；進入對話頁 24 小時內顯示籤名/吉凶/問事，API system prompt 含籤詩內容 |

---

### Commit `2d3ba02` — 孔明神數完整流程 + TypeScript 修復

| 項目 | 內容 |
|------|------|
| 孔明神數流程 | `enter-zhuge-number` FlowStep；冥想後跳擲筊改進 `ZhugeNumberInput`（廟宇風數字鍵盤）；報數 → `drawZhugePoem(n)` |
| 諸葛神數補齊 | 第 1–64 卦完整資料（六十四卦對應易經卦象，均含白話/典故/解曰） |
| PoemCard 升級 | 顯示卦名（title）+ 卦序（ganzhi）；複製/朗讀/分享文案含卦名 |
| TypeScript 全清 | absoluteFillObject、RefreshControl、removeItem export、NotificationBehavior、href as const — 共 6 項 |

---

## 2026-06-01（今日）

### Commit `bdbc34a` — 問事自由輸入
| 項目 | 內容 |
|------|------|
| 變更 | GodSelector QuestionForm 補上 TextInput，用戶可自由打字輸入所求之事（原有 6 個 chip 預設保留並存） |
| 狀態 | ✅ 完成 🔴#3 |

### Commit `8e1e3e9` — 每日運勢依生肖/五行個人化
| 項目 | 內容 |
|------|------|
| 變更 | dailyFortune.ts 加入生肖參數，部分類別依五行相生相剋調整分數，不再純隨機 |
| 狀態 | ✅ 完成 🔴#4 |

### Commit `e1fba9e` — 神明聖誕推播通知
| 項目 | 內容 |
|------|------|
| 變更 | 接到 notifications.ts 排程，神明聖誕前一天推播提醒，lunarCalendar.ts 農曆神誕資料已對接 |
| 狀態 | ✅ 完成 🟡#6 |

### Commit `292511e` — Stats 頁年度回顧卡
| 項目 | 內容 |
|------|------|
| 變更 | Stats 頁底部加「年度回顧」卡：總次數、最常問的事、最常求的神、最高吉籤 |
| 狀態 | ✅ 完成 🟡#8 |

### Commit `4186209` — 籤詩系統全面重整
| 項目 | 內容 |
|------|------|
| 雷雨師百首校正 | 100 首籤詩重新校對，修正錯別字與格式不一致 |
| 觀音靈籤獨立建立 | 新建獨立 dataset，與雷雨師百首區分開來 |

### Commit `3f251db` — 六十甲子籤全面校正
| 項目 | 內容 |
|------|------|
| 六十甲子籤校正 | 60 首六十甲子籤重新校對 |
| 狀態 | ✅ 籤詩總數更新為：雷雨師百首(100) + 觀音靈籤(獨立) + 六十甲子(60) + 諸葛神數(64) = 224+ |

---

## 2026-06-03（今日）

### 香爐空爐圖精修（三風格）
| 檔案 | 說明 |
|------|------|
| `assets/images/ritual/sprites/bronze-censer-empty.png` | 青銅龍紋空爐：邊緣 solidity 0.7192→0.7410，3.8% 像素處理（邊緣平滑 + 腳座強化 + 爐口暗化） |
| `assets/images/ritual/sprites/celadon-censer-empty.png` | 青瓷蓮紋空爐：邊緣本已最佳(0.7984)，微量處理 2.7%（腳部 detailEnhance + 爐口內壁） |
| `assets/images/ritual/sprites/cinnabar-censer-empty.png` | 朱漆寺廟空爐：改善最大 solidity 0.7758→0.7968，5% 像素處理（爐口最大，內緣暗化最明顯） |
| `assets/images/ritual/ai-ritual-styles.png` | 三風格儀式圖集 (1536×1024)，RitualStylePicker 縮圖用 |
| `assets/images/ritual/sprites/*-flat.png` | 三風格擲筊平杯面 |
| `assets/images/ritual/sprites/*-round.png` | 三風格擲筊凸杯面 |

**處理項目**：
- **邊緣** — ApproxPolyDP 輪廓平滑 + 邊緣帶 bilateral filter 去噪 + alpha 清理
- **腳座** — 底部 15% detailEnhance 增強紋理 + medianBlur 除噪
- **爐口內壁** — distance transform 洞口距離漸層暗化（洞口處暗 20%，12px 過渡）+ bilateral 平滑內緣
- **整體紋理** — edgePreservingFilter 15% 柔化統一質感

### 儀式系統重構
| 檔案 | 說明 |
|------|------|
| `src/constants/ritual-styles.ts`（新建） | 三風格定義（bronze/celadon/cinnabar），含香爐空/置 sprite、擲筊 sprite、accent/glow/chip 色系 |
| `src/components/RitualStylePicker.tsx`（新建） | 儀式風格選擇器，從 atlas 裁切風格縮圖，三卡左右滑選 |
| `src/components/IncenseRitual.tsx` | 全面重構：三風格香爐捲動替換、空爐 mask viewport + sprite 顯示、灰燼爆散/壓縮反應動畫 |
| `src/components/Jiaobei.tsx` | 擲筊全面重構：三風格 sprite 替換（pairSplit + tossRise + fallBounce 動畫）、動態著色 |
| `src/components/PoemCard.tsx` | 接收完整神明資料，結果頁頂部顯示神像橫幅 + 問事摘要 |
| `src/app/index.tsx` | 整合 RitualStylePicker，儀式後風格偏好存入設定，流程銜接 incenseRitual → jiaobei → drawAnimation → poemCard |
| `src/app/wishes.tsx` | 還願功能強化 + 供品記錄 |
| `src/app/collection.tsx` | 收藏頁重構，搜尋/篩選/排序優化 |
| `src/app/chat.tsx` | 對話頁支援籤詩上下文，system prompt 含最後求籤資訊 |
| `src/services/wishTracker.ts` | 願望追蹤支援供品類別與還願狀態 |
| `src/services/notifications.ts` | 推播排程擴充，神明聖誕前提醒 |
| `src/components/app-tabs.tsx` | 頁籤色彩跟隨當前選中風格 |

### 上香插入修復（Web）
| 問題 | 修復 |
|------|------|
| `dropZoneRect` null → `placeIncenseInCenser()` 靜默失敗 | scene `onLayout` 取得場景尺寸，style 已知數值計算 drop zone 位置，不再依賴 `measureInWindow` |
| 座標系統錯配（螢幕座標當作 translate offset） | 改用場景內相對座標：手部自然位置 `(sceneW-35, sceneH-62)`，香爐口中心 `(sceneW/2, sceneH-167)`，計算位移差 |
| 拖曳偵測失效 | `isInsideDropZone` 改用場景座標比對，以 incensePosition.\_value 即時算手部位置 |

### Web 靜態匯出與開發伺服
- `npx expo export --platform web` → `dist/` 靜態匯出
- `serve.js` — Node.js SPA 伺服（`localhost:3000`），處理 Expo Router 客戶端路由 fallback
- 已移除 `index.js`（多餘的 entry point，Expo Router package.json `"main": "expo-router/entry"` 已處理）

### 資料層擴充
| 檔案 | 說明 |
|------|------|
| `src/data/godProfiles.ts`（新建） | 9 位神明完整資料：image、tagline、各色系、管轄領域、法器、坐騎、歷史典故 |
| `src/data/oracleCatalog.ts`（新建） | 籤詩目錄中樞：各系統籤數、綁定神明的籤詩系統對照、問事類別建議 |

---

## 2026-06-02

### Commit `bbf2488` — 神明插圖上線 + DrawAnimation 重構 + 工作日誌更新
| 項目 | 內容 |
|------|------|
| 神明插圖 | 9 位神明 PNG 已放入 `assets/images/gods/`，GodSelector 與選神橫幅改為顯示神像 |
| 神明資料 | `gods.ts` 補上 image、tagline、primaryColor、accentColor、auraColor |
| 抽籤動畫 | DrawAnimation 重構為神明肖像、籤筒搖動、籤枝落下、籤號揭示的完整流程 |
| 抽籤時間 | Settings 新增短版 3.0 秒、標準 4.2 秒、沉浸 6.0 秒選項 |
| 狀態 | ✅ 完成 🟡#3 |

### Commit `84aad94` — 標記 Push 遠端完成，更新狀態
| 項目 | 內容 |
|------|------|
| Push | 已推送遠端，工作樹乾淨 |
| TypeScript | `tsc --noEmit` 通過 |

### 本次工作 — 求籤須知折疊欄
| 項目 | 內容 |
|------|------|
| 求籤須知 | QuestionForm 標題下新增可展開提示欄，包含一事一問、同事不短時間重求、聖筊/笑筊/陰筊意義、重大決策仍需專業建議 |
| 狀態 | ✅ 完成 🟡#4 |

### 本次工作 — 抽籤動畫強化
| 項目 | 內容 |
|------|------|
| 落籤金光 | 籤枝落下後新增金光擴散與核心閃光 |
| 籤紙翻面 | 籤號揭示改為宣紙卡片翻面進場，顯示真實抽中籤號 |
| 狀態 | ✅ 完成 |

### 本次工作 — 結果頁神明開示強化
| 項目 | 內容 |
|------|------|
| 神明橫幅 | PoemCard 接收完整神明資料，結果頁頂部顯示神像、神名與神明標語 |
| 問事摘要 | 籤詩結果卡新增本次問事類別與問題摘要，讓籤詩和問題脈絡連在一起 |
| 狀態 | ✅ 完成 |

### 本次工作 — 響應式介面整理
| 項目 | 內容 |
|------|------|
| 首頁容器 | `src/app/index.tsx` 新增 `useWindowDimensions()` 與 `pageShell`，首頁在手機、平板、桌機都有適當最大寬度 |
| 選神與輸入 | `GodSelector` / `QuestionForm` 改為可依寬度切換單欄、雙欄與較寬版配置，手機上按鈕與輸入區不再擁擠 |
| 結果頁 | `PoemCard` 的神明橫幅、問事摘要、解籤操作列與詩文區塊補上窄螢幕優化 |
| 冥想頁 | `MeditationScreen` 補上手機版間距與按鈕寬度控制 |
| 驗證 | `npx tsc --noEmit` 通過，並以本機 web 版做手機/桌機截圖檢查，輸出於 `docs/qa/` |
| 狀態 | ✅ 完成 |

---

## 2026-05-29 ~ 30（前次工作階段）

### Commit `4ee84ec` — 神明占卜 MVP 完整版

**核心功能**：完整求籤流程、AI 解籤（DeepSeek/OpenAI/離線自動降級）、多輪對話、收藏+筆記+搜尋、願望追蹤+還願、統計儀表板、每日籤、TTS 朗讀、程式化音效、香煙動畫、農民曆（2026-05）、多語言 i18n 架構

**8 神明 + 2 籤詩系統**：雷雨師百首（100首）、六十甲子籤（60首）

---

## 目前狀態（2026-06-03）

| 項目 | 狀態 |
|------|------|
| TypeScript | ⚠️ 待驗證（大量重構後需 `tsc --noEmit` 確認） |
| Git | ✅ 已 push origin/master（commit `2409cef`，共 15 commits） |
| 神明 | ✅ 9 神明（含孔明神數），完整資料已建（godProfiles.ts） |
| 神明插圖 | ✅ 9 張台式廟宇彩繪金身風 PNG 已上線 |
| 儀式圖集 | ✅ 三風格（青銅/青瓷/朱漆）香爐空+置 sprite、擲筊平+凸面、atlas 縮圖 |
| 抽籤動畫 | ✅ 籤筒搖動、落籤金光、籤紙翻面、真實籤號揭示、可調整動畫長度 |
| 結果頁 | ✅ 神明開示橫幅 + 本次問事摘要 |
| 響應式介面 | ✅ 首頁、選神、問事輸入、結果頁、冥想頁已補手機/平板/桌機版面調整 |
| 籤詩 | ✅ 雷雨師百首(100) + 觀音靈籤(獨立) + 六十甲子(60) + 諸葛神數(64) = 224+ 首 |
| 籤詩目錄 | ✅ oracleCatalog.ts 中樞對照系統 |
| 每日運勢 | ✅ 已依生肖/五行個人化 |
| 問事輸入 | ✅ 支援自由打字 + 預設 chip 並存 |
| 求籤須知 | ✅ 選完神明後，QuestionForm 顯示可展開折疊欄 |
| 神明聖誕 | ✅ 推播通知已排程 |
| 統計頁 | ✅ 年度回顧卡已上線 |
| 農民曆 | ✅ 2026 全年 |
| 音效架構 | ✅ expo-av 就位，合成音運作中，等待真實音檔 |
| 上香流程 | ✅ 三風格香爐、點香→拖曳/點擊→插香→灰燼動畫，Web 座標修復完成 |
| 擲筊流程 | ✅ 三風格 sprite、拋擲動畫、聖筊/笑筊/陰筊判斷 |

---

## 待辦清單（優先順序）

### 🔴 本週必做

| # | 項目 | 說明 |
|---|------|------|
| 1 | **香爐空爐圖二輪精修** | 第一輪已修邊緣/腳座/爐口，待實際跑一遍上香流程確認效果；如需再修：腳座紋路細化、爐口內壁質感統一 |
| 2 | **TypeScript 驗證** | 本次大量重構後需 `npx tsc --noEmit` 確認零錯誤 |
| 3 | **真實廟宇音檔** | 準備 5 個 CC0 授權 `.mp3`（toss / shengbei / draw / incense / result）放入 `assets/sounds/` |

### 🟡 下一批

| # | 項目 | 說明 |
|---|------|------|
| 4 | **還願引導流程** | `wishes.tsx` 還願時加步驟引導（準備供品、稟告詞、感謝文模板） |
| 5 | **響應式收尾** | 針對頂部分頁列、Collection/Stats/Wishes 頁面補做手機與桌機版檢查，確認所有主頁面寬度策略一致 |
| 6 | **結果頁實機驗證** | 逐步檢查 PoemCard 在長詩文、長 AI 解釋、不同問事類別下是否仍維持可讀性與按鈕不折斷 |
| 7 | **QA 產物整理** | 決定 `docs/qa/` 截圖是保留作驗證紀錄、搬到文件目錄，或加入 `.gitignore` 避免工作樹持續出現未追蹤檔 |
| 8 | **上香拖曳微調** | Web 版 drag-to-drop 目前偵測範圍可能需要微調（座標已修復但手感待實測） |

### 🟢 優化項

| # | 項目 | 說明 |
|---|------|------|
| 9 | **背景音樂** | Settings 加「背景音樂」開關，選擇：誦經/靜心音樂/靜音 |
| 10 | **i18n 套用** | `i18n.ts` 已建好，將硬編碼文字換成 `t()` 呼叫 |
| 11 | **收藏匯出 PDF** | collection.tsx 加「匯出」功能，將收藏的籤詩整理成可分享的 PDF/圖片 |
| 12 | **啟動畫面** | `app.json` 設定 splash screen，加廟宇大門圖或金色神明符文 |
| 13 | **Jiaobei sprite 精修** | 擲筊 sprite 目前也是 AI 生成，可能也需要邊緣/紋理精修 |

---

## 下次建議順序

| 順序 | 建議事項 | 原因 |
|------|------|------|
| 1 | TypeScript 驗證 + 上香流程實測 | 這次重構量大，先確保零錯誤 + Web 版流程正常 |
| 2 | 香爐空爐圖二輪精修 | 等實測確認目前效果後，針對腳座、爐口再做細修 |
| 3 | 響應式收尾 | 版面剛調整完，趁脈絡還在補齊 collection/stats/wishes |
| 4 | 結果頁實機驗證 | PoemCard 核心頁，確認長詩文、AI 解釋都穩定 |

---

## 架構備忘

```
啟動指令
├── 前端（開發）：npx expo start --web  →  http://localhost:8081
├── 前端（靜態）：npx expo export --platform web && node serve.js → http://localhost:3000
└── 後端：cd backend && npm run dev  →  http://localhost:3001

音效音檔路徑（待補）
└── assets/sounds/
    ├── toss.mp3      ← 擲筊落地聲
    ├── shengbei.mp3  ← 聖筊（清磬）
    ├── draw.mp3      ← 抽籤搖筒聲
    ├── incense.mp3   ← 上香（木魚）
    └── result.mp3    ← 結果揭曉（銅鑼）
```
