"use client"

import { useEffect, useState } from "react";
import { Trash2, UserCheck, ShieldAlert, Loader2, Users as UsersIcon, ShieldCheck } from "lucide-react";

import { useStore } from "@/store";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UsersPage() {
  const { users, currentUser, updateUserRole, deleteUser } = useStore();
  const [mounted, setMounted] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const handleToggleRole = (user: User) => {
    // Prevent changing role of oneself
    if (user.id === currentUser?.id) return;
    const newRole = user.role === "Admin" ? "Customer" : "Admin";
    updateUserRole(user.id, newRole);
  };

  const handleDeleteConfirm = () => {
    if (deletingUser) {
      deleteUser(deletingUser.id);
      setDeletingUser(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Users & Roles</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Control access levels, moderate admin privileges, and manage registered site accounts.
        </p>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">User Profile</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead>Security Role</TableHead>
              <TableHead className="w-[200px] text-right pr-6">Access Control</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-400">
                  No registered users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {user.name}
                          {user.id === currentUser?.id && (
                            <Badge className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-750 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 text-[9px] font-bold py-0 h-4">
                              You
                            </Badge>
                          )}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-600 dark:text-slate-400">{user.email}</TableCell>
                  <TableCell>
                    {user.role === "Admin" ? (
                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-450 dark:border-indigo-800 gap-1" variant="outline">
                        <ShieldCheck className="h-3 w-3" /> Admin
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800 gap-1" variant="outline">
                        <UsersIcon className="h-3 w-3" /> Customer
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 gap-1.5"
                        disabled={user.id === currentUser?.id}
                        onClick={() => handleToggleRole(user)}
                      >
                        {user.role === "Admin" ? (
                          <>
                            <UserCheck className="h-3.5 w-3.5 text-slate-450" />
                            Make Customer
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="h-3.5 w-3.5 text-indigo-505" />
                            Make Admin
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-red-650 dark:hover:text-red-455 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md"
                        disabled={user.id === currentUser?.id}
                        onClick={() => setDeletingUser(user)}
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Removing user account{" "}
              <strong className="text-slate-900 dark:text-slate-100">&quot;{deletingUser?.name}&quot;</strong> will terminate
              their login credentials.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-650 hover:bg-red-750 text-white">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
