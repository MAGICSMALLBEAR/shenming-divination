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
  16: {
    card: require('@/assets/images/gods/generated/cards/yuhuangshangdi-card.png'),
    soft: require('@/assets/images/gods/generated/soft/yuhuangshangdi-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/yuhuangshangdi-closeup.png'),
  },
  17: {
    card: require('@/assets/images/gods/generated/cards/qingshuizushi-card.png'),
    soft: require('@/assets/images/gods/generated/soft/qingshuizushi-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/qingshuizushi-closeup.png'),
  },
  18: {
    card: require('@/assets/images/gods/generated/cards/yaochijinmu-card.png'),
    soft: require('@/assets/images/gods/generated/soft/yaochijinmu-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/yaochijinmu-closeup.png'),
  },
  19: {
    card: require('@/assets/images/gods/generated/cards/dizangwang-card.png'),
    soft: require('@/assets/images/gods/generated/soft/dizangwang-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/dizangwang-closeup.png'),
  },
  20: {
    card: require('@/assets/images/gods/generated/cards/wenfuqiansui-card.png'),
    soft: require('@/assets/images/gods/generated/soft/wenfuqiansui-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/wenfuqiansui-closeup.png'),
  },
  21: {
    card: require('@/assets/images/gods/generated/cards/shennongdadi-card.png'),
    soft: require('@/assets/images/gods/generated/soft/shennongdadi-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/shennongdadi-closeup.png'),
  },
  22: {
    card: require('@/assets/images/gods/generated/cards/sanguandadi-card.png'),
    soft: require('@/assets/images/gods/generated/soft/sanguandadi-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/sanguandadi-closeup.png'),
  },
  23: {
    card: require('@/assets/images/gods/generated/cards/sanshanguowang-card.png'),
    soft: require('@/assets/images/gods/generated/soft/sanshanguowang-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/sanshanguowang-closeup.png'),
  },
  24: {
    card: require('@/assets/images/gods/generated/cards/guangzezunwang-card.png'),
    soft: require('@/assets/images/gods/generated/soft/guangzezunwang-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/guangzezunwang-closeup.png'),
  },
  25: {
    card: require('@/assets/images/gods/generated/cards/kaizhangshengwang-card.png'),
    soft: require('@/assets/images/gods/generated/soft/kaizhangshengwang-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/kaizhangshengwang-closeup.png'),
  },
  26: {
    card: require('@/assets/images/gods/generated/cards/zhaogongming-card.png'),
    soft: require('@/assets/images/gods/generated/soft/zhaogongming-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/zhaogongming-closeup.png'),
  },
  27: {
    card: require('@/assets/images/gods/generated/cards/huye-card.png'),
    soft: require('@/assets/images/gods/generated/soft/huye-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/huye-closeup.png'),
  },
  28: {
    card: require('@/assets/images/gods/generated/cards/jiutianxuannu-card.png'),
    soft: require('@/assets/images/gods/generated/soft/jiutianxuannu-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/jiutianxuannu-closeup.png'),
  },
  29: {
    card: require('@/assets/images/gods/generated/cards/taisui-card.png'),
    soft: require('@/assets/images/gods/generated/soft/taisui-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/taisui-closeup.png'),
  },
  30: {
    card: require('@/assets/images/gods/generated/cards/linshuifuren-card.png'),
    soft: require('@/assets/images/gods/generated/soft/linshuifuren-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/linshuifuren-closeup.png'),
  },
  31: {
    card: require('@/assets/images/gods/generated/cards/yiminye-card.png'),
    soft: require('@/assets/images/gods/generated/soft/yiminye-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/yiminye-closeup.png'),
  },
  32: {
    card: require('@/assets/images/gods/generated/cards/confucius-card.png'),
    soft: require('@/assets/images/gods/generated/soft/confucius-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/confucius-closeup.png'),
  },
  33: {
    card: require('@/assets/images/gods/generated/cards/medicinebuddha-card.png'),
    soft: require('@/assets/images/gods/generated/soft/medicinebuddha-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/medicinebuddha-closeup.png'),
  },
  34: {
    card: require('@/assets/images/gods/generated/cards/qitiandasheng-card.png'),
    soft: require('@/assets/images/gods/generated/soft/qitiandasheng-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/qitiandasheng-closeup.png'),
  },
  35: {
    card: require('@/assets/images/gods/generated/cards/zhongkui-card.png'),
    soft: require('@/assets/images/gods/generated/soft/zhongkui-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/zhongkui-closeup.png'),
  },
  36: {
    card: require('@/assets/images/gods/generated/cards/wangmuniangniang-card.png'),
    soft: require('@/assets/images/gods/generated/soft/wangmuniangniang-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/wangmuniangniang-closeup.png'),
  },
  37: {
    card: require('@/assets/images/gods/generated/cards/qiaoshengxianshi-card.png'),
    soft: require('@/assets/images/gods/generated/soft/qiaoshengxianshi-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/qiaoshengxianshi-closeup.png'),
  },
  38: {
    card: require('@/assets/images/gods/generated/cards/dongyuedadi-card.png'),
    soft: require('@/assets/images/gods/generated/soft/dongyuedadi-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/dongyuedadi-closeup.png'),
  },
  39: {
    card: require('@/assets/images/gods/generated/cards/yanluotianzi-card.png'),
    soft: require('@/assets/images/gods/generated/soft/yanluotianzi-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/yanluotianzi-closeup.png'),
  },
  40: {
    card: require('@/assets/images/gods/generated/cards/fengdudadi-card.png'),
    soft: require('@/assets/images/gods/generated/soft/fengdudadi-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/fengdudadi-closeup.png'),
  },
  41: {
    card: require('@/assets/images/gods/generated/cards/wuxiandadi-card.png'),
    soft: require('@/assets/images/gods/generated/soft/wuxiandadi-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/wuxiandadi-closeup.png'),
  },
  42: {
    card: require('@/assets/images/gods/generated/cards/chifuqiansui-card.png'),
    soft: require('@/assets/images/gods/generated/soft/chifuqiansui-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/chifuqiansui-closeup.png'),
  },
  43: {
    card: require('@/assets/images/gods/generated/cards/wunianqiansui-card.png'),
    soft: require('@/assets/images/gods/generated/soft/wunianqiansui-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/wunianqiansui-closeup.png'),
  },
  44: {
    card: require('@/assets/images/gods/generated/cards/guanpingtaizi-card.png'),
    soft: require('@/assets/images/gods/generated/soft/guanpingtaizi-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/guanpingtaizi-closeup.png'),
  },
  45: {
    card: require('@/assets/images/gods/generated/cards/zhoucangjiangjun-card.png'),
    soft: require('@/assets/images/gods/generated/soft/zhoucangjiangjun-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/zhoucangjiangjun-closeup.png'),
  },
  46: {
    card: require('@/assets/images/gods/generated/cards/qianliyan-card.png'),
    soft: require('@/assets/images/gods/generated/soft/qianliyan-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/qianliyan-closeup.png'),
  },
  47: {
    card: require('@/assets/images/gods/generated/cards/shunfenger-card.png'),
    soft: require('@/assets/images/gods/generated/soft/shunfenger-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/shunfenger-closeup.png'),
  },
  48: {
    card: require('@/assets/images/gods/generated/cards/taiyangxingjun-card.png'),
    soft: require('@/assets/images/gods/generated/soft/taiyangxingjun-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/taiyangxingjun-closeup.png'),
  },
  49: {
    card: require('@/assets/images/gods/generated/cards/taiyinniangniang-card.png'),
    soft: require('@/assets/images/gods/generated/soft/taiyinniangniang-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/taiyinniangniang-closeup.png'),
  },
  50: {
    card: require('@/assets/images/gods/generated/cards/fazhuzhenjun-card.png'),
    soft: require('@/assets/images/gods/generated/soft/fazhuzhenjun-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/fazhuzhenjun-closeup.png'),
  },
  51: {
    card: require('@/assets/images/gods/generated/cards/fudezhengshen-card.png'),
    soft: require('@/assets/images/gods/generated/soft/fudezhengshen-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/fudezhengshen-closeup.png'),
  },
  52: {
    card: require('@/assets/images/gods/generated/cards/jigonghuofo-card.png'),
    soft: require('@/assets/images/gods/generated/soft/jigonghuofo-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/jigonghuofo-closeup.png'),
  },
  53: {
    card: require('@/assets/images/gods/generated/cards/santaizi-card.png'),
    soft: require('@/assets/images/gods/generated/soft/santaizi-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/santaizi-closeup.png'),
  },
  54: {
    card: require('@/assets/images/gods/generated/cards/zhongkui-card.png'),
    soft: require('@/assets/images/gods/generated/soft/zhongkui-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/zhongkui-closeup.png'),
  },
  55: {
    card: require('@/assets/images/gods/generated/cards/baoshengdadi-card.png'),
    soft: require('@/assets/images/gods/generated/soft/baoshengdadi-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/baoshengdadi-closeup.png'),
  },
  56: {
    card: require('@/assets/images/gods/generated/cards/yiminye-card.png'),
    soft: require('@/assets/images/gods/generated/soft/yiminye-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/yiminye-closeup.png'),
  },
  57: {
    card: require('@/assets/images/gods/generated/cards/yuhuangshangdi-card.png'),
    soft: require('@/assets/images/gods/generated/soft/yuhuangshangdi-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/yuhuangshangdi-closeup.png'),
  },
  58: {
    card: require('@/assets/images/gods/generated/cards/guanyin-card.png'),
    soft: require('@/assets/images/gods/generated/soft/guanyin-soft.png'),
    closeup: require('@/assets/images/gods/generated/closeups/guanyin-closeup.png'),
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

