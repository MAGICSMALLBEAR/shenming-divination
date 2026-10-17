import type { ImageSourcePropType } from 'react-native';

type GodImageSet = {
  card: ImageSourcePropType;
  soft: ImageSourcePropType;
  closeup: ImageSourcePropType;
};

const godImagesById: Record<number, GodImageSet> = {
  1: {
    card: require('@/assets/images/gods/generated/cards/guanshengdijun-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/guanshengdijun-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/guanshengdijun-closeup.webp'),
  },
  2: {
    card: require('@/assets/images/gods/generated/cards/guanyin-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/guanyin-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/guanyin-closeup.webp'),
  },
  3: {
    card: require('@/assets/images/gods/generated/cards/mazu-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/mazu-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/mazu-closeup.webp'),
  },
  4: {
    card: require('@/assets/images/gods/generated/cards/wangye-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/wangye-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/wangye-closeup.webp'),
  },
  5: {
    card: require('@/assets/images/gods/generated/cards/baoshengdadi-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/baoshengdadi-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/baoshengdadi-closeup.webp'),
  },
  6: {
    card: require('@/assets/images/gods/generated/cards/fudezhengshen-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/fudezhengshen-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/fudezhengshen-closeup.webp'),
  },
  7: {
    card: require('@/assets/images/gods/generated/cards/zhushengniangniang-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/zhushengniangniang-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/zhushengniangniang-closeup.webp'),
  },
  8: {
    card: require('@/assets/images/gods/generated/cards/wenchangdijun-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/wenchangdijun-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/wenchangdijun-closeup.webp'),
  },
  9: {
    card: require('@/assets/images/gods/generated/cards/zhugewuhou-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/zhugewuhou-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/zhugewuhou-closeup.webp'),
  },
  10: {
    card: require('@/assets/images/gods/generated/cards/xuantianshangdi-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/xuantianshangdi-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/xuantianshangdi-closeup.webp'),
  },
  11: {
    card: require('@/assets/images/gods/generated/cards/jigonghuofo-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/jigonghuofo-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/jigonghuofo-closeup.webp'),
  },
  12: {
    card: require('@/assets/images/gods/generated/cards/santaizi-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/santaizi-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/santaizi-closeup.webp'),
  },
  13: {
    card: require('@/assets/images/gods/generated/cards/yuexialaoren-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/yuexialaoren-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/yuexialaoren-closeup.webp'),
  },
  14: {
    card: require('@/assets/images/gods/generated/cards/chenghuangye-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/chenghuangye-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/chenghuangye-closeup.webp'),
  },
  15: {
    card: require('@/assets/images/gods/generated/cards/lvdongbin-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/lvdongbin-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/lvdongbin-closeup.webp'),
  },
  16: {
    card: require('@/assets/images/gods/generated/cards/yuhuangshangdi-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/yuhuangshangdi-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/yuhuangshangdi-closeup.webp'),
  },
  17: {
    card: require('@/assets/images/gods/generated/cards/qingshuizushi-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/qingshuizushi-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/qingshuizushi-closeup.webp'),
  },
  18: {
    card: require('@/assets/images/gods/generated/cards/yaochijinmu-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/yaochijinmu-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/yaochijinmu-closeup.webp'),
  },
  19: {
    card: require('@/assets/images/gods/generated/cards/dizangwang-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/dizangwang-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/dizangwang-closeup.webp'),
  },
  20: {
    card: require('@/assets/images/gods/generated/cards/wenfuqiansui-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/wenfuqiansui-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/wenfuqiansui-closeup.webp'),
  },
  21: {
    card: require('@/assets/images/gods/generated/cards/shennongdadi-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/shennongdadi-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/shennongdadi-closeup.webp'),
  },
  22: {
    card: require('@/assets/images/gods/generated/cards/sanguandadi-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/sanguandadi-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/sanguandadi-closeup.webp'),
  },
  23: {
    card: require('@/assets/images/gods/generated/cards/sanshanguowang-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/sanshanguowang-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/sanshanguowang-closeup.webp'),
  },
  24: {
    card: require('@/assets/images/gods/generated/cards/guangzezunwang-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/guangzezunwang-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/guangzezunwang-closeup.webp'),
  },
  25: {
    card: require('@/assets/images/gods/generated/cards/kaizhangshengwang-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/kaizhangshengwang-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/kaizhangshengwang-closeup.webp'),
  },
  26: {
    card: require('@/assets/images/gods/generated/cards/zhaogongming-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/zhaogongming-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/zhaogongming-closeup.webp'),
  },
  27: {
    card: require('@/assets/images/gods/generated/cards/huye-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/huye-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/huye-closeup.webp'),
  },
  28: {
    card: require('@/assets/images/gods/generated/cards/jiutianxuannu-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/jiutianxuannu-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/jiutianxuannu-closeup.webp'),
  },
  29: {
    card: require('@/assets/images/gods/generated/cards/taisui-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/taisui-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/taisui-closeup.webp'),
  },
  30: {
    card: require('@/assets/images/gods/generated/cards/linshuifuren-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/linshuifuren-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/linshuifuren-closeup.webp'),
  },
  31: {
    card: require('@/assets/images/gods/generated/cards/yiminye-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/yiminye-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/yiminye-closeup.webp'),
  },
  32: {
    card: require('@/assets/images/gods/generated/cards/confucius-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/confucius-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/confucius-closeup.webp'),
  },
  33: {
    card: require('@/assets/images/gods/generated/cards/medicinebuddha-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/medicinebuddha-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/medicinebuddha-closeup.webp'),
  },
  34: {
    card: require('@/assets/images/gods/generated/cards/qitiandasheng-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/qitiandasheng-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/qitiandasheng-closeup.webp'),
  },
  35: {
    card: require('@/assets/images/gods/generated/cards/zhongkui-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/zhongkui-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/zhongkui-closeup.webp'),
  },
  36: {
    card: require('@/assets/images/gods/generated/cards/wangmuniangniang-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/wangmuniangniang-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/wangmuniangniang-closeup.webp'),
  },
  37: {
    card: require('@/assets/images/gods/generated/cards/qiaoshengxianshi-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/qiaoshengxianshi-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/qiaoshengxianshi-closeup.webp'),
  },
  38: {
    card: require('@/assets/images/gods/generated/cards/dongyuedadi-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/dongyuedadi-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/dongyuedadi-closeup.webp'),
  },
  39: {
    card: require('@/assets/images/gods/generated/cards/yanluotianzi-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/yanluotianzi-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/yanluotianzi-closeup.webp'),
  },
  40: {
    card: require('@/assets/images/gods/generated/cards/fengdudadi-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/fengdudadi-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/fengdudadi-closeup.webp'),
  },
  41: {
    card: require('@/assets/images/gods/generated/cards/wuxiandadi-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/wuxiandadi-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/wuxiandadi-closeup.webp'),
  },
  42: {
    card: require('@/assets/images/gods/generated/cards/chifuqiansui-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/chifuqiansui-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/chifuqiansui-closeup.webp'),
  },
  43: {
    card: require('@/assets/images/gods/generated/cards/wunianqiansui-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/wunianqiansui-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/wunianqiansui-closeup.webp'),
  },
  44: {
    card: require('@/assets/images/gods/generated/cards/guanpingtaizi-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/guanpingtaizi-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/guanpingtaizi-closeup.webp'),
  },
  45: {
    card: require('@/assets/images/gods/generated/cards/zhoucangjiangjun-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/zhoucangjiangjun-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/zhoucangjiangjun-closeup.webp'),
  },
  46: {
    card: require('@/assets/images/gods/generated/cards/qianliyan-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/qianliyan-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/qianliyan-closeup.webp'),
  },
  47: {
    card: require('@/assets/images/gods/generated/cards/shunfenger-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/shunfenger-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/shunfenger-closeup.webp'),
  },
  48: {
    card: require('@/assets/images/gods/generated/cards/taiyangxingjun-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/taiyangxingjun-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/taiyangxingjun-closeup.webp'),
  },
  49: {
    card: require('@/assets/images/gods/generated/cards/taiyinniangniang-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/taiyinniangniang-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/taiyinniangniang-closeup.webp'),
  },
  50: {
    card: require('@/assets/images/gods/generated/cards/fazhuzhenjun-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/fazhuzhenjun-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/fazhuzhenjun-closeup.webp'),
  },
  51: {
    card: require('@/assets/images/gods/generated/cards/dijizhu-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/dijizhu-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/dijizhu-closeup.webp'),
  },
  52: {
    card: require('@/assets/images/gods/generated/cards/huangdaxian-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/huangdaxian-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/huangdaxian-closeup.webp'),
  },
  53: {
    card: require('@/assets/images/gods/generated/cards/erlangshen-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/erlangshen-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/erlangshen-closeup.webp'),
  },
  54: {
    card: require('@/assets/images/gods/generated/cards/zhangtianshi-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/zhangtianshi-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/zhangtianshi-closeup.webp'),
  },
  55: {
    card: require('@/assets/images/gods/generated/cards/huatuoxianshi-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/huatuoxianshi-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/huatuoxianshi-closeup.webp'),
  },
  56: {
    card: require('@/assets/images/gods/generated/cards/shibawanggong-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/shibawanggong-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/shibawanggong-closeup.webp'),
  },
  57: {
    card: require('@/assets/images/gods/generated/cards/leigong-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/leigong-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/leigong-closeup.webp'),
  },
  58: {
    card: require('@/assets/images/gods/generated/cards/shijiamounifo-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/shijiamounifo-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/shijiamounifo-closeup.webp'),
  },
  59: {
    card: require('@/assets/images/gods/generated/cards/chegong-card.webp'),
    soft: require('@/assets/images/gods/generated/soft/chegong-soft.webp'),
    closeup: require('@/assets/images/gods/generated/closeups/chegong-closeup.webp'),
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

