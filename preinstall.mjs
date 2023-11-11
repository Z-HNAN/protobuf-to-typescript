import { $ } from 'zx';
import path from 'node:path';

import protoc from './bin/protoc.js';
import tsProtoc from './bin/ts-protoc.js';

const protocBin = path.resolve(process.cwd(), './bin', protoc)

try {
  $`${protocBin} --version`;
} catch (err) {
  err.message = `protoc vendor unsupport current platform :( \n${err.message}`;
  throw err;
}

try {
  if (tsProtoc === 'protoc-gen-ts_proto') {
    console.log('use global ts-protoc');
    $`pnpm install ts-proto@^1.164.0 -g`;
  }
} catch (err) {
  err.message = `install globalts-protoc error :( \n${err.message}`;
  throw err;
}