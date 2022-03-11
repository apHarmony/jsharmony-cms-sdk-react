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

const nPath = require('path');
const { paths } = require('./config');


function getBaseConfig(tsConfigPath, isDev) {

  const entry = '../src/public-api.ts';

  return {
    devtool: 'source-map',
    experiments: {},
    mode: isDev || true ? 'development' : 'production',
    context: nPath.resolve(__dirname),
    entry,
    output: {},
    externals: {
      'react': 'react',
      'react-router':  'react-router',
      'react-router-dom':  'react-router-dom'
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: tsConfigPath
              }
            }
          ],
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    }
  };
}

function getConfig(isUmd, isDev) {

  // path is relative to entry.
  const tsConfigFile = isUmd ? '../tsconfig.esm5.json' : '../tsconfig.esm2015.json';
  const outputRoot = paths.distRoot;
  const config = getBaseConfig(tsConfigFile, isDev);

  if (isUmd) {
    config.output = {
      path: nPath.join(outputRoot, 'bundles'),
      filename: 'jsHarmonyCmsSdkReact.umd.js',
      library: {
        name: 'jsHarmonyCmsSdkReact',
        type: 'umd'
      }
    };
  } else {
    config.output = {
      path: nPath.join(outputRoot, 'fesm2015'),
      filename: 'jsHarmonyCmsSdkReact.js',
      module: true,
      library: {
        type: 'module',
      },
      environment: { module: true }
    };
    config.externalsType = 'module';
    config.experiments = {
      outputModule: true
    };
    config.resolve.alias = {
      'react-router': nPath.resolve('../node_modules/react-router/esm/react-router.js'),
      'react-router-dom': nPath.resolve('../node_modules/react-router-dom/esm/react-router-dom.js'),
    }
  }

  return config;
}

module.exports.getConfig = getConfig