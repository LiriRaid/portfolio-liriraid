import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const environmentPath = resolve(process.cwd(), 'src/environments/environment.ts');

const serviceId = process.env['EMAILJS_SERVICE_ID'];
const templateId = process.env['EMAILJS_TEMPLATE_ID'];
const publicKey = process.env['EMAILJS_PUBLIC_KEY'];

const hasAllEmailJsVars = Boolean(serviceId && templateId && publicKey);

if (!hasAllEmailJsVars) {
  if (existsSync(environmentPath)) {
    console.log('preenv: EMAILJS_SERVICE_ID/EMAILJS_TEMPLATE_ID/EMAILJS_PUBLIC_KEY no definidas, se usa src/environments/environment.ts existente');
    process.exit(0);
  }

  throw new Error(
    'Faltan las variables de entorno EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID y EMAILJS_PUBLIC_KEY, y src/environments/environment.ts no existe localmente.',
  );
}

const fileContent = `export const environment = {
  production: ${process.env['NODE_ENV'] === 'production'},

  emailjs: {
    serviceId: '${serviceId}',
    templateId: '${templateId}',
    publicKey: '${publicKey}',
  },
};
`;

mkdirSync(dirname(environmentPath), { recursive: true });
writeFileSync(environmentPath, fileContent, 'utf8');
console.log('preenv: src/environments/environment.ts generado desde variables de entorno');
