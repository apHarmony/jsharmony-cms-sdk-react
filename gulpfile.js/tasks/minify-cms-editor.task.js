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

const cmsEditorPath = nPath.join(paths.distRoot, 'jsHarmonyCmsEditor.js');

async function minifyCmsEditor() {

  const file = (await fs.readFile(cmsEditorPath)).toString();
  const result = UglifyJS.minify(file);

  await fs.writeFile(cmsEditorPath, result.code);
}

module.exports.minifyCmsEditor = minifyCmsEditor;