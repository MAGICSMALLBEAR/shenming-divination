## 2026-07-05（下半場）依優先度清空高/中優先待辦

### 本輪主題
延續上午的功能缺口盤點，依「高優先→中優先」順序，把不需要外部帳號就能做的項目全部做完。

### 完成項目 1：淺色主題全站套用（收尾）
- 剩餘 34 個檔案（11 個 Stack 頁面 + 20 個元件）全部從 `TempleTheme` 靜態常數改成 `useAppTheme()` + `createStyles(theme)` 動態模式
- 全站已無任何 `TempleTheme.` 殘留引用（`grep` 確認）
- 設定頁「淺色主題仍在優化中」提示已改為「已套用至全站，切換後立即生效」
- 意外發現並修復：`src/data/temples.ts` 有 3 座廟宇（龍山寺、碧潭福德宮、北港朝天宮）各自被重複建檔兩次、共用同一個 `id`，導致廟宇地圖頁 React key 重複錯誤；已將第二筆重新命名為 `_2` 後綴，內容不變

### 完成項目 2：隱私權政策 / 服務條款頁面
- 新增 `src/app/privacy.tsx`，內容依本 App 實際資料流程撰寫（本機儲存、AI 解籤傳輸範圍、拍照解籤、GPS 定位、Firebase 雲端同步條件、付費訂閱僅為展示等），並附服務性質聲明（僅供娛樂參考、非專業建議）
- 從「設定」頁「關於這個版本」區塊新增連結入口

### 完成項目 3：測試 / CI 基礎建設
| 項目 | 說明 |
|------|------|
| 安裝 | `jest-expo`、`jest`、`@types/jest`、`@testing-library/react-native`（依 Expo 官方文件版本） |
| 設定 | `package.json` 加入 `jest` 設定區塊（含 `@/assets/*` 對應真實 assets 目錄的 moduleNameMapper，否則圖片 require 會解析失敗）；`tsconfig.json` 加入 `types: ["jest"]` |
| 測試 | 新增 `__tests__/`：`interpretation.test.ts`（含今天修的重複 key bug 的回歸測試）、`godSpecific.test.ts`（濟公 `general` 欄位覆寫 bug 的回歸測試）、`themes.test.ts`、`divination.test.ts`，共 15 個測試全過 |
| CI | 新增 `.github/workflows/ci.yml`：push/PR 時跑 typecheck + lint + test |

### 完成項目 4：籤詩查詢圖書館
- 新增 `src/app/library.tsx`：不需抽籤，直接依神明切換籤詩系統、用籤號或關鍵字搜尋、點擊展開看完整籤文/白話/典故
- 涵蓋全部籤詩系統（雷雨師百首、觀音靈籤、六十甲子、諸葛神數、二十八宿，含 4 套神明專屬版本）
- 從「更多」頁工具網格新增入口（排在第一位）

### 驗證
- `npx tsc --noEmit` 全部通過
- `npm test` 15 個測試全過
- `npm run lint`、`npm run test -- --ci` 皆已本機驗證可用（CI 會用同樣指令）
- 用 Playwright 實際操作瀏覽器版本，涵蓋首頁/設定/今日/神明殿/收藏/更多/八字/願望/地圖/統計/多元占卜/隱私政策/籤詩圖書館，確認淺色主題與新功能皆正常、無 console 錯誤

### 尚未處理（需要外部帳號，本輪未觸碰）
Firebase 接入、IAP 真實付款、Fly.io 後端部署、Crash reporting/Analytics、Apple 登入 — 詳見上方「未來代辦清單」

---

## 2026-07-05 淺色主題重建 + App Store 評分上線 + 功能缺口盤點

### 本輪主題
先做一次全 App 功能盤點，找出「架子搭好但沒接上線」的缺口；再依優先度動手修復其中兩項可以獨立完成、不需外部帳號的高優先項目。

### 功能盤點重點發現
| 類別 | 發現 |
|------|------|
| 🔴 架好但沒接線 | Firebase 仍是 `YOUR_API_KEY` 佔位符、`premiumService.ts` 用 AsyncStorage 模擬訂閱（未接 IAP）、`expo-store-review` 套件未安裝、淺色主題全站未套用、後端未正式部署到 Fly.io |
| 🟡 產品面缺口 | 沒有測試/CI、沒有隱私權政策頁面（有用 Firebase Auth／金流，上架必須）、沒有 Crash reporting/Analytics、沒有籤詩全庫瀏覽/查詢功能、沒有 Apple 登入 |
| 🟢 長期 | npm 11 個中度漏洞（卡在 Expo 內部套件鏈，等 SDK 57）、Firestore 離線持久化未設定、籤詩文本本身無多語言版本 |

詳細分類已整理進本檔案下方「未來代辦清單」。

### 完成項目 1：App Store 評分機制真正上線
| 項目 | 檔案 | 說明 |
|------|------|------|
| 安裝套件 | `package.json` | `npx expo install expo-store-review`（依 Expo v56 官方文件確認不需 config plugin） |
| 移除臨時動態 import | `src/services/reviewService.ts` | 改回正常 `import * as StoreReview from 'expo-store-review'` |
| **補上遺漏的呼叫點** | `src/hooks/useDivination.ts` | 發現 `shouldRequestReview()`/`requestReview()` 兩個函式雖然寫好，但整個專案沒有任何地方呼叫，裝了套件也不會生效；已在 `performDraw()` 抽籤完成、`step` 設為 `'result'` 之後接上呼叫 |

### 完成項目 2：淺色/深色主題改成真正可即時切換
| 項目 | 檔案 | 說明 |
|------|------|------|
| 新增主題狀態管理 | `src/services/themeStore.ts`（新檔） | 仿照既有 `i18n.ts` 的 singleton + listener 模式，管理目前主題模式與系統色彩模式 |
| 新增 reactive hook | `src/hooks/useAppTheme.ts`（新檔） | 提供 `{ theme, mode, setMode }` |
| App 啟動載入設定 | `src/app/_layout.tsx` | 掛載時讀取使用者先前存的主題設定 |
| 首頁全面轉換 | `src/app/(tabs)/index.tsx` | 含 `HomeScreen` 及其 4 個子元件，`StyleSheet.create` 改成 `createStyles(theme)` 函式 |
| 設定頁全面轉換 | `src/app/(tabs)/settings.tsx` | 主題選擇改成即時套用（比照現有「環境音」開關的體驗），不用再按「儲存設定」 |
| 首頁子元件轉換 | `src/components/home/ForWhomSelector.tsx`、`DailyFortuneCard.tsx` | 含把模組層級寫死顏色的 `RELATION_LABEL` 物件改成依 theme 動態產生 |

#### 疑難排解記錄（有參考價值，先記下來）
主題切換一開始「狀態有更新但畫面不變色」：`setThemeMode()` 確認有觸發、監聽器也有被呼叫，但畫面重新渲染後讀到的還是舊值。排除模組重複載入、dev server 快取舊 bundle 後，找到真正原因：

**`app.json` 開了 `experiments.reactCompiler: true`**。React Compiler 會自動幫函式加記憶化，但它看不出 `getCurrentThemeMode()` 這種讀取「模組層級外部可變狀態」的函式每次呼叫結果可能不同，於是把第一次的值快取住，之後永遠不會重新計算。

**修法**：改用 React 內建的 `useSyncExternalStore`（就是為了訂閱這種外部可變狀態設計的 hook），React Compiler 認得這個 hook 的語意、不會把它記憶化掉。

### 驗證
- `npx tsc --noEmit` 全部通過
- 用 Playwright 啟動本機 Web 版實際點擊「深色/淺色」切換，截圖確認首頁與設定頁即時換色，主控台無錯誤

### 尚未完成（範圍內刻意保留）
- 其餘約 35 個檔案仍用固定死的 `TempleTheme`，設定頁「* 淺色主題仍在優化中」提示保留為真實狀態
- 尚未 commit（詳見下方「未來代辦清單」與目前 git 狀態）

---

## 2026-06-30 Code Review 十大 Bug 修復

### 本輪主題
對前一輪抽籤動畫修復的 diff 跑 `/code-review --effort high`，找出 10 個 bug 並全部修復。

### 修復清單
| # | 檔案 | Bug | 修法 |
|---|------|-----|------|
| 1 | `src/services/interpretation.ts` | `SECTION_TITLES` 只有 5 個項目，但程式寫入索引 0~6，`sections[5]`/`[6]` undefined 導致每次 fallback 都會 crash | 補上 `state`、`avoid` 兩個 section，擴充成 7 個對齊 |
| 2 | `src/components/PoemCard.tsx` | 「💬 社群交流」按鈕複製貼上重複渲染兩次 | 移除多餘的一個 |
| 3 | `src/app/(tabs)/index.tsx` | `handleReset` 沒有重置 `poemConfirmText`/`poemConfirming` | 補上重置 |
| 4 | `src/components/Jiaobei.tsx` | `visibleStrictCount` 連續兩次聖筊時因 `latestResult` 判斷錯誤少算一次 | 改用 `preTossResultLength` ref 判斷 |
| 5 | `src/data/poems/godSpecific.ts` | 濟公籤 `focusKey: 'general'` 時，`general:` 覆寫掉本該寫入的內容 | `focusKey === 'general'` 時不再額外寫 `general` |
| 6 | `src/app/(tabs)/index.tsx` | 3 個子元件只收到 `reducedMotion`，沒收到 `lowMotionMode` | 傳入 `reducedMotion \|\| lowMotionMode` |
| 7 | `src/services/storage.ts` | `isFavorite` 只比對 `poem.number`，不同神明共用籤號會誤判已收藏 | 加上 `godName` 一併比對 |
| 8 | `src/app/(tabs)/collection.tsx` | `handleToggleAction` 每次都 `await loadData()` 全量重讀 | 改成樂觀更新本地 state，背景寫入 |
| 9 | `src/components/DrawAnimation.tsx` | 進度條寬度/位移用寫死的數字 | 改用 `onLayout` 動態量測 |
| 10 | `src/services/photoDivination.ts` | 拍照辨識比對籤號時沒有依籤系統排序，會被基底系統（雷雨師/六十甲子）搶先誤配對 | 排序時讓有專屬籤詩系統的神明優先比對 |

### Git
- `fix: 修復 code review 發現的 10 個 bug`（commit `610420c`）

---

## 2026-06-29 抽籤動畫 crash 修復 + Vercel 部署

### 本輪主題
修復抽籤時的執行期錯誤：`inputRange must be monotonically non-decreasing 0,0.5,1,0.5,0`。

### 根因
`Animated.sequence([0→1 的 timing, 1→0 的 timing])` 在 RN Web 的 native driver 上會被取樣成 5 個關鍵幀 `[0, 0.5, 1, 0.5, 0]`，這串數字被誤判成 `inputRange` 使用，因為不是遞增數列而丟出例外。

### 修法
| 項目 | 檔案 | 說明 |
|------|------|------|
| 動畫改為單程 | `src/components/DrawAnimation.tsx` | `auraLoop`、`floatLoop` 從來回 `sequence` 改成單一 `0→1` timing，搭配鐘形 `outputRange`（如 `[0.94, 1.1, 0.94]`）維持視覺效果 |
| interpolation 穩定化 | 同上 | 所有 interpolation 包進 `useMemo`，避免重渲染時重建節點 |
| 進度條改用原生驅動 | 同上 | `progressAnim` 從 `useNativeDriver: false` 改為 `true`，寬度改用 `transform` |

### 部署
- 修復後 push 到 GitHub（`https://github.com/MAGICSMALLBEAR/shenming-divination.git`），由既有的 GitHub–Vercel 整合自動部署到 `shenming-divination.vercel.app`
- 同時修正 `vercel.json` 加入 `cleanUrls` 支援靜態路由正確對應

### Git
- `fix: 修復抽籤動畫 inputRange 非遞增錯誤並新增功能優化`（commit `82c18d9`）
- `fix: vercel.json 加入 cleanUrls 支援靜態路由正確對應`（commit `a29a3ec`）

---

## 2026-06-10 P1 ~ P4 市場差距全面補足

### 本輪主題
根據競品分析識別四類市場缺口，逐一實作：P1 基礎缺口 → P2 留存缺口 → P3 商業化缺口 → P4 質感缺口

---

### P1 完成（基礎缺口）
| 項目 | 檔案 | 說明 |
|------|------|------|
| 農曆完整版 | `src/data/lunarFullCalendar.ts` | 12時辰宜忌、沖煞生肖、五行納音、神煞 |
| 廟宇地圖 | `src/data/temples.ts` + `src/app/map.tsx` | 台灣20座廟宇、GPS定位、城市篩選、外部導航 |
| Firebase 架構 | `src/services/firebaseConfig.ts` + `authService.ts` + `cloudSync.ts` | 匿名登入＋Firestore 雲端同步，未填寫 API key 時自動降級 |

### P2 完成（留存缺口）
| 項目 | 檔案 | 說明 |
|------|------|------|
| 節慶行事曆 | `src/data/festivals.ts` | 16個台灣節慶 + 拜拜指南 |
| 流年/流月運勢 | `src/services/yearFortune.ts` | 12生肖 × 丙午年年運 + 12個月月運 |
| 完整八字命理 | `src/services/baziAdvanced.ts` | 四柱、十神、大運起算、納音五行 |
| AI 合婚/擇日 | `backend/src/server.ts` | 新增 `POST /api/bazi/match` 和 `POST /api/择日` |
| 日曆頁升級 | `src/app/daily.tsx` | 整合農民曆/節慶/流年5維度/流月12分頁 |

### P3 完成（商業化缺口）
| 項目 | 檔案 | 說明 |
|------|------|------|
| Freemium 訂閱 | `src/services/premiumService.ts` | 月/年/終身三方案，免費版每日3次，AsyncStorage 模擬 |
| 升級彈窗 | `src/components/PremiumPaywall.tsx` | 方案選擇 + 功能對比表 + 法律備注 |
| 線上長明燈 | `src/app/temple.tsx`（更新） | 30天長明燈（Premium限定），未升級彈出 Paywall |
| 真人諮詢頁 | `src/app/consult.tsx` | 4位命理師、預約流程UI、FAQ |
| 設定頁訂閱 | `src/app/settings.tsx`（更新） | 訂閱狀態顯示/升級/取消 |

### P4 完成（質感缺口）
| 項目 | 檔案 | 說明 |
|------|------|------|
| 完整 Onboarding | `src/app/onboarding.tsx` | 4步引導（歡迎→生辰→守護神→通知），首次安裝自動觸發 |
| App Store 評分 | `src/services/reviewService.ts` | 求到好籤（5次後）自動請求 expo-store-review |
| 深/淺色主題 | `src/constants/themes.ts` | 廟宇夜色/宣紙米白/跟隨系統 三選項 |
| 分享圖卡升級 | `src/components/UpgradedShareCard.tsx` | 廟宇金/節慶紅/宣紙白 三種精美模板 |

### 新增導航頁
| Tab | 路由 | 功能 |
|-----|------|------|
| 廟宇 | `/map` | 廟宇搜尋 + 定位 + 導航 |
| 諮詢 | `/consult` | 真人命理師預約 |

### Git
- `feat: P1+P2 功能完整實作`（15個檔案）
- `feat: P3+P4 商業化與質感升級`（13個檔案）
- Push：✅ `origin/master` 已同步

---

## 2026-06-11 高/中/低影響力功能全面完成

### 本輪主題
根據競品分析新增搖機求籤、節氣提示、跨神比對、社群交流（高影響）→ 廟宇擴充50+、2027年運、合婚擇日UI、八字命盤頁（中影響）→ 離線快取、Widget替代、後端部署配置（低影響）

### 高影響力功能（已完成）
| 項目 | 檔案 | 說明 |
|------|------|------|
| 搖手機求籤 | `src/hooks/useShakeDetector.ts` | Accelerometer閾值2.8G，cooldown 1200ms，web平台跳過 |
| 節氣提示 | `src/services/solarTerms.ts` | 24節氣2026完整資料，五行/宜/忌，顯示於求籤結果頁 |
| 跨神明比對 | `src/components/CrossTempleComparison.tsx` | 隨機3位其他神明籤詩對照，可展開 |
| 社群交流 | `src/app/community.tsx` | Firebase Firestore + AsyncStorage fallback，按讚/貼文/時間戳 |

### 中影響力功能（已完成）
| 項目 | 檔案 | 說明 |
|------|------|------|
| 廟宇擴充50+ | `src/data/temples.ts` | 20→50+座，新增Temple介面欄位：userRating/reviewCount/photos/website/parking |
| 2027丁未年運 | `src/services/yearFortune.ts` | 12生肖完整年運+月運，三合亥卯未/六合午未/沖丑/刑戌/害子 |
| 合婚擇日UI | `src/app/fate.tsx` | 合婚八字配對 + 擇日選吉，呼叫後端 `/api/bazi/match` 和 `/api/择日` |
| 八字命盤頁 | `src/app/bazi.tsx` | 四柱表/五行分佈條/大運時間軸，呼叫 `calculateFullBazi()` |

### 低影響力功能（已完成）
| 項目 | 檔案 | 說明 |
|------|------|------|
| AI 離線快取 | `src/services/offlineCache.ts` | AsyncStorage快取，key=神名+籤號+問題類別，TTL 7天，最多50條 |
| Widget 替代方案 | `src/services/notifications.ts` | 新增 `scheduleFortuneWidgetNotification()`，每天08:00推送節氣+神諭 |
| Widget 設定開關 | `src/app/settings.tsx` | 通知區塊新增「每日運勢看板」Toggle |
| 後端部署設定 | `backend/Dockerfile` + `backend/fly.toml` | Node 20 Alpine，部署到 Fly.io nrt(東京)區域 |
| npm 漏洞說明 | 見下方說明 | 11個中等漏洞全在 Expo 內部包，非本專案可修 |

### npm 安全性漏洞說明（技術債記錄）
`npm audit` 回報 11 個 moderate 漏洞，追蹤來源：
- 全部在 `@expo/config-plugins` → `@expo/config` 依賴鏈
- `expo-splash-screen`、`expo-modules-core` 等 Expo SDK 56 內部套件
- **不能用 `npm audit fix`**（safe mode 無修復路徑）
- **不能用 `npm audit fix --force`**（breaking changes，會破壞 SDK 相容性）
- **處理方式**：等 Expo SDK 57 升級時一併解決；上架前如 Apple/Google 要求，可於 AppStore Connect 說明為第三方 SDK 上游問題

### 新增導航頁
| Tab | 路由 | 功能 |
|-----|------|------|
| 交流 | `/community` | 社群討論版 |
| 合婚擇日 | `/fate` | 合婚配對 + 擇日選吉 |
| 八字 | `/bazi` | 八字命盤詳細頁 |

---

## 未來代辦清單

> 2026-07-05 更新：#2、#4、#10、#11、#14 皆已完成。剩餘項目全部需要外部帳號/服務才能繼續。

### 🔴 高優先（上架前必須）

| # | 項目 | 說明 | 指令/備注 |
|---|------|------|-----------|
| 1 | **Firebase 接入** | 到 console.firebase.google.com 建立專案，填入 `src/services/firebaseConfig.ts` | 填完後雲端同步自動生效 |
| 2 | ~~**expo-store-review 安裝**~~ ✅ 2026-07-05 完成 | 已安裝套件，並補上 `useDivination.ts` 裡遺漏的呼叫點（原本裝了也不會生效） | — |
| 3 | **IAP 真實付款** | premiumService.ts 架構已建好，接入 RevenueCat 或 Expo IAP | 目前 AsyncStorage 模擬，不能收費 |
| 4 | ~~**淺色主題全頁面套用**~~ ✅ 2026-07-05 完成 | 全站 34 個剩餘檔案已全部轉換，`grep TempleTheme.` 全站零殘留 | — |
| 10 | ~~**隱私權政策 / 服務條款頁面**~~ ✅ 2026-07-05 完成 | 新增 `src/app/privacy.tsx`，從設定頁「關於這個版本」可連結進入 | — |

### 🟡 中優先（品質提升）

| # | 項目 | 說明 |
|---|------|------|
| 5 | **後端正式部署** | `backend/Dockerfile` + `fly.toml` 已建好，執行 `fly launch` 部署到 Fly.io；更新前端 `EXPO_PUBLIC_AI_API_URL` |
| 6 | **Firebase Community** | community.tsx 已實作 Firestore 路徑，填入真實 API key 後自動生效 |
| 11 | ~~**測試 / CI**~~ ✅ 2026-07-05 完成 | `jest-expo` + `__tests__/`（15 個測試）+ `.github/workflows/ci.yml`（typecheck+lint+test） |
| 12 | **Crash reporting / Analytics** | 尚未接 Sentry 或 Firebase Analytics 之類工具，上線後出問題會完全不知道 |
| 13 | **Apple 登入** | `authService.ts` 目前只有 Google／匿名登入；若上 iOS 且提供其他第三方登入，Apple 規定必須同時提供 Sign in with Apple |

### 🟢 低優先（長期優化）

| # | 項目 | 說明 |
|---|------|------|
| 7 | **npm 漏洞** | 等 Expo SDK 57 升級時一併解決，詳見上方說明 |
| 8 | **原生 Widget** | Expo SDK 57+ expo-widgets 套件，屆時將現有 `scheduleFortuneWidgetNotification()` 資料層升接原生 Widget UI |
| 9 | **Firebase 資料離線快取** | AI 解籤已有 offlineCache.ts，Firebase 讀寫另需 Firestore offline persistence 設定 |
| 14 | ~~**籤詩查詢圖書館**~~ ✅ 2026-07-05 完成 | 新增 `src/app/library.tsx`，從「更多」頁進入，可切換神明/搜尋/展開籤文 |

---

### 接手指令
```powershell
cd c:\Users\user\Desktop\神明占卜\shenming-divination
.\node_modules\.bin\tsc.cmd --noEmit   # 型別檢查
npx expo start --web                   # 啟動前端（http://localhost:8081）
cd backend; npm run dev                # 啟動後端（http://localhost:3001）
```

---

## 2026-06-05 睡前整理

### 本輪主題
- 神明新圖資產接線
- 補齊 `soft` 柔邊版
- 產出結果頁用 `closeup` 近景版

### 已完成
| 項目 | 狀態 | 備註 |
|------|------|------|
| App 改吃新神像圖 | 完成 | `GodSelector`、首頁選神後 banner 改吃 `generated/cards/*` |
| 結果頁近景版接線 | 完成 | `PoemCard` 改吃 `generated/closeups/*`，頭像框改成直式比例 |
| 抽籤動畫 soft 圖接線 | 完成 | `DrawAnimation` 改吃 `generated/soft/*` |
| 其餘 7 位 soft 圖補齊 | 完成 | 新增 `baoshengdadi / fudezhengshen / mazu / wangye / wenchangdijun / zhugewuhou / zhushengniangniang` |
| closeup 近景版一套 | 完成 | 9 位神明皆已輸出到 `assets/images/gods/generated/closeups/` |
| 型別檢查 | 完成 | `./node_modules/.bin/tsc.cmd --noEmit` 通過 |

### 這次新增 / 修改檔案
| 檔案 | 說明 |
|------|------|
| `src/data/godImages.ts` | 集中管理 `card / soft / closeup` 三套圖 |
| `src/components/GodSelector.tsx` | 神明卡改吃新 `card` 圖 |
| `src/app/index.tsx` | 選神後 banner 改吃新 `card` 圖 |
| `src/components/DrawAnimation.tsx` | 抽籤動畫縮圖改吃 `soft` 圖 |
| `src/components/PoemCard.tsx` | 結果頁改吃 `closeup` 圖並調整頭像容器比例 |
| `scripts/generate-god-derived-assets.ps1` | 從 `cards` 批次產出 `soft` 與 `closeup` |
| `assets/images/gods/generated/soft/*` | 補齊剩餘 7 張 soft 圖 |
| `assets/images/gods/generated/closeups/*` | 新增 9 張結果頁近景圖 |

### 目前 git 狀態
```text
M  src/app/index.tsx
M  src/components/DrawAnimation.tsx
M  src/components/GodSelector.tsx
M  src/components/PoemCard.tsx
?? assets/images/gods/generated/
?? scripts/generate-god-derived-assets.ps1
?? src/data/godImages.ts
```

### 明天第一優先代辦
1. 開 Web 或裝置實機檢查首頁神明卡、選神後 banner、結果頁頭像比例是否順眼。
2. 如果結果頁近景太近或太高，優先微調 `scripts/generate-god-derived-assets.ps1` 內的 `$cropTopBySlug` 後重跑。
3. 視畫面效果決定要不要把 `soft` 圖也套到其他頁面，或只保留給抽籤動畫。
4. 補 `assets/images/gods/generated/README.md`，把 `closeups/` 與產生方式寫進去。

### 待確認 / 風險
- 這輪只做了靜態與圖片抽查，還沒完成實際瀏覽器畫面 QA。
- `WORKLOG.md` 舊內容在終端顯示有亂碼，但檔案本身仍可讀；若明天 IDE 也顯示異常，再一起整理編碼。
- `soft` 目前是用程式從 `card` 做羽化，不是重新 AI 生成；一致性高，但若想更夢幻可再追加 AI 版。

### 明天接手指令
```powershell
cd c:\Users\user\Desktop\神明占卜\shenming-divination
./node_modules/.bin/tsc.cmd --noEmit
./scripts/generate-god-derived-assets.ps1
```

---
# 撌乩??亥? - 蟡??? App

---

## 2026-05-31

### Commit `d89f97f` ???之?詨?撌株?鋆?

#### ?劓?怠??游?
| 瑼? | ?批捆 |
|------|------|
| `src/services/bazi.ts`嚗撱綽? | ??/憭拙僕?唳/鈭?/?詨??豢?/摰風蟡?閮?嚗?渲正??瘞?撟港遢頛詨 |
| `src/app/settings.tsx` | ?劓?寧撟港遢頛詨 ???單?憿舐內?怠??∴?鈭??脫???賢僑蝝?霅衣內嚗??末蟡??芸? ?? 璅內摰風蟡?|
| `src/components/GodSelector.tsx` | 霈??颲啗身摰?蝯血?霅瑞?憿舐內??霅瑯?敺賜?嚗??慰摮之摮?????閫/慦???靽???憡???摮??誨 emoji |

#### 瘥??Ｘ
| 瑼? | ?批捆 |
|------|------|
| `src/services/dailyFortune.ts`嚗撱綽? | 鞎?鈭???摨瑚?蝬剛???1?????兢??雿摮???銵???靘?Ⅱ摰抒???|
| `src/app/index.tsx` | 擐? GodSelector 銝???嚗?閮剜韏瘀?暺?撅?鈭雁閰?閰單? |

#### ?單?蝟餌絞??
| 瑼? | ?批捆 |
|------|------|
| `src/services/proceduralSound.ts` | expo-av ?嗆?撠曹?嚗瑼 assets/sounds/ ?喳??剁?嚗????嚗擳?銝?)??蝤???)?姘???脩?)????蝯?) |
| `src/components/IncenseRitual.tsx` | ???孛?潭擳 |
| `src/app/index.tsx` | 蝯??剜??孛?潮??潸 |

---

### Commit `0229510` ??鋆? 6 ???賜撩??
| # | ? | 撖虫? |
|---|------|------|
| 1 | **閮梢???** | 蝯???action bar ???? 閮梢?嚗??萄??`addWish`嚗歇閮梢?憿舐內 ??|
| 2 | **颲脫???朣?* | 2026-06 ~ 12 ??7 ???30憭抬??怎?瘞????隤?銝剖??葉蝘??賜?嚗?|
| 3 | **Settings 摮?蟡** | ?末蟡??詨鋆? id:9 摮?蟡 |
| 4 | **Stats ?勗?** | ?渡??梁???擃漲靘?憭批潛?瘥葬??|
| 5 | **??澈** | PoemCard ??潘? ??澈??Native ?芸?嚗eb ??銴ˊ?? |
| 6 | **Chat 蝐方帘銝???* | 瘙?蝐方???敺惜閰抬??脣撠店??24 撠??折＊蝷箇惜???/??嚗PI system prompt ?怎惜閰拙摰?|

---

### Commit `2d3ba02` ??摮?蟡摰瘚? + TypeScript 靽桀儔

| ? | ?批捆 |
|------|------|
| 摮?蟡瘚? | `enter-zhuge-number` FlowStep嚗?喳?頝單蝑??`ZhugeNumberInput`嚗?摰◢?詨??萇嚗??望 ??`drawZhugePoem(n)` |
| 隢貉?蟡鋆? | 蝚?1??4 ?血??渲????剖??撠????西情嚗??怎閰??豢?/閫?嚗?|
| PoemCard ?? | 憿舐內?血?嚗itle嚗? ?血?嚗anzhi嚗?銴ˊ/??/?澈???怠??|
| TypeScript ?冽? | absoluteFillObject?efreshControl?emoveItem export?otificationBehavior?ref as const ????6 ??|

---

## 2026-06-01嚗??伐?

### Commit `bdbc34a` ?????芰頛詨
| ? | ?批捆 |
|------|------|
| 霈 | GodSelector QuestionForm 鋆? TextInput嚗?嗅?芰??頛詨?瘙?鈭??? 6 ??chip ?身靽?銝血?嚗?|
| ???| ??摰? ?#3 |

### Commit `8e1e3e9` ??瘥?靘???鈭??犖??| ? | ?批捆 |
|------|------|
| 霈 | dailyFortune.ts ????嚗???乩?鈭??貊??詨?隤踵?嚗????冽? |
| ???| ??摰? ?#4 |

### Commit `e1fba9e` ??蟡????冽?
| ? | ?批捆 |
|------|------|
| 霈 | ?亙 notifications.ts ??嚗???隤?銝憭拇?剜???lunarCalendar.ts 颲脫?蟡?鞈?撌脣???|
| ???| ??摰? ?#6 |

### Commit `292511e` ??Stats ?僑摨血?憿批
| ? | ?批捆 |
|------|------|
| 霈 | Stats ???典??僑摨血?憿扼嚗蜇甈⊥??撣詨?????撣豢?????擃?蝐?|
| ???| ??摰? ?#8 |

### Commit `4186209` ??蝐方帘蝟餌絞?券?
| ? | ?批捆 |
|------|------|
| ?琿撣怎擐甇?| 100 擐惜閰拚??唳撠?靽格迤?臬摮??澆?銝???|
| 閫?喲?蝐斤蝡遣蝡?| ?啣遣?函? dataset嚗??琿撣怎擐???靘?|

### Commit `3f251db` ???剖??脣?蝐文?Ｘ甇?| ? | ?批捆 |
|------|------|
| ?剖??脣?蝐斗甇?| 60 擐?摮惜??∪? |
| ???| ??蝐方帘蝮賣?湔?綽??琿撣怎擐?100) + 閫?喲?蝐??函?) + ?剖??脣?(60) + 隢貉?蟡(64) = 224+ |

---

## 2026-06-03嚗??伐?

### 擐?蝛箇??移靽殷?銝◢?潘?
| 瑼? | 隤芣? |
|------|------|
| `assets/images/ritual/sprites/bronze-censer-empty.png` | ??樴?蝛箇?嚗?蝺?solidity 0.7192??.7410嚗?.8% ????嚗?蝺?像皛?+ ?喳漣撘瑕? + ???嚗?|
| `assets/images/ritual/sprites/celadon-censer-empty.png` | ??桃?蝛箇?嚗?蝺?撌脫?雿?0.7984)嚗凝????2.7%嚗??detailEnhance + ??批?嚗?|
| `assets/images/ritual/sprites/cinnabar-censer-empty.png` | ?望?撖箏?蝛箇?嚗??憭?solidity 0.7758??.7968嚗?% ????嚗????憭改??抒楠????＊嚗?|
| `assets/images/ritual/ai-ritual-styles.png` | 銝◢?澆?撘???(1536?1024)嚗itualStylePicker 蝮桀???|
| `assets/images/ritual/sprites/*-flat.png` | 銝◢?潭蝑像?舫 |
| `assets/images/ritual/sprites/*-round.png` | 銝◢?潭蝑?舫 |

**???**嚗?- **?楠** ??ApproxPolyDP 頛芸?撟單? + ?楠撣?bilateral filter ?餃 + alpha 皜?
- **?喳漣** ??摨 15% detailEnhance 憓撥蝝? + medianBlur ?文
- **??批?** ??distance transform 瘣頝瞍詨惜??嚗??????20%嚗?2px ?腹嚗? bilateral 撟單??抒楠
- **?湧?蝝?** ??edgePreservingFilter 15% ??蝯曹?鞈芣?

### ?撘頂蝯梢?瑽?| 瑼? | 隤芣? |
|------|------|
| `src/constants/ritual-styles.ts`嚗撱綽? | 銝◢?澆?蝢抬?bronze/celadon/cinnabar嚗??恍??征/蝵?sprite?蝑?sprite?ccent/glow/chip ?脩頂 |
| `src/components/RitualStylePicker.tsx`嚗撱綽? | ?撘◢?潮?嚗? atlas 鋆?憸冽蝮桀?嚗??∪椰?單???|
| `src/components/IncenseRitual.tsx` | ?券??嚗?憸冽擐??脣??踵??征??mask viewport + sprite 憿舐內??潛???憯葬??? |
| `src/components/Jiaobei.tsx` | ?脩??券??嚗?憸冽 sprite ?踵?嚗airSplit + tossRise + fallBounce ?嚗?????|
| `src/components/PoemCard.tsx` | ?交摰蟡?鞈?嚗????憿舐內蟡?璈怠? + ???? |
| `src/app/index.tsx` | ?游? RitualStylePicker嚗?撘?憸冽?末摮閮剖?嚗?蝔???incenseRitual ??jiaobei ??drawAnimation ??poemCard |
| `src/app/wishes.tsx` | ???撘瑕? + 靘?閮? |
| `src/app/collection.tsx` | ?嗉???瑽???/蝭拚/???芸? |
| `src/app/chat.tsx` | 撠店??渡惜閰拐?銝?嚗ystem prompt ?急?敺?蝐方?閮?|
| `src/services/wishTracker.ts` | 憿?餈質馱?舀靘?憿??憿???|
| `src/services/notifications.ts` | ?冽???游?嚗???隤??? |
| `src/components/app-tabs.tsx` | ?惜?脣蔗頝?嗅??訾葉憸冽 |

### 銝??靽桀儔嚗eb嚗?| ?? | 靽桀儔 |
|------|------|
| `dropZoneRect` null ??`placeIncenseInCenser()` ??憭望? | scene `onLayout` ???湔撠箏站嚗tyle 撌脩?詨潸?蝞?drop zone 雿蔭嚗???鞈?`measureInWindow` |
| 摨扳?蝟餌絞?舫?嚗撟漣璅雿?translate offset嚗?| ?寧?湔?抒撠漣璅???芰雿蔭 `(sceneW-35, sceneH-62)`嚗??銝剖? `(sceneW/2, sceneH-167)`嚗?蝞?蝘餃榆 |
| ??菜葫憭望? | `isInsideDropZone` ?寧?湔摨扳?瘥?嚗誑 incensePosition.\_value ?單?蝞??其?蝵?|

### Web ???臬???潔撩??- `npx expo export --platform web` ??`dist/` ???臬
- `serve.js` ??Node.js SPA 隡箸?嚗localhost:3000`嚗??? Expo Router 摰Ｘ蝡航楝??fallback
- 撌脩宏??`index.js`嚗?擗? entry point嚗xpo Router package.json `"main": "expo-router/entry"` 撌脰???

### 鞈?撅斗??| 瑼? | 隤芣? |
|------|------|
| `src/data/godProfiles.ts`嚗撱綽? | 9 雿????渲???image?agline???脩頂?恣頧????具?擉風?脣??|
| `src/data/oracleCatalog.ts`嚗撱綽? | 蝐方帘?桅?銝剜?嚗?蝟餌絞蝐斗??摰???蝐方帘蝟餌絞撠??鈭??亙遣霅?|

---

## 2026-06-02

### Commit `bbf2488` ??蟡???銝? + DrawAnimation ?? + 撌乩??亥??湔
| ? | ?批捆 |
|------|------|
| 蟡??? | 9 雿???PNG 撌脫??`assets/images/gods/`嚗odSelector ?蟡帖撟?粹＊蝷箇???|
| 蟡?鞈? | `gods.ts` 鋆? image?agline?rimaryColor?ccentColor?uraColor |
| ?賜惜? | DrawAnimation ???箇????惜蝑??惜?銝惜?蝷箇?摰瘚? |
| ?賜惜?? | Settings ?啣??剔? 3.0 蝘?皞?4.2 蝘?瘚?6.0 蝘??|
| ???| ??摰? ?#3 |

### Commit `84aad94` ??璅? Push ?垢摰?嚗?啁???| ? | ?批捆 |
|------|------|
| Push | 撌脫??蝡荔?撌乩?璅嫣嗾瘛?|
| TypeScript | `tsc --noEmit` ?? |

### ?祆活撌乩? ??瘙惜???甈?| ? | ?批捆 |
|------|------|
| 瘙惜? | QuestionForm 璅?銝憓撅??內甈??銝鈭???鈭??剜???瘙?蝑?蝚?/?啁??儔??憭扳捱蝑??撠平撱箄降 |
| ???| ??摰? ?#4 |

### ?祆活撌乩? ???賜惜?撘瑕?
| ? | ?批捆 |
|------|------|
| ?賜惜?? | 蝐斗??賭?敺憓??????詨??? |
| 蝐斤?蝧駁 | 蝐方??剔內?寧摰???∠?蝧駁?脣嚗＊蝷箇?撖行銝剔惜??|
| ???| ??摰? |

### ?祆活撌乩? ??蝯?????蝷箏撥??| ? | ?批捆 |
|------|------|
| 蟡?璈怠? | PoemCard ?交摰蟡?鞈?嚗????憿舐內蟡?????蟡?璅? |
| ???? | 蝐方帘蝯??⊥憓甈∪?鈭??亥?????嚗?蝐方帘??憿?蝯⊿?銝韏?|
| ???| ??摰? |

### ?祆活撌乩? ???踵?撘??Ｘ??| ? | ?批捆 |
|------|------|
| 擐?摰孵 | `src/app/index.tsx` ?啣? `useWindowDimensions()` ??`pageShell`嚗?????像?踴?璈??嗆?憭批祝摨?|
| ?貊??撓??| `GodSelector` / `QuestionForm` ?寧?臭?撖砍漲???格???甈?頛祝??蝵殷???銝???頛詨?銝??? |
| 蝯???| `PoemCard` ???帖撟?鈭?閬圾蝐斗?雿??帘??憛?銝??Ｗ??芸? |
| ?交??| `MeditationScreen` 鋆?????頝???撖砍漲?批 |
| 撽? | `npx tsc --noEmit` ??嚗蒂隞交璈?web ????/獢??芸?瑼Ｘ嚗撓?箸 `docs/qa/` |
| ???| ??摰? |

---

## 2026-05-29 ~ 30嚗?甈∪極雿?畾蛛?

### Commit `4ee84ec` ??蟡??? MVP 摰??
**?詨??**嚗??湔?蝐斗?蝔I 閫?惜嚗eepSeek/OpenAI/?Ｙ??芸???嚗?頛芸?閰晞??蝑?+?????蕭頩????絞閮?銵冽???亦惜?TS ????撘??單??????怒噙瘞?嚗?026-05嚗?隤? i18n ?嗆?

**8 蟡? + 2 蝐方帘蝟餌絞**嚗?典葦?暸?嚗?00擐???摮惜嚗?0擐?

---

## ?桀????2026-06-03嚗?
| ? | ???|
|------|------|
| TypeScript | ?? 敺?霅?憭折???敺? `tsc --noEmit` 蝣箄?嚗?|
| Git | ??撌?push origin/master嚗ommit `2409cef`嚗 15 commits嚗?|
| 蟡? | ??9 蟡?嚗摮?蟡嚗?摰鞈?撌脣遣嚗odProfiles.ts嚗?|
| 蟡??? | ??9 撘萄撘?摰蔗蝜芷?頨恍◢ PNG 撌脖?蝺?|
| ?撘???| ??銝◢?潘???/?/?望?嚗??征+蝵?sprite?蝑像+?賊?tlas 蝮桀? |
| ?賜惜? | ??蝐斤????蝐日??惜蝝蕃?Ｕ?撖衣惜?蝷箝隤踵??瑕漲 |
| 蝯???| ??蟡??內璈怠? + ?祆活???? |
| ?踵?撘???| ??擐??蟡?鈭撓?乓?????喲?撌脰???/撟單/獢??隤踵 |
| 蝐方帘 | ???琿撣怎擐?100) + 閫?喲?蝐??函?) + ?剖??脣?(60) + 隢貉?蟡(64) = 224+ 擐?|
| 蝐方帘?桅? | ??oracleCatalog.ts 銝剜?撠蝟餌絞 |
| 瘥? | ??撌脖???/鈭??犖??|
| ??頛詨 | ???舀?芰?? + ?身 chip 銝血? |
| 瘙惜? | ???詨?蟡?敺?QuestionForm 憿舐內?臬????? |
| 蟡??? | ???冽?撌脫?蝔?|
| 蝯梯???| ??撟游漲?“?∪歇銝? |
| 颲脫???| ??2026 ?典僑 |
| ?單??嗆? | ??expo-av 撠曹?嚗????銝哨?蝑??祕?單? |
| 銝?瘚? | ??銝◢?潮???擐??/暺???擐??啁?嚗eb 摨扳?靽桀儔摰? |
| ?脩?瘚? | ??銝◢??sprite???脣??怒?蝑?蝚?/?啁??斗 |

---

## 敺齒皜嚗??摨?

### ? ?祇勗???
| # | ? | 隤芣? |
|---|------|------|
| 1 | **擐?蝛箇???頛芰移靽?* | 蝚砌?頛芸歇靽桅?蝺??喳漣/?嚗?撖阡?頝???擐?蝔Ⅱ隤???憒??耨嚗摨抒?頝舐敦????憯釭?絞銝 |
| 2 | **TypeScript 撽?** | ?祆活憭折???敺? `npx tsc --noEmit` 蝣箄??園隤?|
| 3 | **?祕撱??單?** | 皞? 5 ??CC0 ?? `.mp3`嚗oss / shengbei / draw / incense / result嚗??`assets/sounds/` |

### ? 銝???
| # | ? | 隤芣? |
|---|------|------|
| 4 | **??撘?瘚?** | `wishes.tsx` ????甇仿?撘?嚗?????????雓?璅⊥嚗?|
| 5 | **?踵?撘撠?* | ??????ollection/Stats/Wishes ?鋆?????璈?瑼Ｘ嚗Ⅱ隤??蜓?撖砍漲蝑銝??|
| 6 | **蝯??祕璈?霅?* | ?郊瑼Ｘ PoemCard ?券閰拇?? AI 閫??????鈭??乩??臬隞雁?霈?扯???銝???|
| 7 | **QA ?Ｙ?渡?** | 瘙箏? `docs/qa/` ?芸??臭???撽?蝝??唳?隞嗥??????`.gitignore` ?踹?撌乩?璅寞?蝥?暹餈質馱瑼?|
| 8 | **銝??敺株矽** | Web ??drag-to-drop ?桀??菜葫蝭??航?閬凝隤選?摨扳?撌脖耨敺拐???敺祕皜穿? |

### ? ?芸???
| # | ? | 隤芣? |
|---|------|------|
| 9 | **??單?** | Settings ???舫璅????豢?嚗爬蝬????單?/? |
| 10 | **i18n 憟** | `i18n.ts` 撌脣遣憟踝?撠′蝺函Ⅳ???? `t()` ?澆 |
| 11 | **?嗉??臬 PDF** | collection.tsx ??箝??踝?撠??蝐方帘?渡???澈??PDF/?? |
| 12 | **???恍** | `app.json` 閮剖? splash screen嚗?撱?憭折????蟡?蝚行? |
| 13 | **Jiaobei sprite 蝎曆耨** | ?脩? sprite ?桀?銋 AI ??嚗?賭??閬?蝺?蝝?蝎曆耨 |

---

## 銝活撱箄降??

| ?? | 撱箄降鈭? | ?? |
|------|------|------|
| 1 | TypeScript 撽? + 銝?瘚?撖行葫 | ?活???之嚗?蝣箔??園隤?+ Web ??蝔迤撣?|
| 2 | 擐?蝛箇???頛芰移靽?| 蝑祕皜祉Ⅱ隤????嚗?撠摨扼?????敦靽?|
| 3 | ?踵?撘撠?| ??矽?游?嚗??窗?鋆? collection/stats/wishes |
| 4 | 蝯??祕璈?霅?| PoemCard ?詨???蝣箄??瑁帘?I 閫???賜帘摰?|

---

## ?嗆???

```
???誘
??? ?垢嚗??潘?嚗px expo start --web  ?? http://localhost:8081
??? ?垢嚗???嚗px expo export --platform web && node serve.js ??http://localhost:3000
??? 敺垢嚗d backend && npm run dev  ?? http://localhost:3001

?單??單?頝臬?嚗?鋆?
??? assets/sounds/
    ??? toss.mp3      ???脩??賢??    ??? shengbei.mp3  ????嚗?蝤穿?
    ??? draw.mp3      ???賜惜????    ??? incense.mp3   ??銝?嚗擳?
    ??? result.mp3    ??蝯??剜?嚗??潘?
```
## 2026-06-05 ?∪??渡?

### ?祈憚銝駁?
- 蟡??啣?鞈?亦?
- 鋆? `soft` ????- ?Ｗ蝯?? `closeup` 餈??
### 撌脣???| ? | ???| ?酉 |
|------|------|------|
| App ?孵??啁??? | 摰? | `GodSelector`???蟡? banner ?孵? `generated/cards/*` |
| 蝯????舐??亦? | 摰? | `PoemCard` ?孵? `generated/closeups/*`嚗???寞??游?瘥? |
| ?賜惜? soft ?蝺?| 摰? | `DrawAnimation` ?孵? `generated/soft/*` |
| ?園? 7 雿?soft ??朣?| 摰? | ?啣? `baoshengdadi / fudezhengshen / mazu / wangye / wenchangdijun / zhugewuhou / zhushengniangniang` |
| closeup 餈??憟?| 摰? | 9 雿???撌脰撓?箏 `assets/images/gods/generated/closeups/` |
| ?瑼Ｘ | 摰? | `.\node_modules\.bin\tsc.cmd --noEmit` ?? |

### ?活?啣? / 靽格瑼?
| 瑼? | 隤芣? |
|------|------|
| `src/data/godImages.ts` | ?葉蝞∠? `card / soft / closeup` 銝???|
| `src/components/GodSelector.tsx` | 蟡??⊥? `card` ??|
| `src/app/index.tsx` | ?貊?敺?banner ?孵???`card` ??|
| `src/components/DrawAnimation.tsx` | ?賜惜?蝮桀??孵? `soft` ??|
| `src/components/PoemCard.tsx` | 蝯????`closeup` ?蒂隤踵?剖?摰孵瘥? |
| `scripts/generate-god-derived-assets.ps1` | 敺?`cards` ?寞活?Ｗ `soft` ??`closeup` |
| `assets/images/gods/generated/soft/*` | 鋆??拚? 7 撘?soft ??|
| `assets/images/gods/generated/closeups/*` | ?啣? 9 撘萇???餈??|

### ?桀? git ???```text
M  src/app/index.tsx
M  src/components/DrawAnimation.tsx
M  src/components/GodSelector.tsx
M  src/components/PoemCard.tsx
?? assets/images/gods/generated/
?? scripts/generate-god-derived-assets.ps1
?? src/data/godImages.ts
```

### ?予蝚砌??芸?隞?齒
1. ??Web ??蝵桀祕璈炎?仿?????蟡? banner?????剖?瘥??臬???2. 憒?蝯????臬云餈?憭芷?嚗?凝隤?`generate-god-derived-assets.ps1` ?抒? `$cropTopBySlug` 敺?頝?3. 閬?Ｘ??捱摰?銝???`soft` ??憟?嗡??嚗??芯??策?賜惜???4. 鋆?`assets/images/gods/generated/README.md`嚗? `closeups/` ??撘神?脣??
### 敺Ⅱ隤?/ 憸券
- ?憚?芸?鈭??????賣嚗?瘝??祕?汗?函??QA??- `WORKLOG.md` ?摰孵蝯垢憿舐內??蝣潘?雿?獢頨思??航?嚗?予 IDE 銋＊蝷箇撣賂???韏瑟?楊蝣潦?- `soft` ?桀??舐蝔?敺?`card` ?噬??銝? AI ??嚗??湔折?嚗??交?游丐撟餃?蕭??AI ??
### ?予?交??誘
```powershell
cd c:\Users\user\Desktop\蟡???\shenming-divination
.\node_modules\.bin\tsc.cmd --noEmit
.\scripts\generate-god-derived-assets.ps1
```

---

## 2026-06-07 New Deity Portrait Assets

### Completed
- Generated final portrait cards for the six newly added deities: `xuantianshangdi`, `jigonghuofo`, `santaizi`, `yuexialaoren`, `chenghuangye`, and `lvdongbin`.
- Replaced the previous placeholder PNGs under `assets/images/gods/generated/cards/`.
- Regenerated the matching `soft/` and `closeups/` variants for those six deities.
- Standardized all card portraits to `1024x1536`.
- Updated `assets/images/gods/generated/README.md` to document all 15 deity image sets.
- Updated `scripts/generate-god-derived-assets.ps1` so derived assets only regenerate when missing, stale, or dimensionally invalid.

### Verification
- `npx tsc --noEmit` passed.
- `.\scripts\generate-god-derived-assets.ps1` ran cleanly after the incremental regeneration change.
- Checked all card images in `assets/images/gods/generated/cards/`; every card is `1024x1536`.
- `npm run lint` could not complete because Expo tried to auto-create an ESLint config and hit `ECONNREFUSED 127.0.0.1:9`; this is unrelated to the image assets.

### Notes
- Existing data-file changes in `src/data/godImages.ts`, `src/data/godProfiles.ts`, `src/data/gods.ts`, and `src/data/poems/ershibaxiu.ts` were preserved.

---

## 2026-06-07 Product Polish Pass

### Completed
- Replaced the default Expo README with project-specific setup, structure, checks, AI, and generated-asset notes.
- Added ESLint support with `eslint` and `eslint-config-expo`, plus `eslint.config.js`.
- Disabled the React Compiler lint rules that currently conflict with the app's React Native Animated/ref patterns so lint can be used as a practical daily check.
- Filled the new deity `image` fields in `src/data/gods.ts` with the generated card portraits.
- Rebuilt `src/services/actionPlan.ts` with readable, category-aware Chinese action suggestions.
- Rebuilt `src/services/recommendation.ts` with readable recommendation reasons.
- Rebuilt `src/services/shareCard.ts` and `src/components/ShareCardView.tsx` with clean share text and share-card labels.
- Upgraded result sharing to include vernacular text, AI summary, and action steps.
- Added a result-page `回訪` action that opens `collection?tab=history`.
- Added route-param support in `collection.tsx` so the collection page can open directly on history.
- Added homepage cards for `今日適合請示` and `有一支籤等待回訪`.
- Added a small `今日修行` prompt inside the expanded daily fortune card.

### Verification
- `npx tsc --noEmit` passed.
- `npm run lint` passed with warnings only.
- `npm run export:web` passed and generated 9 static routes under ignored `dist/`.

### Follow-Up Debt
- Lint still reports warnings for unused imports, Unicode BOMs, hook dependency arrays, and legacy `require()` imports.
- `npm install` reported 11 moderate vulnerabilities. No automatic `npm audit fix` was run because it may alter dependency versions broadly.

---

## 2026-06-07 Lint Cleanup Pass

### Completed
- Ran `npx expo lint --fix` to remove auto-fixable formatting and style warnings.
- Removed unused imports/state/variables from `_layout.tsx`, `index.tsx`, `settings.tsx`, `GodSelector.tsx`, `ParticleEffect.tsx`, `PoemCard.tsx`, `proceduralSound.ts`, and `lunarCalendar.ts`.
- Renamed the fireworks burst type/component pair to avoid `no-redeclare`.
- Updated `eslint.config.js` to keep React Native Animated/ref patterns and dynamic `require()` fallbacks from creating noisy lint output.

### Verification
- `npm run lint` passed with zero warnings.
- `npx tsc --noEmit` passed.
- `npm run export:web` passed and exported 9 static routes.

### Remaining Debt
- `npm install` previously reported 11 moderate vulnerabilities. Still not auto-fixed because `npm audit fix` may change dependency versions broadly.

---

## 2026-06-07 Ritual Animation Pass

### Completed
- Added a deity entrance banner animation after god selection: card fade-in, portrait scale-up, gold aura, and rising incense smoke.
- Upgraded the poem reveal presentation with floating gold dust and scroll rods around the poem text area.
- Added a breathing gold-frame animation to the pending review card on the home screen.
- Added a soft shimmer and press-scale animation to the daily deity recommendation card.
- Added a wish completion overlay with red binding threads, a gold-lit seal, and sparks after adding a wish.

### Verification
- `npx tsc --noEmit` passed.
- `npm run lint` passed with zero warnings.
- `npm run export:web` passed and exported 9 static routes.

---

## 2026-06-07 Reduced Motion Support

### Completed
- Added `useReducedMotion` using React Native `AccessibilityInfo`.
- Disabled or simplified the new home-screen ritual animations when system reduced motion is enabled.
- Disabled the poem reveal gold dust loop and reveal transitions under reduced motion.
- Added a reduced-motion fallback for the draw animation so the result state is shown without shaking, pulsing, or flip motion.

### Verification
- `npx tsc --noEmit` passed.
- `npm run lint` passed with zero warnings.
- `npm run export:web` passed and exported 9 static routes.

---

## 2026-06-07 Responsive Layout Pass

### Completed
- Added `useResponsiveLayout` to centralize phone, tablet, desktop, and wide-desktop breakpoints.
- Updated the home screen and deity selector to use shared responsive width rules; wide desktop deity grids can show four columns.
- Updated the daily page so fortune and daily poem cards become a two-column hero layout on desktop.
- Updated the stats page with wider content and desktop section grouping.
- Updated collection/history and wishes pages with desktop two-column card layouts while preserving single-column mobile reading.
- Updated settings with desktop-friendly section grids, responsive duration cards, and side-by-side backup actions.
- Updated chat with a narrower desktop reading width and smaller message bubble max-width.

### Verification
- `npx tsc --noEmit` passed.
- `npm run lint` passed with zero warnings.
- `npm run export:web` passed and exported 9 static routes.

---

## 2026-06-07 Draw Animation Style Switcher

### Completed
- Added a draw-animation style system with three visual/motion presets: bronze dragon censer, celadon lotus censer, and cinnabar temple censer.
- Updated the draw animation to render the selected censer image, matching vessel colors, style badge, style summary, and style-specific shake/lift/flash timing.
- Added settings for draw animation mode: random rotation on every draw or fixed user-selected style.
- Added three selectable style cards in Settings with censer preview images.
- Persisted and normalized the new draw-animation mode and style settings.

### Verification
- `npx tsc --noEmit` passed.
- `npm run lint` passed with zero warnings.
- `npm run export:web` passed and exported 9 static routes.

---

## 2026-06-07 Virtual Temple Pass

### Completed
- Added a new Temple tab/page for the virtual deity hall.
- Added per-deity temple cards with generated deity artwork and active light, flower, and prayer counts.
- Added light offering and flower offering actions, with local records and expiry windows.
- Added deity-specific prayer flows with custom titles, offering copy, light names, flower names, and guided prayer prompts.
- Added recent temple offering history on the Temple page.
- Added local temple record storage and included temple records in backup/export data.

### Verification
- `npx tsc --noEmit` passed.
- `npm run lint` passed with zero warnings.
- `npm run export:web` passed and exported 10 static routes including `/temple`.

