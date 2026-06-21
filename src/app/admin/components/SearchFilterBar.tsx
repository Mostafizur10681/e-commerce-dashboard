import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SearchFilterBarProps {
  onSearch: (term: string) => void;
  onFilter: (status: string) => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ onSearch, onFilter }) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(search.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [search, onSearch]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatus(value);
    onFilter(value);
  };

  const router = useRouter();
  const handleAdd = () => {
    // Placeholder – navigate to an Add Subscription page if exists
    router.push("/admin/subscriptions/add");
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-colors"
        />
        <select
          value={status}
          onChange={handleStatusChange}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-colors"
        >
          <option value="All">All</option>
          <option value="Active">Active</option>
          <option value="Expired">Expired</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      <button
        onClick={handleAdd}
        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        ➕ Add Subscription
      </button>
    </div>
  );
};
