#!/usr/bin/env node

/**
 * Script to check for forbidden white backgrounds on interactive elements
 * This helps ensure no white backgrounds are used on buttons, links, or other interactive elements
 */

const { readFileSync, readdirSync, existsSync } = require('fs');
const { join } = require('path');

// File extensions to check
const targetExtensions = ['.css', '.scss', '.sass', '.less', '.tsx', '.jsx', '.ts', '.js', '.liquid', '.html'];
const isTargetFile = (path) => targetExtensions.some(ext => path.endsWith(ext));

// Patterns to check for forbidden white backgrounds
const forbiddenPatterns = [
  // CSS background properties with white values
  /background(-color)?\s*:\s*(#fff(fff)?|white|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))/i,
  // Tailwind classes with white backgrounds on interactive elements
  /(btn|button|link).*bg-white/i,
  // Styled components with white backgrounds
  /background.*['"`](#fff|white|rgb\(255,\s*255,\s*255\))['"`]/i
];

// Walk directory recursively
function walkDirectory(dir) {
  if (!existsSync(dir)) return [];
  
  return readdirSync(dir, { withFileTypes: true }).flatMap(dirent => {
    if (dirent.name === 'node_modules' || dirent.name === '.git' || dirent.name === '.next') {
      return [];
    }
    
    const fullPath = join(dir, dirent.name);
    
    if (dirent.isDirectory()) {
      return walkDirectory(fullPath);
    } else if (isTargetFile(dirent.name)) {
      return [fullPath];
    }
    
    return [];
  });
}

// Check file for violations
function checkFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const violations = [];
    
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      forbiddenPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          // Additional context check - ignore if it's clearly not an interactive element
          const lineContent = line.toLowerCase();
          
          // Skip if it's clearly a non-interactive element comment or safe context
          if (lineContent.includes('scrollbar') || 
              lineContent.includes('track') || 
              lineContent.includes('page background') ||
              lineContent.includes('card background') ||
              lineContent.includes('modal background')) {
            return;
          }
          
          violations.push({
            file: filePath,
            line: index + 1,
            content: line.trim(),
            pattern: pattern.toString()
          });
        }
      });
    });
    
    return violations;
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
    return [];
  }
}

// Main execution
function main() {
  const sourceDir = join(process.cwd(), 'src');
  
  if (!existsSync(sourceDir)) {
    console.error('Error: src directory not found');
    process.exit(1);
  }
  
  const files = walkDirectory(sourceDir);
  console.log(`Checking ${files.length} files for forbidden white backgrounds...`);
  
  let allViolations = [];
  
  files.forEach(file => {
    const violations = checkFile(file);
    allViolations = allViolations.concat(violations);
  });
  
  if (allViolations.length > 0) {
    console.error('\n❌ FORBIDDEN WHITE BACKGROUNDS FOUND:');
    console.error('=====================================');
    
    allViolations.forEach(violation => {
      console.error(`File: ${violation.file}`);
      console.error(`Line ${violation.line}: ${violation.content}`);
      console.error('---');
    });
    
    console.error(`\nTotal violations: ${allViolations.length}`);
    console.error('\nPlease replace white backgrounds on interactive elements with brand tokens.');
    console.error('Use --brand-primary-50, --brand-neutral-25, or other non-white alternatives.');
    
    process.exit(1);
  } else {
    console.log('✅ No forbidden white backgrounds found on interactive elements!');
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { checkFile, walkDirectory };