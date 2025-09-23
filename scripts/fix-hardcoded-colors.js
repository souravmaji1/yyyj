#!/usr/bin/env node

/**
 * Color Token Migration Script
 * 
 * This script replaces hardcoded colors with design tokens
 * to improve accessibility and brand consistency.
 */

const fs = require('fs');
const path = require('path');

// Color mappings from hardcoded values to design tokens
const colorMappings = {
  // Primary brand color
  '#02A7FD': 'var(--color-primary)',
  '#02a7fd': 'var(--color-primary)',
  
  // Secondary brand color  
  '#2E2D7B': 'var(--color-secondary)',
  '#2e2d7b': 'var(--color-secondary)',
  
  // Common grays that should use neutral tokens
  '#1D2939': 'var(--color-surface)',
  '#1d2939': 'var(--color-surface)',
  '#111827': 'var(--color-panel)',
  '#010E38': 'var(--color-bg)',
  '#010e38': 'var(--color-bg)',
  
  // Other specific colors that need tokens
  '#0072AF': 'var(--color-primary-700)',
  '#0072af': 'var(--color-primary-700)',
};

// CSS class mappings for Tailwind
const tailwindMappings = {
  'text-[#02A7FD]': 'text-[var(--color-primary)]',
  'text-[#02a7fd]': 'text-[var(--color-primary)]',
  'text-[#2E2D7B]': 'text-[var(--color-secondary)]',
  'text-[#2e2d7b]': 'text-[var(--color-secondary)]',
  
  'bg-[#02A7FD]': 'bg-[var(--color-primary)]',
  'bg-[#02a7fd]': 'bg-[var(--color-primary)]',
  'bg-[#2E2D7B]': 'bg-[var(--color-secondary)]',
  'bg-[#2e2d7b]': 'bg-[var(--color-secondary)]',
  
  'border-[#02A7FD]': 'border-[var(--color-primary)]',
  'border-[#02a7fd]': 'border-[var(--color-primary)]',
  'border-[#2E2D7B]': 'border-[var(--color-secondary)]',
  'border-[#2e2d7b]': 'border-[var(--color-secondary)]',
  
  'hover:bg-[#02A7FD]': 'hover:bg-[var(--color-primary)]',
  'hover:bg-[#0072AF]': 'hover:bg-[var(--color-primary-700)]',
  'hover:text-[#02A7FD]': 'hover:text-[var(--color-primary)]',
  
  // Surface colors
  'bg-[#1D2939]': 'bg-[var(--color-surface)]',
  'bg-[#1d2939]': 'bg-[var(--color-surface)]',
  'bg-[#111827]': 'bg-[var(--color-panel)]',
  'bg-[#010E38]': 'bg-[var(--color-bg)]',
  'bg-[#010e38]': 'bg-[var(--color-bg)]',
  
  // Focus and ring colors
  'ring-[#02A7FD]': 'ring-[var(--color-primary)]',
  'focus:ring-[#02A7FD]': 'focus:ring-[var(--color-primary)]',
};

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { changed: false, message: 'File not found' };
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let changeCount = 0;
  
  // Apply tailwind mappings
  for (const [oldClass, newClass] of Object.entries(tailwindMappings)) {
    const regex = new RegExp(oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, newClass);
      changeCount += matches.length;
    }
  }
  
  // Apply general color mappings (for CSS and other contexts)
  for (const [oldColor, newColor] of Object.entries(colorMappings)) {
    const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, newColor);
      changeCount += matches.length;
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return { 
      changed: true, 
      changeCount,
      message: `Updated ${changeCount} color references` 
    };
  }
  
  return { changed: false, changeCount: 0, message: 'No changes needed' };
}

function processDirectory(dirPath, extensions = ['.tsx', '.ts', '.css', '.jsx', '.js']) {
  const results = [];
  
  function scanDirectory(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .git, and other common directories
        if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(item)) {
          scanDirectory(itemPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        const relativePath = path.relative(process.cwd(), itemPath);
        const result = processFile(itemPath);
        
        if (result.changed) {
          results.push({
            file: relativePath,
            ...result
          });
        }
      }
    }
  }
  
  scanDirectory(dirPath);
  return results;
}

// Main execution
const targetPath = process.argv[2] || './src';

console.log('🎨 Color Token Migration Tool');
console.log('============================');
console.log(`Processing files in: ${targetPath}`);

try {
  const results = processDirectory(targetPath);
  
  if (results.length === 0) {
    console.log('✅ No files needed color updates');
  } else {
    console.log(`✅ Updated ${results.length} files:`);
    
    let totalChanges = 0;
    results.forEach(result => {
      console.log(`   ${result.file}: ${result.message}`);
      totalChanges += result.changeCount;
    });
    
    console.log(`\n📊 Total color references updated: ${totalChanges}`);
    console.log('\n💡 Remember to:');
    console.log('   1. Test the application visually');
    console.log('   2. Run accessibility checks');
    console.log('   3. Verify color contrast compliance');
  }
  
} catch (error) {
  console.error('❌ Error processing files:', error.message);
  process.exit(1);
}