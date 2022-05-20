/*!
Copyright 2022 apHarmony

This file is part of jsHarmony.

jsHarmony is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

jsHarmony is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this package.  If not, see <http://www.gnu.org/licenses/>.
*/

const { ESLint } = require('eslint');
const nPath = require('path');
const { paths } = require('../config');

const configFilePath = nPath.join(paths.root, '.eslintrc.json');
const ignoreFilePath = nPath.join(paths.root, '.eslintignore');

async function doLint(autoFix) {

  const eslint = new ESLint({
    cwd: nPath.dirname(configFilePath),
    fix: autoFix,
    ignorePath: ignoreFilePath,
    overrideConfigFile: configFilePath
  });

  const results = await eslint.lintFiles(['./src']);

  if (autoFix) {
    await ESLint.outputFixes(results);
  }

  // 'unix' is another good formatter that will
  // allow easier code navigation than 'stylish'
  // but 'stylish' is easier to read.
  const formatter = await eslint.loadFormatter('stylish');
  const resultText = formatter.format(results);

  console.log(resultText);

  const errorCount = results.reduce((sum, currentResult) => sum + currentResult.errorCount, 0);
  if (errorCount > 0) {
    throw new Error(`Lint finished with ${errorCount} errors`);
  }
}


async function lint() {
  return doLint(false);
}

async function lintFix() {
  return doLint(true);
}

module.exports.lint = lint;
module.exports.lintFix = lintFix;