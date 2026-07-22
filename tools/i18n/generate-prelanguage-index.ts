// tools/i18n/generate-prelanguage-index.ts

import { resolve } from 'node:path';

import { PORTFOLIO_PRELANGUAGE_TOGGLE_SCRIPT } from '../../src/app/core/i18n/prelanguage-toggle.script';
import { updateIndexHtmlBlock } from '../update-index-html-block';

const indexPath = resolve(process.cwd(), 'src/index.html');

const startMarker = '<!-- portfolio-prelang:start -->';
const endMarker = '<!-- portfolio-prelang:end -->';

updateIndexHtmlBlock({
  indexPath,
  startMarker,
  endMarker,
  script: PORTFOLIO_PRELANGUAGE_TOGGLE_SCRIPT,
  label: 'portfolio-prelang',
});
