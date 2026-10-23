import fs from 'fs';
import path from 'path';

function listSourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(full);
    return /\.tsx$/.test(entry.name) ? [full] : [];
  });
}

// JSX 屬性用雙引號字串時不會解析 \uXXXX，螢幕閱讀器會念出跳脫碼本身
describe('JSX 屬性字串不含 \\u 跳脫碼', () => {
  it('所有 .tsx 的雙引號屬性值都直接寫中文', () => {
    const srcDir = path.join(__dirname, '..', 'src');
    const offenders = listSourceFiles(srcDir).flatMap((file) =>
      fs.readFileSync(file, 'utf8').split('\n')
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => /=\s*"[^"]*\\u[0-9a-fA-F]{4}/.test(line))
        .map(({ index }) => `${path.relative(srcDir, file)}:${index + 1}`),
    );
    expect(offenders).toEqual([]);
  });
});
