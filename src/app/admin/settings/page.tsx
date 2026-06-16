"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTheme } from "next-themes";
import { Settings as SettingsIcon, Save, Loader2, CheckCircle2 } from "lucide-react";

import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const settingsSchema = z.object({
  siteName: z.string().min(2, "Site name must be at least 2 characters"),
  logo: z.string().min(1, "Logo text must be at least 1 character"),
  email: z.string().email("Please enter a valid support email address"),
  phone: z.string().min(6, "Please enter a valid phone number"),
  address: z.string().min(5, "Address details must be at least 5 characters"),
  theme: z.enum(["light", "dark", "system"]),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { settings, updateSettings } = useStore();
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: "",
      logo: "",
      email: "",
      phone: "",
      address: "",
      theme: "system",
    },
  });

  // Sync form defaults with store settings
  useEffect(() => {
    if (settings) {
      form.reset({
        siteName: settings.siteName,
        logo: settings.logo,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        theme: settings.theme,
      });
    }
  }, [settings, form]);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const onSubmit = async (values: SettingsFormValues) => {
    setIsSaving(true);
    setIsSaved(false);

    // Simulate save duration
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Update store state
    updateSettings(values);

    // Sync next-themes framework setting
    setTheme(values.theme);

    setIsSaving(false);
    setIsSaved(true);

    // Fade save message
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Modify dashboard variables, branding labels, global support metrics, and panel appearance themes.
        </p>
      </div>

      {isSaved && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-805 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 p-3 rounded-lg flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          Settings successfully updated and theme preferences synced!
        </div>
      )}

      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            General Branding & Info
          </CardTitle>
          <CardDescription>
            These properties define global headings, logos, and support headers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website / Site Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. FreshMart Admin Panel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo Monogram Text</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. DF" {...field} />
                      </FormControl>
                      <FormDescription className="text-[10px]">Max 3 letters recommended</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Support Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="support@dataflow.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Support Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 019-2834" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Corporate Physical Address</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border-slate-200 dark:border-slate-800"
                        placeholder="123 Corporate Way, San Francisco, CA"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Panel Theme</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        {...field}
                      >
                        <option value="light">Light Mode</option>
                        <option value="dark">Dark Mode</option>
                        <option value="system">Follow System Settings</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4 border-t dark:border-slate-850">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
