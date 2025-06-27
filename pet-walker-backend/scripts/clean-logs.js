const fs = require('fs');
const path = require('path');

// Patrones de console.log a limpiar
const LOG_PATTERNS = [
  /console\.log\('[^']*'\);?/g,
  /console\.log\("[^"]*"\);?/g,
  /console\.log\(`[^`]*`\);?/g,
  /console\.log\('[^']*',\s*[^)]+\);?/g,
  /console\.log\("[^"]*",\s*[^)]+\);?/g,
  /console\.log\(`[^`]*`,\s*[^)]+\);?/g,
];

// Archivos a excluir
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'clean-logs.js'
];

function shouldExcludeFile(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function cleanLogsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let cleanedContent = content;
    let changesCount = 0;

    // Limpiar console.logs básicos
    LOG_PATTERNS.forEach(pattern => {
      const matches = cleanedContent.match(pattern);
      if (matches) {
        changesCount += matches.length;
        cleanedContent = cleanedContent.replace(pattern, '');
      }
    });

    // Limpiar líneas vacías extra
    cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (changesCount > 0) {
      fs.writeFileSync(filePath, cleanedContent);
      console.log(`✅ ${filePath}: ${changesCount} logs limpiados`);
      return changesCount;
    }

    return 0;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return 0;
  }
}

function processDirectory(dirPath) {
  let totalCleaned = 0;

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      
      if (shouldExcludeFile(fullPath)) {
        continue;
      }

      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        totalCleaned += processDirectory(fullPath);
      } else if (stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.js'))) {
        totalCleaned += cleanLogsInFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error procesando directorio ${dirPath}:`, error.message);
  }

  return totalCleaned;
}

function main() {
  console.log('🧹 Iniciando limpieza de console.logs...\n');

  const projectRoot = path.join(__dirname, '..');
  const totalCleaned = processDirectory(projectRoot);

  console.log(`\n✨ Limpieza completada: ${totalCleaned} logs eliminados`);
  
  if (totalCleaned > 0) {
    console.log('\n📋 Siguiente paso recomendado:');
    console.log('   npm run build  # Verificar que todo compila');
  }
}

if (require.main === module) {
  main();
}

module.exports = { cleanLogsInFile, processDirectory }; 