import { resolve } from 'node:path';

import { PORTFOLIO_PRETHEME_SCRIPT } from '../../src/app/core/theme/pretheme.script';
import { updateIndexHtmlBlock } from '../update-index-html-block';

const indexPath = resolve(process.cwd(), 'src/index.html');

const startMarker = '<!-- portfolio-pretheme:start -->';
const endMarker = '<!-- portfolio-pretheme:end -->';

updateIndexHtmlBlock({
  indexPath,
  startMarker,
  endMarker,
  script: PORTFOLIO_PRETHEME_SCRIPT,
  label: 'portfolio-pretheme',
});
