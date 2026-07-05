"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Package,
  Layers,
  ClipboardList,
  Users,
  MessageSquare,
  Mail,
  Star,
  Handshake,
  Image as ImageIcon,
  UserCog,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Sun,
  Moon,
  Monitor,
  User,
  Sparkles,
  Sliders,
  ChevronDown,
  HelpCircle,
  MapPin
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import useSWR, { mutate } from "swr";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ToastProvider } from "@/components/ui/toast";

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const currentUser = useStore((state) => state.currentUser);
  const logout = useStore((state) => state.logout);
  const settings = useStore((state) => state.settings);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isAttributesOpen, setIsAttributesOpen] = useState(true);
  const [isPartnersOpen, setIsPartnersOpen] = useState(true);
  const [isReviewsOpen, setIsReviewsOpen] = useState(true);
  const [isFaqsOpen, setIsFaqsOpen] = useState(true);
  const [isLocationsOpen, setIsLocationsOpen] = useState(true);

  useEffect(() => {
    if (pathname.startsWith("/admin/products")) {
      setIsProductOpen(true);
    }
    if (pathname.startsWith("/admin/categories")) {
      setIsCategoryOpen(true);
    }
    if (pathname.startsWith("/admin/attributes")) {
      setIsAttributesOpen(true);
    }
    if (pathname.startsWith("/admin/partners")) {
      setIsPartnersOpen(true);
    }
    if (pathname.startsWith("/admin/faqs") || pathname.startsWith("/admin/faq-categories")) {
      setIsFaqsOpen(true);
    }
    if (pathname.startsWith("/admin/locations")) {
      setIsLocationsOpen(true);
    }
  }, [pathname]);

  // Sync with client-side only parameters to avoid hydration warnings
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch messages via SWR for notification dropdown
  const { data: messagesData } = useSWR(
    mounted ? "/api/messages?limit=5" : null,
    fetcher,
    { refreshInterval: 5000 }
  );
  const unreadMessagesCount = messagesData?.stats?.unread || 0;
  const latestMessages = messagesData?.data || [];

  const menuItems: MenuItem[] = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Categories", href: "/admin/categories", icon: Layers },
    { name: "Orders", href: "/admin/orders", icon: ClipboardList },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Partners", href: "/admin/partners", icon: Handshake },
    { name: "FAQs", href: "/admin/faqs", icon: HelpCircle },
    { name: "FAQ Categories", href: "/admin/faq-categories", icon: Layers },
    { name: "Subscriptions", href: "/admin/subscriptions", icon: Package },
    { name: "Banners", href: "/admin/banners", icon: ImageIcon },
    { name: "Users", href: "/admin/users", icon: UserCog },
    { name: "Settings", href: "/admin/settings", icon: SettingsIcon },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleMessageClick = async (msg: any) => {
    if (msg.status === "Unread") {
      try {
        await fetch(`/api/messages/${msg.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Read" }),
        });
        useStore.getState().updateMessageStatus(msg.id, "Read");
        mutate("/api/messages?limit=5");
      } catch (err) {
        console.error("Failed to mark message as read:", err);
      }
    }
    router.push(`/admin/messages?id=${msg.id}`);
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch("/api/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllAsRead" }),
      });
      if (res.ok) {
        useStore.getState().markAllMessagesAsRead();
        mutate("/api/messages?limit=5");
      }
    } catch (err) {
      console.error("Failed to mark all messages as read:", err);
    }
  };

  useEffect(() => {
    if (messagesData?.data) {
      useStore.getState().setMessages(messagesData.data);
    }
  }, [messagesData]);

  const SidebarContent = ({ className, isCollapsed }: { className?: string; isCollapsed?: boolean }) => {
    return (
      <div className={cn("flex flex-col h-full bg-white text-gray-900 dark:bg-gray-900 dark:text-white", className)}>
        {/* Sidebar Header Logo */}
        <div className={cn("flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-800", isCollapsed ? "justify-center" : "justify-between")}>
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
              <Sparkles className="h-5 w-5" />
            </div>
            {!isCollapsed && <span className="tracking-tight text-gray-900 dark:text-white">{settings.siteName || "DataFlow"}</span>}
          </Link>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {/* Dashboard (First item) */}
          {(() => {
            const dashboardItem = menuItems.find(m => m.name === "Dashboard");
            if (!dashboardItem) return null;
            const Icon = dashboardItem.icon;
            const isActive = pathname === dashboardItem.href;
            return (
              <Link
                href={dashboardItem.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/15"
                    : "text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary",
                  isCollapsed && "justify-center px-2"
                )}
                title={dashboardItem.name}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-gray-500 dark:text-gray-400")} />
                {!isCollapsed && <span>{dashboardItem.name}</span>}
              </Link>
            );
          })()}

          {/* Collapsible Product Menu */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (isCollapsed) {
                  setIsSidebarCollapsed(false);
                  setIsProductOpen(true);
                } else {
                  setIsProductOpen(!isProductOpen);
                }
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary cursor-pointer",
                pathname.startsWith("/admin/products") && "bg-gray-50 dark:bg-gray-800/40 text-primary font-semibold",
                isCollapsed && "justify-center px-2"
              )}
              title="Product"
            >
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 shrink-0 text-gray-500 dark:text-gray-405" />
                {!isCollapsed && <span>Product</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-gray-400 transition-transform duration-300",
                    isProductOpen && "rotate-180"
                  )}
                />
              )}
            </button>

            {/* Submenus (Only visible if not collapsed and isProductOpen is true) */}
            {!isCollapsed && isProductOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1 transition-all duration-300">
                <Link
                  href="/admin/products"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 border-l-4",
                    pathname === "/admin/products"
                      ? "bg-green-50 dark:bg-green-950/20 text-[#16A34A] font-semibold border-[#16A34A]"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-primary border-transparent pl-4"
                  )}
                >
                  <span className="mr-1.5 font-bold">○</span>
                  All Products
                </Link>
                <Link
                  href="/admin/products/add"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 border-l-4",
                    pathname === "/admin/products/add"
                      ? "bg-green-50 dark:bg-green-950/20 text-[#16A34A] font-semibold border-[#16A34A]"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-primary border-transparent pl-4"
                  )}
                >
                  <span className="mr-1.5 font-bold">○</span>
                  Add Product
                </Link>
              </div>
            )}
          </div>

          {/* Collapsible Category Menu */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (isCollapsed) {
                  setIsSidebarCollapsed(false);
                  setIsCategoryOpen(true);
                } else {
                  setIsCategoryOpen(!isCategoryOpen);
                }
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary cursor-pointer",
                pathname.startsWith("/admin/categories") && "bg-gray-50 dark:bg-gray-800/40 text-primary font-semibold",
                isCollapsed && "justify-center px-2"
              )}
              title="Category"
            >
              <div className="flex items-center gap-3">
                <Layers className="h-5 w-5 shrink-0 text-gray-500 dark:text-gray-400" />
                {!isCollapsed && <span>Category</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-gray-400 transition-transform duration-300",
                    isCategoryOpen && "rotate-180"
                  )}
                />
              )}
            </button>

            {/* Submenus (Only visible if not collapsed and isCategoryOpen is true) */}
            {!isCollapsed && isCategoryOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1 transition-all duration-300">
                <Link
                  href="/admin/categories"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 border-l-4",
                    pathname === "/admin/categories"
                      ? "bg-green-50 dark:bg-green-950/20 text-[#16A34A] font-semibold border-[#16A34A]"
                      : "text-gray-505 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-primary border-transparent pl-4"
                  )}
                >
                  <span className="mr-1.5 font-bold">○</span>
                  Category List
                </Link>
                <Link
                  href="/admin/categories/add"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 border-l-4",
                    pathname === "/admin/categories/add"
                      ? "bg-green-50 dark:bg-green-950/20 text-[#16A34A] font-semibold border-[#16A34A]"
                      : "text-gray-505 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-primary border-transparent pl-4"
                  )}
                >
                  <span className="mr-1.5 font-bold">○</span>
                  Add Category
                </Link>
              </div>
            )}
          </div>

          {/* Collapsible Attributes Menu */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (isCollapsed) {
                  setIsSidebarCollapsed(false);
                  setIsAttributesOpen(true);
                } else {
                  setIsAttributesOpen(!isAttributesOpen);
                }
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary cursor-pointer",
                pathname.startsWith("/admin/attributes") && "bg-gray-50 dark:bg-gray-800/40 text-primary font-semibold",
                isCollapsed && "justify-center px-2"
              )}
              title="Attributes"
            >
              <div className="flex items-center gap-3">
                <Sliders className="h-5 w-5 shrink-0 text-gray-500 dark:text-gray-405" />
                {!isCollapsed && <span>Attributes</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-gray-400 transition-transform duration-300",
                    isAttributesOpen && "rotate-180"
                  )}
                />
              )}
            </button>

            {/* Submenus (Only visible if not collapsed and isAttributesOpen is true) */}
            {!isCollapsed && isAttributesOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1 transition-all duration-300">
                <Link
                  href="/admin/attributes"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 border-l-4",
                    pathname === "/admin/attributes"
                      ? "bg-green-50 dark:bg-green-950/20 text-[#16A34A] font-semibold border-[#16A34A]"
                      : "text-gray-505 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-primary border-transparent pl-4"
                  )}
                >
                  <span className="mr-1.5 font-bold">○</span>
                  Attributes
                </Link>
                <Link
                  href="/admin/attributes/add"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 border-l-4",
                    pathname === "/admin/attributes/add"
                      ? "bg-green-50 dark:bg-green-950/20 text-[#16A34A] font-semibold border-[#16A34A]"
                      : "text-gray-505 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-primary border-transparent pl-4"
                  )}
                >
                  <span className="mr-1.5 font-bold">○</span>
                  Add Attributes
                </Link>
              </div>
            )}
          </div>

          {/* Collapsible Partners Menu */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (isCollapsed) {
                  setIsSidebarCollapsed(false);
                  setIsPartnersOpen(true);
                } else {
                  setIsPartnersOpen(!isPartnersOpen);
                }
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary cursor-pointer",
                pathname.startsWith("/admin/partners") && "bg-gray-50 dark:bg-gray-800/40 text-primary font-semibold",
                isCollapsed && "justify-center px-2"
              )}
              title="Partners"
            >
              <div className="flex items-center gap-3">
                <Handshake className="h-5 w-5 shrink-0 text-gray-500 dark:text-gray-400" />
                {!isCollapsed && <span>Partners</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-gray-400 transition-transform duration-300",
                    isPartnersOpen && "rotate-180"
                  )}
                />
              )}
            </button>

            {/* Submenus (Only visible if not collapsed and isPartnersOpen is true) */}
            {!isCollapsed && isPartnersOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1 transition-all duration-300">
                <Link
                  href="/admin/partners"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 border-l-4",
                    pathname === "/admin/partners"
                      ? "bg-green-50 dark:bg-green-950/20 text-[#16A34A] font-semibold border-[#16A34A]"
                      : "text-gray-505 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-primary border-transparent pl-4"
                  )}
                >
                  <span className="mr-1.5 font-bold">○</span>
                  Partner List
                </Link>
                <Link
                  href="/admin/partners/add"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 border-l-4",
                    pathname === "/admin/partners/add"
                      ? "bg-green-50 dark:bg-green-950/20 text-[#16A34A] font-semibold border-[#16A34A]"
                      : "text-gray-505 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-primary border-transparent pl-4"
                  )}
                >
                  <span className="mr-1.5 font-bold">○</span>
                  Add Partner
                </Link>
              </div>
            )}
          </div>

          {/* Collapsible Reviews Menu */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (isCollapsed) {
                  setIsSidebarCollapsed(false);
                  setIsReviewsOpen(true);
                } else {
                  setIsReviewsOpen(!isReviewsOpen);
                }
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary cursor-pointer",
                pathname.startsWith("/admin/reviews") && "bg-gray-50 dark:bg-gray-800/40 text-primary font-semibold",
                isCollapsed && "justify-center px-2"
              )}
              title="Reviews"
            >
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 shrink-0 text-gray-500 dark:text-gray-400" />
                {!isCollapsed && <span>Reviews</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-gray-400 transition-transform duration-300",
                    isReviewsOpen && "rotate-180"
                  )}
                />
              )}
            </button>

            {/* Submenus (Only visible if not collapsed and isReviewsOpen is true) */}
            {!isCollapsed && isReviewsOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1 transition-all duration-300">
                <Link
                  href="/admin/reviews"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 border-l-4",
                    pathname === "/admin/reviews"
                      ? "bg-green-50 dark:bg-green-950/20 text-[#16A34A] font-semibold border-[#16A34A]"
                      : "text-gray-505 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-primary border-transparent pl-4"
                  )}
                >
                  <span className="mr-1.5 font-bold">○</span>
                  Reviews List
                </Link>
                <Link
                  href="/admin/reviews/add"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 border-l-4",
                    pathname === "/admin/reviews/add"
                      ? "bg-green-50 dark:bg-green-950/20 text-[#16A34A] font-semibold border-[#16A34A]"
                      : "text-gray-505 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-primary border-transparent pl-4"
                  )}
                >
                  <span className="mr-1.5 font-bold">○</span>
                  Add Review
                </Link>
              </div>
            )}
          </div>

          {/* Collapsible FAQs Menu */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (isCollapsed) {
                  setIsSidebarCollapsed(false);
                  setIsFaqsOpen(true);
                } else {
                  setIsFaqsOpen(!isFaqsOpen);
                }
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary cursor-pointer",
                (pathname.startsWith("/admin/faqs") || pathname.startsWith("/admin/faq-categories")) && "bg-gray-50 dark:bg-gray-800/40 text-primary font-semibold",
                isCollapsed && "justify-center px-2"
              )}
              title="FAQs"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 shrink-0 text-gray-500 dark:text-gray-400" />
                {!isCollapsed && <span>FAQs</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-gray-400 transition-transform duration-300",
                    isFaqsOpen && "rotate-180"
                  )}
                />
              )}
            </button>

            {/* Submenus (Only visible if not collapsed and isFaqsOpen is true) */}
            {!isCollapsed && isFaqsOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1 transition-all duration-300">
                <Link
                  href="/admin/faq-categories"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 border-l-4",
                    pathname === "/admin/faq-categories"
                      ? "bg-green-50 dark:bg-green-950/20 text-[#16A34A] font-semibold border-[#16A34A]"
                      : "text-gray-505 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-primary border-transparent pl-4"
                  )}
                >
                  <span className="mr-1.5 font-bold">○</span>
                  FAQ Category List
                </Link>
                <Link
                  href="/admin/faq-categories/add"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 border-l-4",
                    pathname === "/admin/faq-categories/add"
                      ? "bg-green-50 dark:bg-green-950/20 text-[#16A34A] font-semibold border-[#16A34A]"
                      : "text-gray-505 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-primary border-transparent pl-4"
                  )}
                >
                  <span className="mr-1.5 font-bold">○</span>
                  Add FAQ Category
                </Link>
                <Link
                  href="/admin/faqs"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 border-l-4",
                    pathname === "/admin/faqs"
                      ? "bg-green-50 dark:bg-green-950/20 text-[#16A34A] font-semibold border-[#16A34A]"
                      : "text-gray-555 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-primary border-transparent pl-4"
                  )}
                >
                  <span className="mr-1.5 font-bold">○</span>
                  FAQ List
                </Link>
                <Link
                  href="/admin/faqs/add"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 border-l-4",
                    pathname === "/admin/faqs/add"
                      ? "bg-green-50 dark:bg-green-950/20 text-[#16A34A] font-semibold border-[#16A34A]"
                      : "text-gray-505 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-primary border-transparent pl-4"
                  )}
                >
                  <span className="mr-1.5 font-bold">○</span>
                  Add FAQ
                </Link>
              </div>
            )}
          </div>

          {/* Collapsible Locations Menu */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (isCollapsed) {
                  setIsSidebarCollapsed(false);
                  setIsLocationsOpen(true);
                } else {
                  setIsLocationsOpen(!isLocationsOpen);
                }
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary cursor-pointer",
                pathname.startsWith("/admin/locations") && "bg-gray-50 dark:bg-gray-800/40 text-primary font-semibold",
                isCollapsed && "justify-center px-2"
              )}
              title="Locations"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-gray-550 dark:text-gray-400" />
                {!isCollapsed && <span>Locations</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-gray-400 transition-transform duration-300",
                    isLocationsOpen && "rotate-180"
                  )}
                />
              )}
            </button>

            {/* Submenus (Only visible if not collapsed and isLocationsOpen is true) */}
            {!isCollapsed && isLocationsOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1 transition-all duration-300">
                <Link
                  href="/admin/locations/divisions"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 border-l-4",
                    pathname.startsWith("/admin/locations/divisions")
                      ? "bg-green-50 dark:bg-green-950/20 text-[#16A34A] font-semibold border-[#16A34A]"
                      : "text-gray-505 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-primary border-transparent pl-4"
                  )}
                >
                  <span className="mr-1.5 font-bold">○</span>
                  Division
                </Link>
                <Link
                  href="/admin/locations/districts"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 border-l-4",
                    pathname.startsWith("/admin/locations/districts")
                      ? "bg-green-50 dark:bg-green-950/20 text-[#16A34A] font-semibold border-[#16A34A]"
                      : "text-gray-505 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-primary border-transparent pl-4"
                  )}
                >
                  <span className="mr-1.5 font-bold">○</span>
                  District
                </Link>
                <Link
                  href="/admin/locations/thanas"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 border-l-4",
                    pathname.startsWith("/admin/locations/thanas")
                      ? "bg-green-50 dark:bg-green-950/20 text-[#16A34A] font-semibold border-[#16A34A]"
                      : "text-gray-505 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-primary border-transparent pl-4"
                  )}
                >
                  <span className="mr-1.5 font-bold">○</span>
                  Thana
                </Link>
              </div>
            )}
          </div>

          {/* Other Menu Items */}
          {menuItems.filter(m => m.name !== "Dashboard" && m.name !== "Categories" && m.name !== "Partners" && m.name !== "Reviews" && m.name !== "FAQs" && m.name !== "FAQ Categories").map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/15"
                    : "text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary",
                  isCollapsed && "justify-center px-2"
                )}
                title={item.name}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-gray-500 dark:text-gray-400")} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="ghost"
            className={cn(
              "w-full flex items-center gap-3 text-gray-550 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 text-sm font-medium justify-start px-3 py-2.5 h-auto text-left rounded-xl transition-colors",
              isCollapsed && "justify-center px-2"
            )}
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-200">
      {/* Desktop Sidebar (Persistent) */}
      <aside
        className={cn(
          "hidden md:block fixed inset-y-0 left-0 z-20 border-r border-gray-200 dark:border-gray-800 transition-all duration-300",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent isCollapsed={isSidebarCollapsed} />
        {/* Toggle Collapse Trigger */}
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-3 top-10 h-6 w-6 rounded-full border border-gray-200 dark:border-gray-800 shadow-md bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 z-30"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </Button>
      </aside>

      {/* Main Layout Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          isSidebarCollapsed ? "md:pl-16" : "md:pl-64"
        )}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 md:px-6 shadow-sm">

          {/* Left Area: Mobile Menu Trigger + Search */}
          <div className="flex items-center gap-4 flex-1 max-w-lg">
            {/* Mobile Sheet Drawer Menu */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="md:hidden text-gray-600 dark:text-gray-400">
                    <Menu className="h-5 w-5" />
                  </Button>
                }
              />
              <SheetContent side="left" className="p-0 w-72 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-800">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            {/* Global Mock Search */}
            <div className="relative w-full max-w-sm hidden sm:block">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search anything..."
                className="pl-9 h-9 border-gray-200 dark:border-gray-800 dark:bg-gray-950/50 rounded-xl focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Right Area: Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle (Client Side mounted check to avoid hydration mismatch) */}
            {mounted && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                      {theme === "dark" ? (
                        <Moon className="h-[1.2rem] w-[1.2rem]" />
                      ) : theme === "light" ? (
                        <Sun className="h-[1.2rem] w-[1.2rem]" />
                      ) : (
                        <Monitor className="h-[1.2rem] w-[1.2rem]" />
                      )}
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2">
                    <Sun className="h-4 w-4" /> Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2">
                    <Moon className="h-4 w-4" /> Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" /> System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Messages Alert Pop */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <MessageSquare className="h-5 w-5" />
                    {unreadMessagesCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-650 text-[10px] text-white border-2 border-white dark:border-gray-900 rounded-full font-bold">
                        {unreadMessagesCount}
                      </Badge>
                    )}
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-[390px] max-w-[calc(100vw-32px)] p-0 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Messages</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    You have {unreadMessagesCount} unread messages
                  </p>
                </div>
                <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                  {latestMessages.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gray-50 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 flex items-center justify-center border border-transparent dark:border-gray-700/50">
                        <Mail className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-slate-500">
                        No new messages
                      </p>
                    </div>
                  ) : (
                    latestMessages.map((msg: any) => {
                      const isUnread = msg.status === "Unread";
                      
                      const getRelativeTime = (isoString: string) => {
                        try {
                          const diff = Date.now() - new Date(isoString).getTime();
                          const mins = Math.floor(diff / 60000);
                          if (mins < 1) return "Just now";
                          if (mins < 60) return `${mins} min ago`;
                          const hours = Math.floor(mins / 60);
                          if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
                          return new Date(isoString).toLocaleDateString(undefined, { month: "short", day: "numeric" });
                        } catch (e) {
                          return "Recently";
                        }
                      };

                      return (
                        <div
                          key={msg.id}
                          onClick={() => handleMessageClick(msg)}
                          className={cn(
                            "p-3.5 cursor-pointer flex flex-col transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0",
                            isUnread 
                              ? "bg-blue-50/20 dark:bg-blue-950/10 border-l-[4px] border-l-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/15 pl-2.5" 
                              : "hover:bg-gray-55 dark:hover:bg-gray-800/40 border-l-[4px] border-l-transparent pl-2.5"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn("text-xs truncate text-gray-900 dark:text-white", isUnread ? "font-bold" : "font-medium")}>
                              {msg.name}
                            </p>
                            <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                              {getRelativeTime(msg.createdAt)}
                            </span>
                          </div>
                          
                          <p className={cn("text-xs truncate mt-1 text-gray-905 dark:text-white", isUnread ? "font-bold text-gray-900 dark:text-white" : "font-medium text-gray-700 dark:text-gray-300")}>
                            {msg.subject}
                          </p>

                          <p className={cn("text-[11px] mt-0.5 text-gray-500 dark:text-slate-400 line-clamp-2 leading-snug", isUnread && "font-semibold")}>
                            {msg.message.length > 80 ? `${msg.message.substring(0, 80)}...` : msg.message}
                          </p>

                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100/50 dark:border-gray-800/30">
                            <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold", 
                              isUnread 
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" 
                                : "bg-gray-150 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            )}>
                              {isUnread ? "Unread" : "Read"}
                            </span>

                            {isUnread && (
                              <div className="flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">New</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="p-2 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-xl">
                  <Button
                    variant="ghost"
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 h-8 rounded-lg cursor-pointer"
                  >
                    Mark All As Read
                  </Button>
                  <Link
                    href="/admin/messages"
                    className="inline-flex items-center justify-center text-xs font-semibold text-primary hover:bg-primary/10 dark:text-primary-400 h-8 rounded-lg transition-colors"
                  >
                    View All Messages
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications Alert Pop */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 text-gray-650 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary hover:bg-primary-700 text-[10px] text-white border-2 border-white dark:border-gray-900 rounded-full font-bold">
                      3
                    </Badge>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-80 p-0 border-gray-250 dark:border-gray-800">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white">Notifications</div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">New order #ord-1004 received</p>
                    <p className="text-[10px] text-gray-400 mt-1">Just now</p>
                  </div>
                  <div className="p-3 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">Sarah Connor left a 5-star review</p>
                    <p className="text-[10px] text-gray-400 mt-1">2 hours ago</p>
                  </div>
                  <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">Product "iPhone 15 Pro Max" stock low</p>
                    <p className="text-[10px] text-gray-400 mt-1">1 day ago</p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" className="h-9 gap-2 pl-2 pr-3 text-gray-850 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-850 text-gray-700 dark:text-gray-300 font-bold text-xs">
                      {currentUser?.name?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <span className="text-xs font-semibold hidden sm:inline-block">
                      {currentUser?.name || "Admin"}
                    </span>
                    <ChevronDown className="h-3 w-3 text-gray-400" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56 border-gray-200 dark:border-gray-800">
                <div className="font-normal p-4 flex flex-col space-y-1 border-b border-gray-150 dark:border-gray-850">
                  <p className="text-sm font-semibold leading-none text-gray-900 dark:text-white">{currentUser?.name}</p>
                  <p className="text-xs leading-none text-gray-500 mt-0.5">{currentUser?.email}</p>
                </div>
                <DropdownMenuSeparator className="border-gray-200 dark:border-gray-850" />
                <DropdownMenuItem onClick={() => router.push("/admin/settings")} className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/settings")} className="flex items-center gap-2 cursor-pointer">
                  <SettingsIcon className="h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-gray-200 dark:border-gray-850" />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-500 focus:text-red-500 cursor-pointer">
                  <LogOut className="h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
          <ToastProvider>
            {children}
          </ToastProvider>
        </main>
      </div>
    </div>
  );
}
