# 四套候選籤本：原文逐字轉錄報告

日期：2026-10-28。範圍：內門紫竹寺觀音 28、日月潭文武廟月老 40、屏東慈鳳宮媽祖 100、祀典大天后宮月老 27，合計 195 首。

**展示權狀態：四套皆未取得。** 因此四套仍不可抽籤：`rightsCleared` 全為 `false`，發布閘門維持關閉。本報告只記錄「原文轉錄」這一關的結果。

## 為什麼全文不在這個 repo

`shenming-divination` 是公開 repository（GitHub 可見性為 public）。在廟方未授權 App 展示前，把整批籤文 commit 進去等同公開發表，超出目前取得的範圍。因此：

- 逐首全文、抓取到的官方頁面、大天后宮籤紙影像：放在 repo 外的 `神明占卜/private-oracle-transcriptions/2026-10-28/`。
- repo 內只留：轉錄腳本、首數、雜湊、異文與缺口紀錄、權利狀態。
- 權利確認後，才把全文轉成 `Poem[]` 併入對應籤本，並通過 `getOracleEditionGateErrors`。

## 轉錄方式

| 籤本 | 來源型態 | 方式 |
|---|---|---|
| 紫竹寺觀音 28 | 官方逐首 HTML | `scripts/oracle-transcribe/transcribe.py` 解析官方頁面的 `<p>` 區塊 |
| 文武廟月老 40 | 官方逐首 HTML | 同上，取「籤詩」區塊第一段 |
| 慈鳳宮媽祖 100 | 官方逐首 HTML | 同上，取四個 `fortune-verse-item` |
| 大天后宮月老 27 | 官方籤紙 JPG | `scripts/oracle-transcribe/fetch_tainan_images.py` 下載每首第一張圖，人工目視逐字轉錄 |

腳本以 `urllib` 抓取、30 秒 timeout、三次重試、快取原始 HTML；輸出含 `fetchedAt`、官方頁網址、正規化後字數、`sha256` 與 `reviewFlags`。大天后宮每頁的第二張圖是廟方白話解說，**未轉錄**。

## 結果

| 籤本 | 應有 | 已轉錄 | 無待確認用字 | 全文檔 sha256（前 16 碼） |
|---|---:|---:|---:|---|
| 紫竹寺觀音 28 | 28 | 28 | 28 | `46228d0a79d334b3` |
| 文武廟月老 40 | 40 | 40 | 40 | `888dfdb5b07ce551` |
| 慈鳳宮媽祖 100 | 100 | 100 | 99 | `f2f6021476e14eeb` |
| 大天后宮月老 27 | 27 | 27 | 27 | `01b0274f0367408a` |

無重複籤文、無缺號、無解析失敗。

## 需要廟方確認的用字與格式

1. **慈鳳宮第 49 首**：官方頁面原始碼在第 3 句夾了 3 個 U+FFFD 替換字元（不是抓取錯誤）。待廟方提供正確用字；在修正前 `textVerified` 保持 `false`。
2. **紫竹寺第 28 首**：四句長短不一、不是七言四句，也沒有吉凶分級。這是原始格式，不補成四句、不補吉凶。
3. **大天后宮第 9、10、16、24 首**：放大比對後確認卡片印的是「觀魚現」「登揚州」「無千之事」「倆相求」。前兩者與常見傳本不同，後兩者疑為廟方刻版用字。全部保留原樣並標記 `suspicious_reading`，不以其他版本逕行修正。
4. **大天后宮與紫竹寺屬不同傳本**：11 首有系統性異文（例如第 1 首第 1、2 句的「如／南山」與「你／爾」用字就不同）。異文不是錯字，不得互相覆蓋。

## 尚未完成的部分

- **第二來源交叉校對**：目前每首只對過一個官方頁面（`crossSourceCheckedCount: 0`）。要達到「逐字校對」的嚴格標準，還需要第二份獨立底本或廟方回覆。
- **展示權**：四套皆無書面許可；請求信範本見 [展示權請求範本](rights-request-template-2026-10-28.md)。
- **可抽資料**：全文尚未轉成 `Poem[]`（含 `ganzhi`、`level`、七類解曰），也尚未處理紫竹寺第 28 首與大天后宮「無吉凶分級」的欄位問題。
- **大天后宮三筊流程實測**：27 組筊象映射已有測試，但仍未在真機與正式資料上驗收。

## 重跑方式

```bash
python -I scripts/oracle-transcribe/transcribe.py \
  --edition zizhu \
  --register src/data/poems/oracleCandidateEntryRegister.json \
  --out-dir <repo 外的目錄> \
  --cache-dir <repo 外的目錄>/cache
```

`--edition` 可為 `zizhu`、`wenwu`、`cifeng`、`tainan`（`tainan` 只解析標籤，全文需人工依影像轉錄）。輸出目錄請務必在 repo 外。

## 相關文件

- [工作日誌 2026-10-28](worklog-2026-10-28.md)
- [七套候選籤本現況與缺口](oracle-seven-editions-gap-review-2026-10-28.md)
- [未來功能代辦](future-features-todo.md)
