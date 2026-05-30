# 工作日誌 - 神明占卜 App

---

## 2026-05-31（今日）

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

## 2026-05-29 ~ 30（前次工作階段）

### Commit `4ee84ec` — 神明占卜 MVP 完整版

**核心功能**：完整求籤流程、AI 解籤（DeepSeek/OpenAI/離線自動降級）、多輪對話、收藏+筆記+搜尋、願望追蹤+還願、統計儀表板、每日籤、TTS 朗讀、程式化音效、香煙動畫、農民曆（2026-05）、多語言 i18n 架構

**8 神明 + 2 籤詩系統**：雷雨師百首（100首）、六十甲子籤（60首）

---

## 目前狀態（2026-05-31）

| 項目 | 狀態 |
|------|------|
| TypeScript | ✅ 0 錯誤 |
| Git | ✅ 已 commit，ahead of origin by 3 commits（尚未 push） |
| 神明 | ✅ 9 神明（含孔明神數） |
| 籤詩 | ✅ 雷雨師百首(100) + 六十甲子(60) + 諸葛神數(64) = 224 首 |
| 農民曆 | ✅ 2026 全年（5–12 月） |
| 音效架構 | ✅ expo-av 就位，合成音運作中，等待真實音檔 |

---

## 待辦清單（優先順序）

### 🔴 本週必做

| # | 項目 | 說明 |
|---|------|------|
| 1 | **真實廟宇音檔** | 準備 5 個 CC0 授權 `.mp3`（toss / shengbei / draw / incense / result）放入 `assets/sounds/`，取消 `proceduralSound.ts` 中的 require comment |
| 2 | **Push 到遠端** | `git push origin master`（3 個 commit 尚未推送） |
| 3 | **問事自由輸入** | `GodSelector.tsx` QuestionForm 的「所求之事」補一個 TextInput，允許用戶打字（目前只有 6 個 chip 預設） |
| 4 | **每日運勢依生肖個人化** | `dailyFortune.ts` 加入生肖參數，部分類別依五行相生相剋調整分數 |

### 🟡 下一批

| # | 項目 | 說明 |
|---|------|------|
| 5 | **神明插圖** | 為 9 個神明準備插圖（SVG 或 PNG），放入 `assets/gods/`，GodSelector / PoemCard 載入 |
| 6 | **神明聖誕推播** | `lunarCalendar.ts` 農曆神誕資料已有，接到 `notifications.ts` 排程，在聖誕前一天推播提醒 |
| 7 | **求籤禁忌說明** | 選完神明後的 QuestionForm 加「求籤須知」折疊欄（同日不重複求、三聖筊意義等） |
| 8 | **年度求籤總結** | Stats 頁底部加「年度回顧」卡：總次數、最常問的事、最常求的神、最高吉籤 |
| 9 | **還願引導流程** | `wishes.tsx` 還願時加步驟引導（準備供品、稟告詞、感謝文模板） |

### 🟢 優化項

| # | 項目 | 說明 |
|---|------|------|
| 10 | **背景音樂** | Settings 加「背景音樂」開關，選擇：誦經/靜心音樂/靜音 |
| 11 | **i18n 套用** | `i18n.ts` 已建好，將 index.tsx 的硬編碼文字換成 `t()` 呼叫 |
| 12 | **收藏匯出 PDF** | collection.tsx 加「匯出」功能，將收藏的籤詩整理成可分享的 PDF/圖片 |
| 13 | **啟動畫面** | `app.json` 設定 splash screen，加廟宇大門圖或金色神明符文 |

---

## 架構備忘

```
啟動指令
├── 前端：npx expo start --web  →  http://localhost:8081
└── 後端：cd backend && npm run dev  →  http://localhost:3001

音效音檔路徑（待補）
└── assets/sounds/
    ├── toss.mp3      ← 擲筊落地聲
    ├── shengbei.mp3  ← 聖筊（清磬）
    ├── draw.mp3      ← 抽籤搖筒聲
    ├── incense.mp3   ← 上香（木魚）
    └── result.mp3    ← 結果揭曉（銅鑼）
```
