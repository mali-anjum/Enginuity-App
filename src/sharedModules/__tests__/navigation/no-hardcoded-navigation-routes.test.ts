import fs from 'fs';
import path from 'path';

const SRC_ROOT = path.resolve(__dirname, '../../../');
const EXTENSIONS = new Set(['.ts', '.tsx']);

const ROUTER_LITERAL_PATTERN = /router\.(?:push|replace)\(\s*(['"`])\//;
const HREF_LITERAL_PATTERN = /href=\{?\s*(['"`])\//;

const IGNORED_FILES = new Set([
  path.resolve(SRC_ROOT, 'sharedModules/navigation/routes.ts'),
]);

function collectSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(fullPath, acc);
      continue;
    }
    if (EXTENSIONS.has(path.extname(entry.name))) {
      acc.push(fullPath);
    }
  }
  return acc;
}

describe('navigation routes usage', () => {
  it('does not use hardcoded route literals in router/link calls', () => {
    const files = collectSourceFiles(SRC_ROOT).filter((file) => !IGNORED_FILES.has(file));
    const violations: string[] = [];

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (ROUTER_LITERAL_PATTERN.test(line) || HREF_LITERAL_PATTERN.test(line)) {
          violations.push(`${path.relative(SRC_ROOT, filePath)}:${idx + 1}`);
        }
      });
    }

    expect(violations).toEqual([]);
  });
});
