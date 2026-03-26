const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('d:\\balda\\frontend\\src', function(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let original = fs.readFileSync(filePath, 'utf8');
    if (original.includes('localStorage')) {
      // Only replace if it relates to aura_user or if it's safe (all localStorage here is auth)
      let replaced = original.replace(/localStorage\.getItem/g, 'sessionStorage.getItem')
                             .replace(/localStorage\.setItem/g, 'sessionStorage.setItem')
                             .replace(/localStorage\.removeItem/g, 'sessionStorage.removeItem');
      if (original !== replaced) {
        fs.writeFileSync(filePath, replaced, 'utf8');
        console.log('Updated', filePath);
      }
    }
  }
});
