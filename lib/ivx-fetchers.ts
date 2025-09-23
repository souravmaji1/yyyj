import { CatalogKind, ID, IVXProduct } from "./ivx-types";
import { ivxProducts } from "./ivx-data";

/**
 * Simulate network delay
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Simulate random network errors (8% chance)
 */
const maybeFail = () => {
  if (Math.random() < 0.08) {
    throw new Error("Network error - please try again");
  }
};

/**
 * Fetch products for a specific video or event
 * Simulates real API with latency and error handling
 */
export async function ivxGetProducts(kind: CatalogKind, id: ID): Promise<IVXProduct[]> {
  // Simulate network latency (300-800ms)
  await delay(300 + Math.random() * 500);
  
  // Possibly throw an error to test error handling
  maybeFail();
  
  // Filter products by kind and id
  const products = ivxProducts.filter(
    product => product.for?.kind === kind && product.for?.id === id
  );
  
  return products;
}

/**
 * Client-side wrapper for fetching products via API route
 */
export async function fetchProductsFromAPI(kind: CatalogKind, id: ID): Promise<IVXProduct[]> {
  const response = await fetch(`/api/ivx-products?kind=${kind}&id=${id}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch products: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get products by type (physical/digital)
 */
export function filterProductsByType(products: IVXProduct[], type: "physical" | "digital"): IVXProduct[] {
  return products.filter(product => product.type === type);
}

/**
 * Search products by title or tags
 */
export function searchProducts(products: IVXProduct[], query: string): IVXProduct[] {
  if (!query.trim()) return products;
  
  const lowerQuery = query.toLowerCase();
  
  return products.filter(product => 
    product.title.toLowerCase().includes(lowerQuery) ||
    product.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}