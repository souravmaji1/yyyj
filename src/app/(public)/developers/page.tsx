"use client";

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState, useCallback } from 'react';
import Image from 'next/image';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

type Service = { key: string; name: string; url: string; group: 'User' | 'Admin' | 'AI' | 'Games' | 'Products' | 'Payment' };

interface SwaggerState {
  loading: boolean;
  error: string | null;
  hasValidSpec: boolean;
}

const SERVICES: Service[] = [
  // User APIs
  { key: 'user-api', name: 'User Management', url: 'https://api.intelli-verse-x.ai/api/user/api-docs-json', group: 'User' },

  // Admin APIs  
  { key: 'admin-api', name: 'Admin Operations', url: 'https://api.intelli-verse-x.ai/api/admin/api-docs-json', group: 'Admin' },

  // AI APIs
  { key: 'ai-api', name: 'AI Services', url: 'https://ai.intelli-verse-x.ai/api/ai/api-docs-json', group: 'AI' },
  { key: 'ai-ms', name: 'AI (Microservices)', url: 'https://msapi.intelli-verse-x.io/api/ai/api-docs-json', group: 'AI' },

  // Games APIs
  { key: 'games-api', name: 'Games Platform', url: 'https://api.intelli-verse-x.ai/api/games/api-docs-json', group: 'Games' },
  { key: 'games-ms', name: 'Games (Microservices)', url: 'https://msapi.intelli-verse-x.io/api/games/api-docs-json', group: 'Games' },

  // Products APIs
  { key: 'products-api', name: 'Products & E-commerce', url: 'https://api.intelli-verse-x.ai/api/products/api-docs-json', group: 'Products' },
  { key: 'products-ms', name: 'Products (Microservices)', url: 'https://msapi.intelli-verse-x.io/api/products/api-docs-json', group: 'Products' },

  // Payment APIs
  { key: 'payment-api', name: 'Payment Processing', url: 'https://payment.intelli-verse-x.ai/api/payment/api-docs-json', group: 'Payment' },

  // Tournament APIs (Available)
  { key: 'tournament-api', name: 'Tournament System', url: 'https://api.intelli-verse-x.ai/api/tournaments/api-docs-json', group: 'Games' },

  // Prediction APIs (Available)
  { key: 'prediction-api', name: 'Prediction Markets', url: 'https://api.intelli-verse-x.ai/api/predictions/api-docs-json', group: 'Games' },
];

export default function Developers() {
  const [active, setActive] = useState<Service>(SERVICES[0] || { key: '', name: '', url: '', group: 'User' });
  const [filter, setFilter] = useState('');
  const [swaggerLoaded, setSwaggerLoaded] = useState(false);
  const [swaggerState, setSwaggerState] = useState<SwaggerState>({
    loading: false,
    error: null,
    hasValidSpec: false
  });

  // Validate OpenAPI/Swagger specification
  const validateSwaggerSpec = useCallback(async (url: string): Promise<boolean> => {
    try {
      setSwaggerState({ loading: true, error: null, hasValidSpec: false });
      
      // Use proxy for external URLs to avoid CORS issues
      const proxyUrl = `/api/proxy?target=${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      let spec;
      
      if (contentType?.includes('application/json')) {
        spec = await response.json();
      } else if (contentType?.includes('application/yaml') || contentType?.includes('text/yaml')) {
        const text = await response.text();
        // Basic YAML validation - check for common OpenAPI fields
        if (!text.includes('openapi') && !text.includes('swagger')) {
          throw new Error('Invalid OpenAPI specification: missing version field');
        }
        spec = text;
      } else {
        // Try JSON first, then text
        const text = await response.text();
        try {
          spec = JSON.parse(text);
        } catch {
          spec = text;
        }
      }
      
      // Validate that spec has required fields
      if (typeof spec === 'object' && spec !== null) {
        if (!spec.openapi && !spec.swagger) {
          throw new Error('Invalid OpenAPI specification: missing version field (openapi or swagger)');
        }
        
        if (!spec.info) {
          throw new Error('Invalid OpenAPI specification: missing required field (info)');
        }
        
        // Check if this is an error spec from our proxy
        if (spec.info?.title?.includes('Error') || spec.info?.title?.includes('Connection Error')) {
          throw new Error(spec.info.description || 'API specification could not be loaded');
        }
      }
      
      setSwaggerState({ loading: false, error: null, hasValidSpec: true });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load API specification';
      setSwaggerState({ loading: false, error: errorMessage, hasValidSpec: false });
      return false;
    }
  }, []);

  // Validate spec when active service changes
  useEffect(() => {
    if (active.url && swaggerLoaded) {
      validateSwaggerSpec(active.url);
    }
  }, [active.url, swaggerLoaded, validateSwaggerSpec]);

  const getGroupColor = (group: Service['group']) => {
    switch (group) {
      case 'User': return 'text-blue-400';
      case 'Admin': return 'text-purple-400';
      case 'AI': return 'text-green-400';
      case 'Games': return 'text-yellow-400';
      case 'Products': return 'text-orange-400';
      case 'Payment': return 'text-red-400';
      default: return 'text-cyan-400';
    }
  };

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return SERVICES;
    return SERVICES.filter(s => (s.name + s.group + s.url).toLowerCase().includes(q));
  }, [filter]);

  useEffect(() => {
    if (!filtered.includes(active) && filtered.length && filtered[0]) setActive(filtered[0]);
  }, [filtered, active]);

  // Load Swagger UI CSS
  useEffect(() => {
    if (typeof window !== 'undefined' && !swaggerLoaded) {
      setSwaggerLoaded(true);
    }
  }, [swaggerLoaded]);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-white">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-xl">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                API Documentation & Playground
              </h1>
              <p className="text-gray-400 text-lg mt-2">
                Interactive Swagger docs for AI, Games, Products & Payment services
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 rounded-xl p-6 border border-[var(--color-primary)]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[var(--color-primary)]/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">Quick Start Guide</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-3">🚀 Get Started in 3 Steps</h3>
                <ol className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="bg-[var(--color-primary)] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mt-0.5">1</span>
                    <span>Request API credentials from your admin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-[var(--color-primary)] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mt-0.5">2</span>
                    <span>Select a service and click <strong>Authorize</strong> in Swagger</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-[var(--color-primary)] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mt-0.5">3</span>
                    <span>Use <strong>Try it out</strong> to test endpoints instantly</span>
                  </li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-3">🔑 Sample Authentication</h3>
                <div className="bg-[var(--color-surface)]/50 rounded-lg p-4 border border-slate-700/30">
                  <pre className="text-xs text-gray-300 overflow-x-auto">
{`curl -X POST 'https://api.intelli-verse-x.ai/api/admin/oauth/token' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET"
  }'`}
                  </pre>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  🔒 Never expose credentials in frontend code. Use environment variables or manual token entry.
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="mb-8 grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">API Services</h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>All services online</span>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="relative">
              <input
                placeholder="Search services..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-[var(--color-surface)]/50 px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
              />
              <svg className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Service Navigation */}
          <nav className="w-80 shrink-0">
            <div className="bg-[var(--color-surface)]/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 bg-[var(--color-surface)]/80 border-b border-slate-700">
                <h3 className="font-semibold text-white">Available Services</h3>
                <p className="text-sm text-gray-400 mt-1">{filtered.length} services</p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <ul className="p-2 space-y-1">
                  {filtered.map(s => (
                    <li key={s.key}>
                      <button
                        onClick={() => setActive(s)}
                        className={`w-full text-left rounded-lg px-3 py-3 transition-all group ${
                          active.key === s.key
                            ? 'bg-[var(--color-primary)] text-white shadow-lg'
                            : 'hover:bg-[var(--color-surface)]/80 text-gray-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <div className={`text-xs font-medium ${getGroupColor(s.group)} ${
                              active.key === s.key ? 'text-white/80' : ''
                            }`}>
                              {s.group}
                            </div>
                            <div className="text-sm font-medium mt-1 truncate">{s.name}</div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
                            active.key === s.key ? 'bg-white/60' : 'bg-green-400'
                          }`}></div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-[var(--color-surface)]/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="text-sm font-semibold text-white">Authorization</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Click "Authorize" in any service tab to enable API testing
              </p>
              <div className="bg-[var(--color-bg)]/50 rounded-lg p-3 border border-slate-700/50">
                <p className="text-xs text-gray-500">
                  💡 <strong>Tip:</strong> CORS issues? Use our proxy endpoint for testing
                </p>
              </div>
            </div>
          </nav>

          {/* Swagger UI Container */}
          <section className="flex-1">
            <div className="bg-[var(--color-surface)]/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 bg-[var(--color-surface)]/80 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{active.name}</h2>
                    <p className="text-sm text-gray-400">{active.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Status:</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-green-400">Online</span>
                    </div>
                  </div>
                </div>
              </div>
              {!swaggerLoaded && (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <p className="text-white/60">Loading Swagger UI...</p>
                  </div>
                </div>
              )}
              
              {swaggerLoaded && swaggerState.loading && (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <p className="text-white/60">Loading API specification for {active.name}...</p>
                  </div>
                </div>
              )}
              
              {swaggerLoaded && swaggerState.error && (
                <div className="py-20 px-6">
                  <div className="text-center">
                    <div className="rounded-full bg-red-500/20 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">API Documentation Error</h3>
                    <p className="text-red-400 mb-4">{swaggerState.error}</p>
                    <div className="text-sm text-white/60 mb-6">
                      <p><strong>Service:</strong> {active.name}</p>
                      <p><strong>URL:</strong> {active.url}</p>
                    </div>
                    <button
                      onClick={() => validateSwaggerSpec(active.url)}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                  <div className="mt-8 rounded-lg p-4 bg-black/20">
                    <h4 className="font-medium text-white mb-2">Common Issues & Solutions</h4>
                    <ul className="text-sm text-white/80 space-y-1">
                      <li>• <strong>CORS Error:</strong> The API server may not allow requests from this domain</li>
                      <li>• <strong>Invalid Specification:</strong> The OpenAPI/Swagger spec may be malformed</li>
                      <li>• <strong>Missing Version:</strong> Add "openapi: 3.x.x" or "swagger: 2.0" to the spec</li>
                      <li>• <strong>Server Down:</strong> The API server may be temporarily unavailable</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {swaggerLoaded && !swaggerState.loading && !swaggerState.error && (
                <SwaggerUI
                  url={`/api/proxy?target=${encodeURIComponent(active.url)}`}
                  docExpansion="list"
                  defaultModelsExpandDepth={-1}
                  showCommonExtensions
                  showExtensions
                  persistAuthorization
                  deepLinking
                  tryItOutEnabled
                  oauth2RedirectUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/oauth2-redirect.html`}
                  requestInterceptor={(req: any) => {
                    // Use proxy for all external requests to avoid CORS issues
                    if (req.url && !req.url.startsWith('/api/proxy') && 
                        (req.url.includes('intelli-verse-x.ai') || 
                         req.url.includes('intelli-verse-x.io') ||
                         req.url.startsWith('http'))) {
                      req.url = `/api/proxy?target=${encodeURIComponent(req.url)}`;
                    }
                    return req;
                  }}
                  onComplete={() => {
                    const css = `
                      .swagger-ui .topbar { display:none !important; }
                      .swagger-ui, .swagger-ui .wrapper, .opblock, .opblock-tag-section {
                        background: var(--color-surface, #121826) !important; 
                        color: var(--color-foreground, #e5e7eb) !important;
                      }
                      .btn, .opblock-summary-control, .tab, .authorize__btn {
                        border-radius: 0.75rem !important;
                      }
                      .btn.authorize.unlocked, .authorize__btn { 
                        background: var(--color-primary, #22d3ee) !important; 
                      }
                      code, pre { 
                        background: var(--color-bg, #0b0f1a) !important; 
                        color: var(--color-foreground, #e5e7eb) !important; 
                      }
                      .model-box, .model-box .brace-open, .model-box .brace-close { 
                        color: #cbd5e1 !important; 
                      }
                      .swagger-ui .scheme-container {
                        background: var(--color-surface, #121826) !important;
                        border: 1px solid rgba(255,255,255,0.1) !important;
                      }
                      .swagger-ui .opblock .opblock-summary {
                        border-color: rgba(255,255,255,0.1) !important;
                      }
                    `;
                    const style = document.createElement('style');
                    style.innerHTML = css;
                    document.head.appendChild(style);
                    
                    setSwaggerState(prev => ({ ...prev, hasValidSpec: true }));
                  }}
                  onFailure={(error: any) => {
                    console.error('SwaggerUI Failure:', error);
                    setSwaggerState({ 
                      loading: false, 
                      error: 'Failed to render API documentation. The specification may be invalid or inaccessible.', 
                      hasValidSpec: false 
                    });
                  }}
                />
              )}
            </div>
          </section>
        </div>

        {/* Deep docs sections */}
        {/* Game Developer Onboarding Section */}
        <section className="mt-10 rounded-2xl p-6" style={{ background: 'var(--color-surface, #121826)' }}>
          <h2 className="text-2xl font-bold text-white mb-6">🎮 Game Developer Onboarding</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-3">Getting Started</h3>
              <ol className="list-decimal pl-5 text-sm opacity-90 space-y-2">
                <li><strong>Sign Up:</strong> Create your Game Developer account via <code>/api/user/register</code></li>
                <li><strong>KYC Verification:</strong> Complete identity verification for token distribution</li>
                <li><strong>Wallet Setup:</strong> Connect your wallet for XUT token distribution and payments</li>
                <li><strong>Game Registration:</strong> Register your game via <code>/api/games/register</code></li>
                <li><strong>API Keys:</strong> Get your client credentials from admin dashboard</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Wallet Integration</h3>
              <ol className="list-decimal pl-5 text-sm opacity-90 space-y-2">
                <li><strong>Connect Wallet:</strong> MetaMask, WalletConnect, or Coinbase Wallet</li>
                <li><strong>Token Distribution:</strong> Receive XUT tokens for game development milestones</li>
                <li><strong>Revenue Sharing:</strong> Automated token distribution for in-game purchases</li>
                <li><strong>Transfer Tokens:</strong> Send/receive XUT tokens between developers and players</li>
              </ol>
            </div>
          </div>
        </section>

        {/* API Documentation Sections */}
        <section className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl p-5" style={{ background: 'var(--color-surface, #121826)' }}>
            <h3 className="text-lg font-semibold text-white">User Management & Auth</h3>
            <ol className="mt-3 list-decimal pl-5 text-sm opacity-90">
              <li>Register and authenticate users via User API</li>
              <li>Manage user profiles, preferences, and sessions</li>
              <li>Handle user roles, permissions, and access control</li>
              <li>Implement password reset and account recovery</li>
              <li>Social login integration (Google, Facebook, Apple)</li>
            </ol>
          </article>

          <article className="rounded-2xl p-5" style={{ background: 'var(--color-surface, #121826)' }}>
            <h3 className="text-lg font-semibold text-white">Admin Operations</h3>
            <ol className="mt-3 list-decimal pl-5 text-sm opacity-90">
              <li>Generate client credentials and API tokens</li>
              <li>Manage system-wide configurations and settings</li>
              <li>Monitor API usage, analytics, and performance</li>
              <li>Handle administrative user management and auditing</li>
              <li>Game developer approval and verification</li>
            </ol>
          </article>

          <article className="rounded-2xl p-5" style={{ background: 'var(--color-surface, #121826)' }}>
            <h3 className="text-lg font-semibold text-white">AI Integration</h3>
            <ol className="mt-3 list-decimal pl-5 text-sm opacity-90">
              <li>Create conversational AI with chat endpoints</li>
              <li>Generate content, images, and media with AI</li>
              <li>Implement content moderation and safety checks</li>
              <li>Cache AI outputs server-side for performance</li>
              <li>AI-powered game analytics and player insights</li>
            </ol>
          </article>

          <article className="rounded-2xl p-5" style={{ background: 'var(--color-surface, #121826)' }}>
            <h3 className="text-lg font-semibold text-white">Game Development APIs</h3>
            <ol className="mt-3 list-decimal pl-5 text-sm opacity-90">
              <li>Register games and manage game metadata</li>
              <li>Set up webhooks for game events (match start/end)</li>
              <li>Track player progress, achievements, and rewards</li>
              <li>Integrate leaderboards and tournament systems</li>
              <li>Real-time player statistics and analytics</li>
            </ol>
          </article>

          <article className="rounded-2xl p-5" style={{ background: 'var(--color-surface, #121826)' }}>
            <h3 className="text-lg font-semibold text-white">Products & E-commerce</h3>
            <ol className="mt-3 list-decimal pl-5 text-sm opacity-90">
              <li>Create products, SKUs, and manage inventory</li>
              <li>Handle product media, descriptions, and categories</li>
              <li>Link products to in-game unlocks and rewards</li>
              <li>Manage pricing, discounts, and promotional offers</li>
              <li>Digital and physical product association with games</li>
            </ol>
          </article>

          <article className="rounded-2xl p-5" style={{ background: 'var(--color-surface, #121826)' }}>
            <h3 className="text-lg font-semibold text-white">Payment & Token Transfer</h3>
            <ol className="mt-3 list-decimal pl-5 text-sm opacity-90">
              <li>Process payments with multiple gateway support</li>
              <li>Handle subscriptions, recurring payments, and billing</li>
              <li>XUT token transfers between wallets</li>
              <li>Revenue sharing and developer payouts</li>
              <li>Secure tokenization and PCI compliance</li>
            </ol>
          </article>
        </section>

        {/* Product Creation & Game Association */}
        <section className="mt-10 rounded-2xl p-6" style={{ background: 'var(--color-surface, #121826)' }}>
          <h2 className="text-2xl font-bold text-white mb-6">🛍️ Product Creation & Game Association</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Digital Products</h3>
              <div className="space-y-4">
                <div className="rounded-lg p-4 bg-black/20">
                  <h4 className="font-medium text-white mb-2">In-Game Items & Currencies</h4>
                  <ul className="text-sm opacity-90 space-y-1">
                    <li>• Weapon skins, character outfits, and cosmetics</li>
                    <li>• Virtual currencies (coins, gems, XUT tokens)</li>
                    <li>• Power-ups, boosts, and consumables</li>
                    <li>• Season passes and battle passes</li>
                  </ul>
                </div>
                <div className="rounded-lg p-4 bg-black/20">
                  <h4 className="font-medium text-white mb-2">Product Creation API</h4>
                  <pre className="text-xs bg-black/40 p-2 rounded"><code>{`POST /api/products/create
{
  "name": "Epic Sword Skin",
  "type": "digital",
  "category": "weapon_skin",
  "price": 999, // XUT tokens
  "gameId": "game_123",
  "metadata": {
    "rarity": "legendary",
    "attributes": { "damage": "+15%" }
  }
}`}</code></pre>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-400 mb-3">Physical Products</h3>
              <div className="space-y-4">
                <div className="rounded-lg p-4 bg-black/20">
                  <h4 className="font-medium text-white mb-2">Merchandise & Collectibles</h4>
                  <ul className="text-sm opacity-90 space-y-1">
                    <li>• Game-branded apparel and accessories</li>
                    <li>• Collectible figures and statues</li>
                    <li>• Gaming peripherals and hardware</li>
                    <li>• Limited edition art prints and posters</li>
                  </ul>
                </div>
                <div className="rounded-lg p-4 bg-black/20">
                  <h4 className="font-medium text-white mb-2">Physical Product API</h4>
                  <pre className="text-xs bg-black/40 p-2 rounded"><code>{`POST /api/products/create
{
  "name": "Game Hero T-Shirt",
  "type": "physical",
  "category": "apparel",
  "price": 2999, // cents USD
  "gameId": "game_123",
  "shipping": {
    "weight": 200, // grams
    "dimensions": "30x20x2" // cm
  }
}`}</code></pre>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-lg p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
            <h4 className="font-medium text-white mb-2">🔗 Game Association Features</h4>
            <ul className="text-sm opacity-90 space-y-1">
              <li>• <strong>Unlock Conditions:</strong> Link products to game achievements, levels, or events</li>
              <li>• <strong>Cross-Promotion:</strong> Feature physical merchandise in-game and vice versa</li>
              <li>• <strong>Bundle Deals:</strong> Create bundles with both digital and physical items</li>
              <li>• <strong>Reward Integration:</strong> Award products as tournament prizes or milestone rewards</li>
            </ul>
          </div>
        </section>

        {/* Tournament & Competition APIs */}
        <section className="mt-10 rounded-2xl p-6" style={{ background: 'var(--color-surface, #121826)' }}>
          <h2 className="text-2xl font-bold text-white mb-6">🏆 Tournament & Competition APIs</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">Tournament Management</h3>
              <div className="space-y-3">
                <div className="text-sm opacity-90">
                  <strong>Create Tournaments:</strong>
                  <pre className="text-xs bg-black/40 p-2 rounded mt-1"><code>{`POST /api/tournaments/create
{
  "name": "Championship 2024",
  "gameId": "game_123",
  "entryFee": 100, // XUT
  "prizePool": 10000, // XUT
  "maxParticipants": 64,
  "startDate": "2024-03-01",
  "brackets": "single_elimination"
}`}</code></pre>
                </div>
                <ul className="text-sm opacity-90 space-y-1">
                  <li>• Bracket generation and management</li>
                  <li>• Automated prize distribution</li>
                  <li>• Real-time tournament updates</li>
                  <li>• Live streaming integration</li>
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-3">Player Registration</h3>
              <div className="space-y-3">
                <div className="text-sm opacity-90">
                  <strong>Registration API:</strong>
                  <pre className="text-xs bg-black/40 p-2 rounded mt-1"><code>{`POST /api/tournaments/register
{
  "tournamentId": "tour_123",
  "playerId": "player_456",
  "teamName": "Optional Team",
  "paymentMethod": "xut_wallet"
}`}</code></pre>
                </div>
                <ul className="text-sm opacity-90 space-y-1">
                  <li>• Skill-based matchmaking</li>
                  <li>• Team formation and management</li>
                  <li>• Entry fee payment processing</li>
                  <li>• Qualification requirements</li>
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Live Updates</h3>
              <div className="space-y-3">
                <div className="text-sm opacity-90">
                  <strong>WebSocket Events:</strong>
                  <pre className="text-xs bg-black/40 p-2 rounded mt-1"><code>{`// Tournament Events
{
  "event": "match_completed",
  "tournamentId": "tour_123",
  "matchId": "match_789",
  "winner": "player_456",
  "score": "3-1"
}`}</code></pre>
                </div>
                <ul className="text-sm opacity-90 space-y-1">
                  <li>• Real-time bracket updates</li>
                  <li>• Live match scores</li>
                  <li>• Spectator notifications</li>
                  <li>• Prize distribution alerts</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Prediction Markets & Betting APIs */}
        <section className="mt-10 rounded-2xl p-6" style={{ background: 'var(--color-surface, #121826)' }}>
          <h2 className="text-2xl font-bold text-white mb-6">🎯 Prediction Markets & Betting APIs</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-3">Market Creation</h3>
              <div className="space-y-4">
                <div className="text-sm opacity-90">
                  <strong>Create Prediction Market:</strong>
                  <pre className="text-xs bg-black/40 p-3 rounded"><code>{`POST /api/predictions/create
{
  "title": "Who will win the Championship?",
  "description": "Final tournament winner",
  "eventId": "tournament_123",
  "outcomes": [
    { "id": "team_a", "name": "Team Alpha" },
    { "id": "team_b", "name": "Team Beta" }
  ],
  "endDate": "2024-03-15T20:00:00Z",
  "category": "esports"
}`}</code></pre>
                </div>
                <ul className="text-sm opacity-90 space-y-1">
                  <li>• Dynamic odds calculation</li>
                  <li>• Multiple outcome types</li>
                  <li>• Automated market resolution</li>
                  <li>• Liquidity pool management</li>
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">Betting & Odds</h3>
              <div className="space-y-4">
                <div className="text-sm opacity-90">
                  <strong>Place Bet:</strong>
                  <pre className="text-xs bg-black/40 p-3 rounded"><code>{`POST /api/predictions/bet
{
  "marketId": "market_123",
  "outcomeId": "team_a",
  "amount": 50, // XUT tokens
  "betType": "win",
  "odds": 2.5
}`}</code></pre>
                </div>
                <ul className="text-sm opacity-90 space-y-1">
                  <li>• Real-time odds updates</li>
                  <li>• Risk management controls</li>
                  <li>• Multi-bet combinations</li>
                  <li>• Instant payout processing</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg p-4 bg-gradient-to-r from-red-900/30 to-orange-900/30">
              <h4 className="font-medium text-white mb-2">🎮 Game Predictions</h4>
              <p className="text-sm opacity-90">Match outcomes, player performance, in-game events, and tournament results.</p>
            </div>
            <div className="rounded-lg p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
              <h4 className="font-medium text-white mb-2">📊 Market Analytics</h4>
              <p className="text-sm opacity-90">Betting volume, user engagement, market sentiment, and prediction accuracy.</p>
            </div>
            <div className="rounded-lg p-4 bg-gradient-to-r from-green-900/30 to-teal-900/30">
              <h4 className="font-medium text-white mb-2">🏅 Leaderboards</h4>
              <p className="text-sm opacity-90">Top predictors, win rates, profit tracking, and achievement systems.</p>
            </div>
          </div>
        </section>

        {/* Coming Soon APIs Section */}
        <section className="mt-10 rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">🚀 Coming Soon APIs</h2>
            <p className="text-lg opacity-80">Essential APIs for next-generation game development</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl p-5 bg-gradient-to-br from-blue-900/40 to-blue-600/40 border border-blue-500/30">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">🎮</span>
                <h3 className="text-lg font-semibold text-white">Multiplayer Game APIs</h3>
              </div>
              <ul className="text-sm opacity-90 space-y-2">
                <li>• Real-time matchmaking and lobby management</li>
                <li>• WebSocket-based game state synchronization</li>
                <li>• Anti-cheat and fair play enforcement</li>
                <li>• Cross-platform session management</li>
                <li>• Voice chat integration</li>
              </ul>
              <div className="mt-4 text-xs text-blue-300">
                <strong>ETA:</strong> Q2 2024
              </div>
            </div>

            <div className="rounded-xl p-5 bg-gradient-to-br from-purple-900/40 to-purple-600/40 border border-purple-500/30">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">🧠</span>
                <h3 className="text-lg font-semibold text-white">Advanced AI APIs</h3>
              </div>
              <ul className="text-sm opacity-90 space-y-2">
                <li>• AI-powered NPCs with dynamic behavior</li>
                <li>• Procedural content generation</li>
                <li>• Intelligent game balancing algorithms</li>
                <li>• Player behavior prediction models</li>
                <li>• Automated QA and bug detection</li>
              </ul>
              <div className="mt-4 text-xs text-purple-300">
                <strong>ETA:</strong> Q3 2024
              </div>
            </div>

            <div className="rounded-xl p-5 bg-gradient-to-br from-green-900/40 to-green-600/40 border border-green-500/30">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">🌐</span>
                <h3 className="text-lg font-semibold text-white">Metaverse Integration</h3>
              </div>
              <ul className="text-sm opacity-90 space-y-2">
                <li>• Cross-game asset portability</li>
                <li>• Virtual world hosting and management</li>
                <li>• Spatial audio and 3D environments</li>
                <li>• Avatar customization and persistence</li>
                <li>• Social interaction frameworks</li>
              </ul>
              <div className="mt-4 text-xs text-green-300">
                <strong>ETA:</strong> Q4 2024
              </div>
            </div>

            <div className="rounded-xl p-5 bg-gradient-to-br from-orange-900/40 to-orange-600/40 border border-orange-500/30">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">📊</span>
                <h3 className="text-lg font-semibold text-white">Analytics & Intelligence</h3>
              </div>
              <ul className="text-sm opacity-90 space-y-2">
                <li>• Real-time player analytics dashboard</li>
                <li>• Predictive churn and retention models</li>
                <li>• Revenue optimization algorithms</li>
                <li>• A/B testing framework</li>
                <li>• Custom KPI tracking and alerts</li>
              </ul>
              <div className="mt-4 text-xs text-orange-300">
                <strong>ETA:</strong> Q2 2024
              </div>
            </div>

            <div className="rounded-xl p-5 bg-gradient-to-br from-red-900/40 to-red-600/40 border border-red-500/30">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">🔒</span>
                <h3 className="text-lg font-semibold text-white">Blockchain & NFT APIs</h3>
              </div>
              <ul className="text-sm opacity-90 space-y-2">
                <li>• NFT minting and marketplace integration</li>
                <li>• Smart contract deployment tools</li>
                <li>• Cross-chain asset management</li>
                <li>• DeFi gaming mechanics</li>
                <li>• Wallet-as-a-Service integration</li>
              </ul>
              <div className="mt-4 text-xs text-red-300">
                <strong>ETA:</strong> Q3 2024
              </div>
            </div>

            <div className="rounded-xl p-5 bg-gradient-to-br from-cyan-900/40 to-cyan-600/40 border border-cyan-500/30">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">📱</span>
                <h3 className="text-lg font-semibold text-white">Mobile & Cross-Platform</h3>
              </div>
              <ul className="text-sm opacity-90 space-y-2">
                <li>• Progressive Web App (PWA) tools</li>
                <li>• Native mobile SDK integration</li>
                <li>• Cloud gaming streaming APIs</li>
                <li>• Device-specific optimization</li>
                <li>• Offline-first game state management</li>
              </ul>
              <div className="mt-4 text-xs text-cyan-300">
                <strong>ETA:</strong> Q2 2024
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="rounded-lg p-4 bg-gradient-to-r from-indigo-900/30 to-purple-900/30">
              <h4 className="text-lg font-semibold text-white mb-2">🔔 Stay Updated</h4>
              <p className="text-sm opacity-90 mb-3">
                Get notified when these APIs become available. Join our developer early access program for beta testing opportunities.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full text-xs">Early Access</span>
                <span className="px-3 py-1 bg-green-600/30 text-green-300 rounded-full text-xs">Beta Testing</span>
                <span className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-xs">Priority Support</span>
              </div>
            </div>
          </div>
        </section>

        {/* Building Complete Workflows Section */}
        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl p-5" style={{ background: 'var(--color-surface, #121826)' }}>
            <h3 className="text-lg font-semibold text-white">Building Complete Workflows</h3>
            <ol className="mt-3 list-decimal pl-5 text-sm opacity-90">
              <li><b>Game Dev Onboarding:</b> User API → Wallet Setup → Game Registration → Token Distribution</li>
              <li><b>Tournament Creation:</b> Game API → Tournament API → Prediction Markets → Payment Processing</li>
              <li><b>Product Integration:</b> Products API → Game Association → Payment API → Inventory Management</li>
              <li><b>AI-Enhanced Gaming:</b> AI API → Game API → Analytics → Player Experience Optimization</li>
              <li><b>Admin Oversight:</b> Admin API → Analytics → System Management → Developer Support</li>
            </ol>
          </article>

          <article className="rounded-2xl p-5" style={{ background: 'var(--color-surface, #121826)' }}>
            <h3 className="text-lg font-semibold text-white">Security & Best Practices</h3>
            <ol className="mt-3 list-decimal pl-5 text-sm opacity-90">
              <li><b>Authentication:</b> Always use Bearer tokens from Admin API</li>
              <li><b>Rate Limiting:</b> Respect API limits and implement retries</li>
              <li><b>Error Handling:</b> Handle 4xx/5xx responses gracefully</li>
              <li><b>Data Privacy:</b> Follow GDPR guidelines for user data</li>
              <li><b>Token Security:</b> Secure XUT token transfers and wallet integrations</li>
            </ol>
          </article>
        </section>

        <section className="mt-10 rounded-2xl p-5" style={{ background: 'var(--color-surface, #121826)' }}>
          <h3 className="text-lg font-semibold text-white">SDK Snippets (Node / TypeScript)</h3>
          <pre className="mt-3 overflow-auto rounded bg-black/40 p-3 text-xs">{`// Authentication & Token Management
export async function getToken({ clientId, clientSecret }: { clientId:string; clientSecret:string }) {
  const r = await fetch('https://api.intelli-verse-x.ai/api/admin/oauth/token', {
    method: 'POST',
    headers: { 'accept': 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
  });
  if (!r.ok) throw new Error(\`Token error \${r.status}\`);
  const data = await r.json();
  return data.access_token ?? data.token;
}

// API Client Factory
export function createApiClient(baseUrl: string, token: string) {
  return async function call(path: string, init: RequestInit = {}) {
    const r = await fetch(\`\${baseUrl}\${path}\`, {
      ...init,
      headers: { ...(init.headers || {}), 'authorization': \`Bearer \${token}\` },
    });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      throw new Error(\`HTTP \${r.status}: \${text}\`);
    }
    return r.json().catch(() => ({}));
  }
}

// Usage Examples for All APIs
(async () => {
  const token = await getToken({ 
    clientId: process.env.CLIENT_ID!, 
    clientSecret: process.env.CLIENT_SECRET! 
  });

  // User Management & Game Dev Onboarding
  const userApi = createApiClient('https://api.intelli-verse-x.ai', token);
  await userApi('/api/user/profile', { method: 'GET' });
  await userApi('/api/user/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ 
      email: 'gamedev@example.com', 
      password: 'secret',
      role: 'game_developer',
      walletAddress: '0x742d35c6737C5C5...', // Optional wallet for token distribution
    }),
  });

  // Game Registration & Management
  const gamesApi = createApiClient('https://api.intelli-verse-x.ai', token);
  await gamesApi('/api/games/list');
  await gamesApi('/api/games/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ 
      name: 'Epic Adventure RPG', 
      description: 'Fantasy RPG with AI-powered NPCs',
      genre: 'RPG',
      platform: ['PC', 'Mobile'],
      developerWallet: '0x742d35c6737C5C5...' // For revenue sharing
    }),
  });

  // Product Creation (Digital & Physical)
  const productsApi = createApiClient('https://api.intelli-verse-x.ai', token);
  
  // Digital Product Example
  await productsApi('/api/products/create', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Legendary Sword Skin',
      type: 'digital',
      price: 999, // XUT tokens
      category: 'weapon_skin',
      gameId: 'game_123',
      metadata: {
        rarity: 'legendary',
        attributes: { damage: '+15%', glow: true }
      }
    }),
  });
  
  // Physical Product Example
  await productsApi('/api/products/create', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Game Hero Action Figure',
      type: 'physical',
      price: 2999, // cents USD
      category: 'collectible',
      gameId: 'game_123',
      shipping: {
        weight: 350, // grams
        dimensions: '15x10x20' // cm
      }
    }),
  });

  // Tournament Management
  const tournamentApi = createApiClient('https://api.intelli-verse-x.ai', token);
  await tournamentApi('/api/tournaments/create', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Spring Championship 2024',
      gameId: 'game_123',
      entryFee: 100, // XUT tokens
      prizePool: 10000, // XUT tokens
      maxParticipants: 64,
      startDate: '2024-03-01T18:00:00Z',
      tournamentType: 'single_elimination'
    }),
  });

  // Prediction Markets
  const predictionApi = createApiClient('https://api.intelli-verse-x.ai', token);
  await predictionApi('/api/predictions/create', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      title: 'Who will win the Championship?',
      description: 'Predict the tournament winner',
      eventId: 'tournament_123',
      outcomes: [
        { id: 'team_alpha', name: 'Team Alpha', initialOdds: 2.5 },
        { id: 'team_beta', name: 'Team Beta', initialOdds: 1.8 }
      ],
      endDate: '2024-03-15T20:00:00Z'
    }),
  });

  // Token Transfer & Wallet Management
  const paymentApi = createApiClient('https://payment.intelli-verse-x.ai', token);
  
  // Transfer XUT tokens between wallets
  await paymentApi('/api/payment/token-transfer', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      fromWallet: '0x742d35c6737C5C5...',
      toWallet: '0x8ba1f109551bd432...',
      amount: 1000, // XUT tokens
      reason: 'tournament_prize',
      metadata: {
        tournamentId: 'tournament_123',
        placement: 1
      }
    }),
  });

  // Process traditional payments
  await paymentApi('/api/payment/process', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      amount: 1999, // cents
      currency: 'USD',
      paymentMethod: 'card',
      gameId: 'game_123',
      productId: 'product_456'
    }),
  });

  // AI Services for Game Development
  const aiApi = createApiClient('https://ai.intelli-verse-x.ai', token);
  await aiApi('/api/ai/conversation', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ 
      messages: [{ role: 'user', content: 'Generate dialogue for a fantasy NPC shopkeeper' }],
      gameContext: {
        genre: 'fantasy',
        setting: 'medieval',
        tone: 'friendly'
      }
    }),
  });

  // Admin Operations & Analytics
  const adminApi = createApiClient('https://api.intelli-verse-x.ai', token);
  await adminApi('/api/admin/analytics/overview');
  await adminApi('/api/admin/developers/approve', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      developerId: 'dev_123',
      approved: true,
      tokenAllocation: 50000 // Initial XUT token allocation
    }),
  });
})();`}</pre>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl p-5" style={{ background: 'var(--color-surface, #121826)' }}>
            <h3 className="text-base font-semibold text-white">Rate Limits</h3>
            <p className="mt-2 text-sm opacity-90">Default 60 RPM/token/service (customizable). See <code>x-ratelimit-*</code> headers for current usage.</p>
          </article>
          <article className="rounded-2xl p-5" style={{ background: 'var(--color-surface, #121826)' }}>
            <h3 className="text-base font-semibold text-white">Versioning</h3>
            <p className="mt-2 text-sm opacity-90">Semantic versioning across all APIs. Breaking changes announced 30+ days ahead with migration guides.</p>
          </article>
          <article className="rounded-2xl p-5" style={{ background: 'var(--color-surface, #121826)' }}>
            <h3 className="text-base font-semibold text-white">Support</h3>
            <p className="mt-2 text-sm opacity-90">Email support@anideebee.com. Include <code>traceId</code>, timestamp, and endpoint for faster resolution.</p>
          </article>
          <article className="rounded-2xl p-5" style={{ background: 'var(--color-surface, #121826)' }}>
            <h3 className="text-base font-semibold text-white">Monitoring</h3>
            <p className="mt-2 text-sm opacity-90">Real-time status at status.intelli-verse-x.ai. API health checks and incident notifications.</p>
          </article>
        </section>
      </section>
    </main>
  );
}