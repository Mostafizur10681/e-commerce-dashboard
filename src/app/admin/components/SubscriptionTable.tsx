import React from "react";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
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

export const SubscriptionTable: React.FC<Props> = ({ data, onDelete }) => (
  <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-6">User Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Plan Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Auto Renew</TableHead>
          <TableHead className="text-right pr-6">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((sub) => (
          <TableRow
            key={sub.id}
            className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
          >
            <TableCell className="pl-6 font-medium text-gray-900 dark:text-white">
              {sub.name}
            </TableCell>
            <TableCell className="text-gray-500 dark:text-gray-400">
              {sub.email}
            </TableCell>
            <TableCell className="font-medium text-green-600">{sub.plan}</TableCell>
            <TableCell>
              <StatusBadge status={sub.status as any} />
            </TableCell>
            <TableCell className="text-gray-500 dark:text-gray-400">
              {sub.startDate}
            </TableCell>
            <TableCell className="text-gray-500 dark:text-gray-400">
              {sub.endDate}
            </TableCell>
            <TableCell className="text-gray-500 dark:text-gray-400">
              {sub.autoRenew ? "Yes" : "No"}
            </TableCell>
          <TableCell className="text-right pr-6 flex gap-2 justify-end">
              <Link
                href={`/admin/subscriptions/${sub.id}`}
                className="text-sm"
                aria-label="View subscription"
                title="View"
              >
                <Eye className="h-5 w-5 text-blue-600 hover:text-blue-800 transition-colors" />
              </Link>
              <Link
                href={`/admin/subscriptions/edit/${sub.id}`}
                className="text-sm"
                aria-label="Edit subscription"
                title="Edit"
              >
                <Pencil className="h-5 w-5 text-emerald-600 hover:text-emerald-800 transition-colors" />
              </Link>
              <button
                onClick={() => onDelete(sub)}
                className="text-sm"
                aria-label="Delete subscription"
                title="Delete"
              >
                <Trash2 className="h-5 w-5 text-red-600 hover:text-red-800 transition-colors" />
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
