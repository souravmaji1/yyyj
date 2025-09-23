"use client";

import React, { useState } from 'react';
import { ShoppingCart, Star, Download, Heart, Filter, Search, Sparkles } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { useStudioWalletStore } from '@/src/lib/store/studio/wallet';
import { motion } from 'framer-motion';

interface MarketplaceItem {
  id: string;
  title: string;
  category: 'templates' | 'assets' | 'packs' | 'tools';
  type: 'image' | 'video' | 'audio' | 'threeD' | 'template';
  price: number; // in XUT
  rating: number;
  downloads: number;
  thumbnail: string;
  author: string;
  description: string;
  tags: string[];
  featured: boolean;
  popular: boolean;
  new: boolean;
}

const mockMarketplaceItems: MarketplaceItem[] = [
  {
    id: 'tmpl_001',
    title: 'Social Media Template Pack',
    category: 'templates',
    type: 'template',
    price: 150,
    rating: 4.8,
    downloads: 1250,
    thumbnail: 'https://picsum.photos/300/200?random=1',
    author: 'DesignPro',
    description: 'Professional social media templates for Instagram, Twitter, and Facebook',
    tags: ['social', 'instagram', 'modern', 'clean'],
    featured: true,
    popular: true,
    new: false,
  },
  {
    id: 'asset_001',
    title: 'Abstract Background Collection',
    category: 'assets',
    type: 'image',
    price: 80,
    rating: 4.6,
    downloads: 890,
    thumbnail: 'https://picsum.photos/300/200?random=2',
    author: 'ArtistHub',
    description: 'Set of 20 high-quality abstract backgrounds in 4K resolution',
    tags: ['abstract', 'background', '4k', 'colorful'],
    featured: false,
    popular: true,
    new: false,
  },
  {
    id: 'pack_001',
    title: 'Premium Music Loops',
    category: 'packs',
    type: 'audio',
    price: 200,
    rating: 4.9,
    downloads: 650,
    thumbnail: 'https://picsum.photos/300/200?random=3',
    author: 'SoundMaster',
    description: 'Royalty-free music loops for video projects and presentations',
    tags: ['music', 'loops', 'royalty-free', 'commercial'],
    featured: true,
    popular: false,
    new: true,
  },
  {
    id: 'model_001',
    title: 'Low Poly Character Set',
    category: 'assets',
    type: 'threeD',
    price: 300,
    rating: 4.7,
    downloads: 420,
    thumbnail: 'https://picsum.photos/300/200?random=4',
    author: '3DCreator',
    description: 'Stylized low-poly characters for games and animations',
    tags: ['3d', 'character', 'low-poly', 'game'],
    featured: false,
    popular: false,
    new: true,
  },
  {
    id: 'tool_001',
    title: 'AI Enhancement Bundle',
    category: 'tools',
    type: 'template',
    price: 500,
    rating: 4.9,
    downloads: 340,
    thumbnail: 'https://picsum.photos/300/200?random=5',
    author: 'AIStudio',
    description: 'Advanced AI tools for image enhancement and upscaling',
    tags: ['ai', 'enhancement', 'upscale', 'professional'],
    featured: true,
    popular: true,
    new: false,
  },
  {
    id: 'video_001',
    title: 'Motion Graphics Pack',
    category: 'packs',
    type: 'video',
    price: 250,
    rating: 4.5,
    downloads: 780,
    thumbnail: 'https://picsum.photos/300/200?random=6',
    author: 'MotionPro',
    description: 'Professional motion graphics elements and transitions',
    tags: ['motion', 'graphics', 'transitions', 'after-effects'],
    featured: false,
    popular: true,
    new: false,
  },
];

async function fetchMarketplaceItems(): Promise<MarketplaceItem[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockMarketplaceItems;
}

export function MarketplacePanel() {
  const { charge, balance } = useStudioWalletStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['marketplace-items'],
    queryFn: fetchMarketplaceItems,
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handlePurchase = (item: MarketplaceItem) => {
    const success = charge(item.price, `Purchased ${item.title}`);
    if (success) {
      window.dispatchEvent(new CustomEvent('studio-toast', {
        detail: {
          type: 'success',
          title: 'Purchase Successful!',
          description: `${item.title} added to your library`
        }
      }));
    }
  };

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      return newFavorites;
    });
  };

  const featuredItems = filteredItems.filter(item => item.featured);
  const popularItems = filteredItems.filter(item => item.popular);
  const newItems = filteredItems.filter(item => item.new);

  return (
    <div className="h-full flex flex-col bg-[#0F1629]">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center space-x-2 mb-3">
          <ShoppingCart className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-[#E6EEFF]">Marketplace</h2>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search templates, assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[var(--color-surface)] border-white/20 text-[#E6EEFF] placeholder-gray-400"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All', icon: <Filter className="h-4 w-4" /> },
            { id: 'templates', label: 'Templates', icon: <Sparkles className="h-4 w-4" /> },
            { id: 'assets', label: 'Assets', icon: <Download className="h-4 w-4" /> },
            { id: 'packs', label: 'Packs', icon: <ShoppingCart className="h-4 w-4" /> },
            { id: 'tools', label: 'Tools', icon: <Star className="h-4 w-4" /> },
          ].map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-1 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                  : 'hover:bg-white/10 text-gray-300'
              }`}
            >
              {category.icon}
              <span>{category.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="featured" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[var(--color-surface)]">
              <TabsTrigger value="featured" className="data-[state=active]:bg-indigo-600">
                Featured
              </TabsTrigger>
              <TabsTrigger value="popular" className="data-[state=active]:bg-indigo-600">
                Popular
              </TabsTrigger>
              <TabsTrigger value="new" className="data-[state=active]:bg-indigo-600">
                New
              </TabsTrigger>
            </TabsList>

            <TabsContent value="featured" className="mt-4">
              <ItemGrid items={featuredItems} isLoading={isLoading} onPurchase={handlePurchase} favorites={favorites} onToggleFavorite={toggleFavorite} />
            </TabsContent>

            <TabsContent value="popular" className="mt-4">
              <ItemGrid items={popularItems} isLoading={isLoading} onPurchase={handlePurchase} favorites={favorites} onToggleFavorite={toggleFavorite} />
            </TabsContent>

            <TabsContent value="new" className="mt-4">
              <ItemGrid items={newItems} isLoading={isLoading} onPurchase={handlePurchase} favorites={favorites} onToggleFavorite={toggleFavorite} />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}

interface ItemGridProps {
  items: MarketplaceItem[];
  isLoading: boolean;
  onPurchase: (item: MarketplaceItem) => void;
  favorites: Set<string>;
  onToggleFavorite: (itemId: string) => void;
}

function ItemGrid({ items, isLoading, onPurchase, favorites, onToggleFavorite }: ItemGridProps) {
  const { balance } = useStudioWalletStore();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[var(--color-surface)] rounded-lg p-4 animate-pulse">
            <div className="w-full h-32 bg-white/10 rounded-lg mb-3" />
            <div className="h-4 bg-white/10 rounded mb-2" />
            <div className="h-3 bg-white/10 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <div className="text-lg mb-2">No items found</div>
        <div className="text-sm">Try adjusting your search or category filter</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => {
        const canAfford = balance >= item.price;
        const isFavorite = favorites.has(item.id);

        return (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.02 }}
            className="bg-[var(--color-surface)] rounded-lg overflow-hidden border border-white/10 hover:border-indigo-400/50 transition-all duration-200"
          >
            {/* Thumbnail */}
            <div className="relative">
              <img 
                src={item.thumbnail} 
                alt={item.title}
                className="w-full h-32 object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex space-x-1">
                {item.featured && (
                  <Badge className="bg-yellow-500 text-black text-xs">Featured</Badge>
                )}
                {item.new && (
                  <Badge className="bg-green-500 text-white text-xs">New</Badge>
                )}
                {item.popular && (
                  <Badge className="bg-blue-500 text-white text-xs">Popular</Badge>
                )}
              </div>

              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(item.id)}
                className={`absolute top-2 right-2 h-8 w-8 p-0 ${
                  isFavorite ? 'text-red-400 hover:text-red-500' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-[#E6EEFF] line-clamp-2 flex-1">
                  {item.title}
                </h3>
              </div>

              <div className="text-xs text-gray-400 mb-2">by {item.author}</div>
              
              <p className="text-xs text-gray-300 mb-3 line-clamp-2">
                {item.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {item.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Stats and Price */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3 text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{item.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="h-3 w-3" />
                    <span>{item.downloads}</span>
                  </div>
                </div>
                
                <div className="text-sm font-medium text-[#E6EEFF]">
                  {item.price} XUT
                </div>
              </div>

              {/* Purchase Button */}
              <Button
                onClick={() => onPurchase(item)}
                disabled={!canAfford}
                className={`w-full text-sm ${
                  canAfford
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                {canAfford ? 'Purchase' : 'Insufficient Funds'}
              </Button>
              
              {!canAfford && (
                <div className="text-xs text-red-400 text-center mt-1">
                  Need {item.price - balance} more XUT
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}