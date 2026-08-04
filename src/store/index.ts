import { create } from "zustand";
import { Product, Category, Order, Customer, Review, Partner, Banner, User, Settings, OrderStatus, Attribute, ContactMessage, FAQ } from "../types";
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
  initialAttributes,
} from "../data/mockData";

interface StoreState {
  // Data State
  currentUser: User | null;
  products: Product[];
  categories: Category[];
  attributes: Attribute[];
  orders: Order[];
  customers: Customer[];
  reviews: Review[];
  partners: Partner[];
  banners: Banner[];
  users: User[];
  settings: Settings;
  messages: ContactMessage[];
  faqs: FAQ[];
  isHydrated: boolean;

  // Hydration & Auth Actions
  hydrate: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string, password_confirmation?: string, phone?: string) => Promise<boolean>;
  logout: () => void;

  // Products CRUD
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Categories CRUD
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Attributes CRUD
  addAttribute: (attribute: Omit<Attribute, "id">) => void;
  updateAttribute: (id: string, attribute: Partial<Attribute>) => void;
  deleteAttribute: (id: string) => void;

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
  fetchPartners: () => Promise<void>;
  addPartner: (partner: Omit<Partner, "id">) => Promise<boolean>;
  updatePartner: (id: string, partner: Partial<Partner>) => Promise<boolean>;
  deletePartner: (id: string) => Promise<boolean>;
  getPartnerById: (id: string) => Partner | undefined;

  // Banners CRUD
  addBanner: (banner: Omit<Banner, "id">) => void;
  updateBanner: (id: string, banner: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;

  // Users Actions
  updateUserRole: (id: string, role: "Admin" | "Customer") => void;
  deleteUser: (id: string) => void;

  // Settings Actions
  updateSettings: (settings: Partial<Settings>) => void;

  // Messages Actions
  addMessage: (message: Omit<ContactMessage, "id" | "createdAt">) => void;
  updateMessageStatus: (id: string, status: "Unread" | "Read" | "Replied") => void;
  deleteMessage: (id: string) => void;
  markAllMessagesAsRead: () => void;
  setMessages: (messages: ContactMessage[]) => void;

  // FAQs Actions
  addFaq: (faq: Omit<FAQ, "id" | "createdAt" | "updatedAt">) => void;
  updateFaq: (id: string, faq: Partial<FAQ>) => void;
  deleteFaq: (id: string) => void;
  getFaqById: (id: string) => FAQ | undefined;
  getActiveFaqs: () => FAQ[];
  setFaqs: (faqs: FAQ[]) => void;
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
  attributes: initialAttributes,
  orders: initialOrders,
  customers: initialCustomers,
  reviews: initialReviews,
  partners: initialPartners,
  banners: initialBanners,
  users: initialUsers,
  settings: initialSettings,
  messages: [],
  faqs: [],
  isHydrated: false,

  hydrate: () => {
    if (typeof window === "undefined" || get().isHydrated) return;

    const currentUser = getFromLocalStorage("df_currentUser", null);
    const products = getFromLocalStorage("df_products", initialProducts);
    const categories = getFromLocalStorage("df_categories", initialCategories);
    const attributes = getFromLocalStorage("df_attributes", initialAttributes);
    const orders = getFromLocalStorage("df_orders", initialOrders);
    const customers = getFromLocalStorage("df_customers", initialCustomers);
    const reviews = getFromLocalStorage("df_reviews", initialReviews);
    const partners = getFromLocalStorage("df_partners", initialPartners);
    const banners = getFromLocalStorage("df_banners", initialBanners);
    const users = getFromLocalStorage("df_users", initialUsers);
    const settings = getFromLocalStorage("df_settings", initialSettings);
    const messages = getFromLocalStorage("df_messages", []);
    const faqs = getFromLocalStorage("df_faqs", []);

    set({
      currentUser,
      products,
      categories,
      attributes,
      orders,
      customers,
      reviews,
      partners,
      banners,
      users,
      settings,
      messages,
      faqs,
      isHydrated: true,
    });
  },

  login: async (email: string, password?: string) => {
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000") + "/api/v1/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.errors?.status?.[0] || errorData.errors?.email?.[0] || errorData.message || "Invalid login credentials";
        return { success: false, error: errorMessage };
      }
      const data = await res.json();
      if (data.success && data.data && data.data.user) {
        const backendUser = data.data.user;
        const mappedUser: User = {
          id: String(backendUser.id),
          name: backendUser.name,
          email: backendUser.email,
          role: backendUser.role === 'admin' ? 'Admin' : 'Customer',
          status: backendUser.status,
        };
        if (mappedUser.status === 'pending') {
          return { success: false, error: "Your account is pending admin approval." };
        }
        if (mappedUser.status === 'blocked') {
          return { success: false, error: "Your account has been blocked." };
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("df_access_token", data.data.access_token);
        }
        set({ currentUser: mappedUser });
        saveToLocalStorage("df_currentUser", mappedUser);
        return { success: true };
      }
      return { success: false, error: "Invalid login credentials" };
    } catch (error: any) {
      console.error("Login API Error:", error);
      return { success: false, error: error.message || "An unexpected error occurred. Please try again." };
    }
  },

  register: async (name: string, email: string, password?: string, password_confirmation?: string, phone?: string) => {
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000") + "/api/v1/auth/admin/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation,
          phone,
        }),
      });
      if (!res.ok) {
        return false;
      }
      const data = await res.json();
      if (data.success && data.data && data.data.user) {
        const backendUser = data.data.user;
        const mappedUser: User = {
          id: String(backendUser.id),
          name: backendUser.name,
          email: backendUser.email,
          role: backendUser.role === 'admin' ? 'Admin' : 'Customer',
          status: backendUser.status,
        };
        if (mappedUser.status === 'pending') {
          return true;
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("df_access_token", data.data.access_token);
        }
        set({ currentUser: mappedUser });
        saveToLocalStorage("df_currentUser", mappedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Register API Error:", error);
      return false;
    }
  },

  logout: () => {
    set({ currentUser: null });
    if (typeof window !== "undefined") {
      localStorage.removeItem("df_currentUser");
      localStorage.removeItem("df_access_token");
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

  // Attributes CRUD
  addAttribute: (attribute) => {
    const newAttribute: Attribute = {
      ...attribute,
      id: `attr-${Date.now()}`,
    };
    const updated = [...get().attributes, newAttribute];
    set({ attributes: updated });
    saveToLocalStorage("df_attributes", updated);
  },

  updateAttribute: (id, data) => {
    const updated = get().attributes.map((a) => (a.id === id ? { ...a, ...data } : a));
    set({ attributes: updated });
    saveToLocalStorage("df_attributes", updated);
  },

  deleteAttribute: (id) => {
    const updated = get().attributes.filter((a) => a.id !== id);
    set({ attributes: updated });
    saveToLocalStorage("df_attributes", updated);
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
  fetchPartners: async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch("/api/partners", {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        set({ partners: data.partners || [] });
        saveToLocalStorage("df_partners", data.partners || []);
      }
    } catch (error) {
      console.error("fetchPartners error:", error);
    }
  },

  addPartner: async (partner) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(partner),
      });
      if (res.ok) {
        const newPartner = await res.json();
        const updated = [...get().partners, newPartner];
        set({ partners: updated });
        saveToLocalStorage("df_partners", updated);
        return true;
      }
      return false;
    } catch (error) {
      console.error("addPartner error:", error);
      return false;
    }
  },

  updatePartner: async (id, data) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/partners/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updatedPartner = await res.json();
        const updated = get().partners.map((p) => (p.id === id ? updatedPartner : p));
        set({ partners: updated });
        saveToLocalStorage("df_partners", updated);
        return true;
      }
      return false;
    } catch (error) {
      console.error("updatePartner error:", error);
      return false;
    }
  },

  deletePartner: async (id) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/partners/${id}`, {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const updated = get().partners.filter((p) => p.id !== id);
        set({ partners: updated });
        saveToLocalStorage("df_partners", updated);
        return true;
      }
      return false;
    } catch (error) {
      console.error("deletePartner error:", error);
      return false;
    }
  },

  getPartnerById: (id) => {
    return get().partners.find((p) => p.id === id);
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

  // Messages Actions
  addMessage: (message) => {
    const newMsg: ContactMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newMsg, ...get().messages];
    set({ messages: updated });
    saveToLocalStorage("df_messages", updated);
  },

  updateMessageStatus: (id, status) => {
    const updated = get().messages.map((m) => (m.id === id ? { ...m, status } : m));
    set({ messages: updated });
    saveToLocalStorage("df_messages", updated);
  },

  deleteMessage: (id) => {
    const updated = get().messages.filter((m) => m.id !== id);
    set({ messages: updated });
    saveToLocalStorage("df_messages", updated);
  },

  markAllMessagesAsRead: () => {
    const updated = get().messages.map((m) => m.status === "Unread" ? { ...m, status: "Read" as const } : m);
    set({ messages: updated });
    saveToLocalStorage("df_messages", updated);
  },

  setMessages: (messages) => {
    set({ messages });
    saveToLocalStorage("df_messages", messages);
  },

  // FAQs Actions
  addFaq: (faq) => {
    const newFaq: FAQ = {
      ...faq,
      id: `faq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...get().faqs, newFaq].sort((a, b) => a.displayOrder - b.displayOrder);
    set({ faqs: updated });
    saveToLocalStorage("df_faqs", updated);
  },

  updateFaq: (id, data) => {
    const updated = get().faqs.map((f) =>
      f.id === id
        ? { ...f, ...data, updatedAt: new Date().toISOString() }
        : f
    ).sort((a, b) => a.displayOrder - b.displayOrder);
    set({ faqs: updated });
    saveToLocalStorage("df_faqs", updated);
  },

  deleteFaq: (id) => {
    const updated = get().faqs.filter((f) => f.id !== id);
    set({ faqs: updated });
    saveToLocalStorage("df_faqs", updated);
  },

  getFaqById: (id) => {
    return get().faqs.find((f) => f.id === id);
  },

  getActiveFaqs: () => {
    return get().faqs.filter((f) => f.status === "active");
  },

  setFaqs: (faqs) => {
    const sorted = [...faqs].sort((a, b) => a.displayOrder - b.displayOrder);
    set({ faqs: sorted });
    saveToLocalStorage("df_faqs", sorted);
  },
}));
