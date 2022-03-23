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

const { paths } = require('../config');
const fs = require('fs-extra');
const nPath = require('path');

const packageJsonPath = nPath.join(paths.distRoot, 'package.json');

async function stripPackageJson() {
  const fileObj = JSON.parse(fs.readFileSync(packageJsonPath).toString());
  delete fileObj['scripts'];
  delete fileObj['devDependencies'];

  fileObj.main = fileObj.main.replace(/^dist\//i, '');
  fileObj.module = fileObj.module.replace(/^dist\//i, '');

  fs.writeFileSync(packageJsonPath, JSON.stringify(fileObj, null, 2));
}

module.exports.stripPackageJson = stripPackageJson;