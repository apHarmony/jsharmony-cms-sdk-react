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

const { spawn } = require('child_process');
const nPath = require('path');
const { paths } = require('../config');
const fs = require('fs-extra');

const projectFile = nPath.join(paths.root, 'tsconfig.declaration.json');
const outputFolder = nPath.join(paths.root, 'temp/tsc-out/dts');

async function generateTypeDefs() {

  await fs.remove(outputFolder)

  return new Promise((resolve, reject) => {
    const tsc = spawn('npx', ['tsc', '-p', projectFile], {
      shell: true,
      stdio: 'inherit'
    });

    tsc.on('close', code => {
      resolve(code);
    });
  });
}

module.exports.generateTypeDefs = generateTypeDefs;