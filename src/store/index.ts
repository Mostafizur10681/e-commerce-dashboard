import { create } from "zustand";
import { Product, Category, Order, Customer, Review, Partner, Banner, User, Settings, OrderStatus } from "../types";
import {
  initialProducts,
  initialCategories,
  initialOrders,
  initialCustomers,
  initialReviews,
  initialPartners,
  initialBanners,
  initialUsers,
  initialSettings,
} from "../data/mockData";

interface StoreState {
  // Data State
  currentUser: User | null;
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  reviews: Review[];
  partners: Partner[];
  banners: Banner[];
  users: User[];
  settings: Settings;
  isHydrated: boolean;

  // Hydration & Auth Actions
  hydrate: () => void;
  login: (email: string) => boolean;
  register: (name: string, email: string) => boolean;
  logout: () => void;

  // Products CRUD
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Categories CRUD
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Orders Actions
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  addOrder: (order: Omit<Order, "id" | "date">) => void;

  // Customers CRUD
  addCustomer: (customer: Omit<Customer, "id" | "joinedDate">) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Reviews Actions
  approveReview: (id: string) => void;
  deleteReview: (id: string) => void;

  // Partners CRUD
  addPartner: (partner: Omit<Partner, "id">) => void;
  updatePartner: (id: string, partner: Partial<Partner>) => void;
  deletePartner: (id: string) => void;

  // Banners CRUD
  addBanner: (banner: Omit<Banner, "id">) => void;
  updateBanner: (id: string, banner: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;

  // Users Actions
  updateUserRole: (id: string, role: "Admin" | "Customer") => void;
  deleteUser: (id: string) => void;

  // Settings Actions
  updateSettings: (settings: Partial<Settings>) => void;
}

const saveToLocalStorage = (key: string, data: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

const getFromLocalStorage = (key: string, defaultValue: any) => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }
  return defaultValue;
};

export const useStore = create<StoreState>((set, get) => ({
  currentUser: null,
  products: initialProducts,
  categories: initialCategories,
  orders: initialOrders,
  customers: initialCustomers,
  reviews: initialReviews,
  partners: initialPartners,
  banners: initialBanners,
  users: initialUsers,
  settings: initialSettings,
  isHydrated: false,

  hydrate: () => {
    if (typeof window === "undefined" || get().isHydrated) return;

    const currentUser = getFromLocalStorage("df_currentUser", null);
    const products = getFromLocalStorage("df_products", initialProducts);
    const categories = getFromLocalStorage("df_categories", initialCategories);
    const orders = getFromLocalStorage("df_orders", initialOrders);
    const customers = getFromLocalStorage("df_customers", initialCustomers);
    const reviews = getFromLocalStorage("df_reviews", initialReviews);
    const partners = getFromLocalStorage("df_partners", initialPartners);
    const banners = getFromLocalStorage("df_banners", initialBanners);
    const users = getFromLocalStorage("df_users", initialUsers);
    const settings = getFromLocalStorage("df_settings", initialSettings);

    set({
      currentUser,
      products,
      categories,
      orders,
      customers,
      reviews,
      partners,
      banners,
      users,
      settings,
      isHydrated: true,
    });
  },

  login: (email: string) => {
    const users = get().users;
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.role === "Admin") {
      set({ currentUser: user });
      saveToLocalStorage("df_currentUser", user);
      return true;
    }
    // For testing/mock convenience, if user doesn't exist, create an admin account for them
    if (email.includes("@")) {
      const name = email.split("@")[0];
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: email,
        role: "Admin",
      };
      const updatedUsers = [...users, newUser];
      set({ currentUser: newUser, users: updatedUsers });
      saveToLocalStorage("df_currentUser", newUser);
      saveToLocalStorage("df_users", updatedUsers);
      return true;
    }
    return false;
  },

  register: (name: string, email: string) => {
    const users = get().users;
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      if (existing.role === "Admin") {
        set({ currentUser: existing });
        saveToLocalStorage("df_currentUser", existing);
        return true;
      }
      return false;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: "Admin", // Automatically assign Admin role for this demo
    };

    const updatedUsers = [...users, newUser];
    set({ currentUser: newUser, users: updatedUsers });
    saveToLocalStorage("df_currentUser", newUser);
    saveToLocalStorage("df_users", updatedUsers);
    return true;
  },

  logout: () => {
    set({ currentUser: null });
    if (typeof window !== "undefined") {
      localStorage.removeItem("df_currentUser");
    }
  },

  // Products CRUD
  addProduct: (product) => {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
    };
    const updated = [newProduct, ...get().products];
    set({ products: updated });
    saveToLocalStorage("df_products", updated);
  },

  updateProduct: (id, data) => {
    const updated = get().products.map((p) => (p.id === id ? { ...p, ...data } : p));
    set({ products: updated });
    saveToLocalStorage("df_products", updated);
  },

  deleteProduct: (id) => {
    const updated = get().products.filter((p) => p.id !== id);
    set({ products: updated });
    saveToLocalStorage("df_products", updated);
  },

  // Categories CRUD
  addCategory: (category) => {
    const newCategory: Category = {
      ...category,
      id: `cat-${Date.now()}`,
    };
    const updated = [...get().categories, newCategory];
    set({ categories: updated });
    saveToLocalStorage("df_categories", updated);
  },

  updateCategory: (id, data) => {
    const updated = get().categories.map((c) => (c.id === id ? { ...c, ...data } : c));
    set({ categories: updated });
    saveToLocalStorage("df_categories", updated);
  },

  deleteCategory: (id) => {
    const updated = get().categories.filter((c) => c.id !== id);
    set({ categories: updated });
    saveToLocalStorage("df_categories", updated);
  },

  // Orders Actions
  updateOrderStatus: (id, status) => {
    const updated = get().orders.map((o) => (o.id === id ? { ...o, status } : o));
    set({ orders: updated });
    saveToLocalStorage("df_orders", updated);
  },

  addOrder: (order) => {
    const newOrder: Order = {
      ...order,
      id: `ord-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split("T")[0],
    };
    const updated = [newOrder, ...get().orders];
    set({ orders: updated });
    saveToLocalStorage("df_orders", updated);
  },

  // Customers CRUD
  addCustomer: (customer) => {
    const newCustomer: Customer = {
      ...customer,
      id: `cust-${Date.now()}`,
      joinedDate: new Date().toISOString().split("T")[0],
    };
    const updated = [newCustomer, ...get().customers];
    set({ customers: updated });
    saveToLocalStorage("df_customers", updated);
  },

  updateCustomer: (id, data) => {
    const updated = get().customers.map((c) => (c.id === id ? { ...c, ...data } : c));
    set({ customers: updated });
    saveToLocalStorage("df_customers", updated);
  },

  deleteCustomer: (id) => {
    const updated = get().customers.filter((c) => c.id !== id);
    set({ customers: updated });
    saveToLocalStorage("df_customers", updated);
  },

  // Reviews Actions
  approveReview: (id) => {
    const updated = get().reviews.map((r) => (r.id === id ? { ...r, approved: true } : r));
    set({ reviews: updated });
    saveToLocalStorage("df_reviews", updated);
  },

  deleteReview: (id) => {
    const updated = get().reviews.filter((r) => r.id !== id);
    set({ reviews: updated });
    saveToLocalStorage("df_reviews", updated);
  },

  // Partners CRUD
  addPartner: (partner) => {
    const newPartner: Partner = {
      ...partner,
      id: `part-${Date.now()}`,
    };
    const updated = [...get().partners, newPartner];
    set({ partners: updated });
    saveToLocalStorage("df_partners", updated);
  },

  updatePartner: (id, data) => {
    const updated = get().partners.map((p) => (p.id === id ? { ...p, ...data } : p));
    set({ partners: updated });
    saveToLocalStorage("df_partners", updated);
  },

  deletePartner: (id) => {
    const updated = get().partners.filter((p) => p.id !== id);
    set({ partners: updated });
    saveToLocalStorage("df_partners", updated);
  },

  // Banners CRUD
  addBanner: (banner) => {
    const newBanner: Banner = {
      ...banner,
      id: `ban-${Date.now()}`,
    };
    const updated = [...get().banners, newBanner];
    set({ banners: updated });
    saveToLocalStorage("df_banners", updated);
  },

  updateBanner: (id, data) => {
    const updated = get().banners.map((b) => (b.id === id ? { ...b, ...data } : b));
    set({ banners: updated });
    saveToLocalStorage("df_banners", updated);
  },

  deleteBanner: (id) => {
    const updated = get().banners.filter((b) => b.id !== id);
    set({ banners: updated });
    saveToLocalStorage("df_banners", updated);
  },

  // Users Actions
  updateUserRole: (id, role) => {
    const updated = get().users.map((u) => (u.id === id ? { ...u, role } : u));
    set({ users: updated });
    saveToLocalStorage("df_users", updated);
  },

  deleteUser: (id) => {
    const updated = get().users.filter((u) => u.id !== id);
    set({ users: updated });
    saveToLocalStorage("df_users", updated);
  },

  // Settings Actions
  updateSettings: (data) => {
    const updated = { ...get().settings, ...data };
    set({ settings: updated });
    saveToLocalStorage("df_settings", updated);
  },
}));
