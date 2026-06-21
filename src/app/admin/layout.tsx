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
  ChevronDown
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
    if (pathname.startsWith("/admin/reviews")) {
      setIsReviewsOpen(true);
    }
  }, [pathname]);

  // Sync with client-side only parameters to avoid hydration warnings
  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems: MenuItem[] = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Categories", href: "/admin/categories", icon: Layers },
    { name: "Orders", href: "/admin/orders", icon: ClipboardList },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Partners", href: "/admin/partners", icon: Handshake },
    { name: "Subscriptions", href: "/admin/subscriptions", icon: Package },
    { name: "Banners", href: "/admin/banners", icon: ImageIcon },
    { name: "Users", href: "/admin/users", icon: UserCog },
    { name: "Settings", href: "/admin/settings", icon: SettingsIcon },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

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
                <Link
                  href="/admin/products/details"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 border-l-4",
                    pathname === "/admin/products/details"
                      ? "bg-green-50 dark:bg-green-950/20 text-[#16A34A] font-semibold border-[#16A34A]"
                      : "text-gray-505 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-primary border-transparent pl-4"
                  )}
                >
                  <span className="mr-1.5 font-bold">○</span>
                  Product Details
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

          {/* Other Menu Items */}
          {menuItems.filter(m => m.name !== "Dashboard" && m.name !== "Categories" && m.name !== "Partners" && m.name !== "Reviews").map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
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
