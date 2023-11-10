import { $ } from 'zx';
import protoc from './bin/protoc.js'

try {
  $`${protoc} --version`;
} catch (err) {
  err.message = `protoc vendor unsupport current platform :( \n${err.message}`;
  throw err;
}