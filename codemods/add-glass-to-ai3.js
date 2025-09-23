/**
 * JSCodeshift transform to add glass styling to ai3 components
 * Usage: jscodeshift -t codemods/add-glass-to-ai3.js src/components/ai3
 */

const skipPatterns = /(Wallpaper|Caustics|Portal|Menu|Popover|Tooltip)/i;

function addGlassToElement(j, element) {
  const classNameAttribute = element.openingElement.attributes.find(
    attr => attr.type === 'JSXAttribute' && attr.name && attr.name.name === 'className'
  );
  
  if (classNameAttribute) {
    // Merge existing className with glass
    if (classNameAttribute.value.type === 'Literal') {
      const currentClasses = classNameAttribute.value.value;
      if (!currentClasses.includes('glass')) {
        classNameAttribute.value.value = `glass ${currentClasses}`.trim();
      }
    } else if (classNameAttribute.value.type === 'JSXExpressionContainer') {
      // Handle template literals or expressions
      const expression = classNameAttribute.value.expression;
      if (expression.type === 'TemplateLiteral') {
        // Insert glass at the beginning of template literal
        if (expression.quasis[0] && !expression.quasis[0].value.raw.includes('glass')) {
          expression.quasis[0].value.raw = `glass ${expression.quasis[0].value.raw}`.trim();
          expression.quasis[0].value.cooked = `glass ${expression.quasis[0].value.cooked}`.trim();
        }
      } else {
        // Wrap existing expression with template literal that includes glass
        classNameAttribute.value.expression = j.templateLiteral(
          [
            j.templateElement({ raw: 'glass ', cooked: 'glass ' }, false),
            j.templateElement({ raw: '', cooked: '' }, true)
          ],
          [expression]
        );
      }
    }
  } else {
    // Add new className="glass" attribute
    element.openingElement.attributes.push(
      j.jsxAttribute(
        j.jsxIdentifier('className'),
        j.literal('glass')
      )
    );
  }
}

function isRootContainerElement(element) {
  // Check if this is likely a root container (div, main, section, article, aside, etc.)
  const containerTags = ['div', 'main', 'section', 'article', 'aside', 'header', 'footer', 'nav'];
  return element.openingElement.name && 
         element.openingElement.name.type === 'JSXIdentifier' &&
         containerTags.includes(element.openingElement.name.name);
}

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  
  // Skip files that match skip patterns
  if (skipPatterns.test(file.path)) {
    return null;
  }
  
  // Find the default export function component
  let componentFunction = null;
  
  // Check for default export function declaration
  root.find(j.ExportDefaultDeclaration).forEach(path => {
    if (path.value.declaration.type === 'FunctionDeclaration') {
      componentFunction = path.value.declaration;
    } else if (path.value.declaration.type === 'Identifier') {
      // Find the referenced function
      const name = path.value.declaration.name;
      root.find(j.FunctionDeclaration, { id: { name } }).forEach(funcPath => {
        componentFunction = funcPath.value;
      });
    }
  });
  
  // Check for arrow function exports
  if (!componentFunction) {
    root.find(j.VariableDeclaration).forEach(path => {
      path.value.declarations.forEach(declarator => {
        if (declarator.init && 
            (declarator.init.type === 'ArrowFunctionExpression' || 
             declarator.init.type === 'FunctionExpression')) {
          // Check if this is exported as default
          const varName = declarator.id.name;
          const isDefault = root.find(j.ExportDefaultDeclaration)
            .filter(exportPath => 
              exportPath.value.declaration.type === 'Identifier' && 
              exportPath.value.declaration.name === varName
            ).length > 0;
          
          if (isDefault) {
            componentFunction = declarator.init;
          }
        }
      });
    });
  }
  
  if (!componentFunction) {
    return null;
  }
  
  let modified = false;
  
  // Find the return statement with JSX
  j(componentFunction).find(j.ReturnStatement).forEach(returnPath => {
    const returnValue = returnPath.value.argument;
    
    if (returnValue && returnValue.type === 'JSXElement') {
      const rootElement = returnValue;
      
      // Check if this is a container element that should get glass styling
      if (isRootContainerElement(rootElement)) {
        const hasGlass = rootElement.openingElement.attributes.some(attr => {
          if (attr.type === 'JSXAttribute' && attr.name && attr.name.name === 'className') {
            if (attr.value.type === 'Literal') {
              return attr.value.value.includes('glass');
            }
          }
          return false;
        });
        
        if (!hasGlass) {
          addGlassToElement(j, rootElement);
          modified = true;
        }
      }
    } else if (returnValue && returnValue.type === 'JSXFragment') {
      // Handle fragments - look for first container element
      const firstChild = returnValue.children.find(child => 
        child.type === 'JSXElement' && isRootContainerElement(child)
      );
      
      if (firstChild) {
        const hasGlass = firstChild.openingElement.attributes.some(attr => {
          if (attr.type === 'JSXAttribute' && attr.name && attr.name.name === 'className') {
            if (attr.value.type === 'Literal') {
              return attr.value.value.includes('glass');
            }
          }
          return false;
        });
        
        if (!hasGlass) {
          addGlassToElement(j, firstChild);
          modified = true;
        }
      }
    }
  });
  
  return modified ? root.toSource({ quote: 'single', trailingComma: true }) : null;
};