import fs from 'fs';
import path from 'path';

const templeSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', '(tabs)', 'temple.tsx'), 'utf8');
const i18nSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'services', 'i18n.ts'), 'utf8');

function ritualSection() {
  const start = templeSource.indexOf('// ─── 線上法事委辦');
  const end = templeSource.indexOf('function createRbStyles(');
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  return templeSource.slice(start, end);
}

describe('線上法事委辦：尚未與廟宇合作時不得假裝可以代辦', () => {
  it('不標價、不收姓名電話、不寫入新的預約', () => {
    const section = ritualSection();
    expect(section).not.toMatch(/NT\$|price/);
    expect(section).not.toMatch(/TextInput/);
    expect(section).not.toMatch(/AsyncStorage\.setItem/);
    expect(section).not.toMatch(/預約成功|將於 24 小時內確認|status: 'confirmed'/);
  });

  it('說明文字明講尚未合作、不收費，並提醒舊登記未送出', () => {
    expect(i18nSource).toContain('本 App 目前尚未與任何廟宇合作，無法代辦法事，也不會收取任何費用');
    expect(i18nSource).toContain('這些登記只存在您的手機上，沒有送到任何廟宇');
    expect(i18nSource).not.toMatch(/廟方將聯繫確認/);
  });
});
