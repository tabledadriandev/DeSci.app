const fs = require('fs');
const path = require('path');

function fixDuplicateContent(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalLength = content.length;
  
  // Pattern: Find incomplete return statements followed by duplicate imports
  // Look for: "return NextResponse.json(\nimport"
  const pattern = /return NextResponse\.json\(\s*import/g;
  
  if (pattern.test(content)) {
    // Find the first incomplete return statement
    const incompleteReturnMatch = content.match(/return NextResponse\.json\(\s*import/);
    if (incompleteReturnMatch) {
      const index = incompleteReturnMatch.index;
      
      // Find where the original function should end (before the duplicate)
      // Look backwards from the incomplete return to find the catch block start
      const beforeIncomplete = content.substring(0, index);
      const lastCatchIndex = beforeIncomplete.lastIndexOf('} catch (error) {');
      
      if (lastCatchIndex !== -1) {
        // Find the end of the catch block (should be before the incomplete return)
        const catchBlock = beforeIncomplete.substring(lastCatchIndex);
        const catchBlockEnd = catchBlock.indexOf('}');
        
        if (catchBlockEnd !== -1) {
          // Find where duplicate content starts (the import after incomplete return)
          const duplicateStart = content.indexOf('import', index);
          
          if (duplicateStart !== -1) {
            // Find where the duplicate function ends (look for the last closing brace before next import or end of file)
            let duplicateEnd = content.length;
            const afterDuplicate = content.substring(duplicateStart);
            const nextImport = afterDuplicate.indexOf('\nimport', 100); // Skip first import
            if (nextImport !== -1) {
              // No more duplicates, end is before next import
              duplicateEnd = duplicateStart + nextImport;
            }
            
            // Fix the incomplete return statement
            const beforeReturn = content.substring(0, index);
            const errorMessage = "const errorMessage = error instanceof Error ? error.message : 'Request failed';";
            const fixedReturn = `    const errorMessage = error instanceof Error ? error.message : 'Request failed';\n    return NextResponse.json(\n      { error: errorMessage },\n      { status: 500 }\n    );\n  }\n}`;
            
            // Remove duplicate content
            content = beforeReturn + fixedReturn;
          }
        }
      }
    }
  }
  
  // Also fix: incomplete return statements that are just "return NextResponse.json("
  // followed by import on next line
  content = content.replace(/return NextResponse\.json\(\s*\n\s*import/g, (match, offset) => {
    // Find the catch block before this
    const before = content.substring(0, offset);
    const lastCatch = before.lastIndexOf('} catch (error) {');
    if (lastCatch !== -1) {
      return `    const errorMessage = error instanceof Error ? error.message : 'Request failed';\n    return NextResponse.json(\n      { error: errorMessage },\n      { status: 500 }\n    );\n  }\n}\nimport`;
    }
    return match;
  });
  
  if (content.length !== originalLength) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Find all route.ts files
const apiDir = path.join(__dirname, '..', 'api');
const routeFiles = [];

function findRouteFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findRouteFiles(filePath);
    } else if (file === 'route.ts') {
      routeFiles.push(filePath);
    }
  }
}

findRouteFiles(apiDir);

let fixedCount = 0;
for (const file of routeFiles) {
  if (fixDuplicateContent(file)) {
    fixedCount++;
    console.log(`Fixed: ${file}`);
  }
}

console.log(`\nFixed ${fixedCount} files with duplicate content.`);



















