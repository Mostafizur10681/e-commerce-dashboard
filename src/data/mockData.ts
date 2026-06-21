import { Product, Category, Order, Customer, Review, Partner, Banner, User, Settings, Attribute } from "../types";

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
    customerEmail: "sarah.connor@cyberdyne.com",
    amount: 1548,
    subtotal: 1528,
    shippingCost: 20,
    status: "Delivered",
    paymentStatus: "Paid",
    paymentMethod: "Credit Card",
    transactionId: "txn_8273948512",
    paymentDate: "2026-06-12",
    date: "2026-06-12",
    shippingAddress: {
      street: "123 Cyberdyne Blvd",
      city: "Los Angeles",
      state: "CA",
      zip: "90210",
      country: "USA"
    },
    billingAddress: {
      street: "123 Cyberdyne Blvd",
      city: "Los Angeles",
      state: "CA",
      zip: "90210",
      country: "USA"
    },
    items: [
      { productName: "iPhone 15 Pro Max", quantity: 1, price: 1199, thumbnail: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'><rect width='100' height='100' fill='%236366f1'/></svg>" },
      { productName: "Wireless ANC Headphones", quantity: 1, price: 349, thumbnail: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'><rect width='100' height='100' fill='%233b82f6'/></svg>" },
    ],
  },
  {
    id: "ord-1002",
    customerName: "John Doe",
    customerEmail: "john.doe@gmail.com",
    amount: 349,
    subtotal: 349,
    shippingCost: 0,
    status: "Shipped",
    paymentStatus: "Paid",
    paymentMethod: "PayPal",
    transactionId: "txn_1029384756",
    paymentDate: "2026-06-14",
    date: "2026-06-14",
    shippingAddress: {
      street: "456 Main Street, Apt 2B",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA"
    },
    billingAddress: {
      street: "456 Main Street, Apt 2B",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA"
    },
    items: [
      { productName: "Wireless ANC Headphones", quantity: 1, price: 349, thumbnail: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'><rect width='100' height='100' fill='%233b82f6'/></svg>" }
    ],
  },
  {
    id: "ord-1003",
    customerName: "Alice Smith",
    customerEmail: "alice.smith@yahoo.com",
    amount: 688,
    subtotal: 673,
    shippingCost: 15,
    status: "Processing",
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
    transactionId: "txn_5647382910",
    paymentDate: "2026-06-15",
    date: "2026-06-15",
    shippingAddress: {
      street: "789 Pine Ave",
      city: "San Francisco",
      state: "CA",
      zip: "94103",
      country: "USA"
    },
    billingAddress: {
      street: "789 Pine Ave",
      city: "San Francisco",
      state: "CA",
      zip: "94103",
      country: "USA"
    },
    items: [
      { productName: "Ergonomic Office Chair", quantity: 1, price: 499, thumbnail: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'><rect width='100' height='100' fill='%2310b981'/></svg>" },
      { productName: "Minimalist Leather Backpack", quantity: 1, price: 189, thumbnail: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f59e0b'/></svg>" },
    ],
  },
  {
    id: "ord-1004",
    customerName: "Bruce Wayne",
    customerEmail: "bruce@waynecorp.com",
    amount: 2398,
    subtotal: 2398,
    shippingCost: 0,
    status: "Pending",
    paymentStatus: "Pending",
    paymentMethod: "Credit Card",
    transactionId: "txn_9081726354",
    paymentDate: "2026-06-16",
    date: "2026-06-16",
    shippingAddress: {
      street: "1007 Mountain Drive",
      city: "Gotham City",
      state: "NJ",
      zip: "07001",
      country: "USA"
    },
    billingAddress: {
      street: "1007 Mountain Drive",
      city: "Gotham City",
      state: "NJ",
      zip: "07001",
      country: "USA"
    },
    items: [
      { productName: "iPhone 15 Pro Max", quantity: 2, price: 1199, thumbnail: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'><rect width='100' height='100' fill='%236366f1'/></svg>" }
    ],
  },
  {
    id: "ord-1005",
    customerName: "Peter Parker",
    customerEmail: "peter@dailybugle.com",
    amount: 150,
    subtotal: 130,
    shippingCost: 20,
    status: "Cancelled",
    paymentStatus: "Failed",
    paymentMethod: "PayPal",
    transactionId: "txn_7766554433",
    paymentDate: "2026-06-10",
    date: "2026-06-10",
    shippingAddress: {
      street: "20 Ingram Street",
      city: "Forest Hills, Queens",
      state: "NY",
      zip: "11375",
      country: "USA"
    },
    billingAddress: {
      street: "20 Ingram Street",
      city: "Forest Hills, Queens",
      state: "NY",
      zip: "11375",
      country: "USA"
    },
    items: [
      { productName: "Ultra Running Shoes", quantity: 1, price: 150, thumbnail: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23ec4899'/></svg>" }
    ],
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
  { id: "part-1", logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40' viewBox='0 0 100 40'><rect width='100' height='40' fill='%23e2e8f0' rx='5'/><text x='50' y='25' font-family='sans-serif' font-weight='bold' font-size='12' fill='%23475569' text-anchor='middle'>Stripe</text></svg>", name: "Stripe", website: "https://stripe.com", status: "Active", createdAt: "2026-06-10" },
  { id: "part-2", logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40' viewBox='0 0 100 40'><rect width='100' height='40' fill='%23e2e8f0' rx='5'/><text x='50' y='25' font-family='sans-serif' font-weight='bold' font-size='12' fill='%23475569' text-anchor='middle'>FedEx</text></svg>", name: "FedEx", website: "https://fedex.com", status: "Active", createdAt: "2026-06-11" },
  { id: "part-3", logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40' viewBox='0 0 100 40'><rect width='100' height='40' fill='%23e2e8f0' rx='5'/><text x='50' y='25' font-family='sans-serif' font-weight='bold' font-size='12' fill='%23475569' text-anchor='middle'>Shopify</text></svg>", name: "Shopify", website: "https://shopify.com", status: "Active", createdAt: "2026-06-12" },
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

export const initialAttributes: Attribute[] = [
  { id: "attr-1", name: "Color", values: ["Red", "Green", "Blue", "Yellow", "Black"], status: "Active", createdDate: "2026-06-10" },
  { id: "attr-2", name: "Size", values: ["S", "M", "L", "XL", "XXL"], status: "Active", createdDate: "2026-06-11" },
  { id: "attr-3", name: "Material", values: ["Cotton", "Polyester", "Wool", "Leather", "Silk"], status: "Active", createdDate: "2026-06-12" },
  { id: "attr-4", name: "Brand", values: ["Nike", "Adidas", "Puma", "Apple", "Samsung"], status: "Active", createdDate: "2026-06-13" },
];
