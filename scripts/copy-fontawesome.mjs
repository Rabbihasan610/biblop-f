import { cpSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'node_modules', '@fortawesome', 'fontawesome-free');
const target = resolve(root, 'public', 'vendor', 'fontawesome');

mkdirSync(target, { recursive: true });
cpSync(resolve(source, 'css'), resolve(target, 'css'), { recursive: true });
cpSync(resolve(source, 'webfonts'), resolve(target, 'webfonts'), { recursive: true });
