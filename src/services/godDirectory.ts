import { questionCategories, type God } from '@/data/gods';

/** Display groups for the deity directory when every god is shown. */
export const GOD_DIRECTORY_GROUPS: { id: God['category']; label: string; icon: string }[] = [
  { id: 'heaven', label: '天界星君', icon: '☁️' },
  { id: 'compassion', label: '慈悲護佑', icon: '🪷' },
  { id: 'sea', label: '海上守護', icon: '🌊' },
  { id: 'war', label: '武神護法', icon: '⚔️' },
  { id: 'wealth', label: '財神', icon: '💰' },
  { id: 'general', label: '文教與綜合', icon: '📜' },
  { id: 'health', label: '醫藥保健', icon: '🌿' },
  { id: 'guardian', label: '護境鎮宅', icon: '🏮' },
  { id: 'growth', label: '開拓鄉賢', icon: '🧭' },
  { id: 'release', label: '冥界司法', icon: '⚖️' },
];

export type GodDirectorySection = { key: string; title: string; icon: string; gods: God[] };

export type GodDirectory = { title: string; total: number; sections: GodDirectorySection[] };

/**
 * Builds the directory for exactly the gods the selector currently shows, in
 * the same order. "All" is grouped by deity type; a question category is one list.
 */
export function buildGodDirectory(visibleGods: God[], categoryId: string): GodDirectory {
  if (categoryId !== 'all') {
    const category = questionCategories.find((item) => item.id === categoryId);
    const title = category?.name ?? '神明';
    return {
      title,
      total: visibleGods.length,
      sections: visibleGods.length ? [{ key: categoryId, title, icon: category?.icon ?? '🙏', gods: visibleGods }] : [],
    };
  }

  const sections = GOD_DIRECTORY_GROUPS
    .map((group) => ({
      key: group.id,
      title: group.label,
      icon: group.icon,
      gods: visibleGods.filter((god) => god.category === group.id),
    }))
    .filter((section) => section.gods.length > 0);
  return { title: '全部神明', total: visibleGods.length, sections };
}
