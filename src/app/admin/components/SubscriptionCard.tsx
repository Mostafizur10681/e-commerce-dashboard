import React from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

interface Subscription {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: "Active" | "Expired" | "Cancelled";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

interface Props {
  data: Subscription[];
  onDelete: (sub: Subscription) => void;
}

export const SubscriptionCard: React.FC<Props> = ({ data, onDelete }) => (
  <div className="grid gap-4">
    {data.map((sub) => (
      <div
        key={sub.id}
        className="rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{sub.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{sub.email}</p>
          </div>
          <StatusBadge status={sub.status as any} />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium">Plan:</span> {sub.plan}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium">Period:</span> {sub.startDate} → {sub.endDate}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium">Auto‑Renew:</span> {sub.autoRenew ? "Yes" : "No"}
        </p>
        <div className="mt-3 flex justify-end gap-2">
          <Link
            href={`/admin/subscriptions/${sub.id}`}
            className="text-blue-600 hover:text-blue-800"
            aria-label="View subscription"
            title="View"
          >
            <Eye className="h-5 w-5" />
          </Link>
          <Link
            href={`/admin/subscriptions/edit/${sub.id}`}
            className="text-emerald-600 hover:text-emerald-800"
            aria-label="Edit subscription"
            title="Edit"
          >
            <Pencil className="h-5 w-5" />
          </Link>
          <button
            onClick={() => onDelete(sub)}
            className="text-red-600 hover:text-red-800"
            aria-label="Delete subscription"
            title="Delete"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    ))}
  </div>
);
