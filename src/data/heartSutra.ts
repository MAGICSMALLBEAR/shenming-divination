// 《般若波羅蜜多心經》唐三藏法師玄奘譯
// 經文依 CBETA《大正新脩大藏經》第 8 冊 No. 251（cbdata.dila.edu.tw，2026-10-23 取得），
// 標點依 CBETA 新式標點；原典咒語未斷句，咒語中的逗號為本 App 所加。
// 台灣常見流通本的咒語作「揭諦揭諦，波羅揭諦，波羅僧揭諦，菩提薩婆訶」，與大正藏用字不同。

export const HEART_SUTRA_TITLE = '般若波羅蜜多心經';
export const HEART_SUTRA_TRANSLATOR = '唐三藏法師玄奘譯';
export const HEART_SUTRA_SOURCE = 'CBETA《大正新脩大藏經》第 8 冊 No. 251';

export const HEART_SUTRA_TEXT =
  '觀自在菩薩行深般若波羅蜜多時，照見五蘊皆空，度一切苦厄。'
  + '舍利子！色不異空，空不異色，色即是空，空即是色；受、想、行、識，亦復如是。'
  + '舍利子！是諸法空相，不生不滅，不垢不淨，不增不減。'
  + '是故，空中無色，無受、想、行、識；無眼、耳、鼻、舌、身、意；無色、聲、香、味、觸、法；無眼界，乃至無意識界；'
  + '無無明亦無無明盡，乃至無老死亦無老死盡；無苦、集、滅、道；無智，亦無得。'
  + '以無所得故，菩提薩埵依般若波羅蜜多故，心無罣礙；無罣礙故，無有恐怖，遠離顛倒夢想，究竟涅槃。'
  + '三世諸佛依般若波羅蜜多故，得阿耨多羅三藐三菩提。'
  + '故知般若波羅蜜多是大神咒、是大明咒、是無上咒、是無等等咒，能除一切苦，真實不虛，故說般若波羅蜜多咒。'
  + '即說咒曰：揭帝揭帝，般羅揭帝，般羅僧揭帝，菩提莎婆訶。';

const HAN = /[㐀-鿿]/;

export function isHanChar(char: string): boolean {
  return HAN.test(char);
}

/** 抄經只比對漢字，不比對標點。 */
export function toHanChars(text: string): string[] {
  return Array.from(text).filter(isHanChar);
}

export const HEART_SUTRA_CHARS = toHanChars(HEART_SUTRA_TEXT);
