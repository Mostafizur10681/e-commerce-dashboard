"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Pencil, Trash2, Eye, Search, X, Loader2, Package, ChevronLeft, ChevronRight } from "lucide-react";

import { useStore } from "@/store";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

// Form validation schema
const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  price: z.number().positive("Price must be a positive number"),
  stock: z.number().nonnegative("Stock cannot be negative"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  imageUrl: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const router = useRouter();
  const { products, categories, addProduct, updateProduct, deleteProduct } = useStore();
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Name-ASC");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      price: 0,
      stock: 0,
      description: "",
      imageUrl: "",
    },
  });

  // Reset form when changing edit/add mode
  useEffect(() => {
    if (editingProduct) {
      form.reset({
        name: editingProduct.name,
        category: editingProduct.category,
        price: editingProduct.price,
        stock: editingProduct.stock,
        description: editingProduct.description,
        imageUrl: editingProduct.images?.[0] || "",
      });
    } else {
      form.reset({
        name: "",
        category: categories[0]?.name || "Electronics",
        price: 0,
        stock: 0,
        description: "",
        imageUrl: "",
      });
    }
  }, [editingProduct, isFormOpen, categories, form]);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#16A34A]" />
      </div>
    );
  }

  // Filter products by Search, Category, Status
  let filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "In Stock" && p.stock > 0) ||
      (selectedStatus === "Out of Stock" && p.stock <= 0);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Apply sorting
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "Name-ASC":
        return a.name.localeCompare(b.name);
      case "Name-DESC":
        return b.name.localeCompare(a.name);
      case "Price-LOW":
        return a.price - b.price;
      case "Price-HIGH":
        return b.price - a.price;
      case "Stock-LOW":
        return a.stock - b.stock;
      case "Stock-HIGH":
        return b.stock - a.stock;
      default:
        return 0;
    }
  });

  // Calculate pagination specs
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

  const onSubmit = (values: ProductFormValues) => {
    const finalImage = values.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=60";

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: values.name,
        category: values.category,
        price: values.price,
        stock: values.stock,
        description: values.description,
        images: [finalImage],
      });
    } else {
      addProduct({
        name: values.name,
        category: values.category,
        price: values.price,
        stock: values.stock,
        description: values.description,
        images: [finalImage],
      });
    }
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingProduct) {
      deleteProduct(deletingProduct.id);
      toast("Product deleted successfully");
      setDeletingProduct(null);
      // Reset page if needed
      if (paginatedProducts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
          <Link href="/admin/dashboard" className="hover:text-[#16A34A] transition-colors">Dashboard</Link>
          <span>&gt;</span>
          <span>Product</span>
          <span>&gt;</span>
          <span className="text-[#16A34A] font-semibold">All Products</span>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">All Products</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Manage inventory items, review prices, adjust stock, and update catalog info.
            </p>
          </div>
        </div>
      </div>

      {/* TOP INFO BAR */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 rounded-xl p-4 flex items-start gap-2.5 text-xs text-green-800 dark:text-green-300 font-medium transition-all duration-300">
        <span className="text-base select-none mt-0.5">💡</span>
        <div className="space-y-0.5">
          <span className="font-bold">Tip search by Product ID:</span>
          <p className="text-green-700/90 dark:text-green-400/90 mt-0.5">
            Each product is provided with a unique ID. Use it to filter individual items instantly.
          </p>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          
          {/* Entries dropdown (Left) */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Showing</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-[#16A34A] outline-none cursor-pointer text-gray-700 dark:text-gray-300"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>

          {/* Search box (Middle) */}
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search className="absolute top-3 left-3.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by Product Name or Product ID"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-10 border-gray-250 dark:border-gray-700 dark:bg-gray-950/50 rounded-xl focus-visible:ring-[#16A34A] focus-visible:ring-1 text-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-650 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Dropdown Filters & Button (Right) */}
          <div className="flex flex-wrap items-center gap-3.5">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-[#16A34A] outline-none cursor-pointer text-gray-750 dark:text-gray-300 h-10"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-[#16A34A] outline-none cursor-pointer text-gray-750 dark:text-gray-300 h-10"
            >
              <option value="All">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-[#16A34A] outline-none cursor-pointer text-gray-750 dark:text-gray-300 h-10"
            >
              <option value="Name-ASC">Name (A-Z)</option>
              <option value="Name-DESC">Name (Z-A)</option>
              <option value="Price-LOW">Price (Low to High)</option>
              <option value="Price-HIGH">Price (High to Low)</option>
              <option value="Stock-LOW">Stock (Low to High)</option>
              <option value="Stock-HIGH">Stock (High to Low)</option>
            </select>

            {/* Add New Product Button */}
            <Button
              onClick={() => router.push("/admin/products/add")}
              className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-4 flex items-center gap-1.5 font-medium transition-all hover:scale-[1.01] cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" /> Add Product
            </Button>
          </div>

        </div>
      </div>

      {/* PRODUCT TABLE CONTAINER */}
      <div className="rounded-2xl border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-gray-50/70 dark:bg-gray-850/40 sticky top-0 border-b border-gray-150 dark:border-gray-800">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 text-gray-700 dark:text-gray-300 font-bold text-xs h-12">Product</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300 font-bold text-xs">Product ID</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300 font-bold text-xs">Price</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300 font-bold text-xs">Quantity</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300 font-bold text-xs">Sale</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300 font-bold text-xs">Stock</TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300 font-bold text-xs">Start Date</TableHead>
                <TableHead className="text-right pr-6 text-gray-700 dark:text-gray-300 font-bold text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center space-y-2 py-6">
                      <Package className="h-10 w-10 stroke-1 text-gray-300" />
                      <span className="text-sm">No products found matching filters</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => {
                  const isOutOfStock = product.stock <= 0;
                  // Generate stable mocks for display matching UI rules
                  const productCode = product.id.toUpperCase();
                  const salesMock = `${(product.price > 100 ? 124 : 290) + product.name.length} sold`;
                  const dateMock = "2026-04-18";

                  return (
                    <TableRow
                      key={product.id}
                      className="border-b border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      {/* Product Image & Name */}
                      <TableCell className="pl-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-xl overflow-hidden shrink-0 bg-gray-50 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700">
                            {product.images?.[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[9px] text-gray-400 font-mono">
                                IMG
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-gray-900 dark:text-white leading-tight">
                              {product.name}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                              {product.category}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Product ID */}
                      <TableCell className="font-mono text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
                        {productCode}
                      </TableCell>

                      {/* Price */}
                      <TableCell className="font-bold text-sm text-gray-900 dark:text-white">
                        ${product.price.toFixed(2)}
                      </TableCell>

                      {/* Quantity */}
                      <TableCell className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                        {product.stock}
                      </TableCell>

                      {/* Sale (mock sales metric) */}
                      <TableCell className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {salesMock}
                      </TableCell>

                      {/* Stock Status Badge */}
                      <TableCell>
                        {isOutOfStock ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/40 text-red-750 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                            Out Of Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-950/40 text-green-750 dark:text-green-400 border border-green-200 dark:border-green-900/50">
                            In Stock
                          </span>
                        )}
                      </TableCell>

                      {/* Start Date (mock) */}
                      <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                        {dateMock}
                      </TableCell>

                      {/* Action buttons (rounded-full, hover animations) */}
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => router.push(`/admin/products/view/${product.id}`)}
                            title="View Details"
                            className="h-8 w-8 flex items-center justify-center text-gray-550 hover:text-[#16A34A] bg-gray-50 hover:bg-[#16A34A]/10 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-[#16A34A] dark:hover:bg-[#16A34A]/10 rounded-full transition-all duration-300 hover:scale-[1.05] cursor-pointer border border-transparent hover:border-[#16A34A]/20"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                            title="Edit Product"
                            className="h-8 w-8 flex items-center justify-center text-gray-550 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/20 rounded-full transition-all duration-300 hover:scale-[1.05] cursor-pointer border border-transparent hover:border-blue-500/20"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(product)}
                            title="Delete Product"
                            className="h-8 w-8 flex items-center justify-center text-gray-550 hover:text-red-600 bg-gray-50 hover:bg-red-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-950/20 rounded-full transition-all duration-300 hover:scale-[1.05] cursor-pointer border border-transparent hover:border-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION SECTION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {Math.min(startIndex + pageSize, totalItems)}
              </span>{" "}
              of <span className="font-semibold text-gray-700 dark:text-gray-300">{totalItems}</span> entries
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="h-8 px-2.5 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-[#16A34A] text-white border-[#16A34A] shadow-xs"
                      : "border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="h-8 px-2.5 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer text-xs"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Add / Edit Dialog Form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              {editingProduct ? "Edit Product Details" : "Add New Product"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
              Provide catalog specifications for this inventory item. Click submit to save.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">Product Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter product title"
                        className="rounded-xl border-gray-300 dark:border-gray-700 focus-visible:ring-[#16A34A]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">Category</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-xl border border-gray-300 bg-white dark:bg-gray-900 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#16A34A] dark:border-gray-700 text-gray-800 dark:text-gray-250 cursor-pointer"
                          {...field}
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="rounded-xl border-gray-300 dark:border-gray-700 focus-visible:ring-[#16A34A]"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">Available Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="rounded-xl border-gray-300 dark:border-gray-700 focus-visible:ring-[#16A34A]"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://images.unsplash.com/..."
                          className="rounded-xl border-gray-300 dark:border-gray-700 focus-visible:ring-[#16A34A] text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">Description</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-800 dark:text-gray-250"
                        placeholder="Write detailed descriptions..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6 flex gap-2">
                <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)} className="rounded-xl h-10 cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-5 cursor-pointer">
                  {editingProduct ? "Save Changes" : "Create Product"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-900 dark:text-white">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              This action cannot be undone. This will permanently remove the product{" "}
              <strong className="text-gray-900 dark:text-white">&quot;{deletingProduct?.name}&quot;</strong> from
              the catalog database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel className="rounded-xl cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-750 text-white rounded-xl cursor-pointer">
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
