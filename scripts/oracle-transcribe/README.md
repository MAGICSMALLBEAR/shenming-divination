# 籤本轉錄工具

把候選籤本的官方頁面抓下來、解析成逐首 JSON，並標記需要人工確認的地方。

## 重要：輸出不要放進 repo

這個 repository 是公開的。廟方尚未授權 App 展示前，逐首全文只能放在 repo 外的目錄（例如 `神明占卜/private-oracle-transcriptions/YYYY-MM-DD/`）。commit 進 repo 等同公開發表。

Repo 內只保留本目錄的腳本，以及 `docs/` 的首數、雜湊、異文與缺口紀錄。

## 用法

```bash
python -I scripts/oracle-transcribe/transcribe.py \
  --edition zizhu \
  --register src/data/poems/oracleCandidateEntryRegister.json \
  --out-dir /path/outside/repo \
  --cache-dir /path/outside/repo/cache
```

`--edition` 可選 `zizhu`、`wenwu`、`cifeng`、`tainan`；`--limit N` 可先試跑前 N 首。

輸出：

- `<editionId>.json`：逐首 `content`、`lines`、`charCount`、`sha256`、`reviewFlags`、來源網址與抓取時間。
- `<editionId>.report.txt`：人眼快速檢查用。

`reviewFlags` 會標出：官方頁面本身含 U+FFFD、非四句、非七字句。這些不是程式錯誤，是需要人工或廟方確認的地方，不要自動「修正」。

## 大天后宮（籤文只有圖片）

```bash
python -I scripts/oracle-transcribe/fetch_tainan_images.py \
  --register src/data/poems/oracleCandidateEntryRegister.json \
  --out-dir /path/outside/repo
```

下載每首的第一張圖（籤紙）與清單；第二張圖是廟方白話解說，不轉錄。全文由人工目視輸入，異文與可疑用字寫在 `docs/oracle-transcription-report-2026-10-28.md`。

## 抓取禮貌

每次請求間隔 0.4 秒、30 秒 timeout、失敗重試三次，並快取 HTML。重跑時直接讀快取，不會重複打廟方網站。
