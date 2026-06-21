import React from "react";

interface StatusBadgeProps {
  status: "Active" | "Expired" | "Pending" | "Cancelled";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const base = "px-2 py-0.5 rounded text-xs font-medium";
  const variants: Record<string, string> = {
    Active: "bg-green-100 dark:bg-green-900/30 text-green-600",
    Expired: "bg-red-100 dark:bg-red-900/30 text-red-500",
    Pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500",
    Cancelled: "bg-gray-100 dark:bg-gray-800/30 text-gray-500",
  };

  return <span className={`${base} ${variants[status]}`}>{status}</span>;
};
