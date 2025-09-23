import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://intelli-verse-x.ai';
  
  // Define all routes that should be included in the sitemap
  const routes = [
    // Core pages
    '',
    '/about',
    '/shop',
    '/arena',
    '/ai-studio',
    '/tokens',
    '/blogs',
    
    // Company & Press
    '/careers',
    '/press',
    '/investors',
    
    // AI & Research
    '/ai/ethics',
    '/ai/models',
    '/ai/bias-mitigation',
    '/ai/training-data',
    '/ai/safety',
    
    // Support & Contact
    '/support',
    '/contact',
    
    // Legal, Privacy & Security
    '/privacy',
    '/terms',
    '/security',
    
    // Privacy Controls & Cookies
    '/privacy/dashboard',
    '/data/export',
    '/data/delete',
    '/cookies/preferences',
    '/privacy/choices',
    
    // Fairness & Transparency
    '/fairness/rng-audit',
    '/fairness/game-logs',
    '/fairness/verification',
    '/fairness/responsible-gaming',
    '/fairness/transparency',
    
    // Utility pages
    '/sitemap',
    '/accessibility',
    
    // Existing pages
    '/developers',
    '/notifications',
    '/profile',
    '/cart',
    '/checkout',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 
                    route.startsWith('/ai/') || route.startsWith('/fairness/') ? 'weekly' :
                    route.startsWith('/privacy/') || route.startsWith('/data/') ? 'monthly' :
                    'weekly',
    priority: route === '' ? 1 : 
             route === '/shop' || route === '/arena' || route === '/ai-studio' ? 0.9 :
             route === '/about' || route === '/careers' || route === '/contact' ? 0.8 :
             route.startsWith('/ai/') || route.startsWith('/fairness/') ? 0.7 :
             0.6,
  }));
}