"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError("Please fill out all required fields.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message.");
      }

      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col justify-between transition-colors duration-200">
      {/* Top Navigation Back bar */}
      <div className="max-w-7xl w-full mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <span className="text-xs font-bold font-mono px-3 py-1 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 rounded-full border border-green-100/50 dark:border-green-900/30">
          Contact Form
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-5xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-none border border-gray-150 dark:border-slate-800/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-200">
          
          {/* Left Side: Contact Information Column */}
          <div className="lg:col-span-5 bg-green-700 dark:bg-[#165b33] p-8 md:p-12 text-white flex flex-col justify-between space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold tracking-tight">Contact Info</h2>
              <p className="text-green-100 text-sm leading-relaxed">
                Have questions or need assistance? Fill out the form and our team will get back to you within 24 hours.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-green-200 font-semibold uppercase tracking-wider">Call Us</p>
                  <p className="text-sm font-bold mt-0.5">+1 (555) 019-9000</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-green-200 font-semibold uppercase tracking-wider">Email Support</p>
                  <p className="text-sm font-bold mt-0.5">support@freshmart.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-green-200 font-semibold uppercase tracking-wider">Headquarters</p>
                  <p className="text-sm font-bold mt-0.5 leading-tight">100 Fresh Way, Green City</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 text-xs text-green-200">
              © {new Date().getFullYear()} FreshMart Inc. All rights reserved.
            </div>
          </div>

          {/* Right Side: Contact Form Input Column */}
          <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center">
            {success ? (
              <div className="text-center space-y-6 max-w-md mx-auto py-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/20 text-[#16A34A] border border-green-100 dark:border-green-900/30">
                  <CheckCircle2 className="h-9 w-9 text-green-600 dark:text-green-500 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Message Sent!</h3>
                  <p className="text-gray-505 dark:text-slate-400 text-sm mt-2 leading-relaxed">
                    Thank you for reaching out. Your message has been received and saved as an unread inquiry in our admin messages module. We will respond shortly.
                  </p>
                </div>
                <Button
                  onClick={() => setSuccess(false)}
                  className="bg-green-650 hover:bg-green-700 text-white rounded-xl h-10 px-6 font-semibold shadow-sm transition-colors duration-200"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Get in Touch</h3>
                  <p className="text-xs text-gray-400 dark:text-slate-500">Fields marked with * are required.</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl border border-red-100 dark:border-red-900/30">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300" htmlFor="name">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      className="w-full h-10 px-3.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300" htmlFor="email">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className="w-full h-10 px-3.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300" htmlFor="phone">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 012-3456"
                      className="w-full h-10 px-3.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300" htmlFor="subject">
                      Subject *
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Product inquiry, Support, etc."
                      className="w-full h-10 px-3.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300" htmlFor="message">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your inquiry in detail..."
                    className="w-full p-3.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-colors min-h-[100px]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-650 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-xl h-11 flex items-center justify-center gap-2 font-bold shadow-md cursor-pointer transition-all hover:scale-[1.01]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
