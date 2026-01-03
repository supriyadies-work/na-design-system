const fs = require('fs');
const path = require('path');

// Copy CSS files from src to dist
function copyCSSFiles(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  
  const files = fs.readdirSync(srcDir);
  
  files.forEach(file => {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyCSSFiles(srcPath, destPath);
    } else if (file.endsWith('.css') || file.endsWith('.module.css')) {
      if (!fs.existsSync(path.dirname(destPath))) {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
      }
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  });
}

// Copy CSS files from src/components to dist/js/components
const srcComponents = path.join(__dirname, '../src/components');
const destComponents = path.join(__dirname, '../dist/js/components');

if (fs.existsSync(srcComponents)) {
  copyCSSFiles(srcComponents, destComponents);
  console.log('✅ CSS files copied successfully');
} else {
  console.log('⚠️  Source components directory not found');
}

