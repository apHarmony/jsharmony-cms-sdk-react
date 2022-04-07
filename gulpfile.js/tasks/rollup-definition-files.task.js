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
const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');
const fs = require('fs-extra');
const { paths } = require('../config');
const apiExtractorJsonPath = nPath.join(paths.gulpRoot, 'api-extractor.json');
const tsDocJsonPath = nPath.join(paths.gulpRoot, 'tsdoc.json');

const ambientDefs = [
  nPath.join(paths.srcRoot, 'jsHarmonyCmsClient.d.ts')
 ];


const defOutputFile = nPath.join(paths.distRoot, 'jsHarmonyCmsSdkReact.d.ts');
const licenseFile = nPath.join(paths.root, 'LICENSE.include');

async function appendAmbients() {

  let fileText = (await fs.readFile(defOutputFile)).toString();
  for (let i = 0; i < ambientDefs.length; i++) {
    fileText += '\n\n\n' + (await fs.readFile(ambientDefs[i])).toString();
  }
  fileText = (await fs.readFile(licenseFile)).toString() + '\n\n' + fileText;
  await fs.writeFile(defOutputFile, fileText);
}

async function rollup() {

  const extractorConfig = ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath);
  extractorConfig.tsdocConfigFile = tsDocJsonPath;
  const extractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: false,
  });

  if (extractorResult.errorCount > 0) {
    console.error(`API Extractor completed with ${extractorResult.errorCount} errors.`);
    return Promise.reject(new Error('API Extractor failed'));
  }

  if (extractorResult.warningCount > 0) {
    console.error(`API Extractor completed with ${extractorResult.warningCount} warnings`);
  }

  if (extractorResult.succeeded) {
    console.log(`API Extractor completed successfully`);
  }

  return Promise.resolve();
}

async function rollupDefinitionFiles() {
  await rollup();
  await appendAmbients();
}


module.exports.rollupDefinitionFiles = rollupDefinitionFiles;