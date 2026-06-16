"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit2, Trash2, Globe, Loader2, Handshake, Link as LinkIcon } from "lucide-react";

import { useStore } from "@/store";
import { Partner } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const partnerSchema = z.object({
  name: z.string().min(2, "Partner name must be at least 2 characters"),
  website: z.string().url("Please enter a valid website URL"),
  logoUrl: z.string().optional(),
});

type PartnerFormValues = z.infer<typeof partnerSchema>;

export default function PartnersPage() {
  const { partners, addPartner, updatePartner, deletePartner } = useStore();
  const [mounted, setMounted] = useState(false);

  // States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: "",
      website: "",
      logoUrl: "",
    },
  });

  useEffect(() => {
    if (editingPartner) {
      form.reset({
        name: editingPartner.name,
        website: editingPartner.website,
        logoUrl: editingPartner.logo || "",
      });
    } else {
      form.reset({
        name: "",
        website: "",
        logoUrl: "",
      });
    }
  }, [editingPartner, isFormOpen, form]);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const onSubmit = (values: PartnerFormValues) => {
    const finalLogo = values.logoUrl || `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2055/svg' width='100' height='40' viewBox='0 0 100 40'><rect width='100' height='40' fill='%23e2e8f0' rx='5'/><text x='50' y='25' font-family='sans-serif' font-weight='bold' font-size='12' fill='%23475569' text-anchor='middle'>${values.name}</text></svg>`;

    if (editingPartner) {
      updatePartner(editingPartner.id, {
        name: values.name,
        website: values.website,
        logo: finalLogo,
      });
    } else {
      addPartner({
        name: values.name,
        website: values.website,
        logo: finalLogo,
      });
    }
    setIsFormOpen(false);
    setEditingPartner(null);
  };

  const handleEditClick = (partner: Partner) => {
    setEditingPartner(partner);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingPartner) {
      deletePartner(deletingPartner.id);
      setDeletingPartner(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Affiliate Partners</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage brands, payment systems, shipping affiliates, and logistics partners.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPartner(null);
            setIsFormOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Partner
        </Button>
      </div>

      {/* Grid of Partners */}
      {partners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 border border-dashed rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <Handshake className="h-10 w-10 stroke-1 mb-2 text-indigo-500" />
          <p className="text-sm font-semibold">No partners registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {partners.map((partner) => (
            <Card key={partner.id} className="border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-bold truncate pr-2">{partner.name}</CardTitle>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => handleEditClick(partner)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => setDeletingPartner(partner)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-850">
                <div className="h-14 flex items-center justify-center rounded-lg overflow-hidden p-2">
                  {partner.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-full max-w-full object-contain filter dark:brightness-90"
                    />
                  ) : (
                    <div className="text-xs font-semibold text-slate-400">No Logo</div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-3 bg-white dark:bg-slate-950 flex justify-between items-center text-xs text-slate-400">
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-650 dark:text-indigo-400 hover:underline font-semibold"
                >
                  <Globe className="h-3 w-3" /> Visit Website
                </a>
                <span className="text-[10px] text-slate-400 font-mono">ID: {partner.id}</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Partner Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPartner ? "Edit Partner Profile" : "Register Affiliate Partner"}
            </DialogTitle>
            <DialogDescription>
              Record administrative records for shipping, payment, or sales channels.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. PayPal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website Address (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://paypal.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="data:image/svg..." {...field} />
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
                  {editingPartner ? "Save Changes" : "Create Partner"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deletingPartner} onOpenChange={(open) => !open && setDeletingPartner(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove affiliate record for{" "}
              <strong className="text-slate-900 dark:text-slate-100">&quot;{deletingPartner?.name}&quot;</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-650 hover:bg-red-750 text-white">
              Delete Partner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
