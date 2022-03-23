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

const { series, watch } = require('gulp');
const { runWebpack, runWebpackWatch } = require('./tasks/webpack.task');
const { rollupDefinitionFiles } = require('./tasks/rollup-definition-files.task');
const { copyFiles } = require('./tasks/copy.task');
const { minifyCmsEditor } = require('./tasks/minify-cms-editor.task');
const { lint, lintFix } = require('./tasks/lint.task');
const { cleanDist } = require('./tasks/clean-dist.task');
const { generateTypeDefs } = require('./tasks/generate-type-defs.task');
const { generateDocs } = require('./tasks/generate-docs.task');
const { stripPackageJson } = require('./tasks/strip-package-json.task');

exports['build:prod'] = series(
  lint,
  cleanDist,
  runWebpack,
  generateTypeDefs,
  rollupDefinitionFiles,
  generateDocs,
  copyFiles,
  stripPackageJson,
  minifyCmsEditor
);

exports['build:watch'] = async function() {

  await cleanDist();
  await copyFiles();

  runWebpackWatch(async () => {
    await generateTypeDefs();
    rollupDefinitionFiles()
  });
}

exports.extractDefinitions = series(
  generateTypeDefs,
  rollupDefinitionFiles
);

exports.generateDocs = generateDocs;
exports.lint = lint
exports.lintFix = lintFix

