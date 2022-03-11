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

const fs = require('fs-extra');
const nPath = require('path');
const { paths } = require('../config');

const fileList = [
  { src: './README.md', dest: './README.md' },
  { src: './package.dist.json', dest: './package.json'},
  { src: './lib/jsHarmonyCmsEditor.js', dest: './jsHarmonyCmsEditor.js'},
];


async function copyFiles() {

  for (let i = 0; i < fileList.length; i++) {

    const src = nPath.resolve(nPath.join(paths.root, fileList[i].src));
    const dest = nPath.resolve(nPath.join(paths.distRoot, fileList[i].dest));

    await fs.copy(src, dest);
  }
}

module.exports.copyFiles = copyFiles;