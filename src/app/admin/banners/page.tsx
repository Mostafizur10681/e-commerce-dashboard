"use client"

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit2, Trash2, Loader2, ImageIcon, Link as LinkIcon, ImagePlus, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const bannerSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").optional().or(z.literal('')),
  subtitle: z.string().optional().or(z.literal('')),
  image: z.any().optional(),
  badge: z.string().optional().or(z.literal('')),
  cta_text: z.string().optional().or(z.literal('')),
  cta_link: z.string().optional().or(z.literal('')),
  order: z.number(),
  is_active: z.boolean(),
  menu_location: z.string().min(1, "Menu location is required"),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

const MENU_LOCATIONS = [
  "Main Slider",
  "Shop Sidebar",
  "Header Banner",
  "Footer Ad"
];

export default function BannersPage() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<any | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const headers: any = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/banners", { headers });
      const data = await res.json();
      if (data.data) {
        setBanners(data.data);
      }
    } catch (err) {
      console.error(err);
      toast("Failed to fetch banners", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchBanners();
  }, []);

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      badge: "",
      cta_text: "",
      cta_link: "",
      order: 0,
      is_active: true,
      menu_location: "Main Slider",
    },
  });

  useEffect(() => {
    if (editingBanner) {
      form.reset({
        title: editingBanner.title || "",
        subtitle: editingBanner.subtitle || "",
        badge: editingBanner.badge || "",
        cta_text: editingBanner.cta_text || "",
        cta_link: editingBanner.cta_link || "",
        order: editingBanner.order || 0,
        is_active: editingBanner.is_active ?? true,
        menu_location: editingBanner.menu_location || "Main Slider",
      });
      setPreviewImage(editingBanner.image || null);
    } else {
      form.reset({
        title: "",
        subtitle: "",
        badge: "",
        cta_text: "",
        cta_link: "",
        order: 0,
        is_active: true,
        menu_location: "Main Slider",
      });
      setPreviewImage(null);
    }
  }, [editingBanner, isFormOpen, form]);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    form.setValue("image", undefined);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: BannerFormValues) => {
    try {
      const isEdit = !!editingBanner;
      
      if (!isEdit && !values.image && !previewImage) {
        toast("Image is required for new banners", "error");
        return;
      }

      const url = isEdit ? `/api/banners/${editingBanner.id}` : `/api/banners`;
      
      const formData = new FormData();
      if (values.title) formData.append("title", values.title);
      if (values.subtitle) formData.append("subtitle", values.subtitle);
      if (values.badge) formData.append("badge", values.badge);
      if (values.cta_text) formData.append("cta_text", values.cta_text);
      if (values.cta_link) formData.append("cta_link", values.cta_link);
      formData.append("order", values.order.toString());
      formData.append("is_active", values.is_active ? "1" : "0");
      formData.append("menu_location", values.menu_location);
      
      if (previewImage) {
        formData.append("image", previewImage);
      }
      
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const headers: any = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST", // The proxy routes handle PUT via POST override if needed
        headers,
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to save banner");

      toast(`Banner successfully ${isEdit ? "updated" : "created"}!`, "success");

      setIsFormOpen(false);
      fetchBanners();
    } catch (err) {
      console.error(err);
      toast("Failed to save banner", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deletingBanner) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const headers: any = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/banners/${deletingBanner.id}`, { 
        method: "DELETE",
        headers 
      });
      if (!res.ok) throw new Error("Failed to delete");
      
      toast("Banner deleted successfully", "success");
      fetchBanners();
    } catch (error) {
      console.error(error);
      toast("Failed to delete banner", "error");
    } finally {
      setDeletingBanner(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Slider / Banners</h2>
          <p className="text-muted-foreground mt-1">
            Manage your dynamic website hero sliders and promotional banners.
          </p>
        </div>
        <Button onClick={() => { setEditingBanner(null); setIsFormOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add New Banner
        </Button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : banners.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 bg-slate-50 border-dashed">
          <ImageIcon className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium">No Banners Found</h3>
          <p className="text-sm text-slate-500 mb-4">Add your first banner to display it on the website slider.</p>
          <Button onClick={() => { setEditingBanner(null); setIsFormOpen(true); }} variant="outline">
            <Plus className="h-4 w-4 mr-2" /> Add Banner
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <Card key={banner.id} className={`overflow-hidden transition-all duration-200 ${!banner.is_active && "opacity-60 grayscale-[0.5]"}`}>
              <div className="relative h-48 bg-slate-100 group">
                <img 
                  src={banner.image} 
                  alt={banner.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/800x400?text=Invalid+Image";
                  }}
                />
                {!banner.is_active && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Badge variant="secondary" className="text-lg">Inactive</Badge>
                  </div>
                )}
                
                {/* Actions Overlay */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="h-8 w-8 shadow-sm" onClick={() => { setEditingBanner(banner); setIsFormOpen(true); }}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8 shadow-sm" onClick={() => setDeletingBanner(banner)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1" title={banner.title}>{banner.title || "Untitled Banner"}</h3>
                  <Badge variant="outline" className="shrink-0">{banner.menu_location}</Badge>
                </div>
                {banner.subtitle && <p className="text-sm text-slate-500 line-clamp-2 mb-3">{banner.subtitle}</p>}
                
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <LinkIcon className="h-4 w-4 shrink-0" />
                  <span className="line-clamp-1">{banner.cta_link || "No Link Provided"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBanner ? "Edit Banner" : "Add New Banner"}</DialogTitle>
            <DialogDescription>
              Configure the banner details and placement.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="space-y-2">
                <FormLabel>Banner Image *</FormLabel>
                <div className="flex items-center justify-center w-full">
                  {previewImage ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-200">
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm" 
                          onClick={clearImage}
                          className="gap-2"
                        >
                          <X className="h-4 w-4" /> Remove Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImagePlus className="w-10 h-10 mb-3 text-slate-400" />
                        <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 2MB</p>
                      </div>
                      <input 
                        id="dropzone-file" 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="menu_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Menu Location *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MENU_LOCATIONS.map(loc => (
                            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Fresh Vegetables" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="badge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Badge Text</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 50% OFF" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl>
                      <Input placeholder="Short description below the title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cta_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Text</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Shop Now" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cta_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Link URL</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. /shop" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm mt-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Active Status
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Toggle to make this banner visible on the frontend slider.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingBanner ? "Save Changes" : "Create Banner"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={!!deletingBanner} onOpenChange={(open) => !open && setDeletingBanner(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the banner
              "{deletingBanner?.title}" and remove it from your servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete Banner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
