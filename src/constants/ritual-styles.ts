import type { ImageSourcePropType } from 'react-native';

type GodCategory = 'war' | 'compassion' | 'sea' | 'health' | 'wealth' | 'general' | 'heaven' | 'guardian' | 'release' | 'growth';

export type RitualStyleKey = 'bronze' | 'celadon' | 'cinnabar' | 'ebony' | 'jade';

export interface AtlasCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RitualStyleDefinition {
  key: RitualStyleKey;
  label: string;
  summary: string;
  chipColor: string;
  glowColor: string;
  censer: {
    lip: string;
    body: string;
    border: string;
    base: string;
    baseBorder: string;
    ash: string;
    ashBurst: string;
    accent: string;
    ornament: string;
    emptySprite: ImageSourcePropType;
    placedSprite: ImageSourcePropType;
    realisticHolderSprite: ImageSourcePropType;
    realisticStickSprite: ImageSourcePropType;
  };
  jiaobei: {
    round: string;
    flat: string;
    panel: string;
    line: string;
    highlight: string;
    shadow: string;
    rim: string;
    roundSprite: ImageSourcePropType;
    flatSprite: ImageSourcePropType;
  };
  preview: {
    censer: AtlasCrop;
    round: AtlasCrop;
    flat: AtlasCrop;
  };
}

export const ritualStyleAtlas: ImageSourcePropType = require('@/assets/images/ritual/ai-ritual-styles.png');

export const ritualStyleAtlasSize = {
  width: 1536,
  height: 1024,
};

export const ritualStyles: Record<RitualStyleKey, RitualStyleDefinition> = {
  bronze: {
    key: 'bronze',
    label: '青銅龍紋',
    summary: '帝廟感、鎏金紋飾、厚重法器氣場',
    chipColor: '#E0B04A',
    glowColor: '#D48A3A',
    censer: {
      lip: '#7F5428',
      body: '#5B371E',
      border: '#C58A3B',
      base: '#3D2412',
      baseBorder: '#7B4F25',
      ash: '#A88A68',
      ashBurst: '#D5C1A6',
      accent: '#E2B35C',
      ornament: '#8A5B2A',
      emptySprite: require('@/assets/images/ritual/sprites/bronze-censer-empty.png'),
      placedSprite: require('@/assets/images/ritual/realistic/bronze-holder.png'),
      realisticHolderSprite: require('@/assets/images/ritual/realistic/bronze-holder.png'),
      realisticStickSprite: require('@/assets/images/ritual/realistic/bronze-stick.png'),
    },
    jiaobei: {
      round: '#995322',
      flat: '#75411B',
      panel: '#E8CC9E',
      line: '#C68D4A',
      highlight: '#B56C2D',
      shadow: '#6F350F',
      rim: '#F0C28540',
      roundSprite: require('@/assets/images/ritual/sprites/bronze-round.png'),
      flatSprite: require('@/assets/images/ritual/sprites/bronze-flat.png'),
    },
    preview: {
      censer: { x: 36, y: 92, width: 470, height: 468 },
      round: { x: 38, y: 620, width: 300, height: 350 },
      flat: { x: 300, y: 620, width: 300, height: 350 },
    },
  },
  celadon: {
    key: 'celadon',
    label: '青瓷蓮紋',
    summary: '玉潤青瓷、金邊蓮花、溫潤安定',
    chipColor: '#92C9AF',
    glowColor: '#8EBFA0',
    censer: {
      lip: '#769C89',
      body: '#9EB8A8',
      border: '#D8B76A',
      base: '#6C8A79',
      baseBorder: '#C4A85B',
      ash: '#B8A78E',
      ashBurst: '#DDD1BF',
      accent: '#E5C877',
      ornament: '#7AA08F',
      emptySprite: require('@/assets/images/ritual/sprites/celadon-censer-empty.png'),
      placedSprite: require('@/assets/images/ritual/realistic/porcelain-holder.png'),
      realisticHolderSprite: require('@/assets/images/ritual/realistic/porcelain-holder.png'),
      realisticStickSprite: require('@/assets/images/ritual/realistic/porcelain-stick.png'),
    },
    jiaobei: {
      round: '#A1B89E',
      flat: '#88A58B',
      panel: '#D8D5C4',
      line: '#C4A85B',
      highlight: '#DCE7D8',
      shadow: '#6C8870',
      rim: '#F3E0A950',
      roundSprite: require('@/assets/images/ritual/sprites/celadon-round.png'),
      flatSprite: require('@/assets/images/ritual/sprites/celadon-flat.png'),
    },
    preview: {
      censer: { x: 515, y: 92, width: 500, height: 468 },
      round: { x: 535, y: 620, width: 310, height: 350 },
      flat: { x: 800, y: 620, width: 305, height: 350 },
    },
  },
  cinnabar: {
    key: 'cinnabar',
    label: '朱漆寺廟',
    summary: '朱紅木漆、浮雕雲紋、節慶氣氛更濃',
    chipColor: '#D9644F',
    glowColor: '#D25040',
    censer: {
      lip: '#6F3A1B',
      body: '#8F2E22',
      border: '#D67A42',
      base: '#5D1F16',
      baseBorder: '#A84B28',
      ash: '#B49A83',
      ashBurst: '#DCCBBC',
      accent: '#E1A058',
      ornament: '#B1422F',
      emptySprite: require('@/assets/images/ritual/sprites/cinnabar-censer-empty.png'),
      placedSprite: require('@/assets/images/ritual/realistic/cinnabar-holder.png'),
      realisticHolderSprite: require('@/assets/images/ritual/realistic/cinnabar-holder.png'),
      realisticStickSprite: require('@/assets/images/ritual/realistic/cinnabar-stick.png'),
    },
    jiaobei: {
      round: '#A23A2A',
      flat: '#81291D',
      panel: '#C44631',
      line: '#E09B5A',
      highlight: '#C65F48',
      shadow: '#6E2017',
      rim: '#F1BF8442',
      roundSprite: require('@/assets/images/ritual/sprites/cinnabar-round.png'),
      flatSprite: require('@/assets/images/ritual/sprites/cinnabar-flat.png'),
    },
    preview: {
      censer: { x: 1025, y: 92, width: 468, height: 468 },
      round: { x: 1060, y: 620, width: 305, height: 350 },
      flat: { x: 1280, y: 620, width: 240, height: 350 },
    },
  },
  ebony: {
    key: 'ebony',
    label: '黑檀描金',
    summary: '沉穩黑檀、描金如意、朱漆內緣',
    chipColor: '#D7A84A',
    glowColor: '#A86D36',
    censer: {
      lip: '#1F1713', body: '#17110F', border: '#C49336', base: '#0C0908',
      baseBorder: '#7D5A28', ash: '#93816D', ashBurst: '#CDBBA4',
      accent: '#E0B650', ornament: '#8E221C',
      emptySprite: require('@/assets/images/ritual/sprites/bronze-censer-empty.png'),
      placedSprite: require('@/assets/images/ritual/realistic/ebony-holder.png'),
      realisticHolderSprite: require('@/assets/images/ritual/realistic/ebony-holder.png'),
      realisticStickSprite: require('@/assets/images/ritual/realistic/ebony-stick.png'),
    },
    jiaobei: {
      round: '#321D16', flat: '#21120F', panel: '#B83E2F', line: '#D8A847',
      highlight: '#6C4030', shadow: '#100A08', rim: '#E6BA6650',
      roundSprite: require('@/assets/images/ritual/sprites/bronze-round.png'),
      flatSprite: require('@/assets/images/ritual/sprites/bronze-flat.png'),
    },
    preview: {
      censer: { x: 36, y: 92, width: 470, height: 468 },
      round: { x: 38, y: 620, width: 300, height: 350 },
      flat: { x: 300, y: 620, width: 300, height: 350 },
    },
  },
  jade: {
    key: 'jade',
    label: '白玉蓮華',
    summary: '溫潤白玉、淺雕蓮華、典雅金邊',
    chipColor: '#E8D7A6',
    glowColor: '#F0DFC0',
    censer: {
      lip: '#D4B45E', body: '#E8DDBF', border: '#D2B35E', base: '#C9B98F',
      baseBorder: '#B69543', ash: '#C7BBA5', ashBurst: '#ECE4D6',
      accent: '#E8CB72', ornament: '#D2B35E',
      emptySprite: require('@/assets/images/ritual/sprites/celadon-censer-empty.png'),
      placedSprite: require('@/assets/images/ritual/realistic/jade-holder.png'),
      realisticHolderSprite: require('@/assets/images/ritual/realistic/jade-holder.png'),
      realisticStickSprite: require('@/assets/images/ritual/realistic/jade-stick.png'),
    },
    jiaobei: {
      round: '#EEE4CA', flat: '#D8CAA8', panel: '#F2E9D4', line: '#C4A85B',
      highlight: '#FFF8E8', shadow: '#9D8E70', rim: '#F3E0A970',
      roundSprite: require('@/assets/images/ritual/sprites/celadon-round.png'),
      flatSprite: require('@/assets/images/ritual/sprites/celadon-flat.png'),
    },
    preview: {
      censer: { x: 515, y: 92, width: 500, height: 468 },
      round: { x: 535, y: 620, width: 310, height: 350 },
      flat: { x: 800, y: 620, width: 305, height: 350 },
    },
  },
};

export const ritualStyleOrder: RitualStyleKey[] = ['bronze', 'celadon', 'cinnabar', 'ebony', 'jade'];

export function getDefaultRitualStyleKey(
  god?: { category?: GodCategory; id?: number } | null
): RitualStyleKey {
  if (!god?.category) {
    return 'bronze';
  }

  switch (god.category) {
    case 'compassion':
    case 'health':
    case 'release':
      return 'celadon';
    case 'sea':
    case 'growth':
      return 'cinnabar';
    case 'wealth':
      return god.id === 6 ? 'bronze' : 'cinnabar';
    case 'war':
    case 'heaven':
    case 'guardian':
      return 'bronze';
    default:
      return god.id && god.id % 2 === 0 ? 'cinnabar' : 'bronze';
  }
}
