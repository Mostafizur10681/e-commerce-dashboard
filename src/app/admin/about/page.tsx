"use client"

import React, { useEffect, useState, useRef } from "react";
import {
  Info,
  Save,
  Loader2,
  CheckCircle2,
  Upload,
  Plus,
  Trash2,
  FileText,
  Compass,
  Award,
  BarChart,
  Users
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function AboutSettingsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");
  const [formData, setFormData] = useState<any>(null);

  // File input refs
  const storyImageInputRef = useRef<HTMLInputElement>(null);
  const teamImageInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  const fetchAboutData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/about");
      const result = await res.json();
      if (result.success && result.data) {
        setFormData(result.data);
      } else {
        toast("Failed to retrieve about content", "error");
      }
    } catch (err) {
      console.error("Fetch about error:", err);
      toast("Error fetching about page data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchAboutData();
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStoryPointChange = (index: number, value: string) => {
    setFormData((prev: any) => {
      const points = [...(prev.story_points || [])];
      points[index] = value;
      return { ...prev, story_points: points };
    });
  };

  const addStoryPoint = () => {
    setFormData((prev: any) => {
      const points = [...(prev.story_points || []), ""];
      return { ...prev, story_points: points };
    });
  };

  const removeStoryPoint = (index: number) => {
    setFormData((prev: any) => {
      const points = (prev.story_points || []).filter((_: any, i: number) => i !== index);
      return { ...prev, story_points: points };
    });
  };

  const handleFeatureChange = (index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const features = [...(prev.features || [])];
      features[index] = { ...features[index], [field]: value };
      return { ...prev, features };
    });
  };

  const addFeature = () => {
    setFormData((prev: any) => {
      const currentFeatures = prev.features || [];
      const bgClasses = [
        "bg-blue-50 dark:bg-blue-900/30",
        "bg-green-50 dark:bg-green-900/30",
        "bg-amber-50 dark:bg-amber-900/30",
        "bg-rose-50 dark:bg-rose-900/30",
        "bg-purple-50 dark:bg-purple-900/30",
        "bg-cyan-50 dark:bg-cyan-900/30"
      ];
      const nextBgClass = bgClasses[currentFeatures.length % bgClasses.length];
      const newFeature = {
        icon: "✨",
        title: "New Feature",
        desc: "Feature description details...",
        bgClass: nextBgClass
      };
      return {
        ...prev,
        features: [...currentFeatures, newFeature]
      };
    });
  };

  const removeFeature = (index: number) => {
    setFormData((prev: any) => {
      const features = (prev.features || []).filter((_: any, i: number) => i !== index);
      return { ...prev, features };
    });
  };

  const handleStatChange = (index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const stats = [...(prev.stats || [])];
      stats[index] = { ...stats[index], [field]: value };
      return { ...prev, stats };
    });
  };

  const handleTeamMemberChange = (index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const team = [...(prev.team || [])];
      team[index] = { ...team[index], [field]: value };
      return { ...prev, team };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "story" | "team", teamIndex?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast("File size should not exceed 2MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === "story") {
          handleFieldChange("story_image", base64String);
        } else if (type === "team" && typeof teamIndex === "number") {
          handleTeamMemberChange(teamIndex, "image", base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("df_access_token");
      const res = await fetch("/api/about", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("About page updated successfully!", "success");
        setFormData(data.data);
      } else {
        toast(data.message || "Failed to update about page", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Error updating about page content", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-sm text-slate-500">Loading dynamic About page data...</p>
      </div>
    );
  }

  const tabs = [
    { id: "hero", label: "Hero Banner", icon: FileText },
    { id: "story", label: "Our Story", icon: Compass },
    { id: "purpose", label: "Purpose & Goals", icon: Award },
    { id: "advantages", label: "Why Choose Us", icon: BarChart },
    { id: "team", label: "Team Members", icon: Users }
  ];

  return (
    <div className="space-y-6 max-w-5xl p-0 sm:p-2 lg:p-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">About Page Manager</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Dynamically configure descriptions, story highlights, purpose blocks, advantages, statistics, and team listings.
          </p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 px-5 py-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab Selection Navigation */}
        <div className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap lg:w-full ${activeTab === tab.id
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* HERO BANNER TAB */}
            {activeTab === "hero" && (
              <Card className="border-slate-200 dark:border-slate-850 shadow-sm">
                <CardHeader>
                  <CardTitle>Hero Banner Section</CardTitle>
                  <CardDescription>
                    Configure the main heading, summary description, and top badge displayed at the top of the About page.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Hero Section Badge</label>
                      <Input
                        value={formData.hero_badge || ""}
                        onChange={(e) => handleFieldChange("hero_badge", e.target.value)}
                        placeholder="e.g. Who We Are"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Hero Title / Heading</label>
                      <Input
                        value={formData.hero_title || ""}
                        onChange={(e) => handleFieldChange("hero_title", e.target.value)}
                        placeholder="e.g. About Us"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Hero Subtitle / Description Text</label>
                    <Textarea
                      value={formData.hero_subtitle || ""}
                      onChange={(e) => handleFieldChange("hero_subtitle", e.target.value)}
                      placeholder="Enter a brief, engaging summary describing your platform..."
                      className="min-h-[120px]"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* OUR STORY TAB */}
            {activeTab === "story" && (
              <Card className="border-slate-200 dark:border-slate-850 shadow-sm">
                <CardHeader>
                  <CardTitle>Our Story Section</CardTitle>
                  <CardDescription>
                    Manage the narrative of your journey, timeline milestones, and matching banner graphics.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Story Section Badge</label>
                      <Input
                        value={formData.story_badge || ""}
                        onChange={(e) => handleFieldChange("story_badge", e.target.value)}
                        placeholder="e.g. Our Story"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Story Title / Headline</label>
                      <Input
                        value={formData.story_title || ""}
                        onChange={(e) => handleFieldChange("story_title", e.target.value)}
                        placeholder="e.g. From a Small Idea to a Trusted Platform"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Description Paragraph 1</label>
                      <Textarea
                        value={formData.story_description_1 || ""}
                        onChange={(e) => handleFieldChange("story_description_1", e.target.value)}
                        placeholder="Primary paragraph..."
                        className="min-h-[120px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Description Paragraph 2</label>
                      <Textarea
                        value={formData.story_description_2 || ""}
                        onChange={(e) => handleFieldChange("story_description_2", e.target.value)}
                        placeholder="Supporting paragraph..."
                        className="min-h-[120px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* Since & Points */}
                    <div className="space-y-4 md:col-span-2">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Establishment Year (Since)</label>
                        <Input
                          value={formData.story_since || ""}
                          onChange={(e) => handleFieldChange("story_since", e.target.value)}
                          placeholder="e.g. 2023"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Key Story Points (Bullet List)</label>
                          <Button type="button" size="sm" variant="outline" onClick={addStoryPoint} className="h-7 px-2 text-xs">
                            <Plus className="h-3 w-3 mr-1" /> Add Point
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {(formData.story_points || []).map((point: string, idx: number) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <Input
                                value={point}
                                onChange={(e) => handleStoryPointChange(idx, e.target.value)}
                                placeholder="Bullet point text..."
                              />
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 text-red-500 hover:text-red-600 shrink-0"
                                onClick={() => removeStoryPoint(idx)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Image Preview & Upload */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Story Image Graphic</label>
                      <div className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 h-44 bg-slate-50 flex items-center justify-center">
                        {formData.story_image ? (
                          <>
                            <img
                              src={formData.story_image}
                              alt="Story Graphic"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="gap-2"
                                onClick={() => storyImageInputRef.current?.click()}
                              >
                                <Upload className="h-4 w-4" /> Replace Image
                              </Button>
                            </div>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => storyImageInputRef.current?.click()}
                            className="flex flex-col items-center gap-2 p-4 text-slate-400 hover:text-slate-600 transition"
                          >
                            <Upload className="h-8 w-8" />
                            <span className="text-xs font-semibold">Upload Image</span>
                          </button>
                        )}
                        <input
                          type="file"
                          ref={storyImageInputRef}
                          onChange={(e) => handleImageChange(e, "story")}
                          className="hidden"
                          accept="image/*"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* PURPOSE & GOALS TAB */}
            {activeTab === "purpose" && (
              <div className="space-y-6">
                <Card className="border-slate-200 dark:border-slate-850 shadow-sm">
                  <CardHeader>
                    <CardTitle>Mission Statement</CardTitle>
                    <CardDescription>
                      Describe your core purpose, user guarantees, and operational focus.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Mission Box Heading</label>
                      <Input
                        value={formData.mission_title || ""}
                        onChange={(e) => handleFieldChange("mission_title", e.target.value)}
                        placeholder="e.g. Our Mission"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Mission Description</label>
                      <Textarea
                        value={formData.mission_description || ""}
                        onChange={(e) => handleFieldChange("mission_description", e.target.value)}
                        placeholder="Describe the company's daily mission..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-850 shadow-sm">
                  <CardHeader>
                    <CardTitle>Vision Statement</CardTitle>
                    <CardDescription>
                      Document the long-term goals and technological reach your company aims to build.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Vision Box Heading</label>
                      <Input
                        value={formData.vision_title || ""}
                        onChange={(e) => handleFieldChange("vision_title", e.target.value)}
                        placeholder="e.g. Our Vision"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Vision Description</label>
                      <Textarea
                        value={formData.vision_description || ""}
                        onChange={(e) => handleFieldChange("vision_description", e.target.value)}
                        placeholder="Describe the long term visionary goals..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* WHY CHOOSE US TAB */}
            {activeTab === "advantages" && (
              <div className="space-y-6">
                <Card className="border-slate-200 dark:border-slate-850 shadow-sm">
                  <CardHeader>
                    <CardTitle>Why Choose Us Header</CardTitle>
                    <CardDescription>
                      Configure section headings displaying customer advantages and statistics.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Section Badge</label>
                        <Input
                          value={formData.why_choose_badge || ""}
                          onChange={(e) => handleFieldChange("why_choose_badge", e.target.value)}
                          placeholder="e.g. Our Advantages"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Section Title</label>
                        <Input
                          value={formData.why_choose_title || ""}
                          onChange={(e) => handleFieldChange("why_choose_title", e.target.value)}
                          placeholder="e.g. Why Choose FreshMart?"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Section Subtitle / Description</label>
                      <Input
                        value={formData.why_choose_subtitle || ""}
                        onChange={(e) => handleFieldChange("why_choose_subtitle", e.target.value)}
                        placeholder="We go the extra mile so you get the very best..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Features & Counters */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Advantages/Features Cards List */}
                  <Card className="border-slate-200 dark:border-slate-850 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div>
                        <CardTitle className="text-base">Features List</CardTitle>
                        <CardDescription>Modify descriptions for key delivery advantages.</CardDescription>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addFeature}
                        className="h-8 px-2.5 text-xs flex items-center gap-1 border-indigo-200 hover:border-indigo-300 text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Feature
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(formData.features || []).map((feat: any, idx: number) => (
                        <div key={idx} className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
                          <div className="flex gap-2 items-center">
                            <Input
                              value={feat.icon || ""}
                              onChange={(e) => handleFeatureChange(idx, "icon", e.target.value)}
                              placeholder="Icon"
                              className="h-8 w-12 text-center text-lg p-0 font-semibold"
                            />
                            <Input
                              value={feat.title || ""}
                              onChange={(e) => handleFeatureChange(idx, "title", e.target.value)}
                              placeholder="Feature title..."
                              className="h-8 font-semibold flex-1"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                              onClick={() => removeFeature(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            value={feat.desc || ""}
                            onChange={(e) => handleFeatureChange(idx, "desc", e.target.value)}
                            placeholder="Feature description..."
                            className="h-8 text-xs text-slate-500 dark:text-slate-400"
                          />
                        </div>
                      ))}
                      {(formData.features || []).length === 0 && (
                        <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                          No features added. Click "Add Feature" to get started.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Stat counters */}
                  <Card className="border-slate-200 dark:border-slate-850 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Metric Stats (4 Counters)</CardTitle>
                      <CardDescription>Dynamic counters displaying numbers in the green strip.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(formData.stats || []).map((stat: any, idx: number) => (
                        <div key={idx} className="grid grid-cols-2 gap-3 p-3 border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Value / Number</label>
                            <Input
                              value={stat.value || ""}
                              onChange={(e) => handleStatChange(idx, "value", e.target.value)}
                              placeholder="e.g. 12K+"
                              className="h-8 text-sm text-green-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Label / Description</label>
                            <Input
                              value={stat.label || ""}
                              onChange={(e) => handleStatChange(idx, "label", e.target.value)}
                              placeholder="e.g. Happy Customers"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                </div>
              </div>
            )}

            {/* TEAM MEMBERS TAB */}
            {activeTab === "team" && (
              <div className="space-y-6">
                <Card className="border-slate-200 dark:border-slate-850 shadow-sm">
                  <CardHeader>
                    <CardTitle>Team Section Header</CardTitle>
                    <CardDescription>Header texts and tags for the operational staff page segment.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Section Badge</label>
                        <Input
                          value={formData.team_badge || ""}
                          onChange={(e) => handleFieldChange("team_badge", e.target.value)}
                          placeholder="e.g. The Team"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Section Title</label>
                        <Input
                          value={formData.team_title || ""}
                          onChange={(e) => handleFieldChange("team_title", e.target.value)}
                          placeholder="e.g. Meet Our Team"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Section Subtitle / Description</label>
                      <Input
                        value={formData.team_subtitle || ""}
                        onChange={(e) => handleFieldChange("team_subtitle", e.target.value)}
                        placeholder="Passionate people working every day..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Team members grid list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(formData.team || []).map((member: any, idx: number) => (
                    <Card key={idx} className="border-slate-200 dark:border-slate-850 shadow-sm flex flex-col justify-between">
                      <CardHeader className="pb-3 text-center">
                        <div className="relative group rounded-full overflow-hidden w-20 h-20 mx-auto border border-slate-100 shadow-sm flex items-center justify-center bg-slate-50">
                          {member.image ? (
                            <>
                              <img
                                src={member.image}
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-white hover:text-slate-200"
                                  onClick={() => teamImageInputRefs[idx].current?.click()}
                                >
                                  <Upload className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => teamImageInputRefs[idx].current?.click()}
                              className="text-slate-400 hover:text-slate-600 transition"
                            >
                              <Upload className="h-6 w-6" />
                            </button>
                          )}
                          <input
                            type="file"
                            ref={teamImageInputRefs[idx]}
                            onChange={(e) => handleImageChange(e, "team", idx)}
                            className="hidden"
                            accept="image/*"
                          />
                        </div>
                        <CardTitle className="text-base mt-3">Member #{idx + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pb-4 flex-1">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Name</label>
                          <Input
                            value={member.name || ""}
                            onChange={(e) => handleTeamMemberChange(idx, "name", e.target.value)}
                            placeholder="Name..."
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Role</label>
                          <Input
                            value={member.role || ""}
                            onChange={(e) => handleTeamMemberChange(idx, "role", e.target.value)}
                            placeholder="Role..."
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Short Bio</label>
                          <Textarea
                            value={member.bio || ""}
                            onChange={(e) => handleTeamMemberChange(idx, "bio", e.target.value)}
                            placeholder="Professional bio summary..."
                            className="min-h-[70px] text-xs leading-normal"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* BOTTOM SAVE FOOTER */}
            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
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
        </div>
      </div>
    </div>
  );
}
