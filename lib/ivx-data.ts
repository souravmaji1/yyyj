import { IVXProduct } from "./ivx-types";

export const ivxProducts: IVXProduct[] = [
  // Video products
  {
    id: "p1",
    title: "Creator Tee — Neon",
    price: 39,
    type: "physical",
    tags: ["Limited", "Unisex"],
    image: "/api/placeholder/300/300?text=Creator+Tee",
    for: { kind: "video", id: "v1" }
  },
  {
    id: "p2",
    title: "Digital Collectible Pass",
    price: 12,
    type: "digital",
    tags: ["NFT", "Access"],
    image: "/api/placeholder/300/300?text=NFT+Pass",
    for: { kind: "video", id: "v1" }
  },
  {
    id: "p3",
    title: "Channel Membership",
    price: 5,
    type: "digital",
    tags: ["Monthly", "Premium"],
    image: "/api/placeholder/300/300?text=Membership",
    for: { kind: "video", id: "v1" }
  },
  {
    id: "p4",
    title: "Exclusive Hoodie",
    price: 65,
    type: "physical",
    tags: ["Limited", "Cotton"],
    image: "/api/placeholder/300/300?text=Hoodie",
    for: { kind: "video", id: "v2" }
  },
  {
    id: "p5",
    title: "Behind Scenes Access",
    price: 8,
    type: "digital",
    tags: ["Exclusive", "Video"],
    image: "/api/placeholder/300/300?text=BTS+Access",
    for: { kind: "video", id: "v2" }
  },

  // Event/Arena products
  {
    id: "p6",
    title: "Tournament Jersey",
    price: 49,
    type: "physical",
    tags: ["Official", "Merch"],
    image: "/api/placeholder/300/300?text=Jersey",
    for: { kind: "event", id: "e1" }
  },
  {
    id: "p7",
    title: "Pro Strategy Guide (PDF)",
    price: 9,
    type: "digital",
    tags: ["Guide", "PDF"],
    image: "/api/placeholder/300/300?text=Strategy+Guide",
    for: { kind: "event", id: "e1" }
  },
  {
    id: "p8",
    title: "VIP Event Pass",
    price: 25,
    type: "digital",
    tags: ["VIP", "Access"],
    image: "/api/placeholder/300/300?text=VIP+Pass",
    for: { kind: "event", id: "e1" }
  },
  {
    id: "p9",
    title: "Gaming Mouse Pad",
    price: 19,
    type: "physical",
    tags: ["Gaming", "Accessory"],
    image: "/api/placeholder/300/300?text=Mouse+Pad",
    for: { kind: "event", id: "e2" }
  },
  {
    id: "p10",
    title: "Champion Bundle",
    price: 15,
    type: "digital",
    tags: ["Bundle", "Skins"],
    image: "/api/placeholder/300/300?text=Champion+Bundle",
    for: { kind: "event", id: "e2" }
  },
  {
    id: "p11",
    title: "Prediction Analytics",
    price: 7,
    type: "digital",
    tags: ["Data", "Analytics"],
    image: "/api/placeholder/300/300?text=Analytics",
    for: { kind: "event", id: "e3" }
  },

  // Some items with no products (for empty state testing)
  // v3, e4, e5 intentionally have no products

  // Additional video products
  {
    id: "p12",
    title: "Streamer Setup Guide",
    price: 12,
    type: "digital",
    tags: ["Tutorial", "Guide"],
    image: "/api/placeholder/300/300?text=Setup+Guide",
    for: { kind: "video", id: "v4" }
  },
  {
    id: "p13",
    title: "Limited Edition Cap",
    price: 28,
    type: "physical",
    tags: ["Limited", "Cap"],
    image: "/api/placeholder/300/300?text=Cap",
    for: { kind: "video", id: "v4" }
  },

  // More event products
  {
    id: "p14",
    title: "Tournament Ticket",
    price: 35,
    type: "digital",
    tags: ["Ticket", "Entry"],
    image: "/api/placeholder/300/300?text=Tournament+Ticket",
    for: { kind: "event", id: "e6" }
  },
  {
    id: "p15",
    title: "Champion Replay Pack",
    price: 6,
    type: "digital",
    tags: ["Replay", "Analysis"],
    image: "/api/placeholder/300/300?text=Replay+Pack",
    for: { kind: "event", id: "e6" }
  },
  {
    id: "p16",
    title: "Gaming Keychain",
    price: 9,
    type: "physical",
    tags: ["Collectible", "Small"],
    image: "/api/placeholder/300/300?text=Keychain",
    for: { kind: "event", id: "e6" }
  }
];