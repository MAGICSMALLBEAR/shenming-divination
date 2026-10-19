// 籤詩吉凶字串的共用判斷。
// 各處以「含上／吉」判斷好籤、「含下／凶」判斷需謹慎；孔子聖籤等籤系有「不吉」，
// 字面含「吉」卻是凶籤，所以需謹慎的判斷要先做，正面判斷也要排除它。
export function isUnluckyLevel(level: string): boolean {
  return level.includes('下') || level.includes('凶') || level.includes('不吉');
}
