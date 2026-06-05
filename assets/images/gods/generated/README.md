# Generated God Portrait Assets

This directory contains three sets of derived PNG portraits for each of the 9 deities, generated from the originals in `assets/images/gods/` via `scripts/generate-god-derived-assets.ps1`.

## Folders

| Folder | Size | Purpose |
|--------|------|---------|
| `cards/` | ~2.5-3 MB each | Full-body card portraits (1024×1536). Used in GodSelector cards and the homepage banner after god selection. |
| `soft/` | ~4-5 MB each | Edge-feathered transparent-fade variants. Used in DrawAnimation godChip so the figure blends softly into the background. |
| `closeups/` | ~3.5-4 MB each | Upper-body close-up crop (1024×1280). Used in PoemCard oracle header as a portrait-ratio avatar (92×116 display). |

## File List

### cards/
| File | Deity |
|------|-------|
| guanshengdijun-card.png | 關聖帝君 |
| guanyin-card.png | 觀世音菩薩 |
| mazu-card.png | 媽祖 |
| wangye-card.png | 王爺 |
| baoshengdadi-card.png | 保生大帝 |
| fudezhengshen-card.png | 福德正神 |
| zhushengniangniang-card.png | 註生娘娘 |
| wenchangdijun-card.png | 文昌帝君 |
| zhugewuhou-card.png | 諸葛武侯 (孔明神數) |

### soft/
| File | Deity |
|------|-------|
| guanshengdijun-soft.png | 關聖帝君 |
| guanyin-soft.png | 觀世音菩薩 |
| mazu-soft.png | 媽祖 |
| wangye-soft.png | 王爺 |
| baoshengdadi-soft.png | 保生大帝 |
| fudezhengshen-soft.png | 福德正神 |
| zhushengniangniang-soft.png | 註生娘娘 |
| wenchangdijun-soft.png | 文昌帝君 |
| zhugewuhou-soft.png | 諸葛武侯 |

### closeups/
| File | Deity |
|------|-------|
| guanshengdijun-closeup.png | 關聖帝君 |
| guanyin-closeup.png | 觀世音菩薩 |
| mazu-closeup.png | 媽祖 |
| wangye-closeup.png | 王爺 |
| baoshengdadi-closeup.png | 保生大帝 |
| fudezhengshen-closeup.png | 福德正神 |
| zhushengniangniang-closeup.png | 註生娘娘 |
| wenchangdijun-closeup.png | 文昌帝君 |
| zhugewuhou-closeup.png | 諸葛武侯 |

## Regenerating

```powershell
cd c:\Users\user\Desktop\神明占卜\shenming-divination
.\scripts\generate-god-derived-assets.ps1
```

To adjust how much of the top is cropped for each deity's closeup, edit the `$cropTopBySlug` hashtable in the script.
