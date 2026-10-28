import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));

import SourceAuditScreen from '@/app/source-audit';

describe('來源與校勘進度畫面', () => {
  it('shows intake states and reveals per-poem source gaps', async () => {
    const view = await render(<SourceAuditScreen />);
    expect(view.getByText('可抽籤 7 套・原文已校待展示權 3 套・校對中 1 套・待取得底本 3 套。來源連結代表可查到目錄，並不代表籤文已校對或取得 App 展示權。')).toBeTruthy();
    await fireEvent.press(view.getByLabelText('查看祀典大天后宮月老籤・27 首逐首來源'));
    expect(view.getByText('收起逐首來源與缺口（27 筆）')).toBeTruthy();
    expect(view.getAllByText('原文已轉錄・展示權待確認').length).toBeGreaterThan(0);
  });
});
