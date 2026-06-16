import { Product, Category, Order, Customer, Review, Partner, Banner, User, Settings } from "../types";

export const initialCategories: Category[] = [
  { id: "cat-1", name: "Electronics", description: "Smartphones, laptops, and gadgets" },
  { id: "cat-2", name: "Fashion", description: "Clothing, shoes, and accessories" },
  { id: "cat-3", name: "Home & Living", description: "Furniture, decor, and kitchenware" },
  { id: "cat-4", name: "Beauty & Health", description: "Skincare, cosmetics, and wellness" },
  { id: "cat-5", name: "Sports & Outdoors", description: "Fitness gear and outdoor equipment" },
];

export const initialProducts: Product[] = [
  {
    id: "prod-1",
    name: "iPhone 15 Pro Max",
    category: "Electronics",
    price: 1199,
    stock: 45,
    description: "Experience the ultimate iPhone with a titanium design, A17 Pro chip, and advanced camera system.",
    images: ["data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 100 100'><defs><linearGradient id='g1' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%236366f1'/><stop offset='100%' stop-color='%23a855f7'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g1)'/><text x='50' y='55' font-family='sans-serif' font-size='10' fill='white' text-anchor='middle'>iPhone 15 Pro</text></svg>"],
  },
  {
    id: "prod-2",
    name: "Wireless ANC Headphones",
    category: "Electronics",
    price: 349,
    stock: 80,
    description: "Industry-leading noise cancelling headphones with premium sound quality and 30-hour battery life.",
    images: ["data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 100 100'><defs><linearGradient id='g2' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%233b82f6'/><stop offset='100%' stop-color='%2306b6d4'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g2)'/><text x='50' y='55' font-family='sans-serif' font-size='10' fill='white' text-anchor='middle'>ANC Headphones</text></svg>"],
  },
  {
    id: "prod-3",
    name: "Minimalist Leather Backpack",
    category: "Fashion",
    price: 189,
    stock: 25,
    description: "Handcrafted from full-grain leather, featuring a padded laptop sleeve and multiple utility pockets.",
    images: ["data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 100 100'><defs><linearGradient id='g3' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23f59e0b'/><stop offset='100%' stop-color='%23ef4444'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g3)'/><text x='50' y='55' font-family='sans-serif' font-size='10' fill='white' text-anchor='middle'>Leather Backpack</text></svg>"],
  },
  {
    id: "prod-4",
    name: "Ergonomic Office Chair",
    category: "Home & Living",
    price: 499,
    stock: 15,
    description: "Fully adjustable lumbar support, breathable mesh, and premium 4D armrests for long sitting sessions.",
    images: ["data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 100 100'><defs><linearGradient id='g4' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%2310b981'/><stop offset='100%' stop-color='%233b82f6'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g4)'/><text x='50' y='55' font-family='sans-serif' font-size='10' fill='white' text-anchor='middle'>Ergo Chair</text></svg>"],
  },
  {
    id: "prod-5",
    name: "Ultra Running Shoes",
    category: "Sports & Outdoors",
    price: 150,
    stock: 60,
    description: "High-performance cushioning with breathable upper mesh, engineered for long distance marathons.",
    images: ["data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 100 100'><defs><linearGradient id='g5' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23ec4899'/><stop offset='100%' stop-color='%238b5cf6'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g5)'/><text x='50' y='55' font-family='sans-serif' font-size='10' fill='white' text-anchor='middle'>Running Shoes</text></svg>"],
  },
];

export const initialCustomers: Customer[] = [
  { id: "cust-1", name: "Sarah Connor", email: "sarah.connor@cyberdyne.com", phone: "+1 (555) 123-4567", ordersCount: 12, joinedDate: "2025-01-15" },
  { id: "cust-2", name: "John Doe", email: "john.doe@gmail.com", phone: "+1 (555) 987-6543", ordersCount: 5, joinedDate: "2025-02-10" },
  { id: "cust-3", name: "Alice Smith", email: "alice.smith@yahoo.com", phone: "+1 (555) 456-7890", ordersCount: 8, joinedDate: "2025-03-05" },
  { id: "cust-4", name: "Bruce Wayne", email: "bruce@waynecorp.com", phone: "+1 (555) 777-8888", ordersCount: 22, joinedDate: "2024-11-20" },
  { id: "cust-5", name: "Peter Parker", email: "peter@dailybugle.com", phone: "+1 (555) 111-2222", ordersCount: 3, joinedDate: "2025-04-01" },
];

export const initialOrders: Order[] = [
  {
    id: "ord-1001",
    customerName: "Sarah Connor",
    amount: 1548,
    status: "Delivered",
    date: "2026-06-12",
    items: [
      { productName: "iPhone 15 Pro Max", quantity: 1, price: 1199 },
      { productName: "Wireless ANC Headphones", quantity: 1, price: 349 },
    ],
  },
  {
    id: "ord-1002",
    customerName: "John Doe",
    amount: 349,
    status: "Shipped",
    date: "2026-06-14",
    items: [{ productName: "Wireless ANC Headphones", quantity: 1, price: 349 }],
  },
  {
    id: "ord-1003",
    customerName: "Alice Smith",
    amount: 688,
    status: "Processing",
    date: "2026-06-15",
    items: [
      { productName: "Ergonomic Office Chair", quantity: 1, price: 499 },
      { productName: "Minimalist Leather Backpack", quantity: 1, price: 189 },
    ],
  },
  {
    id: "ord-1004",
    customerName: "Bruce Wayne",
    amount: 2398,
    status: "Pending",
    date: "2026-06-16",
    items: [{ productName: "iPhone 15 Pro Max", quantity: 2, price: 1199 }],
  },
  {
    id: "ord-1005",
    customerName: "Peter Parker",
    amount: 150,
    status: "Cancelled",
    date: "2026-06-10",
    items: [{ productName: "Ultra Running Shoes", quantity: 1, price: 150 }],
  },
];

export const initialReviews: Review[] = [
  {
    id: "rev-1",
    productName: "iPhone 15 Pro Max",
    customerName: "Sarah Connor",
    rating: 5,
    comment: "Absolutely incredible battery life and camera is stellar. Highly recommend it!",
    date: "2026-06-13",
    approved: true,
  },
  {
    id: "rev-2",
    productName: "Wireless ANC Headphones",
    customerName: "John Doe",
    rating: 4,
    comment: "Great sound quality and noise cancelling, but can get a bit warm after 2 hours.",
    date: "2026-06-14",
    approved: true,
  },
  {
    id: "rev-3",
    productName: "Ergonomic Office Chair",
    customerName: "Alice Smith",
    rating: 5,
    comment: "Saved my back! Super adjustable and high quality materials.",
    date: "2026-06-15",
    approved: false,
  },
  {
    id: "rev-4",
    productName: "Minimalist Leather Backpack",
    customerName: "Robert Downey",
    rating: 2,
    comment: "Too small for my needs and zipper broke on the second day. Disappointed.",
    date: "2026-06-08",
    approved: true,
  },
];

export const initialPartners: Partner[] = [
  { id: "part-1", logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40' viewBox='0 0 100 40'><rect width='100' height='40' fill='%23e2e8f0' rx='5'/><text x='50' y='25' font-family='sans-serif' font-weight='bold' font-size='12' fill='%23475569' text-anchor='middle'>Stripe</text></svg>", name: "Stripe", website: "https://stripe.com" },
  { id: "part-2", logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40' viewBox='0 0 100 40'><rect width='100' height='40' fill='%23e2e8f0' rx='5'/><text x='50' y='25' font-family='sans-serif' font-weight='bold' font-size='12' fill='%23475569' text-anchor='middle'>FedEx</text></svg>", name: "FedEx", website: "https://fedex.com" },
  { id: "part-3", logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40' viewBox='0 0 100 40'><rect width='100' height='40' fill='%23e2e8f0' rx='5'/><text x='50' y='25' font-family='sans-serif' font-weight='bold' font-size='12' fill='%23475569' text-anchor='middle'>Shopify</text></svg>", name: "Shopify", website: "https://shopify.com" },
];

export const initialBanners: Banner[] = [
  { id: "ban-1", title: "Summer Clearance Sale - Up to 50% Off", imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='300' viewBox='0 0 800 300'><defs><linearGradient id='gb1' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23f43f5e'/><stop offset='100%' stop-color='%23fb7185'/></linearGradient></defs><rect width='800' height='300' fill='url(%23gb1)'/><text x='400' y='160' font-family='sans-serif' font-weight='bold' font-size='36' fill='white' text-anchor='middle'>SUMMER SALE</text></svg>", linkUrl: "/products?sale=summer", active: true },
  { id: "ban-2", title: "Next-Gen Tech Gadgets Out Now", imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='300' viewBox='0 0 800 300'><defs><linearGradient id='gb2' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%230f172a'/><stop offset='100%' stop-color='%2338bdf8'/></linearGradient></defs><rect width='800' height='300' fill='url(%23gb2)'/><text x='400' y='160' font-family='sans-serif' font-weight='bold' font-size='36' fill='white' text-anchor='middle'>TECH OF TOMORROW</text></svg>", linkUrl: "/products/electronics", active: true },
  { id: "ban-3", title: "Eco-Friendly Living Initiatives", imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='300' viewBox='0 0 800 300'><defs><linearGradient id='gb3' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23047857'/><stop offset='100%' stop-color='%2334d399'/></linearGradient></defs><rect width='800' height='300' fill='url(%23gb3)'/><text x='400' y='160' font-family='sans-serif' font-weight='bold' font-size='36' fill='white' text-anchor='middle'>SUSTAINABLE HOME</text></svg>", linkUrl: "/products/home", active: false },
];

export const initialUsers: User[] = [
  { id: "usr-1", name: "Admin Manager", email: "admin@dataflow.com", role: "Admin" },
  { id: "usr-2", name: "Sarah Connor", email: "sarah.connor@cyberdyne.com", role: "Customer" },
  { id: "usr-3", name: "John Doe", email: "john.doe@gmail.com", role: "Customer" },
  { id: "usr-4", name: "Demo User", email: "demo@dataflow.com", role: "Admin" },
];

export const initialSettings: Settings = {
  siteName: "FreshMart Admin Panel",
  logo: "DF",
  email: "support@dataflow.com",
  phone: "+1 (555) 019-2834",
  address: "123 Innovation Way, San Francisco, CA",
  theme: "system",
};
