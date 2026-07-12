"use client";

import React, { useEffect, useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  HelpCircle,
  Upload,
  Save,
  Loader2,
  PhoneCall,
  Eye
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function ContactSettingsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    address: "",
    business_hours_weekday: "",
    business_hours_weekend: "",
    support_title: "",
    support_desc: "",
    support_phone: "",
    support_image: ""
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/contact-settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const result = await res.json();
      if (result.success && result.data) {
        setFormData(result.data);
        if (result.data.support_image) {
          setImagePreview(result.data.support_image);
        }
      }
    } catch (err) {
      console.error(err);
      toast("Error loading contact settings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchSettings();
    }
  }, [mounted]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData({ ...formData, support_image: base64 });
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/contact-settings", {
        method: "PUT",
        headers,
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Failed to save settings");
      const result = await res.json();

      if (result.success && result.data) {
        setFormData(result.data);
        if (result.data.support_image) {
          setImagePreview(result.data.support_image);
        }
        toast("Contact settings updated successfully", "success");
      }
    } catch (err) {
      console.error(err);
      toast("Failed to update contact settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 bg-gray-55 dark:bg-slate-950 transition-colors duration-200">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 dark:text-green-500" />
        <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Loading settings...</span>
      </div>
    );
  }

  const tabs = [
    { id: "info", label: "Contact Details", icon: Phone },
    { id: "hours", label: "Working Hours", icon: Clock },
    { id: "support", label: "Support Callout Banner", icon: HelpCircle }
  ];

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gray-55 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header section with Breadcrumbs */}
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Contact Settings" }
          ]}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <PhoneCall className="h-6 w-6 text-green-600 dark:text-green-500" />
              Contact Page Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Configure dynamic contact info and widget settings shown on http://localhost:5173/contact
            </p>
          </div>
          <div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm shadow-green-600/10 cursor-pointer active:scale-[0.98] transition-transform"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pr-0 md:pr-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap md:w-full ${
                  activeTab === tab.id
                    ? "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Editor Area */}
        <div className="flex-1 w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-850 p-6 shadow-sm">
          {/* TAB 1: Contact Details */}
          {activeTab === "info" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Contact Details</h3>
                <p className="text-xs text-slate-500">Physical address, email, and phone contact points.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-650 dark:text-slate-450 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    Phone Contact Number
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +880 1700-000000"
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-650 dark:text-slate-450 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    Email Address
                  </label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. support@freshmart.com"
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-650 dark:text-slate-450 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Physical Office Address
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. 42 Green Lane, Dhaka 1212, Bangladesh"
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Working Hours */}
          {activeTab === "hours" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Business Hours</h3>
                <p className="text-xs text-slate-500">Configure business hour tags displayed under dynamic list.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-650 dark:text-slate-450 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    Weekday Hours (e.g. Mon - Sat)
                  </label>
                  <Input
                    value={formData.business_hours_weekday}
                    onChange={(e) => setFormData({ ...formData, business_hours_weekday: e.target.value })}
                    placeholder="e.g. Mon – Sat: 9:00 AM – 8:00 PM"
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-650 dark:text-slate-450 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    Weekend Hours (e.g. Sunday)
                  </label>
                  <Input
                    value={formData.business_hours_weekend}
                    onChange={(e) => setFormData({ ...formData, business_hours_weekend: e.target.value })}
                    placeholder="e.g. Sunday: 11:00 AM – 5:00 PM"
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Support Callout Banner */}
          {activeTab === "support" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Support Callout Banner</h3>
                <p className="text-xs text-slate-500">Configure the large image banner card with quick support dial-in details.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-655 dark:text-slate-445">Banner Title</label>
                    <Input
                      value={formData.support_title}
                      onChange={(e) => setFormData({ ...formData, support_title: e.target.value })}
                      placeholder="e.g. Need Help?"
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-655 dark:text-slate-445">Direct Dial Phone Link</label>
                    <Input
                      value={formData.support_phone}
                      onChange={(e) => setFormData({ ...formData, support_phone: e.target.value })}
                      placeholder="e.g. +8801700000000"
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-655 dark:text-slate-445">Banner Description</label>
                  <Textarea
                    value={formData.support_desc}
                    onChange={(e) => setFormData({ ...formData, support_desc: e.target.value })}
                    placeholder="e.g. Our support team is always ready to assist you."
                    className="min-h-[70px]"
                  />
                </div>

                {/* Banner image upload */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-slate-655 dark:text-slate-445 flex items-center gap-2">
                    <Upload className="h-3.5 w-3.5 text-slate-400" />
                    Upload Support Banner Image
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="relative h-28 w-44 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-200 shrink-0">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Support preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs font-medium">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500">
                        Upload custom landscape photo (jpg, png, or webp). Recommended ratio: ~16:9.
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="text-xs text-slate-600 dark:text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-green-50 dark:file:bg-green-950/20 file:text-green-700 dark:file:text-green-400 file:cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
