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

const UglifyJS = require('uglify-js');
const nPath = require('path');
const fs = require('fs-extra');
const { paths } = require('../config');
const glob = require('glob');

// the preamble will be added to each
// minfied output.
const preamble =
`
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
`;


async function minify(devBuild) {

  getFiles().forEach((filePath, index, arr) => {

    console.log(`Minifying file ${index + 1}/${arr.length} - ${filePath}`);
    const fileString = fs.readFileSync(filePath).toString();
    const sourceMapPath = parseFileToGetSourceMapPath(filePath, fileString);

    /** @type {UglifyJS.MinifyOptions}*/
    const options = {
      output: {
        preamble: preamble
      }
    };

    // Note:
    // With standard compress options
    // the source maps will only be
    // somewhat accurate (since some
    // changes can't map to original source).
    // This should be okay for production build in most cases.
    // If needed, adjust the `options.compress`
    // settings to get higher fidelity source maps.
    if (sourceMapPath) {
      options.sourceMap = {
        content: fs.readFileSync(sourceMapPath).toString(),
        url: nPath.parse(sourceMapPath).base,
        includeSources: true
      }
    }
    const result = UglifyJS.minify(fileString, options);

    if (result.error) {
      console.error(result.error);
      throw result.error;
    }

    fs.writeFileSync(filePath, result.code);
    if (sourceMapPath) {
      fs.writeFileSync(sourceMapPath, result.map);
    }
  });
}

/**
 * @returns {string[]}
 */
function getFiles() {
  // glob requires forward slashes.
  const pattern = nPath.join(paths.distRoot, '/**/*.js').replace(/\\/g, '/');
  const files = glob.sync(pattern).filter(fileName => nPath.basename(fileName) != 'jsharmony-cms-sdk-react.js');
  return files;
}

function parseFileToGetSourceMapPath(filePath, fileString) {

  const match = /^\s*\/\/#\s+sourceMappingURL\s*=\s*(.*)$/mgi.exec(fileString);
  if (match == null) {
    return undefined;
  }

  return nPath.resolve(nPath.dirname(filePath), match[1]);
}

module.exports.minify = minify;
