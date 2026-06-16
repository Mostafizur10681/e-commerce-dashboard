"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit2, Trash2, Loader2, ImageIcon, Link as LinkIcon, ToggleLeft, ToggleRight } from "lucide-react";

import { useStore } from "@/store";
import { Banner } from "@/types";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const bannerSchema = z.object({
  title: z.string().min(2, "Banner title must be at least 2 characters"),
  linkUrl: z.string().min(1, "Please enter a redirect URL path"),
  imageUrl: z.string().optional(),
  active: z.boolean(),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

export default function BannersPage() {
  const { banners, addBanner, updateBanner, deleteBanner } = useStore();
  const [mounted, setMounted] = useState(false);

  // States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<Banner | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: "",
      linkUrl: "",
      imageUrl: "",
      active: true,
    },
  });

  useEffect(() => {
    if (editingBanner) {
      form.reset({
        title: editingBanner.title,
        linkUrl: editingBanner.linkUrl,
        imageUrl: editingBanner.imageUrl || "",
        active: editingBanner.active,
      });
    } else {
      form.reset({
        title: "",
        linkUrl: "",
        imageUrl: "",
        active: true,
      });
    }
  }, [editingBanner, isFormOpen, form]);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const onSubmit = (values: BannerFormValues) => {
    const finalImage = values.imageUrl || `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='300' viewBox='0 0 800 300'><defs><linearGradient id='gb1' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%236366f1'/><stop offset='100%' stop-color='%23a855f7'/></linearGradient></defs><rect width='800' height='300' fill='url(%23gb1)'/><text x='400' y='160' font-family='sans-serif' font-weight='bold' font-size='36' fill='white' text-anchor='middle'>${values.title}</text></svg>`;

    if (editingBanner) {
      updateBanner(editingBanner.id, {
        title: values.title,
        linkUrl: values.linkUrl,
        imageUrl: finalImage,
        active: values.active,
      });
    } else {
      addBanner({
        title: values.title,
        linkUrl: values.linkUrl,
        imageUrl: finalImage,
        active: values.active,
      });
    }
    setIsFormOpen(false);
    setEditingBanner(null);
  };

  const handleEditClick = (banner: Banner) => {
    setEditingBanner(banner);
    setIsFormOpen(true);
  };

  const handleToggleStatus = (banner: Banner) => {
    updateBanner(banner.id, { active: !banner.active });
  };

  const handleDeleteConfirm = () => {
    if (deletingBanner) {
      deleteBanner(deletingBanner.id);
      setDeletingBanner(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Promotional Banners</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control homepage slider promotions, active marketing offers, and redirect links.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingBanner(null);
            setIsFormOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Banner
        </Button>
      </div>

      {/* Grid of Banners */}
      {banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 border border-dashed rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <ImageIcon className="h-10 w-10 stroke-1 mb-2 text-indigo-500" />
          <p className="text-sm font-semibold">No promotional banners created.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {banners.map((banner) => (
            <Card key={banner.id} className="border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-bold truncate max-w-xs">{banner.title}</CardTitle>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => handleEditClick(banner)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => setDeletingBanner(banner)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 border-y border-slate-100 dark:border-slate-850">
                <div className="aspect-[2.6/1] w-full overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative">
                  {banner.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-xs font-semibold text-slate-400">No Image</div>
                  )}
                  {/* Status Overlay Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    {banner.active ? (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold border-0">Active</Badge>
                    ) : (
                      <Badge className="bg-slate-500 hover:bg-slate-600 text-white font-semibold border-0">Inactive</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-3 bg-white dark:bg-slate-950 flex justify-between items-center text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-medium truncate text-slate-655 dark:text-slate-400">
                  <LinkIcon className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span>Redirect: </span>
                  <code className="text-indigo-600 dark:text-indigo-400 font-mono font-semibold max-w-[150px] truncate">{banner.linkUrl}</code>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[11px] gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-450"
                  onClick={() => handleToggleStatus(banner)}
                >
                  {banner.active ? (
                    <>
                      <ToggleRight className="h-4 w-4 text-emerald-500" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-4 w-4 text-slate-400" />
                      Activate
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Banner Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? "Edit Banner Details" : "Create Promotional Banner"}
            </DialogTitle>
            <DialogDescription>
              Provide slider text, banner images, links, and status triggers.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Winter Sales Kickoff" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Redirect Link Path</FormLabel>
                    <FormControl>
                      <Input placeholder="/products?sale=winter" {...field} />
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
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="data:image/svg..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">Active Status</FormLabel>
                      <p className="text-xs text-slate-500">Enable this banner immediately on home slider</p>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 text-indigo-650 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6">
                <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {editingBanner ? "Save Changes" : "Create Banner"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deletingBanner} onOpenChange={(open) => !open && setDeletingBanner(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete homepage banner{" "}
              <strong className="text-slate-900 dark:text-slate-100">&quot;{deletingBanner?.title}&quot;</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-650 hover:bg-red-750 text-white">
              Delete Banner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
