import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { PORTFOLIO_PRETHEME_SCRIPT } from '../../src/app/core/theme/pretheme.script';

const indexPath = resolve(process.cwd(), 'src/index.html');

const startMarker = '<!-- portfolio-pretheme:start -->';
const endMarker = '<!-- portfolio-pretheme:end -->';

const indexHtml = readFileSync(indexPath, 'utf8');

const startIndex = indexHtml.indexOf(startMarker);
const endIndex = indexHtml.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  throw new Error('No se encontraron los markers portfolio-pretheme en src/index.html');
}

const before = indexHtml.slice(0, startIndex + startMarker.length);
const after = indexHtml.slice(endIndex);

const prethemeBlock = `
    <script>
      ${PORTFOLIO_PRETHEME_SCRIPT}
    </script>
`;

const nextIndexHtml = `${before}${prethemeBlock}    ${after}`;

writeFileSync(indexPath, nextIndexHtml, 'utf8');

console.log('Pretheme script actualizado en src/index.html');
