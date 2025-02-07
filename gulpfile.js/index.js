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
const { rollupDefinitionFiles } = require('./tasks/rollup-definition-files.task');
const { copyFiles } = require('./tasks/copy.task');
const { minify } = require('./tasks/minify.task');
const { lint, lintFix } = require('./tasks/lint.task');
const { cleanDist } = require('./tasks/clean-dist.task');
const { generateTypeDefs } = require('./tasks/generate-type-defs.task');
const { generateDocs } = require('./tasks/generate-docs.task');
const { stripPackageJson } = require('./tasks/strip-package-json.task');
const {
  runRollupLib,
  runRollupLibWatchEsmBundle,
  runRollupLibWatchUmdBundle
} = require('./tasks/rollup-lib.task');


/**
 * Run this for production build
 */
exports['build:prod'] = series(
  lint,
  cleanDist,
  runRollupLib,
  generateTypeDefs,
  rollupDefinitionFiles,
  generateDocs,
  copyFiles,
  stripPackageJson,
  minify
);

/**
 * This is the normal dev build
 * to run.
 */
exports['build:watch'] = async function() {
  await cleanDist();
  await runRollupLib();
  await generateTypeDefs();
  await rollupDefinitionFiles();
  await copyFiles();
  await stripPackageJson();
}

exports['build:watch:esm'] = async function() {

  await cleanDist();
  await copyFiles();

  runRollupLibWatchEsmBundle(async () => {
    await generateTypeDefs();
    rollupDefinitionFiles()
  });
}

/**
 * Run this dev build
 * instead of build:watch when
 * testing the UMD output.
 */
exports['build:watch:umd'] = async function() {

  await cleanDist();
  await copyFiles();

  runRollupLibWatchUmdBundle(async () => {
    await generateTypeDefs();
    rollupDefinitionFiles()
  });
}

/**
 * Generate documentation.
 * This runs as part of production build.
 */
exports.generateDocs = generateDocs;

/**
 * Run linter without auto-fix.
 * This runs as part of production build
 */
exports.lint = lint;

/**
 * Run linter with auto-fix enabled.
 */
exports.lintFix = lintFix;

