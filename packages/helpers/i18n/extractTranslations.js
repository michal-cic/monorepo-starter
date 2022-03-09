import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fse from 'fs-extra';
import glob from 'glob';
import { Parser } from 'i18next-scanner';

const [inputPathArg, translationsPathArg] = process.argv.slice(2);

if (inputPathArg === undefined) {
  console.error(
    'ERROR: Please provide a path (relative to the root directory) to a project in your monorepo'
  );
  process.exit(1);
}

if (translationsPathArg === undefined) {
  console.error(
    'ERROR: Please provide a path (relative to the root directory) where your translations are located in a project'
  );
  process.exit(1);
}

const currentDirPath = path.dirname(fileURLToPath(import.meta.url));
const rootDirPath = path.resolve(currentDirPath, '../..');
const projectPath = path.resolve(rootDirPath, inputPathArg);
const translationsPath = path.resolve(rootDirPath, translationsPathArg);

if (fse.pathExistsSync(projectPath) === false) {
  console.error('ERROR: Resolved project path does not exist');
  process.exit(1);
}

if (fse.pathExistsSync(translationsPath) === false) {
  console.error('ERROR: Resolved translations path does not exist');
  process.exit(1);
}

const files = glob.sync(`${projectPath}/**/*.{ts,tsx}`);
if (files.length === 0) {
  console.error('ERROR: No files matching pattern .{ts,tsx} were found');
  process.exit(1);
}

const lngs = ['da', 'en'];
const ns = ['common'];

const parser = new Parser({
  lngs,
  ns,
  removeUnusedKeys: true,
  resource: {
    loadPath: `${translationsPath}/{{lng}}/{{ns}}.json`,
  },
});

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  parser.parseFuncFromString(content, {
    list: ['t'],
  });
}

const data = parser.get({
  sort: true,
});

// flag to detect errors
let missingTranslations = '';

// traverse languages and namespaces within languages
for (const lng of lngs) {
  for (const n of ns) {
    // traverse and detect missing translations for keys
    for (const [key, value] of Object.entries(data[lng][n])) {
      if (!value) {
        missingTranslations += `[${lng}] ${n}:${key} is a missing translation\n`;
      }
    }
    const path = `${translationsPath}/${lng}/${n}.json`;
    fse.outputFileSync(path, JSON.stringify(data[lng][n], null, 2));
  }
}

if (missingTranslations !== '') {
  console.log(missingTranslations);
}
