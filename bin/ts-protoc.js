const fs = require('fs');
const path = require('path');

const localBin = path.resolve(process.cwd(), './node_modules/.bin/protoc-gen-ts_proto');

module.exports = fs.existsSync(localBin) ? localBin : 'protoc-gen-ts_proto';
