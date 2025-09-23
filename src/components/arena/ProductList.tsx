import { Product } from '@/src/types/arena';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">No products available</div>
        <div className="text-sm text-gray-500">Check back later for new products related to this content.</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="bg-gray-800/50 border-gray-700">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">{product.title}</h4>
                <div className="text-blue-400 font-semibold">{product.priceXUT} XUT</div>
              </div>
              {product.badge && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {product.badge}
                </Badge>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-gray-600 text-gray-400 hover:bg-gray-700"
              disabled
            >
              Add
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}