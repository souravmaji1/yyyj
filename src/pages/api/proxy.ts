import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const target = String(req.query.target || '');
  
  if (!/^https?:\/\//.test(target)) {
    return res.status(400).json({ error: 'Invalid target URL' });
  }

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: {
        ...Object.fromEntries(
          Object.entries(req.headers).filter(([key]) => 
            !['host', 'connection', 'upgrade'].includes(key.toLowerCase())
          )
        ),
        'accept': 'application/json, application/yaml, text/yaml, text/plain',
        'user-agent': 'IntelliVerse-X-Swagger-Proxy/1.0',
      } as HeadersInit,
      body: ['GET', 'HEAD'].includes(req.method || '') ? undefined : req.body,
    });

    const buf = Buffer.from(await upstream.arrayBuffer());
    
    // Detect content type and validate for swagger specs
    const contentType = upstream.headers.get('content-type') || 'application/json';
    const isSwaggerEndpoint = target.includes('/api-docs') || target.includes('/swagger') || target.includes('/openapi');
    
    // For swagger endpoints, try to validate the content
    if (isSwaggerEndpoint) {
      try {
        const text = buf.toString('utf8');
        
        // Try to parse as JSON first
        let spec = null;
        try {
          spec = JSON.parse(text);
        } catch {
          // If not JSON, it might be YAML - check for basic OpenAPI structure
          if (!text.includes('openapi:') && !text.includes('swagger:') && !text.includes('"openapi"') && !text.includes('"swagger"')) {
            throw new Error('Invalid OpenAPI specification: missing version field');
          }
        }
        
        // If we successfully parsed JSON, validate it has required fields
        if (spec && typeof spec === 'object') {
          if (!spec.openapi && !spec.swagger) {
            throw new Error('Invalid OpenAPI specification: missing version field (openapi or swagger)');
          }
          
          if (!spec.info) {
            throw new Error('Invalid OpenAPI specification: missing info field');
          }
          
          if (!spec.paths && !spec.components) {
            throw new Error('Invalid OpenAPI specification: missing paths or components field');
          }
        }
      } catch (validationError) {
        console.error('Swagger validation error for', target, ':', validationError);
        // Return a user-friendly error response
        const errorSpec = {
          openapi: "3.0.0",
          info: {
            title: "API Documentation Error",
            version: "1.0.0",
            description: `Failed to load API specification from ${target}.\n\nError: ${validationError instanceof Error ? validationError.message : 'Unknown error'}\n\nPlease check the API server configuration.`
          },
          paths: {
            "/error": {
              get: {
                summary: "API Documentation Error",
                description: "This endpoint represents an error in loading the API specification",
                responses: {
                  "500": {
                    description: "API specification could not be loaded"
                  }
                }
              }
            }
          }
        };
        
        res.status(200);
        res.setHeader('content-type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return res.json(errorSpec);
      }
    }
    
    res.status(upstream.status);
    upstream.headers.forEach((v, k) => {
      // Skip certain headers that might cause issues
      if (!['content-encoding', 'transfer-encoding', 'connection', 'upgrade'].includes(k.toLowerCase())) {
        res.setHeader(k, v);
      }
    });
    
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    res.send(buf);
  } catch (error) {
    console.error('Proxy error for', target, ':', error);
    
    // For swagger endpoints, return a helpful error spec instead of just JSON error
    const isSwaggerEndpoint = target.includes('/api-docs') || target.includes('/swagger') || target.includes('/openapi');
    if (isSwaggerEndpoint) {
      const errorSpec = {
        openapi: "3.0.0",
        info: {
          title: "Connection Error",
          version: "1.0.0",
          description: `Could not connect to API server at ${target}.\n\nThis might be due to:\n- Server temporarily unavailable\n- Network connectivity issues\n- CORS restrictions\n- Invalid URL\n\nPlease check the server status and try again.`
        },
        paths: {
          "/connection-error": {
            get: {
              summary: "Connection Error",
              description: "This endpoint represents a connection error to the API server",
              responses: {
                "503": {
                  description: "API server unavailable"
                }
              }
            }
          }
        }
      };
      
      res.status(200);
      res.setHeader('content-type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.json(errorSpec);
    }
    
    res.status(500).json({ error: 'Proxy request failed', details: error instanceof Error ? error.message : 'Unknown error' });
  }
}