import { $ } from 'zx';
import path from 'node:path';
import protoc from './bin/protoc.js';


try {
  const protocBin = path.resolve(process.cwd(), './bin', protoc);
  $`${protocBin} --version`;
} catch (err) {
  err.message = `protoc vendor unsupport current platform :( \n${err.message}`;
  throw err;
}
