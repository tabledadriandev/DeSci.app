#!/usr/bin/env node

/**
 * Script to identify and fix common 'any' type patterns in TypeScript files
 * 
 * Common patterns fixed:
 * 1. catch (error) -> catch (error) with proper error handling
 * 2. prisma -> proper Prisma types
 * 3. any[] -> proper typed arrays
 * 4. Record<string, unknown> -> proper typed records
 * 5. Function parameters with any -> proper types
 * 6. Variables with any type -> proper types
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface FixResult {
  file: string;
  fixes: Array<{
    line: number;
    original: string;
    fixed: string;
    pattern: string;
  }>;
  errors: string[];
}

interface Pattern {
  name: string;
  regex: RegExp;
  fix: (match: RegExpMatchArray, line: string, lineNumber: number) => string | null;
  description: string;
}

const patterns: Pattern[] = [
  // Pattern 1: catch (error)
  {
    name: 'catch-error-any',
    regex: /catch\s*\(\s*(\w+)\s*:\s*any\s*\)/g,
    fix: (match, line) => {
      const varName = match[1];
      return line.replace(match[0], `catch (${varName})`);
    },
    description: 'Replace catch (error) with catch (error)',
  },
  
  // Pattern 2: prisma
  {
    name: 'prisma-as-any',
    regex: /\(prisma\s+as\s+any\)/g,
    fix: (match, line) => {
      return line.replace(match[0], 'prisma');
    },
    description: 'Replace prisma with prisma',
  },
  
  // Pattern 3: error: any in catch blocks (alternative format)
  {
    name: 'catch-error-any-alt',
    regex: /}\s+catch\s*\(\s*(\w+)\s*:\s*any\s*\)/g,
    fix: (match, line) => {
      const varName = match[1];
      return line.replace(match[0], `} catch (${varName})`);
    },
    description: 'Replace catch (error) with catch (error)',
  },
  
  // Pattern 4: : unknown[] arrays
  {
    name: 'any-array',
    regex: /:\s*any\[\]/g,
    fix: (match, line) => {
      // Try to infer type from context - if it's a Prisma result, use unknown[]
      if (line.includes('prisma.') || line.includes('findMany') || line.includes('findFirst')) {
        return line.replace(match[0], ': unknown[]');
      }
      return line.replace(match[0], ': unknown[]');
    },
    description: 'Replace : unknown[] with : unknown[]',
  },
  
  // Pattern 5: Record<string, unknown>
  {
    name: 'record-string-any',
    regex: /Record<string,\s*any>/g,
    fix: (match, line) => {
      return line.replace(match[0], 'Record<string, unknown>');
    },
    description: 'Replace Record<string, unknown> with Record<string, unknown>',
  },
  
  // Pattern 6: Variable declarations with : any
  {
    name: 'variable-any',
    regex: /(const|let|var)\s+(\w+)\s*:\s*any(\s*[=;])/g,
    fix: (match, line) => {
      const varType = match[1];
      const varName = match[2];
      const suffix = match[3];
      // Don't fix if it's in a catch block (already handled)
      if (line.includes('catch')) {
        return null;
      }
      return line.replace(match[0], `${varType} ${varName}: unknown${suffix}`);
    },
    description: 'Replace variable: any with variable: unknown',
  },
  
  // Pattern 7: Function parameters with : any
  {
    name: 'param-any',
    regex: /\((\w+)\s*:\s*any\)/g,
    fix: (match, line) => {
      const paramName = match[1];
      // Don't fix if it's in a catch block (already handled)
      if (line.includes('catch')) {
        return null;
      }
      return line.replace(match[0], `(${paramName}: unknown)`);
    },
    description: 'Replace function parameter: any with parameter: unknown',
  },
  
  // Pattern 8: as unknown type assertions
  {
    name: 'as-any-assertion',
    regex: /\s+as\s+any\b/g,
    fix: (match, line) => {
      // Don't fix prisma - already handled
      if (line.includes('prisma')) {
        return null;
      }
      // Check if it's a metadata or JSON field - these might need special handling
      if (line.includes('metadata') || line.includes('Json')) {
        return line.replace(match[0], ' as unknown');
      }
      return line.replace(match[0], ' as unknown');
    },
    description: 'Replace as unknown with as unknown',
  },
];

function findAnyTypes(filePath: string): FixResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const fixes: FixResult['fixes'] = [];
  const errors: string[] = [];
  
  const newLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let modifiedLine = line;
    let lineFixed = false;
    
    for (const pattern of patterns) {
      const matches = Array.from(line.matchAll(pattern.regex));
      
      for (const match of matches) {
        try {
          const fixed = pattern.fix(match, modifiedLine, i + 1);
          
          if (fixed && fixed !== modifiedLine) {
            fixes.push({
              line: i + 1,
              original: line.trim(),
              fixed: fixed.trim(),
              pattern: pattern.name,
            });
            modifiedLine = fixed;
            lineFixed = true;
          }
        } catch (error) {
          errors.push(`Error fixing line ${i + 1} in ${filePath}: ${error}`);
        }
      }
    }
    
    newLines.push(modifiedLine);
  }
  
  return {
    file: filePath,
    fixes,
    errors,
  };
}

function updateErrorHandling(filePath: string, result: FixResult): FixResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const newLines: string[] = [];
  
  // Look for catch blocks that need error handling updates
  let inCatchBlock = false;
  let catchVarName = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect catch block start
    const catchMatch = line.match(/catch\s*\(\s*(\w+)\s*\)/);
    if (catchMatch) {
      inCatchBlock = true;
      catchVarName = catchMatch[1];
      newLines.push(line);
      continue;
    }
    
    // Detect catch block end
    if (inCatchBlock && line.trim().startsWith('}')) {
      inCatchBlock = false;
      newLines.push(line);
      continue;
    }
    
    // Inside catch block - look for error.message usage
    if (inCatchBlock && line.includes(`${catchVarName}.message`)) {
      // Check if we need to add proper error handling
      const errorMessageMatch = line.match(new RegExp(`${catchVarName}\\.message`));
      if (errorMessageMatch) {
        // Check if there's already instanceof Error check
        const hasInstanceof = lines.slice(Math.max(0, i - 5), i).some(l => 
          l.includes('instanceof Error')
        );
        
        if (!hasInstanceof) {
          // Find the line with error.message and update it
          const updatedLine = line.replace(
            new RegExp(`${catchVarName}\\.message\\s*\\|\\|\\s*['"]([^'"]+)['"]`),
            (match, defaultMsg) => {
              return `const errorMessage = ${catchVarName} instanceof Error ? ${catchVarName}.message : '${defaultMsg}';`;
            }
          );
          
          if (updatedLine !== line) {
            // Replace the error.message line
            const nextLine = lines[i + 1];
            if (nextLine && nextLine.includes('error:')) {
              // Update the next line to use errorMessage
              const nextLineUpdated = nextLine.replace(
                new RegExp(`error:\\s*${catchVarName}\\.message`),
                'error: errorMessage'
              );
              newLines.push(updatedLine);
              newLines.push(nextLineUpdated);
              i++; // Skip the next line as we've already processed it
              continue;
            }
          }
        }
      }
    }
    
    newLines.push(line);
  }
  
  return result;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const targetDir = args.find(arg => !arg.startsWith('-')) || 'api';
  const fixPatterns = !args.includes('--analyze-only');
  
  console.log('🔍 Scanning for "any" types...\n');
  console.log(`Target directory: ${targetDir}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'FIX MODE'}`);
  console.log(`Pattern fixing: ${fixPatterns ? 'ENABLED' : 'DISABLED'}\n`);
  
  // Find all TypeScript files
  const files = await glob(`**/*.ts`, {
    cwd: path.join(process.cwd(), targetDir),
    ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
  });
  
  console.log(`Found ${files.length} TypeScript files\n`);
  
  const results: FixResult[] = [];
  let totalFixes = 0;
  let totalErrors = 0;
  
  for (const file of files) {
    const filePath = path.join(process.cwd(), targetDir, file);
    
    try {
      const result = findAnyTypes(filePath);
      
      if (result.fixes.length > 0 || result.errors.length > 0) {
        results.push(result);
        totalFixes += result.fixes.length;
        totalErrors += result.errors.length;
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
  
  // Print results
  console.log('📊 Results:\n');
  console.log(`Total files with "any" types: ${results.length}`);
  console.log(`Total fixes available: ${totalFixes}`);
  console.log(`Total errors: ${totalErrors}\n`);
  
  if (results.length === 0) {
    console.log('✅ No "any" types found!');
    return;
  }
  
  // Group fixes by pattern
  const fixesByPattern: Record<string, number> = {};
  for (const result of results) {
    for (const fix of result.fixes) {
      fixesByPattern[fix.pattern] = (fixesByPattern[fix.pattern] || 0) + 1;
    }
  }
  
  console.log('📈 Fixes by pattern:');
  for (const [pattern, count] of Object.entries(fixesByPattern)) {
    const patternInfo = patterns.find(p => p.name === pattern);
    console.log(`  ${pattern}: ${count} (${patternInfo?.description || 'unknown'})`);
  }
  console.log('');
  
  // Show detailed results for first 10 files
  console.log('📝 Sample fixes (first 10 files):\n');
  for (const result of results.slice(0, 10)) {
    console.log(`\n${result.file}:`);
    for (const fix of result.fixes.slice(0, 3)) {
      console.log(`  Line ${fix.line}:`);
      console.log(`    ❌ ${fix.original}`);
      console.log(`    ✅ ${fix.fixed}`);
    }
    if (result.fixes.length > 3) {
      console.log(`  ... and ${result.fixes.length - 3} more fixes`);
    }
  }
  
  if (results.length > 10) {
    console.log(`\n... and ${results.length - 10} more files with fixes`);
  }
  
  // Apply fixes if not dry run
  if (!dryRun && fixPatterns && totalFixes > 0) {
    console.log('\n🔧 Applying fixes...\n');
    
    for (const result of results) {
      if (result.fixes.length === 0) continue;
      
      const filePath = path.join(process.cwd(), targetDir, result.file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      // Apply fixes in reverse order to maintain line numbers
      const fixesByLine = new Map<number, string>();
      for (const fix of result.fixes) {
        fixesByLine.set(fix.line - 1, fix.fixed);
      }
      
      const newLines = lines.map((line, index) => {
        const fixed = fixesByLine.get(index);
        if (fixed) {
          // Preserve indentation
          const indent = line.match(/^(\s*)/)?.[1] || '';
          const fixedContent = fixed.trim();
          return indent + fixedContent;
        }
        return line;
      });
      
      // Update error handling for catch blocks
      let updatedContent = newLines.join('\n');
      
      // Fix error.message patterns
      updatedContent = updatedContent.replace(
        /catch\s*\(\s*(\w+)\s*\)\s*{[\s\S]*?return\s+NextResponse\.json\([\s\S]*?error:\s*\1\.message\s*\|\|\s*['"]([^'"]+)['"]/g,
        (match, varName, defaultMsg) => {
          return match.replace(
            new RegExp(`error:\\s*${varName}\\.message\\s*\\|\\|\\s*['"]${defaultMsg}['"]`),
            `const errorMessage = ${varName} instanceof Error ? ${varName}.message : '${defaultMsg}';\n    return NextResponse.json(\n      { error: errorMessage }`
          );
        }
      );
      
      fs.writeFileSync(filePath, updatedContent, 'utf-8');
      console.log(`✅ Fixed ${result.fixes.length} issues in ${result.file}`);
    }
    
    console.log(`\n✅ Applied ${totalFixes} fixes across ${results.length} files`);
  } else if (dryRun) {
    console.log('\n💡 Run without --dry-run to apply fixes');
  }
}

// Run the script
main().catch(console.error);


