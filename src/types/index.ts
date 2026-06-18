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

export interface Order {
  id: string;
  customerName: string;
  amount: number;
  status: OrderStatus;
  date: string;
  items: { productName: string; quantity: number; price: number }[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  joinedDate: string;
}

export interface Review {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
}

export interface Partner {
  id: string;
  logo: string;
  name: string;
  website: string;
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
