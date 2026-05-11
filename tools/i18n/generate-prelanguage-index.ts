// tools/i18n/generate-prelanguage-index.ts

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { PORTFOLIO_PRELANGUAGE_TOGGLE_SCRIPT } from '../../src/app/core/i18n/prelanguage-toggle.script';

const indexPath = resolve(process.cwd(), 'src/index.html');

const startMarker = '<!-- portfolio-prelang:start -->';
const endMarker = '<!-- portfolio-prelang:end -->';

const indexHtml = readFileSync(indexPath, 'utf8');

const startIndex = indexHtml.indexOf(startMarker);
const endIndex = indexHtml.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  throw new Error('No se encontraron los markers portfolio-prelang en src/index.html');
}

const before = indexHtml.slice(0, startIndex + startMarker.length);
const after = indexHtml.slice(endIndex);

const prelanguageBlock = `
    <script>
      ${PORTFOLIO_PRELANGUAGE_TOGGLE_SCRIPT}
    </script>
`;

const nextIndexHtml = `${before}${prelanguageBlock}    ${after}`;

writeFileSync(indexPath, nextIndexHtml, 'utf8');

console.log('Prelanguage toggle script actualizado en src/index.html');
