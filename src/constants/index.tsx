const DUMMY_IMAGES =
    "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&q=80"

const GAME_IMAGES = [
    "https://images.unsplash.com/photo-1553481187-be93c21490a9?w=800&q=80",  // Head & Tails - Coin image
    "https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=800&q=80",  // Flip Flop - Card flip
    "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",  // Batting - Cricket/Baseball
    "https://images.unsplash.com/photo-1541278107931-e006523892df?w=800&q=80"   // Card Game - Playing cards
];

const ERROR_IMAGE = 'https://example.com/image1.jpg'

const YOUTUBE_CHANNELS = [
    { name: "AutoCurio", url: "https://www.youtube.com/@AutoCurio" },
    { name: "IntelliVerse Health", url: "https://www.youtube.com/@IntelliVerseHealth" },
    { name: "IntelliVerse TechX", url: "https://www.youtube.com/@IntelliVerseTechX" },
    { name: "IntelliVerse PlayX", url: "https://www.youtube.com/@IntelliVerseplayX" },
    { name: "IntelliVerse Luxe", url: "https://www.youtube.com/@IntelliVerseLuxe" }
] as const;

const NAV_LINKS = [
    { href: "/about", label: "About" },
    { href: "/shop", label: "Shop" },
    { href: "/arena", label: "Arena" },
    { href: "/blogs", label: "Blogs" },
    { href: "/developers", label: "API & Playground" },
    { href: "/vendor/register", label: "Join" }
] as const;

const productOfTheDay = {
    id: "samsung-headphone",
    name: "SAMSUNG SMART HEADPHONE SM900",
    price: 320,
    originalPrice: 640,
    stock: 50,
    rating: 5,
    reviewCount: 256,
    description:
        "Premium wireless headphones with active noise cancellation and long battery life. Perfect for gaming and music enthusiasts.",
    features: [
        "Active noise cancellation",
        "30-hour battery life",
        "Premium sound quality",
    ],
    images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80",
    ],
    specifications: {
        Type: "Over-ear",
        Battery: "30 hours",
        Connectivity: "Bluetooth 5.0",
    },
    category: "mobile",
    ageRestricted: false,
    nftDiscount: {
        available: true,
        discountPercentage: 20,
        nftName: "Gamer Pro NFT",
    },
};

const testimonials = [
    {
        text: "IntelliVerse X has revolutionized my gaming experience. The ability to earn real rewards while playing at any kiosk is incredible. The platform is smooth, and the rewards are actually worth it!",
        author: "Alex Chen",
        role: "Pro Gamer",
        rating: 5,
    },
    {
        text: "As a kiosk owner, partnering with IntelliVerse X was the best decision. The smart contract system is transparent, and the platform brings in consistent players. It's a win-win for everyone.",
        author: "Sarah Miller",
        role: "Kiosk Partner",
        rating: 5,
    },
    {
        text: "The NFT rewards are unique and valuable. I've built quite a collection just by playing my favorite games. The community is great, and the platform keeps adding new features.",
        author: "Marcus Johnson",
        role: "NFT Collector",
        rating: 5,
    },
    {
        text: "IntelliVerse X has revolutionized my gaming experience. The ability to earn real rewards while playing at any kiosk is incredible. The platform is smooth, and the rewards are actually worth it!",
        author: "Alex Chen",
        role: "Pro Gamer",
        rating: 5,
    },
    {
        text: "As a kiosk owner, partnering with IntelliVerse X was the best decision. The smart contract system is transparent, and the platform brings in consistent players. It's a win-win for everyone.",
        author: "Sarah Miller",
        role: "Kiosk Partner",
        rating: 5,
    },
    {
        text: "The NFT rewards are unique and valuable. I've built quite a collection just by playing my favorite games. The community is great, and the platform keeps adding new features.",
        author: "Marcus Johnson",
        role: "NFT Collector",
        rating: 5,
    },
];

const features = [
    "Play to Earn",
    "Smart Kiosks",
    "NFT Rewards",
    "Crypto Gaming"
];

const CHECKOUT_STEPS = ["Cart", "Address", "Order confirmation & payment", "Complete"];

const availableNFTs = [
    {
        id: 1,
        name: "Gamer Pro NFT",
        imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        discountPercentage: 20
    },
    {
        id: 2,
        name: "Intelliverse Founder",
        imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        discountPercentage: 15
    },
    {
        id: 3,
        name: "VR Explorer",
        imageUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        discountPercentage: 10
    },
    {
        id: 4,
        name: "Tech Master",
        imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        discountPercentage: 12
    },
    {
        id: 5,
        name: "Digital Artist",
        imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        discountPercentage: 18
    }
];


const productType = {
    DIGITAL: "digital" as const,
    PHYSICAL: "physical" as const,
    NFT: "NFT" as const,
    ONLINE: "online" as const
} as const;


const TOKEN_PACKAGES = [
    {
        id: 1,
        tokens: 100,
        price: 100,
        bonus: 0,
        image: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=500&auto=format&fit=crop&q=60",
        popular: false
    },
    {
        id: 2,
        tokens: 500,
        price: 500,
        bonus: 50,
        image: "https://images.unsplash.com/photo-1633355444132-695d5876cd00?w=500&auto=format&fit=crop&q=60",
        popular: true
    },
    {
        id: 3,
        tokens: 1000,
        price: 1000,
        bonus: 150,
        image: "https://images.unsplash.com/photo-1633355444132-695d5876cd00?w=500&auto=format&fit=crop&q=60",
        popular: false
    },
    {
        id: 4,
        tokens: 2500,
        price: 2500,
        bonus: 500,
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60",
        popular: false
    }
];

export { DUMMY_IMAGES, ERROR_IMAGE, TOKEN_PACKAGES,productType, productOfTheDay, GAME_IMAGES, testimonials, features, YOUTUBE_CHANNELS, NAV_LINKS, CHECKOUT_STEPS, availableNFTs };