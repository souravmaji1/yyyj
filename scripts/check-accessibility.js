#!/usr/bin/env node

/**
 * Accessibility Validation Script
 * 
 * This script performs automated accessibility checks on the build output
 * to ensure WCAG 2.1 AA compliance before deployment.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkEslintA11yRules() {
  log('\n🔍 Running ESLint accessibility checks...', colors.blue);
  
  return new Promise((resolve, reject) => {
    exec('npx eslint src/ --ext .tsx,.ts --quiet', { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error && error.code !== 1) {
        log(`❌ ESLint execution failed: ${error.message}`, colors.red);
        reject(error);
        return;
      }
      
      const a11yViolations = stdout.split('\n').filter(line => 
        line.includes('jsx-a11y/')
      );
      
      if (a11yViolations.length > 0) {
        log(`⚠️  Found ${a11yViolations.length} accessibility violations:`, colors.yellow);
        // Only show first 10 violations to avoid overwhelming output
        a11yViolations.slice(0, 10).forEach(violation => {
          log(`   ${violation}`, colors.yellow);
        });
        if (a11yViolations.length > 10) {
          log(`   ... and ${a11yViolations.length - 10} more violations`, colors.yellow);
        }
        return resolve({ violations: a11yViolations.length, details: a11yViolations });
      }
      
      log('✅ No accessibility violations found in ESLint check', colors.green);
      resolve({ violations: 0, details: [] });
    });
  });
}

function checkColorContrast() {
  log('\n🎨 Checking for hardcoded colors that may violate contrast requirements...', colors.blue);
  
  const violationPatterns = [
    /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})/g, // Hex colors
    /rgb\s*\([^)]*\)/g, // RGB colors
    /rgba\s*\([^)]*\)/g, // RGBA colors
  ];
  
  const srcPath = path.join(process.cwd(), 'src');
  const violations = [];
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(process.cwd(), filePath);
        
        violationPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            matches.forEach(match => {
              // Skip if it's using CSS variables or design tokens
              if (!match.includes('var(--') && !match.includes('hsl(var(')) {
                violations.push({
                  file: relativePath,
                  color: match,
                  line: content.substring(0, content.indexOf(match)).split('\n').length
                });
              }
            });
          }
        });
      }
    });
  }
  
  try {
    scanDirectory(srcPath);
    
    if (violations.length > 0) {
      log(`⚠️  Found ${violations.length} potential color contrast violations:`, colors.yellow);
      violations.forEach(violation => {
        log(`   ${violation.file}:${violation.line} - ${violation.color}`, colors.yellow);
      });
      return { violations: violations.length, details: violations };
    }
    
    log('✅ No hardcoded color violations found', colors.green);
    return { violations: 0, details: [] };
  } catch (error) {
    log(`❌ Error scanning for color violations: ${error.message}`, colors.red);
    return { violations: 0, details: [], error: error.message };
  }
}

function checkHeadingHierarchy() {
  log('\n📝 Checking heading hierarchy in components...', colors.blue);
  
  const srcPath = path.join(process.cwd(), 'src');
  const violations = [];
  
  function scanForHeadings(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanForHeadings(filePath);
      } else if (file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(process.cwd(), filePath);
        
        // Check for heading elements
        const headingPattern = /<h([1-6])[^>]*>/g;
        const matches = [...content.matchAll(headingPattern)];
        
        if (matches.length > 0) {
          const headingLevels = matches.map(match => parseInt(match[1]));
          
          // Check for skipped heading levels
          for (let i = 1; i < headingLevels.length; i++) {
            const current = headingLevels[i];
            const previous = headingLevels[i - 1];
            
            if (current > previous + 1) {
              violations.push({
                file: relativePath,
                issue: `Heading level ${current} follows h${previous} (skipped h${previous + 1})`,
                line: content.substring(0, content.indexOf(matches[i][0])).split('\n').length
              });
            }
          }
        }
      }
    });
  }
  
  try {
    scanForHeadings(srcPath);
    
    if (violations.length > 0) {
      log(`⚠️  Found ${violations.length} heading hierarchy violations:`, colors.yellow);
      violations.forEach(violation => {
        log(`   ${violation.file}:${violation.line} - ${violation.issue}`, colors.yellow);
      });
      return { violations: violations.length, details: violations };
    }
    
    log('✅ No heading hierarchy violations found', colors.green);
    return { violations: 0, details: [] };
  } catch (error) {
    log(`❌ Error checking heading hierarchy: ${error.message}`, colors.red);
    return { violations: 0, details: [], error: error.message };
  }
}

async function main() {
  log(`${colors.bold}🔍 Accessibility Validation Report${colors.reset}`, colors.blue);
  log('==========================================');
  
  try {
    const eslintResults = await checkEslintA11yRules();
    const colorResults = checkColorContrast();
    const headingResults = checkHeadingHierarchy();
    
    const totalViolations = eslintResults.violations + colorResults.violations + headingResults.violations;
    
    log('\n📊 Summary:', colors.blue);
    log(`   ESLint a11y violations: ${eslintResults.violations}`, eslintResults.violations > 0 ? colors.red : colors.green);
    log(`   Color contrast issues: ${colorResults.violations}`, colorResults.violations > 0 ? colors.yellow : colors.green);
    log(`   Heading hierarchy issues: ${headingResults.violations}`, headingResults.violations > 0 ? colors.yellow : colors.green);
    log(`   Total issues: ${totalViolations}`, totalViolations > 0 ? colors.red : colors.green);
    
    if (totalViolations > 0) {
      log('\n💡 Next steps:', colors.blue);
      log('   1. Fix ESLint accessibility violations (required)', colors.yellow);
      log('   2. Replace hardcoded colors with design tokens', colors.yellow);
      log('   3. Ensure proper heading hierarchy', colors.yellow);
      log('   4. Test with screen readers and keyboard navigation', colors.yellow);
      
      // Exit with error code if there are critical violations
      if (eslintResults.violations > 0) {
        process.exit(1);
      }
    } else {
      log('\n🎉 All accessibility checks passed!', colors.green);
    }
    
  } catch (error) {
    log(`❌ Accessibility check failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

main();