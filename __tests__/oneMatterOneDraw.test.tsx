import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { SameMatterNotice } from '@/components/SameMatterNotice';
import { leiyushiPoems } from '@/data/poems/leiyushi';
import { findSameMatterDraw, normalizeQuestion, SAME_MATTER_WINDOW_MS } from '@/services/oneMatterOneDraw';
import type { DivinationRecord } from '@/services/storage';

const NOW = 1_800_000_000_000;

function record(partial: Partial<DivinationRecord>): DivinationRecord {
  return {
    id: partial.id ?? 'r1',
    godName: '關聖帝君',
    poem: leiyushiPoems[0],
    question: '要不要換工作？',
    questionCategory: 'career',
    timestamp: NOW - 60 * 60 * 1000,
    ...partial,
  };
}

describe('一事一籤判斷', () => {
  it('忽略空白、標點與全形半形差異', () => {
    expect(normalizeQuestion(' 要不要 換工作？ ')).toBe(normalizeQuestion('要不要換工作'));
    expect(normalizeQuestion('ＡＢＣ，ok!')).toBe('abcok');
  });

  it('24 小時內同一位神明、同一件事會被找出，取最近一筆', () => {
    const older = record({ id: 'old', timestamp: NOW - 5 * 60 * 60 * 1000 });
    const newer = record({ id: 'new', timestamp: NOW - 60 * 1000, question: '要不要換工作' });
    expect(findSameMatterDraw([older, newer], '關聖帝君', '要不要 換工作?', NOW)?.id).toBe('new');
  });

  it('不同神明、不同問題、超過 24 小時都不算', () => {
    const history = [
      record({ id: 'other-god', godName: '媽祖' }),
      record({ id: 'other-question', question: '要不要搬家？' }),
      record({ id: 'expired', timestamp: NOW - SAME_MATTER_WINDOW_MS }),
    ];
    expect(findSameMatterDraw(history, '關聖帝君', '要不要換工作？', NOW)).toBeNull();
  });

  it('只有標點的問題不比對', () => {
    expect(findSameMatterDraw([record({ question: '？？' })], '關聖帝君', '？', NOW)).toBeNull();
  });
});

describe('一事一籤提醒視窗', () => {
  const previous = record({ timestamp: Date.now() - 2 * 60 * 60 * 1000 });

  it('顯示上次的籤，並可選擇仍要請示', async () => {
    const onProceed = jest.fn();
    const view = await render(
      <SameMatterNotice record={previous} godName="關聖帝君" allowOverride onChangeQuestion={jest.fn()} onProceed={onProceed} />,
    );
    expect(view.getByText(/2 小時前已經向關聖帝君請示過這件事/)).toBeTruthy();
    expect(view.getByText(`第 ${previous.poem.number} 籤 · ${previous.poem.level} · ${previous.poem.title}`)).toBeTruthy();
    await fireEvent.press(view.getByText('事情有新變化，仍要請示'));
    expect(onProceed).toHaveBeenCalledTimes(1);
  });

  it('嚴謹模式只能換問題', async () => {
    const onChangeQuestion = jest.fn();
    const view = await render(
      <SameMatterNotice record={previous} godName="關聖帝君" allowOverride={false} onChangeQuestion={onChangeQuestion} onProceed={jest.fn()} />,
    );
    expect(view.queryByText('事情有新變化，仍要請示')).toBeNull();
    await fireEvent.press(view.getByText('換個問題'));
    expect(onChangeQuestion).toHaveBeenCalledTimes(1);
  });
});
