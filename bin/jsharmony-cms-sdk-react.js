#!/usr/bin/env node
/*!
Copyright 2025 apHarmony

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

var fs = require('fs');
var path = require('path');
var process = require('process');

function usage(){
  console.log();
  console.log('Usage: npx jsharmony-cms-sdk-react editor [target folder]');
  console.log();
  console.log('Example: npx jsharmony-cms-sdk-react editor .');
}

var args = process.argv.slice(2);
var cmd = args[0] || '';

if(cmd == 'editor'){
  var tgt = args[1] || '';
  if(!tgt){ return usage(); }
  var tgtPath = path.resolve(tgt);
  try{
    var tgtStat = fs.lstatSync(tgtPath);
    if(!tgtStat.isDirectory()){
      console.log('Target path is not a directory: '+tgtPath);
      return;
    }
  }
  catch(ex){
    console.log('Invalid target path: '+tgtPath);
    return;
  }
  var tgtFile = path.join(tgtPath, 'jsHarmonyCmsEditor.js');
  if(fs.existsSync(tgtFile)){ console.log('File already exists: '+tgtFile); return; }
  fs.writeFileSync(tgtFile, fs.readFileSync(path.join(__dirname, '../jsHarmonyCmsEditor.js'), 'utf8'), 'utf8');
  console.log('Saved editor to: '+tgtFile);
}
else {
  return usage();
}