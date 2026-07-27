"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Lock, Mail, User, Phone, Sparkles } from "lucide-react"

import { useStore } from "@/store"
import { AuthInput } from "./AuthInput"
import { AuthButton } from "./AuthButton"
import { SocialAuth } from "./SocialAuth"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"

interface AuthContainerProps {
  defaultMode: "login" | "register";
}

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(6, "Phone number must be at least 6 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export function AuthContainer({ defaultMode }: AuthContainerProps) {
  const router = useRouter();
  const login = useStore((state) => state.login);
  const register = useStore((state) => state.register);

  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("session_expired") === "1") {
        setLoginError("Session expired. Please log in again.");
      }
    }
  }, []);

  // Sync state changes back and forth to browser popstate (e.g. back button)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/register") {
        setMode("register");
      } else if (path === "/login") {
        setMode("login");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const switchMode = (target: "login" | "register") => {
    setMode(target);
    if (target === "register") {
      setSuccessMessage(null);
    }
    // Silent state update without hard router refresh
    window.history.pushState(null, "", `/${target}`);
  };

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@dataflow.com",
      password: "password123",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setLoginError(null);
    setSuccessMessage(null);
    await new Promise((resolve) => setTimeout(resolve, 800));
    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        router.push("/admin/dashboard");
      } else {
        setLoginError(result.error || "Invalid email address or password. Please try again.");
      }
    } catch (error: any) {
      setLoginError(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    setRegisterError(null);
    await new Promise((resolve) => setTimeout(resolve, 800));
    try {
      const success = await register(
        values.name,
        values.email,
        values.password,
        values.confirmPassword,
        values.phone
      );
      if (success) {
        setSuccessMessage("Registration successful! Your account is pending admin approval.");
        switchMode("login");
      } else {
        setRegisterError("Registration failed. Please make sure the details are correct.");
      }
    } catch {
      setRegisterError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 transition-colors duration-300">
      {/* Outer Shell Wrapper (Double Slider layout) */}
      <div className="relative w-full max-w-[420px] min-h-[580px] md:max-w-[800px] md:min-h-[520px] bg-white dark:bg-gray-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500">

        {/* SIGN IN CONTAINER */}
        <div
          className={cn(
            "absolute top-0 h-full transition-all duration-600 ease-in-out left-0 flex flex-col justify-center px-6 sm:px-12 py-8 w-full md:w-1/2",
            mode === "login"
              ? "translate-x-0 opacity-100 z-10"
              : "md:translate-x-full -translate-x-full opacity-0 z-1 pointer-events-none"
          )}
        >
          <div className="space-y-4 w-full">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#16A34A] fill-[#16A34A]/10" />
                Sign In
              </h2>

            </div>

            {successMessage && (
              <div className="rounded-xl bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50 p-3 text-xs font-semibold">
                {successMessage}
              </div>
            )}

            {loginError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 border border-red-200 dark:border-red-900/50 p-3 text-xs font-semibold">
                {loginError}
              </div>
            )}

            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-3.5">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">Email Address</FormLabel>
                      <FormControl>
                        <AuthInput
                          placeholder="admin@dataflow.com"
                          icon={<Mail className="h-4.5 w-4.5" />}
                          error={!!fieldState.error}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">Password</FormLabel>
                      <FormControl>
                        <AuthInput
                          type="password"
                          placeholder="••••••••"
                          icon={<Lock className="h-4.5 w-4.5" />}
                          error={!!fieldState.error}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-500 dark:text-gray-400 select-none">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-[#16A34A] focus:ring-[#16A34A] focus:ring-opacity-25"
                    />
                    <span>Remember Me</span>
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Password recovery link simulated.");
                    }}
                    className="font-semibold text-[#16A34A] hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>

                <AuthButton type="submit" isLoading={isLoading} className="mt-2">
                  Sign In
                </AuthButton>
              </form>
            </Form>

            <SocialAuth />

            <div className="text-center text-xs text-gray-500 dark:text-gray-400 md:hidden pt-2">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="font-bold text-[#16A34A] hover:underline cursor-pointer"
              >
                Register
              </button>
            </div>
          </div>
        </div>

        {/* SIGN UP CONTAINER */}
        <div
          className={cn(
            "absolute top-0 h-full transition-all duration-600 ease-in-out left-0 flex flex-col justify-center px-6 sm:px-12 py-8 w-full md:w-1/2",
            mode === "register"
              ? "md:translate-x-full translate-x-0 opacity-100 z-10"
              : "translate-x-full opacity-0 z-1 pointer-events-none"
          )}
        >
          <div className="space-y-4 w-full">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#16A34A] fill-[#16A34A]/10" />
                Create Account
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-405">
                Setup your administration workspace profile
              </p>
            </div>

            {registerError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-405 border border-red-200 dark:border-red-900/50 p-3 text-xs font-semibold">
                {registerError}
              </div>
            )}

            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-2.5">
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Full Name</FormLabel>
                      <FormControl>
                        <AuthInput
                          placeholder="Sarah Connor"
                          icon={<User className="h-4 w-4" />}
                          error={!!fieldState.error}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Email Address</FormLabel>
                      <FormControl>
                        <AuthInput
                          placeholder="sarah.connor@cyberdyne.com"
                          icon={<Mail className="h-4 w-4" />}
                          error={!!fieldState.error}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="phone"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-0.5">
                      <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Phone Number</FormLabel>
                      <FormControl>
                        <AuthInput
                          placeholder="0170000000"
                          icon={<Phone className="h-4 w-4" />}
                          error={!!fieldState.error}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field, fieldState }) => (
                      <FormItem className="space-y-0.5">
                        <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Password</FormLabel>
                        <FormControl>
                          <AuthInput
                            type="password"
                            placeholder="••••••••"
                            icon={<Lock className="h-4 w-4" />}
                            error={!!fieldState.error}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field, fieldState }) => (
                      <FormItem className="space-y-0.5">
                        <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Confirm</FormLabel>
                        <FormControl>
                          <AuthInput
                            type="password"
                            placeholder="••••••••"
                            icon={<Lock className="h-4 w-4" />}
                            error={!!fieldState.error}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>

                <AuthButton type="submit" isLoading={isLoading} className="mt-2.5">
                  Create Account
                </AuthButton>
              </form>
            </Form>

            <SocialAuth />

            <div className="text-center text-xs text-gray-500 dark:text-gray-400 md:hidden pt-2">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="font-bold text-[#16A34A] hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>

        {/* OVERLAY GRAPHIC CONTAINER (SLIDING BRAND PANEL) */}
        <div
          className={cn(
            "absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600 ease-in-out z-[100] hidden md:block",
            mode === "register" ? "-translate-x-full" : "translate-x-0"
          )}
        >
          {/* Background Sliding Panel */}
          <div
            className={cn(
              "absolute bg-gradient-to-br from-[#16A34A] via-[#15803D] to-emerald-600 dark:from-green-900 dark:via-green-800 dark:to-emerald-900 text-white left-[-100%] h-full w-[200%] transition-transform duration-600 ease-in-out",
              mode === "register" ? "translate-x-1/2" : "translate-x-0"
            )}
          >
            {/* Left Overlay panel (active in register state / prompts to login) */}
            <div
              className={cn(
                "absolute flex flex-col items-center justify-center px-12 text-center top-0 h-full w-1/2 transition-transform duration-600 ease-in-out",
                mode === "register" ? "translate-x-0" : "-translate-x-[20%]"
              )}
            >
              <h1 className="text-3xl font-extrabold tracking-tight mb-4">Welcome Back!</h1>
              <p className="text-xs text-green-100 mb-8 max-w-[280px] leading-relaxed">
                To keep connected with us please login with your personal credentials.
              </p>
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="border border-white hover:bg-white hover:text-green-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider py-3 px-8 transition-all active:scale-[0.97] hover:scale-[1.02] cursor-pointer"
              >
                Sign In
              </button>
            </div>

            {/* Right Overlay panel (active in login state / prompts to register) */}
            <div
              className={cn(
                "absolute flex flex-col items-center justify-center px-12 text-center top-0 h-full w-1/2 transition-transform duration-600 ease-in-out right-0",
                mode === "register" ? "translate-x-[20%]" : "translate-x-0"
              )}
            >
              <h1 className="text-3xl font-extrabold tracking-tight mb-4">Hello, Friend!</h1>
              <p className="text-xs text-green-100 mb-8 max-w-[280px] leading-relaxed">
                Enter your details to create an account and start journey with us today.
              </p>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="border border-white hover:bg-white hover:text-green-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider py-3 px-8 transition-all active:scale-[0.97] hover:scale-[1.02] cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
