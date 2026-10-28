import type { JiaobeiResult } from './divination';

/** 祀典大天后宮官方順序；`xiaobei` 的兩凸面在此儀式稱「陽杯」。 */
export const TIANHOU_THREE_CUP_PATTERNS: readonly (readonly JiaobeiResult[])[] = [
  ['shengbei', 'shengbei', 'shengbei'], // 1
  ['shengbei', 'shengbei', 'xiaobei'], // 2
  ['shengbei', 'shengbei', 'yinbei'], // 3
  ['shengbei', 'yinbei', 'shengbei'], // 4
  ['shengbei', 'xiaobei', 'shengbei'], // 5
  ['shengbei', 'yinbei', 'yinbei'], // 6
  ['shengbei', 'xiaobei', 'xiaobei'], // 7
  ['shengbei', 'xiaobei', 'yinbei'], // 8
  ['shengbei', 'yinbei', 'xiaobei'], // 9
  ['xiaobei', 'xiaobei', 'xiaobei'], // 10
  ['xiaobei', 'shengbei', 'shengbei'], // 11
  ['xiaobei', 'xiaobei', 'yinbei'], // 12
  ['xiaobei', 'shengbei', 'xiaobei'], // 13
  ['xiaobei', 'shengbei', 'yinbei'], // 14
  ['xiaobei', 'yinbei', 'shengbei'], // 15
  ['xiaobei', 'yinbei', 'xiaobei'], // 16
  ['xiaobei', 'yinbei', 'yinbei'], // 17
  ['xiaobei', 'xiaobei', 'shengbei'], // 18
  ['yinbei', 'yinbei', 'yinbei'], // 19
  ['yinbei', 'yinbei', 'xiaobei'], // 20
  ['yinbei', 'yinbei', 'shengbei'], // 21
  ['yinbei', 'shengbei', 'xiaobei'], // 22
  ['yinbei', 'shengbei', 'yinbei'], // 23
  ['yinbei', 'shengbei', 'shengbei'], // 24
  ['yinbei', 'xiaobei', 'xiaobei'], // 25
  ['yinbei', 'xiaobei', 'shengbei'], // 26
  ['yinbei', 'xiaobei', 'yinbei'], // 27
];

const patternToNumber = new Map(
  TIANHOU_THREE_CUP_PATTERNS.map((pattern, index) => [pattern.join(','), index + 1]),
);

export function resolveTianhouThreeCupNumber(results: readonly JiaobeiResult[]): number | null {
  if (results.length !== 3) return null;
  return patternToNumber.get(results.join(',')) ?? null;
}

export function getTianhouCupLabel(result: JiaobeiResult): '聖' | '陽' | '陰' {
  if (result === 'shengbei') return '聖';
  if (result === 'xiaobei') return '陽';
  return '陰';
}
