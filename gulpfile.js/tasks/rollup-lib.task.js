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
// @ts-check
const rollup = require('rollup');
const rollupTypescript = require('@rollup/plugin-typescript');
const rollupCommonjs = require('@rollup/plugin-commonjs');
const paths = require('../config').paths;
const path = require('path');

async function runRollupLib() {

  console.log('Creating ESM2015 bundle');
  let options = getConfig('es');
  let bundle = await rollup.rollup(options);
  await bundle.write(options.output);

  console.log('Creating UMD bundle');
  options = getConfig('umd');
  bundle = await rollup.rollup(options);
  await bundle.write(options.output);
}

/**
* @param {(() => void) | undefined} onBundleSuccess
*/
async function runRollupLibWatchEsmBundle(onBundleSuccess) {
return runWatch('es', onBundleSuccess);
}

/**
* @param {(() => void) | undefined} onBundleSuccess
*/
async function runRollupLibWatchUmdBundle(onBundleSuccess) {
return runWatch('es', onBundleSuccess);
}

/**
 * @param {'es' | 'umd'} format
 */
function getConfig(format) {

  let tsConfigPath = undefined;
  if (format === 'es') {
    tsConfigPath = path.resolve(paths.root, 'tsconfig.esm2015.json');
  } else if (format === 'umd') {
    tsConfigPath = path.resolve(paths.root, 'tsconfig.esm5.json');
  }

  /** @type {rollup.RollupOptions} */
  const options = {
    input: path.resolve(paths.srcRoot, 'index.ts'),
    external: [
      'react',
      'react-dom',
      'react-router',
      'react-router-dom',
    ],
    plugins: [
      // rollupCommonjs is required for
      // 'jsharmony-cms-sdk-clientjs' module
      rollupCommonjs(),
      rollupTypescript({
        tsconfig: tsConfigPath
      })
    ],
    onwarn: warning => {
      // The 'jsharmony-cms-sdk-clientjs' module uses
      // `eval`. This will remove the warning.
      if (warning.code === 'EVAL' && warning.id.endsWith('jsHarmonyCmsClient.js')) return;
      console.warn(warning);
    }
  };

  if (format === 'es') {
    options.output = {
      file: path.resolve(paths.distRoot, 'fesm2015/jsHarmonyCmsSdkReact.js'),
      format: 'es',
      sourcemap: true,
    }
  } else if (format === 'umd') {
    options.output = {
      file: path.resolve(paths.distRoot, 'bundles/jsHarmonyCmsSdkReact.umd.js'),
      format: 'umd',
      sourcemap: true,
      name: 'jsHarmonyCmsSdkReact',
      globals: {
        history: 'HistoryLibrary',
        react: 'React',
        'react-router-dom': 'ReactRouterDom'
      }
    }
  }

  return options;
}

/**
 * @param {rollup.RollupWarning} warning
 */
function logTypeScriptError(warning) {

  const reset = '\x1b[0m';
  const fgRed = '\x1b[31m';
  const fgCyan = '\x1b[36m';
  const fgYellow = '\x1b[33m';

  const errorMessage = warning.message.slice('@rollup/plugin-typescript '.length)
  const { file, line, column } = warning.loc;

  // This string output is compatible with most standard problem matchers so clicking (or ctrl+click)
  // on error message can go straight to file:line:column in editor/IDE
  console.log(`${fgCyan}${file}${fgYellow}:${line}:${column}${reset} - ${fgRed}error${reset} ${errorMessage}`)
}

function logWatchMessage(message) {
  const time = new Date().toISOString();
  console.log(`${time}:\t${message}`);
}

/**
 * @param {'es' | 'umd'} format
 * @param {(() => void) | undefined} onBundleSuccess
 */
function runWatch(format, onBundleSuccess) {

  const options = getConfig(format);
  options.watch = {
    buildDelay: 200,
    clearScreen: false
  };

  let startId = 0;
  let pluginErrorId = -1;
  options.onwarn = warning => {
    if (warning.plugin === 'typescript') {
      pluginErrorId = startId;
      logTypeScriptError(warning);
    }
  }

  const watcher = rollup.watch(options);

  watcher.on('event', event => {
    if (event.code === 'START') {
      startId++;
      logWatchMessage('Rollup.js watcher is starting');
    } else if (event.code === 'BUNDLE_START') {
      logWatchMessage('Starting bundle');
    } else if (event.code === 'BUNDLE_END') {
      if (startId === pluginErrorId) {
        logWatchMessage('Bundle complete with errors');
      } else {
        logWatchMessage('Bundle complete');
        onBundleSuccess?.();
      }
    } else if (event.code === 'END') {
      // All bundles complete. But we only
      // build one at a time so nothing here...
    } else if (event.code === 'ERROR') {
      logWatchMessage('Error')
      console.error(event)
    }

    if (event.result) {
      event.result.close();
    }
  });

  // This should never resolve.
  // We run forever....
  return new Promise(() => {});
}

module.exports.runRollupLib  = runRollupLib;
module.exports.runRollupLibWatchEsmBundle  = runRollupLibWatchEsmBundle;
module.exports.runRollupLibWatchUmdBundle  = runRollupLibWatchUmdBundle;