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

const webpack = require('webpack');
const { getConfig } = require('../webpack.config');

function runWebpackWatch(onSuccess) {

  onSuccess = onSuccess || (() => undefined);

  // Note: this promise should never resolve.
  return new Promise(() => {
    const compiler = webpack(getConfig(false, true));
    compiler.watch({}, (err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          console.error(err.details);
        }
        return;
      }

      console.log(`Webpack Watch Compiled @ ${new Date().toLocaleTimeString()}`)
      const info = stats.toJson();
      if (stats.hasErrors()) {
        info.errors.forEach(error => console.log(formatMessage(error)));
      } else if (stats.hasWarnings()) {
        info.warnings.forEach(warning => console.log(formatMessage(warning)));
        onSuccess();
      } else {
        onSuccess();
      }
    });
  });
}

async function runWebpack() {
  return new Promise((resolve, reject) => {
    const config = [
      getConfig(true, false),
      getConfig(false, false)
    ];
    webpack(config, (err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          console.error(err.details);
        }
        reject(err);
        return;
      }

      const info = stats.toJson();

      if (stats.hasErrors()) {
        info.errors.forEach(error => console.log(formatMessage(error)));
        reject(info.errors);
        return;
      }else if (stats.hasWarnings()) {
        console.log('Webpack finished with warnings');
        info.warnings.forEach(warning => console.log(formatMessage(warning)));
      }

      resolve();
    });
  });
}

function formatMessage(message) {
  return `${message.message}`;
}


module.exports.runWebpackWatch = runWebpackWatch;
module.exports.runWebpack = runWebpack;