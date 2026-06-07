import type { ImageSourcePropType } from 'react-native';

type GodImageSet = {
  card: ImageSourcePropType;
  soft: ImageSourcePropType;
  closeup: ImageSourcePropType;
};

const godImagesById: Record<number, GodImageSet> = {
  1: {
    card: require('@/assets/images/gods/generated/cards/guanshengdijun-card.png'),
    soft: require('@/assets/images/gods/generated/soft/guanshengdijun-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/guanshengdijun-closeup.png'),
  },
  2: {
    card: require('@/assets/images/gods/generated/cards/guanyin-card.png'),
    soft: require('@/assets/images/gods/generated/soft/guanyin-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/guanyin-closeup.png'),
  },
  3: {
    card: require('@/assets/images/gods/generated/cards/mazu-card.png'),
    soft: require('@/assets/images/gods/generated/soft/mazu-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/mazu-closeup.png'),
  },
  4: {
    card: require('@/assets/images/gods/generated/cards/wangye-card.png'),
    soft: require('@/assets/images/gods/generated/soft/wangye-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/wangye-closeup.png'),
  },
  5: {
    card: require('@/assets/images/gods/generated/cards/baoshengdadi-card.png'),
    soft: require('@/assets/images/gods/generated/soft/baoshengdadi-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/baoshengdadi-closeup.png'),
  },
  6: {
    card: require('@/assets/images/gods/generated/cards/fudezhengshen-card.png'),
    soft: require('@/assets/images/gods/generated/soft/fudezhengshen-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/fudezhengshen-closeup.png'),
  },
  7: {
    card: require('@/assets/images/gods/generated/cards/zhushengniangniang-card.png'),
    soft: require('@/assets/images/gods/generated/soft/zhushengniangniang-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/zhushengniangniang-closeup.png'),
  },
  8: {
    card: require('@/assets/images/gods/generated/cards/wenchangdijun-card.png'),
    soft: require('@/assets/images/gods/generated/soft/wenchangdijun-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/wenchangdijun-closeup.png'),
  },
  9: {
    card: require('@/assets/images/gods/generated/cards/zhugewuhou-card.png'),
    soft: require('@/assets/images/gods/generated/soft/zhugewuhou-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/zhugewuhou-closeup.png'),
  },
  10: {
    card: require('@/assets/images/gods/generated/cards/xuantianshangdi-card.png'),
    soft: require('@/assets/images/gods/generated/soft/xuantianshangdi-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/xuantianshangdi-closeup.png'),
  },
  11: {
    card: require('@/assets/images/gods/generated/cards/jigonghuofo-card.png'),
    soft: require('@/assets/images/gods/generated/soft/jigonghuofo-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/jigonghuofo-closeup.png'),
  },
  12: {
    card: require('@/assets/images/gods/generated/cards/santaizi-card.png'),
    soft: require('@/assets/images/gods/generated/soft/santaizi-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/santaizi-closeup.png'),
  },
  13: {
    card: require('@/assets/images/gods/generated/cards/yuexialaoren-card.png'),
    soft: require('@/assets/images/gods/generated/soft/yuexialaoren-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/yuexialaoren-closeup.png'),
  },
  14: {
    card: require('@/assets/images/gods/generated/cards/chenghuangye-card.png'),
    soft: require('@/assets/images/gods/generated/soft/chenghuangye-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/chenghuangye-closeup.png'),
  },
  15: {
    card: require('@/assets/images/gods/generated/cards/lvdongbin-card.png'),
    soft: require('@/assets/images/gods/generated/soft/lvdongbin-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/lvdongbin-closeup.png'),
  },
};

export function getGodCardImage(godId?: number | null): ImageSourcePropType | null {
  if (!godId) {
    return null;
  }

  return godImagesById[godId]?.card ?? null;
}

export function getGodSoftImage(godId?: number | null): ImageSourcePropType | null {
  if (!godId) {
    return null;
  }

  return godImagesById[godId]?.soft ?? null;
}

export function getGodCloseupImage(godId?: number | null): ImageSourcePropType | null {
  if (!godId) {
    return null;
  }

  return godImagesById[godId]?.closeup ?? null;
}
