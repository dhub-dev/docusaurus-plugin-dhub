// Copies non-TS theme assets (CSS modules) from src/ to lib/, since tsc only emits JS.
import fs from 'node:fs';
import path from 'node:path';

function walk(dir) {
  return fs
    .readdirSync(dir, {withFileTypes: true})
    .flatMap((entry) =>
      entry.isDirectory()
        ? walk(path.join(dir, entry.name))
        : [path.join(dir, entry.name)],
    );
}

for (const file of walk('src/theme').filter((f) => f.endsWith('.css'))) {
  const out = path.join('lib', path.relative('src', file));
  fs.mkdirSync(path.dirname(out), {recursive: true});
  fs.copyFileSync(file, out);
}
