import { ArenaItem } from '@/src/types/arena';

type Kind = "tournament" | "prediction" | "game";

/**
 * Fetch a specific arena item by type and ID
 * This uses the existing API structure but adds a convenience method
 */
export async function fetchArenaItem(kind: Kind, id: string): Promise<ArenaItem | null> {
  try {
    // Use existing API endpoint pattern
    const response = await fetch(`/api/arena/item?type=${kind}&id=${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${kind} with id ${id}`);
    }
    
    const data = await response.json();
    return data.item || null;
  } catch (error) {
    console.error('Error fetching arena item:', error);
    return null;
  }
}

/**
 * Fallback: try to find item in mock data or use existing fetchArenaFeed
 * This provides compatibility with existing data structures
 */
export async function findArenaItemFallback(kind: Kind, id: string): Promise<ArenaItem | null> {
  try {
    // Import the existing API to use mock data
    const { fetchArenaFeed } = await import('@/src/lib/api');
    
    // Fetch all items and find the one we need
    const feedData = await fetchArenaFeed({
      primary: 'all',
      secondary: [],
      search: ''
    });
    
    const item = feedData.items.find(item => item.id === id);
    return item || null;
  } catch (error) {
    console.error('Error in fallback fetch:', error);
    return null;
  }
}