#!/usr/bin/env node

/**
 * Script to replace $TA with $tabledadrian throughout the codebase
 * 
 * Usage: node scripts/replace-token-name.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('-d');

// Directories to exclude
const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '.cache',
  'coverage',
  '.turbo',
  'scripts', // Exclude this script itself
];

// File extensions to process
const INCLUDE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.txt',
  '.css',
  '.html',
];

// Patterns to replace (case-sensitive)
const REPLACEMENTS = [
  // Exact matches
  { from: /\$TA\b/g, to: '$tabledadrian' },
  // In strings with quotes
  { from: /"\$TA"/g, to: '"$tabledadrian"' },
  { from: /'\$TA'/g, to: "'$tabledadrian'" },
  { from: /`\$TA`/g, to: '`$tabledadrian`' },
  // With token suffix
  { from: /\$TA token/gi, to: '$tabledadrian token' },
  { from: /\$TA tokens/gi, to: '$tabledadrian tokens' },
  // In comments
  { from: /\/\/ \$TA/g, to: '// $tabledadrian' },
  { from: /\/\* \$TA/g, to: '/* $tabledadrian' },
  // In markdown
  { from: /\*\*\$TA\*\*/g, to: '**$tabledadrian**' },
  { from: /# \$TA/g, to: '# $tabledadrian' },
];

let totalFiles = 0;
let totalReplacements = 0;
const changedFiles = [];

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  if (!INCLUDE_EXTENSIONS.includes(ext)) {
    return false;
  }

  // Check if in excluded directory
  const parts = filePath.split(path.sep);
  for (const part of parts) {
    if (EXCLUDE_DIRS.includes(part)) {
      return false;
    }
  }

  return true;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let fileReplacements = 0;

    // Apply all replacements
    for (const { from, to } of REPLACEMENTS) {
      const matches = newContent.match(from);
      if (matches) {
        fileReplacements += matches.length;
        newContent = newContent.replace(from, to);
      }
    }

    if (fileReplacements > 0) {
      totalReplacements += fileReplacements;
      changedFiles.push({
        path: filePath,
        replacements: fileReplacements,
      });

      if (!DRY_RUN) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✓ ${filePath} (${fileReplacements} replacements)`);
      } else {
        console.log(`[DRY RUN] ${filePath} (${fileReplacements} replacements)`);
      }
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip excluded directories
      if (!EXCLUDE_DIRS.includes(file)) {
        walkDir(filePath, callback);
      }
    } else if (stat.isFile()) {
      if (shouldProcessFile(filePath)) {
        callback(filePath);
        totalFiles++;
      }
    }
  }
}

// Main execution
const projectRoot = path.join(__dirname, '..');

console.log('🔍 Searching for $TA references...\n');

if (DRY_RUN) {
  console.log('⚠️  DRY RUN MODE - No files will be modified\n');
}

walkDir(projectRoot, processFile);

console.log('\n' + '='.repeat(60));
console.log('📊 Summary:');
console.log(`   Files scanned: ${totalFiles}`);
console.log(`   Files changed: ${changedFiles.length}`);
console.log(`   Total replacements: ${totalReplacements}`);

if (DRY_RUN) {
  console.log('\n⚠️  This was a dry run. Run without --dry-run to apply changes.');
} else if (changedFiles.length > 0) {
  console.log('\n✅ Replacement complete!');
  console.log('\nChanged files:');
  changedFiles.forEach(({ path, replacements }) => {
    console.log(`   ${path} (${replacements} replacements)`);
  });
} else {
  console.log('\n✅ No $TA references found to replace.');
}

