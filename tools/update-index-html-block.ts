import { readFileSync, writeFileSync } from 'node:fs';

type UpdateIndexHtmlBlockOptions = {
  indexPath: string;
  startMarker: string;
  endMarker: string;
  script: string;
  label: string;
};

function detectEndOfLine(text: string): string {
  if (text.includes('\r\n')) {
    return '\r\n';
  }

  if (text.includes('\n')) {
    return '\n';
  }

  if (text.includes('\r')) {
    return '\r';
  }

  return '\n';
}

function normalizeEndOfLine(text: string, endOfLine: string): string {
  return text.replace(/\r\n|\n|\r/g, endOfLine);
}

export function updateIndexHtmlBlock({
  indexPath,
  startMarker,
  endMarker,
  script,
  label,
}: UpdateIndexHtmlBlockOptions): void {
  const indexHtml = readFileSync(indexPath, 'utf8');
  const endOfLine = detectEndOfLine(indexHtml);
  const normalizedIndexHtml = normalizeEndOfLine(indexHtml, endOfLine);

  const startIndex = normalizedIndexHtml.indexOf(startMarker);
  const endIndex = normalizedIndexHtml.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error(`No se encontraron los markers ${label} en src/index.html`);
  }

  const before = normalizedIndexHtml.slice(0, startIndex + startMarker.length);
  const after = normalizedIndexHtml.slice(endIndex);
  const scriptBlock = normalizeEndOfLine(
    [
      '',
      '    <script>',
      `      ${script}`,
      '    </script>',
      '',
    ].join('\n'),
    endOfLine,
  );
  const nextIndexHtml = `${before}${scriptBlock}    ${after}`;

  if (nextIndexHtml === normalizedIndexHtml && indexHtml === normalizedIndexHtml) {
    console.log(`${label} sin cambios en src/index.html`);
    return;
  }

  writeFileSync(indexPath, nextIndexHtml, 'utf8');
  console.log(`${label} actualizado en src/index.html`);
}
