import fs from 'fs';
import path from 'path';

import {
  CHIFU_MEDICINE_ARCHIVE_DISCLAIMER,
  CHIFU_MEDICINE_ARCHIVE_GOD_ID,
  chifuMedicineLotArchive,
} from '@/data/chifuMedicineLotArchive';
import { gods } from '@/data/gods';

const ALLOWED_KEYS = [
  'cultureMemoryObjectId',
  'descriptionLicense',
  'lotNumber',
  'objectLicense',
  'reviewedAt',
  'safetyStatus',
  'sourceUrl',
  'title',
];

function listSourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

describe('池府千歲文化藥籤典藏目錄', () => {
  it('對應 #42 池府千歲，收錄第 1–120 首且連號無缺', () => {
    expect(gods.find((g) => g.id === CHIFU_MEDICINE_ARCHIVE_GOD_ID)?.name).toBe('池府千歲');
    expect(chifuMedicineLotArchive.map((lot) => lot.lotNumber)).toEqual(
      Array.from({ length: 120 }, (_, i) => i + 1),
    );
    const ids = chifuMedicineLotArchive.map((lot) => lot.cultureMemoryObjectId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('每筆只含目錄欄位，沒有處方、劑量或適應症', () => {
    for (const lot of chifuMedicineLotArchive) {
      expect(Object.keys(lot).sort()).toEqual(ALLOWED_KEYS);
      expect(lot.safetyStatus).toBe('catalog-only');
      expect(lot.title).toMatch(/^虎尾德興宮池府千歲藥籤第.+首$/);
      expect(lot.sourceUrl).toBe(
        `https://tcmb.culture.tw/zh-tw/detail?id=${lot.cultureMemoryObjectId}&indexCode=Culture_Object`,
      );
      expect(lot.objectLicense).toBe('PDM');
      expect(lot.descriptionLicense).toBe('OGDL-1.0');
    }
    expect(CHIFU_MEDICINE_ARCHIVE_DISCLAIMER).toContain('非處方、非診斷、非治療建議');
    expect(CHIFU_MEDICINE_ARCHIVE_DISCLAIMER).toContain('請勿依藥籤自行配藥或服用');
  });

  it('只有典藏頁與神明詳細頁引用，不接入抽籤、語音或 AI 流程', () => {
    const srcDir = path.join(__dirname, '..', 'src');
    const importers = listSourceFiles(srcDir)
      .filter((file) => fs.readFileSync(file, 'utf8').includes('chifuMedicineLotArchive'))
      .map((file) => path.relative(srcDir, file).split(path.sep).join('/'))
      .filter((file) => file !== 'data/chifuMedicineLotArchive.ts')
      .sort();
    expect(importers).toEqual(['app/chifu-medicine-archive.tsx', 'app/godDetail.tsx']);
  });
});
