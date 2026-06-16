"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: boolean;
}

const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, type, icon, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none select-none">
            {icon}
          </div>
        )}
        <input
          type={inputType}
          className={cn(
            "w-full h-11 rounded-xl bg-gray-50 dark:bg-gray-900 border text-sm transition-all duration-300 outline-none pr-4",
            icon ? "pl-10" : "pl-4",
            isPassword ? "pr-10" : "pr-4",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-800"
              : "border-gray-250 dark:border-gray-800 focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 text-gray-905 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600",
            className
          )}
          ref={ref}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none cursor-pointer"
          >
            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";

export { AuthInput };
