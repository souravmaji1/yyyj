import { Product } from './types';

export const DUMMY_PRODUCTS: Product[] = [
  {
    id: 'hoodie-essential-organic',
    name: 'Unisex Essential Organic Hoodie',
    mockups: {
      front: '/assets/mockups/hoodie/essential/front.png',
      back: '/assets/mockups/hoodie/essential/back.png',
      spin: Array.from({length: 36}, (_,i)=>`/assets/mockups/hoodie/essential/spin/frame-${i+1}.png`),
    },
    printAreas: [
      { view:'front', xPct: 30, yPct: 30, widthPct: 40, heightPct: 30 },
      { view:'back',  xPct: 30, yPct: 28, widthPct: 40, heightPct: 32 },
    ],
    colors: [
      { id:'white', name:'White', hex:'#FFFFFF' },
      { id:'ash', name:'Ash', hex:'#E7E7E7' },
      { id:'stone', name:'Stone', hex:'#C8C8C8' },
      { id:'charcoal', name:'Charcoal', hex:'#2F3237' },
      { id:'black', name:'Black', hex:'#000000' },
    ],
    msrpUSD: 45.99,
  },
  {
    id: 'sweatshirt-organic',
    name: 'Unisex Organic Sweatshirt',
    mockups: { 
      front: '/assets/mockups/sweatshirt/organic/front.png', 
      back: '/assets/mockups/sweatshirt/organic/back.png' 
    },
    printAreas: [
      { view:'front', xPct: 28, yPct: 26, widthPct: 44, heightPct: 34 },
      { view:'back',  xPct: 28, yPct: 24, widthPct: 44, heightPct: 36 },
    ],
    colors: [
      { id:'white', name:'White', hex:'#FFFFFF' },
      { id:'heather', name:'Heather', hex:'#D9D9D9' },
      { id:'navy', name:'Navy', hex:'#1E2A3A' },
    ],
    msrpUSD: 39.99,
  },
  {
    id: 'sweatshirt-midweight',
    name: 'Unisex Organic Mid‑Weight Sweatshirt',
    mockups: { 
      front: '/assets/mockups/sweatshirt/mid/front.png', 
      back: '/assets/mockups/sweatshirt/mid/back.png' 
    },
    printAreas: [
      { view:'front', xPct: 29, yPct: 27, widthPct: 42, heightPct: 33 },
      { view:'back',  xPct: 29, yPct: 25, widthPct: 42, heightPct: 35 },
    ],
    colors: [
      { id:'white', name:'White', hex:'#FFFFFF' },
      { id:'ash', name:'Ash', hex:'#E7E7E7' },
      { id:'black', name:'Black', hex:'#000000' },
    ],
    msrpUSD: 42.99,
  },
  {
    id: 'sweatshirt-garment-dyed',
    name: 'Unisex Garment‑Dyed Sweatshirt',
    mockups: { 
      front: '/assets/mockups/sweatshirt/garment-dyed/front.png', 
      back: '/assets/mockups/sweatshirt/garment-dyed/back.png' 
    },
    printAreas: [
      { view:'front', xPct: 28, yPct: 28, widthPct: 44, heightPct: 32 },
      { view:'back',  xPct: 28, yPct: 26, widthPct: 44, heightPct: 34 },
    ],
    colors: [
      { id:'stone', name:'Stone', hex:'#C8C8C8' },
      { id:'charcoal', name:'Charcoal', hex:'#2F3237' },
    ],
    msrpUSD: 44.99,
  },
  {
    id: 'crew-premium',
    name: 'Unisex Premium Crew Neck Sweatshirt',
    mockups: { 
      front: '/assets/mockups/crew/premium/front.png', 
      back: '/assets/mockups/crew/premium/back.png' 
    },
    printAreas: [
      { view:'front', xPct: 30, yPct: 27, widthPct: 40, heightPct: 33 },
      { view:'back',  xPct: 30, yPct: 25, widthPct: 40, heightPct: 35 },
    ],
    colors: [
      { id:'white', name:'White', hex:'#FFFFFF' },
      { id:'ice', name:'Ice', hex:'#EDEFF3' },
      { id:'black', name:'Black', hex:'#000000' },
    ],
    msrpUSD: 38.99,
  },
];