const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const zip = new JSZip();

function addDirectoryToZip(dirPath, zipFolder) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    if (item === 'node_modules' || item === '.git' || item === 'dist' || item === 'public' || item.endsWith('.zip') || item.endsWith('.tar.gz')) {
      continue;
    }

    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const subFolder = zipFolder.folder(item);
      addDirectoryToZip(fullPath, subFolder);
    } else {
      const content = fs.readFileSync(fullPath);
      zipFolder.file(item, content);
    }
  }
}

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  addDirectoryToZip(rootDir, zip);

  if (!fs.existsSync(path.join(rootDir, 'public'))) {
    fs.mkdirSync(path.join(rootDir, 'public'), { recursive: true });
  }

  const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  const outputPath = path.join(rootDir, 'public', 'sim-tugas-project.zip');
  fs.writeFileSync(outputPath, content);
  console.log('Successfully created public/sim-tugas-project.zip (' + (content.length / 1024).toFixed(1) + ' KB)');
}

main().catch(console.error);
