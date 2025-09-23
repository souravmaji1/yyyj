import { Button } from '@/src/components/ui/button';

export default function ButtonTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Button & Interactive Element Test Page
          </h1>
          <p className="text-neutral-700">
            Testing the new Online & Digital brand palette - No white backgrounds on interactive elements
          </p>
        </div>

        {/* Button Variants */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-neutral-900">Button Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-neutral-25 rounded-lg">
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-neutral-700">Primary Buttons</h3>
              <Button variant="default" size="sm">Small Primary</Button>
              <Button variant="default" size="default">Default Primary</Button>
              <Button variant="default" size="lg">Large Primary</Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-neutral-700">Secondary Buttons</h3>
              <Button variant="secondary" size="sm">Small Secondary</Button>
              <Button variant="secondary" size="default">Default Secondary</Button>
              <Button variant="secondary" size="lg">Large Secondary</Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-neutral-700">Outline Buttons</h3>
              <Button variant="outline" size="sm">Small Outline</Button>
              <Button variant="outline" size="default">Default Outline</Button>
              <Button variant="outline" size="lg">Large Outline</Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-neutral-700">Ghost Buttons</h3>
              <Button variant="ghost" size="sm">Small Ghost</Button>
              <Button variant="ghost" size="default">Default Ghost</Button>
              <Button variant="ghost" size="lg">Large Ghost</Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-neutral-700">Destructive Buttons</h3>
              <Button variant="destructive" size="sm">Small Delete</Button>
              <Button variant="destructive" size="default">Default Delete</Button>
              <Button variant="destructive" size="lg">Large Delete</Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-neutral-700">Link Buttons</h3>
              <Button variant="link" size="sm">Small Link</Button>
              <Button variant="link" size="default">Default Link</Button>
              <Button variant="link" size="lg">Large Link</Button>
            </div>
          </div>
        </section>

        {/* Disabled States */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-neutral-900">Disabled States</h2>
          <div className="flex flex-wrap gap-4 p-6 bg-neutral-25 rounded-lg">
            <Button variant="default" disabled>Disabled Primary</Button>
            <Button variant="secondary" disabled>Disabled Secondary</Button>
            <Button variant="outline" disabled>Disabled Outline</Button>
            <Button variant="ghost" disabled>Disabled Ghost</Button>
            <Button variant="destructive" disabled>Disabled Delete</Button>
          </div>
        </section>

        {/* CSS Utility Classes */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-neutral-900">CSS Utility Classes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-neutral-25 rounded-lg">
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-neutral-700">Standard CSS Classes</h3>
              <button className="btn btn-primary btn-default">CSS Primary</button>
              <button className="btn btn-secondary btn-default">CSS Secondary</button>
              <button className="btn btn-ghost btn-default">CSS Ghost</button>
              <button className="btn btn-destructive btn-default">CSS Destructive</button>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-neutral-700">Custom Tailwind</h3>
              <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-md transition-colors">
                Custom Brand Button
              </button>
              <button className="bg-brand-secondary-600 hover:bg-brand-secondary-700 text-white px-4 py-2 rounded-md transition-colors">
                Custom Secondary
              </button>
              <button className="bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded-md transition-colors">
                Custom Success
              </button>
              <button className="bg-warning-600 hover:bg-warning-700 text-white px-4 py-2 rounded-md transition-colors">
                Custom Warning
              </button>
            </div>
          </div>
        </section>

        {/* Interactive States Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-neutral-900">Interactive States</h2>
          <div className="p-6 bg-neutral-25 rounded-lg">
            <p className="text-sm text-neutral-700 mb-4">
              Use Tab to navigate and test focus states. All hover states should show non-white backgrounds.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Hover & Focus Test</Button>
              <Button variant="secondary">Hover & Focus Test</Button>
              <Button variant="outline">Hover & Focus Test</Button>
              <Button variant="ghost">Hover & Focus Test</Button>
            </div>
          </div>
        </section>

        {/* Color Palette Reference */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-neutral-900">Color Palette Reference</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-neutral-25 rounded-lg">
            
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-neutral-700">Primary Brand</h3>
              <div className="bg-brand-50 p-2 rounded text-xs text-neutral-900">brand-50</div>
              <div className="bg-brand-100 p-2 rounded text-xs text-neutral-900">brand-100</div>
              <div className="bg-brand-600 p-2 rounded text-xs text-white">brand-600</div>
              <div className="bg-brand-700 p-2 rounded text-xs text-white">brand-700</div>
              <div className="bg-brand-800 p-2 rounded text-xs text-white">brand-800</div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-medium text-neutral-700">Secondary</h3>
              <div className="bg-brand-secondary-50 p-2 rounded text-xs text-neutral-900">secondary-50</div>
              <div className="bg-brand-secondary-600 p-2 rounded text-xs text-white">secondary-600</div>
              <div className="bg-brand-secondary-700 p-2 rounded text-xs text-white">secondary-700</div>
              <div className="bg-brand-secondary-800 p-2 rounded text-xs text-white">secondary-800</div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-medium text-neutral-700">Semantic</h3>
              <div className="bg-success-600 p-2 rounded text-xs text-white">success-600</div>
              <div className="bg-warning-600 p-2 rounded text-xs text-white">warning-600</div>
              <div className="bg-danger-600 p-2 rounded text-xs text-white">danger-600</div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-medium text-neutral-700">Neutrals</h3>
              <div className="bg-neutral-25 p-2 rounded text-xs text-neutral-900 border">neutral-25</div>
              <div className="bg-neutral-50 p-2 rounded text-xs text-neutral-900">neutral-50</div>
              <div className="bg-neutral-100 p-2 rounded text-xs text-neutral-900">neutral-100</div>
              <div className="bg-neutral-700 p-2 rounded text-xs text-white">neutral-700</div>
              <div className="bg-neutral-900 p-2 rounded text-xs text-white">neutral-900</div>
            </div>
          </div>
        </section>

        <div className="text-center text-sm text-neutral-700 pt-8">
          ✅ All interactive elements use non-white backgrounds in all states
        </div>
      </div>
    </div>
  );
}