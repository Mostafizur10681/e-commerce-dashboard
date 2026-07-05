"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Users, Loader2, ArrowLeft, Trash2, Lock, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Customer } from "@/types";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(6, "Phone must be at least 6 characters"),
  ordersCount: z.number().min(0, "Orders count cannot be negative"),
  status: z.enum(["Active", "Inactive"]),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      ordersCount: 0,
      status: "Active",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
        const res = await fetch(`/api/customers`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch customers");
        
        const data = await res.json();
        const found = (data.customers || []).find((c: any) => String(c.id) === String(params.id));
        
        if (found) {
          profileForm.reset({
            name: found.name,
            email: found.email,
            phone: found.phone,
            ordersCount: found.ordersCount,
            status: found.status as "Active" | "Inactive",
          });
          setProfilePicPreview(found.profilePic || null);
        } else {
          toast("Customer not found", "error");
          router.push("/admin/customers");
        }
      } catch (err) {
        console.error(err);
        toast("Failed to load customer data", "error");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCustomer();
    }
  }, [params.id, profileForm, router, toast]);

  const onSubmitProfile = async (values: ProfileFormValues) => {
    setSubmittingProfile(true);
    try {
      const payload: any = { ...values };
      if (profilePicPreview) {
        payload.profilePic = profilePicPreview;
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };

      const res = await fetch(`/api/customers/${params.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      toast("Profile information updated successfully", "success");
    } catch (err: any) {
      toast(err.message || "Failed to update profile details", "error");
    } finally {
      setSubmittingProfile(false);
    }
  };

  const onSubmitPassword = async (values: PasswordFormValues) => {
    setSubmittingPassword(true);
    try {
      const payload: any = { 
        currentPassword: values.currentPassword,
        password: values.password 
      };

      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };

      const res = await fetch(`/api/customers/${params.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update password");
      }
      toast("Password updated successfully", "success");
      passwordForm.reset();
    } catch (err: any) {
      toast(err.message || "Failed to update password", "error");
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-slate-50 dark:bg-slate-950 font-sans pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-4">
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/admin" },
              { label: "Customers", href: "/admin/customers" },
              { label: "Edit Customer", href: "#" },
            ]}
          />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Edit Customer Profile
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                Manage customer details and security settings.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/customers")}
              className="rounded-xl h-10 px-4 flex items-center gap-2 border-gray-250 dark:border-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Customers
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-green-500 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">Loading customer data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Profile Information Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 md:p-8 h-fit">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                <User className="h-5 w-5 text-green-600 dark:text-green-500" /> Profile Information
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-8">
                Update your account's profile information and email address.
              </p>

              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                  
                  {/* Profile Pic Upload */}
                  <div className="space-y-2">
                    <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Profile Picture</FormLabel>
                    <div className="flex items-center gap-4">
                      {profilePicPreview ? (
                        <img src={profilePicPreview} alt="Preview" className="h-16 w-16 rounded-full object-cover border border-gray-200 dark:border-slate-700" />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center border border-gray-200 dark:border-slate-700">
                          <Users className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setProfilePicPreview(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="cursor-pointer file:cursor-pointer file:bg-gray-100 file:border-0 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:text-xs file:font-semibold text-sm border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 rounded-xl max-w-sm h-11"
                        />
                      </div>
                      {profilePicPreview && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setProfilePicPreview(null)}
                          className="text-red-500 hover:text-red-600 p-2 h-auto"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Customer Name"
                            {...field}
                            className="h-11 border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="customer@example.com"
                            {...field}
                            className="h-11 border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone */}
                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+123456789"
                            {...field}
                            className="h-11 border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    {/* Orders count */}
                    <FormField
                      control={profileForm.control}
                      name="ordersCount"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Completed Orders</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className="h-11 border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Status */}
                    <FormField
                      control={profileForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Account Status</FormLabel>
                          <FormControl>
                            <select
                              value={field.value}
                              onChange={field.onChange}
                              className="w-full h-11 border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={submittingProfile}
                      className="bg-[#20c997] hover:bg-[#1db386] text-white rounded-md h-10 px-6 font-semibold cursor-pointer shadow-sm border-none flex items-center gap-2"
                    >
                      {submittingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </div>

            {/* Update Password Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 md:p-8 h-fit">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                <Lock className="h-5 w-5 text-red-500" /> Update Password
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-8">
                Ensure your account is using a secure password to stay protected.
              </p>

              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-6">
                  
                  {/* Current Password */}
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">Current Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                              type="password"
                              {...field}
                              className="h-11 pl-10 border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* New Password */}
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                              type="password"
                              {...field}
                              className="h-11 pl-10 border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password */}
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                              type="password"
                              {...field}
                              className="h-11 pl-10 border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={submittingPassword}
                      className="bg-[#dc3545] hover:bg-[#c82333] text-white rounded-md h-10 px-6 font-semibold cursor-pointer shadow-sm border-none flex items-center gap-2"
                    >
                      {submittingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                      Update Password
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
