const os = require('os');
const path = require('path');

const PLATFORM = os.platform();
const ARCH = os.arch();

function getProtocFilename() {
  let baseName = 'protoc-25.0';

  switch (PLATFORM) {
      case 'linux':
          switch (ARCH) {
              case 'arm64': return `./${baseName}/linux-aarch_64.protoc`;
              // case 'ppc64': return `./${baseName}/linux-ppcle_64.protoc`;
              // case 's390x': return `./${baseName}/linux-s390_64.protoc`;
              case 'ia32': return `./${baseName}/linux-x86_32.protoc`;
              case 'x64': return `./${baseName}/linux-x86_64.protoc`;
              default: throw new Error('Unsupported architecture for Linux');
          }
      case 'darwin':
          switch (ARCH) {
              case 'arm64': return `./${baseName}/osx-aarch_64.protoc`;
              case 'x64': return `./${baseName}/osx-x86_64.protoc`;
              // default: return `${baseName}-osx-universal_binary.zip`;
              default: throw new Error('Unsupported architecture for darwin');
          }
      case 'win32':
          return ARCH === 'x64' ? `./${baseName}/win64.protoc.exe` : `./${baseName}/win32.protoc.exe`;
      default:
          throw new Error('Unsupported platform');
  }
}

module.exports = path.resolve(process.cwd(), './bin', getProtocFilename())
