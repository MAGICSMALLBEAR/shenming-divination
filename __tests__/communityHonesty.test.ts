import fs from 'fs';
import path from 'path';

const communitySource = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'community.tsx'), 'utf8');

describe('社群心得：不得放入捏造的使用者見證', () => {
  it('沒有寫死的示範貼文或預設按讚數', () => {
    expect(communitySource).not.toMatch(/SEED_POSTS|示範貼文/);
    expect(communitySource).not.toMatch(/likes:\s*[1-9]/);
  });

  it('沒有貼文時顯示空白提示，而不是補假內容', () => {
    expect(communitySource).toContain("t('communityEmpty')");
  });
});
