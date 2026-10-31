jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { AskFollowUp } from '@/components/AskFollowUp';
import ChatScreen from '@/app/chat';
import { saveLastPoemContext } from '@/services/storage';

const realFetch = global.fetch;
const context = {
  editionId: 'yuelao-hongkong-101', editionLabel: '月老香港版・歷史名稱',
  editionVersionTag: 'historical-v1', editionTemple: '歷史廟本',
  editionSource: '當時的來源說明', drawMethod: 'direct',
};

beforeEach(() => {
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ reply: '請先整理問題。' }) })) as unknown as typeof fetch;
});
afterEach(() => { global.fetch = realFetch; });

function expectHistoricalEdition() {
  const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
  expect(body.messages[0].content).toContain('月老香港版・歷史名稱');
  expect(body.messages[0].content).toContain('historical-v1');
  expect(body.messages[0].content).toContain('當時的來源說明');
  expect(body.messages[0].content).toContain('不得宣稱為廟方原解');
}

it('includes the saved edition in the result-card follow-up', async () => {
  const view = await render(<AskFollowUp godName="月下老人" poemContent="歷史籤文" oracleContext={context} />);
  await act(async () => fireEvent.press(view.getByText('和 月下老人 再追問一次')));
  await act(async () => fireEvent.press(view.getByText('關於這支籤，我最該先做的事是什麼？')));
  expectHistoricalEdition();
});

it('loads the historical edition snapshot into the standalone chat', async () => {
  await saveLastPoemContext({
    ...context, godName: '月下老人', poemContent: '歷史籤文', poemNumber: 1,
    poemTitle: '籤題', poemLevel: '中平', timestamp: 1,
  });
  const view = await render(<ChatScreen />);
  await act(async () => fireEvent.press(view.getByText('我接下來最重要的一步是什麼？')));
  expectHistoricalEdition();
});
