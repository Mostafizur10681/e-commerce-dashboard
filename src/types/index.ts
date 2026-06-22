export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  images: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  status?: "Active" | "Inactive";
  createdDate?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export type PaymentStatus = "Paid" | "Pending" | "Failed" | "Refunded";

export interface Order {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerAvatar?: string;
  amount: number; // total
  subtotal?: number;
  shippingCost?: number;
  status: OrderStatus | "Returned";
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  paymentDate?: string;
  date: string; // Order Date
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: { productName: string; quantity: number; price: number; thumbnail?: string }[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  joinedDate: string;
  status?: "Active" | "Inactive";
}

export interface Review {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
  status?: "Approved" | "Pending" | "Rejected";
  imageUrl?: string;
}

export interface Partner {
  id: string;
  name: string;
  website: string;
  logo: string;
  image?: string;
  description?: string;
  status?: "Active" | "Inactive" | "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Customer";
}

export interface Settings {
  siteName: string;
  logo: string;
  email: string;
  phone: string;
  address: string;
  theme: "light" | "dark" | "system";
}

export interface Attribute {
  id: string;
  name: string;
  values: string[];
  status?: "Active" | "Inactive";
  createdDate?: string;
}

export interface Subscription {
  id: string;
  name: string;
  email: string;
  status: "Active" | "Subscribed" | "Unsubscribed" | "Pending" | "Expired" | "Cancelled";
  source: "Website" | "Checkout" | "Newsletter Popup" | "Manual";
  subscriptionDate: string;
  lastActivity: string;
  notes?: string;
  activityHistory?: { date: string; action: string }[];
  plan?: string;
  startDate?: string;
  endDate?: string;
  autoRenew?: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "Unread" | "Read" | "Replied";
  adminNote?: string;
  createdAt: string;
}

