# Generated God Portrait Assets

This directory contains generated PNG portraits for all 38 deities used by the app.

## Folders

| Folder | Size | Purpose |
|--------|------|---------|
| `cards/` | 1024x1536 | Main portrait cards for GodSelector and selected-god banners. |
| `soft/` | Same size as card source | Edge-feathered variants for DrawAnimation god chips. |
| `closeups/` | 1024x1280 | Upper-body crops for PoemCard oracle headers. |

## File List

| Slug | Deity |
|------|-------|
| `baoshengdadi` | Baosheng Dadi |
| `chenghuangye` | Chenghuang Ye |
| `fudezhengshen` | Fude Zhengshen |
| `guanshengdijun` | Guansheng Dijun |
| `guanyin` | Guanyin |
| `jigonghuofo` | Jigong Living Buddha |
| `lvdongbin` | Lu Dongbin |
| `mazu` | Mazu |
| `santaizi` | Santaizi / Nezha |
| `wangye` | Wangye |
| `wenchangdijun` | Wenchang Dijun |
| `xuantianshangdi` | Xuantian Shangdi |
| `yuexialaoren` | Yuexia Laoren |
| `zhugewuhou` | Zhuge Wuhou |
| zhushengniangniang | Zhusheng Niangniang |
| `dizangwang` | Dizang Wang Pusa |
| `guangzezunwang` | Guangze Zunwang |
| `kaizhangshengwang` | Kaizhang Shengwang |
| `qingshuizushi` | Qingshui Zushi |
| `sanguandadi` | Sanguan Dadi |
| `sanshanguowang` | Sanshan Guowang |
| `shennongdadi` | Shennong Dadi |
| `wenfuqiansui` | Wenfu Qiansui |
| `yaochijinmu` | Yaochi Jinmu |
| `yuhuangshangdi` | Yuhuang Shangdi |
| `zhaogongming` | Xuantan Yuanshuai Zhao Gongming |
| `huye` | Huye / Tiger General |
| `jiutianxuannu` | Jiutian Xuannu |
| `taisui` | Taisui Xingjun |
| `linshuifuren` | Linshui Furen |
| `yiminye` | Yimin Ye |
| `confucius` | Confucius |
| `medicinebuddha` | Medicine Buddha |
| `qitiandasheng` | Qitian Dasheng / Sun Wukong |
| `zhongkui` | Zhong Kui |
| `wangmuniangniang` | Wangmu Niangniang |
| `qiaoshengxianshi` | Qiaosheng Xianshi / Lu Ban |
| `dongyuedadi` | Dongyue Dadi |

Each slug has three generated assets:

```text
cards/<slug>-card.png
soft/<slug>-soft.png
closeups/<slug>-closeup.png
```

## Regenerating Derived Assets

The `soft` and `closeups` images are derived from the corresponding card images.

```powershell
cd c:\Users\user\Desktop\神明占卜\shenming-divination
.\scripts\generate-god-derived-assets.ps1
```

The script only regenerates a derived image when it is missing, has the wrong dimensions, or is older than its source card.

To tune close-up crops, edit the `$cropTopBySlug` table in `scripts/generate-god-derived-assets.ps1`.
