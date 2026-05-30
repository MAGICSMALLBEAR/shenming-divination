# 工作日誌 - 神明占卜 App

---

## 2026-05-30

### 完成功能

#### 🔢 孔明神數特殊求籤流程（主要需求）
「諸葛神數」不擲筊、改由使用者報一數字，系統依數字取對應卦象。

| 檔案 | 變更內容 |
|------|---------|
| `src/hooks/useDivination.ts` | 新增 `enter-zhuge-number` FlowStep；`finishMeditation` 自動偵測是否諸葛神數，決定進入報數步驟或擲筊步驟；`performDraw(n?)` 接收報數，呼叫 `drawZhugePoem(n)` |
| `src/services/divination.ts` | re-export `drawZhugePoem` |
| `src/components/ZhugeNumberInput.tsx` | **新建**：廟宇風格數字鍵盤，六十四卦符號說明、搖晃錯誤動畫、確認報數 |
| `src/app/index.tsx` | 新增 `enter-zhuge-number` case；步驟指示改顯示 🔢；返回按鈕支援新步驟 |

#### 📚 諸葛神數補完為完整 64 卦
| 檔案 | 變更內容 |
|------|---------|
| `src/data/poems/zhugeShenShu.ts` | 補齊第 33–64 卦，`drawZhugePoem()` 現在對應完整 64 卦循環 |
| `src/data/gods.ts` | `孔明神數.totalPoems` 從 `32` 更新為 `64` |
| `src/components/PoemCard.tsx` | 籤卡補顯示 `poem.title`，複製內容含卦名與卦序 |
| `src/app/index.tsx` | 朗讀與分享文案補上卦名、卦序資訊 |

#### 🔧 修復既有 TypeScript 錯誤（6 項，tsc 0 錯誤）

| 錯誤 | 修復方式 |
|------|---------|
| `StyleSheet.absoluteFillObject` 型別不存在（6 個元件） | 改為明確 `position: 'absolute', top: 0, left: 0, right: 0, bottom: 0` |
| `wishes.tsx` ScrollView 不支援 `refreshing`/`onRefresh` | 改用 `RefreshControl` 元件 |
| `storage.ts` `removeItem` 未 export | 加上 `export` |
| `notifications.ts` `NotificationBehavior` 缺少欄位 | 補 `shouldShowBanner` / `shouldShowList` |
| `app-tabs.web.tsx` href 型別為 `string` 太寬 | 各 href 加 `as const` |

### 目前狀態
- TypeScript: **0 錯誤**
- 諸葛神數: **64 卦已補齊**
- 所有未追蹤新檔已就位，尚未 commit

### 待辦（下次繼續）
- [ ] 測試孔明神數完整流程（Web / Android）
- [ ] commit 本次所有變更
- [ ] 視需要同步優化分享卡畫面（目前主卡/文字分享已顯示卦名）

---

## 2026-05-29

### 完成功能（上一工作階段）
- 建立 60 甲子籤獨立資料（`jiazi60.ts`）
- 姓名 TextInput 輸入
- ShareCardView 分享模板
- IncenseRitual 上香儀式動畫
- ScrollReveal 捲軸動畫
- stats 統計儀表板
- 多語言 i18n（zh-TW / en / ja）
- 神明聖誕提醒
- 解曰關鍵詞高亮
- 返回上一步功能
- 下拉更新

### 修復 Bug（上一工作階段）
- `useNativeDriver` Web 不支援問題
- Jiaobei 動畫報錯 → spring 彈跳
- 收藏重複 → toggle 機制
- PoemCard 再求籤無動畫
- AI API 手機連線 localhost 問題
- 後端 API Key 檢查失效
- `drawPoem` 隨機分佈不均
- Hooks 條件渲染報錯（`useEffect` in switch）
