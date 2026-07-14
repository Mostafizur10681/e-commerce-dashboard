"use client";

import React, { useEffect, useState } from "react";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  Link,
  Store,
  Phone,
  Mail,
  MapPin,
  Clock,
  Share2,
  List,
  HeadphonesIcon,
  Eye,
  GripVertical,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

interface SocialLink {
  name: string;
  icon: string;
  url: string;
}

interface NavLink {
  label: string;
  path: string;
}

interface FooterData {
  store_name: string;
  store_icon: string;
  store_description: string;
  copyright_text: string;
  social_links: SocialLink[];
  quick_links: NavLink[];
  service_links: NavLink[];
  contact_address: string;
  contact_phone: string;
  contact_email: string;
  contact_hours: string;
}

const SOCIAL_ICONS = ["facebook", "twitter", "instagram", "youtube", "linkedin", "tiktok", "pinterest", "whatsapp"];

const defaultData: FooterData = {
  store_name: "FreshMart",
  store_icon: "🥬",
  store_description: "Your trusted online grocery store. We deliver the freshest produce, dairy, and everyday essentials right to your doorstep.",
  copyright_text: "FreshMart. All rights reserved.",
  social_links: [
    { name: "Facebook", icon: "facebook", url: "#" },
    { name: "Twitter",  icon: "twitter",  url: "#" },
    { name: "Instagram",icon: "instagram",url: "#" },
    { name: "YouTube",  icon: "youtube",  url: "#" },
  ],
  quick_links: [
    { label: "Home",     path: "/" },
    { label: "Shop",     path: "/shop" },
    { label: "About Us", path: "/about" },
    { label: "Contact",  path: "/contact" },
  ],
  service_links: [
    { label: "FAQ",               path: "/faq" },
    { label: "Shipping Info",     path: "/shipping-info" },
    { label: "Returns & Refunds", path: "/returns-refunds" },
    { label: "Order Tracking",    path: "/track-order" },
    { label: "Payment Methods",   path: "/payment-methods" },
  ],
  contact_address: "123 Green Street, Dhaka 1205, Bangladesh",
  contact_phone: "+880 1700-000000",
  contact_email: "info@freshmart.com",
  contact_hours: "Mon-Sat: 8AM - 10PM",
};

export default function FooterSettingsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("brand");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FooterData>(defaultData);

  useEffect(() => { setMounted(true); }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/footer-settings");
      if (!res.ok) throw new Error("Failed to fetch");
      const result = await res.json();
      if (result.success && result.data) {
        setFormData((prev) => ({ ...prev, ...result.data }));
      }
    } catch (err) {
      console.error(err);
      toast("Using default footer data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) fetchSettings();
  }, [mounted]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/footer-settings", {
        method: "PUT",
        headers,
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Save failed");
      if (result.success && result.data) {
        setFormData((prev) => ({ ...prev, ...result.data }));
      }
      toast("Footer settings saved successfully!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      toast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  /* ─── Link list helpers ─── */
  const addSocial = () =>
    setFormData((p) => ({ ...p, social_links: [...p.social_links, { name: "", icon: "facebook", url: "" }] }));
  const removeSocial = (i: number) =>
    setFormData((p) => ({ ...p, social_links: p.social_links.filter((_, idx) => idx !== i) }));
  const updateSocial = (i: number, field: keyof SocialLink, val: string) =>
    setFormData((p) => {
      const arr = [...p.social_links];
      arr[i] = { ...arr[i], [field]: val };
      return { ...p, social_links: arr };
    });

  const addQuickLink = () =>
    setFormData((p) => ({ ...p, quick_links: [...p.quick_links, { label: "", path: "" }] }));
  const removeQuickLink = (i: number) =>
    setFormData((p) => ({ ...p, quick_links: p.quick_links.filter((_, idx) => idx !== i) }));
  const updateQuickLink = (i: number, field: keyof NavLink, val: string) =>
    setFormData((p) => {
      const arr = [...p.quick_links];
      arr[i] = { ...arr[i], [field]: val };
      return { ...p, quick_links: arr };
    });

  const addServiceLink = () =>
    setFormData((p) => ({ ...p, service_links: [...p.service_links, { label: "", path: "" }] }));
  const removeServiceLink = (i: number) =>
    setFormData((p) => ({ ...p, service_links: p.service_links.filter((_, idx) => idx !== i) }));
  const updateServiceLink = (i: number, field: keyof NavLink, val: string) =>
    setFormData((p) => {
      const arr = [...p.service_links];
      arr[i] = { ...arr[i], [field]: val };
      return { ...p, service_links: arr };
    });

  const tabs = [
    { id: "brand",   label: "Brand",            icon: Store },
    { id: "social",  label: "Social Links",     icon: Share2 },
    { id: "quick",   label: "Quick Links",      icon: List },
    { id: "service", label: "Customer Service", icon: HeadphonesIcon },
    { id: "contact", label: "Contact Info",     icon: Phone },
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Footer Settings" }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Footer Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage all content displayed in the website footer
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => window.open("http://localhost:5173", "_blank")}
            className="gap-2"
          >
            <Eye className="w-4 h-4" /> Preview Site
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tab Sidebar */}
          <div className="lg:w-56 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all w-full text-left ${
                    activeTab === t.id
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">

            {/* ─── Brand Tab ─── */}
            {activeTab === "brand" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-3 border-gray-200 dark:border-gray-700">
                  Brand Identity
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Store Icon (Emoji)
                    </label>
                    <Input
                      value={formData.store_icon}
                      onChange={(e) => setFormData((p) => ({ ...p, store_icon: e.target.value }))}
                      placeholder="🥬"
                      className="text-2xl"
                    />
                    <p className="text-xs text-gray-400 mt-1">Paste an emoji for the logo icon</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Store Name
                    </label>
                    <Input
                      value={formData.store_name}
                      onChange={(e) => setFormData((p) => ({ ...p, store_name: e.target.value }))}
                      placeholder="FreshMart"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Store Description / Tagline
                  </label>
                  <Textarea
                    value={formData.store_description}
                    onChange={(e) => setFormData((p) => ({ ...p, store_description: e.target.value }))}
                    rows={3}
                    placeholder="Your trusted online grocery store…"
                  />
                  <p className="text-xs text-gray-400 mt-1">Shown below the logo in the footer</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Copyright Text
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm shrink-0">© {new Date().getFullYear()}</span>
                    <Input
                      value={formData.copyright_text}
                      onChange={(e) => setFormData((p) => ({ ...p, copyright_text: e.target.value }))}
                      placeholder="FreshMart. All rights reserved."
                    />
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="bg-gray-900 rounded-xl p-5 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{formData.store_icon}</span>
                    <span className="text-xl font-extrabold text-emerald-400">{formData.store_name}</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{formData.store_description}</p>
                  <p className="text-gray-600 text-xs mt-3">© {new Date().getFullYear()} {formData.copyright_text}</p>
                </div>
              </div>
            )}

            {/* ─── Social Links Tab ─── */}
            {activeTab === "social" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Social Media Links</h2>
                  <Button size="sm" onClick={addSocial} className="gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>
                {formData.social_links.length === 0 && (
                  <p className="text-center text-gray-400 py-8">No social links yet. Click Add to create one.</p>
                )}
                {formData.social_links.map((s, i) => (
                  <div key={i} className="grid grid-cols-12 gap-3 items-center p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="col-span-1 flex justify-center">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="col-span-3">
                      <label className="text-xs text-gray-500 mb-1 block">Icon</label>
                      <select
                        value={s.icon}
                        onChange={(e) => updateSocial(i, "icon", e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {SOCIAL_ICONS.map((icon) => (
                          <option key={icon} value={icon}>{icon.charAt(0).toUpperCase() + icon.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <label className="text-xs text-gray-500 mb-1 block">Display Name</label>
                      <Input
                        value={s.name}
                        onChange={(e) => updateSocial(i, "name", e.target.value)}
                        placeholder="Facebook"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="text-xs text-gray-500 mb-1 block">URL</label>
                      <Input
                        value={s.url}
                        onChange={(e) => updateSocial(i, "url", e.target.value)}
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button onClick={() => removeSocial(i)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─── Quick Links Tab ─── */}
            {activeTab === "quick" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Links</h2>
                  <Button size="sm" onClick={addQuickLink} className="gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Link
                  </Button>
                </div>
                {formData.quick_links.length === 0 && (
                  <p className="text-center text-gray-400 py-8">No quick links. Click Add Link.</p>
                )}
                {formData.quick_links.map((link, i) => (
                  <div key={i} className="grid grid-cols-12 gap-3 items-center p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="col-span-1 flex justify-center">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="col-span-5">
                      <label className="text-xs text-gray-500 mb-1 block">Label</label>
                      <Input
                        value={link.label}
                        onChange={(e) => updateQuickLink(i, "label", e.target.value)}
                        placeholder="About Us"
                      />
                    </div>
                    <div className="col-span-5">
                      <label className="text-xs text-gray-500 mb-1 block">Path / URL</label>
                      <div className="relative">
                        <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <Input
                          value={link.path}
                          onChange={(e) => updateQuickLink(i, "path", e.target.value)}
                          placeholder="/about"
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button onClick={() => removeQuickLink(i)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─── Service Links Tab ─── */}
            {activeTab === "service" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Service Links</h2>
                  <Button size="sm" onClick={addServiceLink} className="gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Link
                  </Button>
                </div>
                {formData.service_links.length === 0 && (
                  <p className="text-center text-gray-400 py-8">No service links. Click Add Link.</p>
                )}
                {formData.service_links.map((link, i) => (
                  <div key={i} className="grid grid-cols-12 gap-3 items-center p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="col-span-1 flex justify-center">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="col-span-5">
                      <label className="text-xs text-gray-500 mb-1 block">Label</label>
                      <Input
                        value={link.label}
                        onChange={(e) => updateServiceLink(i, "label", e.target.value)}
                        placeholder="Shipping Info"
                      />
                    </div>
                    <div className="col-span-5">
                      <label className="text-xs text-gray-500 mb-1 block">Path / URL</label>
                      <div className="relative">
                        <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <Input
                          value={link.path}
                          onChange={(e) => updateServiceLink(i, "path", e.target.value)}
                          placeholder="/shipping-info"
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button onClick={() => removeServiceLink(i)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─── Contact Info Tab ─── */}
            {activeTab === "contact" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-3 border-gray-200 dark:border-gray-700">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <MapPin className="w-4 h-4 text-emerald-500" /> Address
                    </label>
                    <Input
                      value={formData.contact_address}
                      onChange={(e) => setFormData((p) => ({ ...p, contact_address: e.target.value }))}
                      placeholder="123 Green Street, Dhaka 1205, Bangladesh"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Phone className="w-4 h-4 text-emerald-500" /> Phone Number
                    </label>
                    <Input
                      value={formData.contact_phone}
                      onChange={(e) => setFormData((p) => ({ ...p, contact_phone: e.target.value }))}
                      placeholder="+880 1700-000000"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Mail className="w-4 h-4 text-emerald-500" /> Email Address
                    </label>
                    <Input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData((p) => ({ ...p, contact_email: e.target.value }))}
                      placeholder="info@freshmart.com"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Clock className="w-4 h-4 text-emerald-500" /> Business Hours
                    </label>
                    <Input
                      value={formData.contact_hours}
                      onChange={(e) => setFormData((p) => ({ ...p, contact_hours: e.target.value }))}
                      placeholder="Mon-Sat: 8AM - 10PM"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-900 rounded-xl p-5 mt-2">
                  <h3 className="text-white font-bold mb-3 text-sm">Contact Preview</h3>
                  <ul className="space-y-2 text-sm">
                    {formData.contact_address && (
                      <li className="flex items-start gap-2 text-gray-400">
                        <span>📍</span><span>{formData.contact_address}</span>
                      </li>
                    )}
                    {formData.contact_phone && (
                      <li className="flex items-start gap-2 text-gray-400">
                        <span>📞</span><span>{formData.contact_phone}</span>
                      </li>
                    )}
                    {formData.contact_email && (
                      <li className="flex items-start gap-2 text-gray-400">
                        <span>📧</span><span>{formData.contact_email}</span>
                      </li>
                    )}
                    {formData.contact_hours && (
                      <li className="flex items-start gap-2 text-gray-400">
                        <span>🕐</span><span>{formData.contact_hours}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
