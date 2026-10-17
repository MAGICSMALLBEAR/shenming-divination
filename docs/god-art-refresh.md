# 神明美術調整（範圍已縮小：只重畫 #31 義民爺）

> 整理日期：2026-10-16，2026-10-17 改版
> 對象：負責生成圖片並接進程式的開發者／AI 代理（例如 Codex）
> **狀態：已完成（2026-10-17）**。Codex 已重畫 #31 義民爺 3 張並通過驗收；特寫圖原有約 0.35% 半透明像素，已轉為完全不透明。
> **2026-10-17 起圖檔格式改為 WebP**：`generated/` 下所有圖已由 PNG 轉為 WebP（品質 80），檔名副檔名改為 `.webp`。日後新增或替換圖片時，請交付 `.webp`（或交付 PNG 後用 Pillow 以 quality=80、method=6 轉檔），並同步更新 `godImages.ts`、`gods.ts` 的路徑；下方驗收腳本中的 `.png` 請對應改成 `.webp`。

## 重要：範圍變更

前一版要求重畫 #1–#50 全部 150 張，**已經取消，請不要做**。

取消的原因：
- 把 59 位的卡片圖並排檢查後，原本 50 位的品質與風格都一致，跟新畫的 #51–#59 擺在一起並不突兀。
- 目前 177 張圖共約 593 MB；全部重畫會讓 git 歷史再增加約 500 MB，舊版刪不掉。

這次只需要重畫 **#31 義民爺**，共 3 張。

## 已經處理好的部分（不用再做）

- **#1–#9 的列表圖**：`src/data/gods.ts` 已改成指向 `generated/cards/` 的新版畫作，與其他畫面一致（2026-10-17）。
- 舊的 `assets/images/gods/<名稱>.png`（9 張）目前已經沒有程式引用，**先保留不要刪**，由使用者決定。

## 唯一任務：重畫 #31 義民爺

### 為什麼要重畫

現在的畫面是兩位清代義民站在一面空神位牌兩側，中央沒有主神。這符合義民廟供奉神位牌、不立神像的傳統，但作為 App 的神明卡片，辨識度太弱。

### 檔案與尺寸

| 種類 | 路徑 | 尺寸 |
|------|------|------|
| card | `assets/images/gods/generated/cards/yiminye-card.png` | **1024 × 1536**（現有檔是 864×1821 的舊比例，順便改正） |
| soft | `assets/images/gods/generated/soft/yiminye-soft.png` | **1024 × 1536** |
| closeup | `assets/images/gods/generated/closeups/yiminye-closeup.png` | 1024 × 1280 |

- **直接覆蓋同名檔**，程式不用改（`godImages.ts` 與 `gods.ts` 已經指向這三個檔名）。
- **soft**：與 card 同一張圖、同構圖，亮度降約 5–8%、對比略降。
- **closeup 必須是胸像特寫**：臉部中心約在畫面上方 1/3 處。可另外生成，或從 card 以臉部為中心放大 1.6 倍以上裁切；**不可以只把 card 下面裁掉**。

### 造型

- **主題色**：主色 #273F58（深藍）、強調色 #D3A652（金）、光暈 #8095A8。
- **神格**：臺灣客家「褒忠義民爺」，紀念清代保衛鄉土殉難的義民，象徵忠義、守土、團結。總廟是新竹新埔的褒忠亭義民廟。
- **建議構圖**：一位莊嚴的義民英靈居中作為主體，清代民兵或武將裝束、手持令旗（可寫意，不可出現文字），神情堅毅肅穆，頭後有金色光環。背景保留褒忠亭的廟宇意象，並可淡淡呈現義民群像或神位牌，以延續原圖「供奉神位」的文化脈絡。
- **要和誰區分**：
  - #56 十八王公：黑犬是主角、北海岸夜景。
  - #45 周倉將軍：黑面、虯髯、青龍偃月刀。
- **風格基準**：對齊 #51–#59。先打開 `generated/cards/huangdaxian-card.png`、`chegong-card.png` 看實際效果；亮度與飽和度與它們同一水準。
- **禁止**：文字、浮水印、簽名、邊框、UI 元素、現代物品。

## 驗收

1. **尺寸**：card、soft 為 1024×1536，closeup 為 1024×1280。
2. **沒有重複圖**（應無輸出）：
   ```bash
   cd assets/images/gods/generated
   md5sum cards/*.png soft/*.png closeups/*.png | awk '{print $1}' | sort | uniq -d
   ```
3. **closeup 不是 card 的上段裁切**：比較 closeup 與 card 上方 1280 像素的平均差異，應明顯大於 0（現有合格素材約 30–45）。
   ```python
   from PIL import Image, ImageStat, ImageChops
   c = Image.open('cards/yiminye-card.png').convert('RGB')
   k = Image.open('closeups/yiminye-closeup.png').convert('RGB')
   print(sum(ImageStat.Stat(ImageChops.difference(c.crop((0, 0, 1024, 1280)), k)).mean) / 3)
   ```
4. **程式檢查**：`npx tsc --noEmit`、`npm run lint`、`npx jest` 全部通過。
5. **人工目視**：神明列表、詳細頁、上香畫面、籤詩卡片，確認義民爺有清楚的主體，而且和十八王公、周倉分得出來。
