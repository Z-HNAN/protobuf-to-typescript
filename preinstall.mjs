import { $ } from 'zx';
import path from 'node:path';
import protoc from './bin/protoc.js'

const protocBin = path.resolve(process.cwd(), './bin', protoc)

try {
  $`${protocBin} --version`;
} catch (err) {
  err.message = `protoc vendor unsupport current platform :( \n${err.message}`;
  throw err;
}