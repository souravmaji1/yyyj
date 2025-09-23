"use client";

import React, { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Alert } from '@/src/components/ui/alert';
import { Skeleton, SkeletonCard, SkeletonForm } from '@/src/components/ui/skeleton';
import { StickyCta, FloatingAddToCart } from '@/src/components/ui/sticky-cta';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { ShoppingCart, Heart, Star, Shield, Truck, RefreshCw } from 'lucide-react';

/**
 * Demo page showcasing enhanced UI components with accessibility and security features
 */
export default function UIComponentsDemo() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 2000);
  };

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <ErrorBoundary level="page">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Enhanced UI Components Demo
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Showcasing WCAG 2.2 AA compliant components with security hardening, 
              high-converting UX patterns, and comprehensive accessibility features.
            </p>
          </div>

          {/* Success Alert */}
          {showSuccess && (
            <Alert
              variant="success"
              title="Success!"
              onClose={() => setShowSuccess(false)}
            >
              Your form has been submitted successfully with full validation and security.
            </Alert>
          )}

          {/* Enhanced Form Demo */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Enhanced Form Components</h2>
            
            {loading ? (
              <SkeletonForm fields={3} />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  placeholder="john@example.com"
                  isRequired
                  helperText="We'll never share your email with anyone."
                />
                
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  error={errors.password}
                  isRequired
                  helperText="Must be at least 8 characters long"
                />
                
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                  success={formData.name.length > 2 ? 'Looks good!' : undefined}
                  isRequired
                  startIcon={<Heart className="h-4 w-4" />}
                />
                
                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Form'
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={simulateLoading}
                  >
                    Test Loading
                  </Button>
                </div>
              </form>
            )}
          </section>

          {/* Button Variants Demo */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Button Variants & Accessibility</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="default">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Primary
              </Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="default" disabled>Disabled</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Accessibility Features:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Minimum 44px touch targets for mobile</li>
                <li>• Visible focus indicators with proper contrast</li>
                <li>• Screen reader compatible with proper ARIA labels</li>
                <li>• Keyboard navigation support</li>
                <li>• Motion preferences respected</li>
              </ul>
            </div>
          </section>

          {/* Alert Variants Demo */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Alert System</h2>
            <div className="space-y-4">
              <Alert variant="info" title="Information">
                This is an informational alert with automatic screen reader announcements.
              </Alert>
              
              <Alert variant="success" title="Success">
                Your action was completed successfully!
              </Alert>
              
              <Alert variant="warning" title="Warning">
                Please review your input before proceeding.
              </Alert>
              
              <Alert variant="destructive" title="Error">
                An error occurred. Please try again or contact support.
              </Alert>
            </div>
          </section>

          {/* Product Card Demo with Skeleton */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Loading States & Skeleton UI</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium mb-4">Loading State</h3>
                <SkeletonCard />
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Loaded Product Card</h3>
                <div className="border rounded-lg p-4 bg-white">
                  <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-white font-medium">Product Image</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Premium Gaming Headset</h4>
                    <p className="text-sm text-gray-600">
                      High-quality audio with noise cancellation and comfortable design.
                    </p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">(127 reviews)</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-lg font-bold">$99.99</span>
                    <Button size="sm">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trust Signals */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Trust Signals & Conversion Elements</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium">Secure Checkout</h3>
                <p className="text-sm text-gray-600">256-bit SSL encryption</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium">Fast Shipping</h3>
                <p className="text-sm text-gray-600">Free delivery over $50</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <RefreshCw className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium">Easy Returns</h3>
                <p className="text-sm text-gray-600">30-day return policy</p>
              </div>
            </div>
          </section>

          {/* Security Notice */}
          <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Security & Privacy Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Security Hardening</h3>
                <ul className="space-y-2 text-sm">
                  <li>✅ CSP headers with strict policy</li>
                  <li>✅ HSTS enforcement</li>
                  <li>✅ Rate limiting protection</li>
                  <li>✅ Input validation with Zod</li>
                  <li>✅ XSS protection</li>
                  <li>✅ CSRF protection</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Privacy Compliance</h3>
                <ul className="space-y-2 text-sm">
                  <li>✅ GDPR-ready analytics</li>
                  <li>✅ Data minimization</li>
                  <li>✅ Sanitized error logging</li>
                  <li>✅ Secure cookie handling</li>
                  <li>✅ User consent management</li>
                  <li>✅ PII protection</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Spacer for sticky demo */}
          <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
            <p className="text-gray-600">Scroll down to see the sticky CTA in action!</p>
          </div>

        </div>

        {/* Sticky CTA Demo */}
        <StickyCta
          primaryText="Add to Cart"
          onPrimaryAction={() => alert('Added to cart!')}
          secondaryText="Wishlist"
          onSecondaryAction={() => alert('Added to wishlist!')}
          price="$99.99"
          originalPrice="$129.99"
          discountPercentage={23}
          inStock={true}
          lowStockCount={3}
          showWishlist={true}
          showShare={true}
        />

        {/* Floating Add to Cart Demo */}
        <FloatingAddToCart
          onAddToCart={() => alert('Quick add to cart!')}
          itemCount={2}
        />
      </div>
    </ErrorBoundary>
  );
}