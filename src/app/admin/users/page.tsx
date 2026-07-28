"use client"

import { useEffect, useState } from "react";
import { Trash2, UserCheck, ShieldAlert, Loader2, Users as UsersIcon, ShieldCheck, Pencil } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UsersPage() {
  const { currentUser, updateUserRole: storeUpdateUserRole, deleteUser: storeDeleteUser } = useStore();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"Admin" | "Customer">("Customer");
  const [editStatus, setEditStatus] = useState<"active" | "blocked" | "pending">("active");
  const [editPassword, setEditPassword] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("df_access_token");
      const res = await fetch("/api/users", {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchUsers();
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const handleToggleRole = async (user: User) => {
    // Prevent changing role of oneself
    if (user.id === currentUser?.id) return;
    const newRole = user.role === "Admin" ? "Customer" : "Admin";
    try {
      const token = localStorage.getItem("df_access_token");
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update user role");
      // Update local state
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
      // Sync Zustand store
      storeUpdateUserRole(user.id, newRole);
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleApprove = async (user: User) => {
    try {
      const token = localStorage.getItem("df_access_token");
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: "active" }),
      });
      if (!res.ok) throw new Error("Failed to approve user");
      // Update local state
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: "active" } : u)));
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };

  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditStatus((user.status as any) || "active");
    setEditPassword("");
  };

  const handleEditSubmit = async () => {
    if (!editingUser) return;
    try {
      setEditSaving(true);
      const token = localStorage.getItem("df_access_token");
      const payload: any = {
        name: editName,
        email: editEmail,
        role: editRole,
        status: editStatus,
      };
      if (editPassword) {
        payload.password = editPassword;
        payload.password_confirmation = editPassword;
      }
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update user");
      const updated = await res.json();
      
      // Update local state
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...updated } : u)));
      setEditingUser(null);
    } catch (error) {
      console.error("Error editing user:", error);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingUser) {
      try {
        const token = localStorage.getItem("df_access_token");
        const res = await fetch(`/api/users/${deletingUser.id}`, {
          method: "DELETE",
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to delete user");
        // Update local state
        setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
        // Sync Zustand store
        storeDeleteUser(deletingUser.id);
        setDeletingUser(null);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  return (
    <div className="space-y-6 p-0 sm:p-2 lg:p-4">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Users & Roles</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Control access levels, moderate admin privileges, and manage registered site accounts.
        </p>
      </div>

      {/* Users Data Layout Wrapper */}
      <div className="rounded-lg border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-955 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            <span className="text-sm text-slate-500">Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No registered users found.
          </div>
        ) : (
          <>
            {/* Desktop View (Table layout) */}
            <div className="hidden lg:block w-full overflow-x-auto">
              <Table className="min-w-[800px] w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">User Profile</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Security Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[280px] text-right pr-6">Access Control</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
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
                                <Badge className="bg-indigo-100 dark:bg-indigo-955/60 text-indigo-750 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 text-[9px] font-bold py-0 h-4">
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
                          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-455 dark:border-indigo-800 gap-1" variant="outline">
                            <ShieldCheck className="h-3 w-3" /> Admin
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800 gap-1" variant="outline">
                            <UsersIcon className="h-3 w-3" /> Customer
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.status === "active" || !user.status ? (
                          <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/30" variant="outline">
                            Active
                          </Badge>
                        ) : user.status === "pending" ? (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-955/30 dark:text-amber-400 dark:border-amber-900/30" variant="outline">
                            Pending Approval
                          </Badge>
                        ) : (
                          <Badge className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30" variant="outline">
                            Blocked
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          {user.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 bg-green-50 text-green-705 border-green-200 hover:bg-green-100 hover:text-green-800 font-bold gap-1 cursor-pointer"
                              onClick={() => handleApprove(user)}
                            >
                              Approve
                            </Button>
                          )}
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
                            className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-455 hover:bg-indigo-50 dark:hover:bg-indigo-955/20 rounded-md"
                            disabled={user.id === currentUser?.id}
                            onClick={() => handleStartEdit(user)}
                            title="Edit User"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-red-650 dark:hover:text-red-455 hover:bg-red-50 dark:hover:bg-red-955/20 rounded-md"
                            disabled={user.id === currentUser?.id}
                            onClick={() => setDeletingUser(user)}
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile/Tablet View (Card grid layout) */}
            <div className="block lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-55/50 dark:bg-slate-900/10">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 space-y-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                          {user.name}
                          {user.id === currentUser?.id && (
                            <Badge className="bg-indigo-100 dark:bg-indigo-955/60 text-indigo-750 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 text-[8px] font-bold py-0 h-3.5">
                              You
                            </Badge>
                          )}
                        </h4>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{user.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="py-2.5 border-t border-b border-gray-100 dark:border-slate-850 flex justify-between items-center gap-4">
                    <div>
                      <span className="text-xs text-gray-400 block">Security Role</span>
                      {user.role === "Admin" ? (
                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-455 dark:border-indigo-800 gap-1 mt-0.5" variant="outline">
                          <ShieldCheck className="h-3 w-3" /> Admin
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800 gap-1 mt-0.5" variant="outline">
                          <UsersIcon className="h-3 w-3" /> Customer
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-405 block">Status</span>
                      {user.status === "active" || !user.status ? (
                        <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/30 mt-0.5" variant="outline">
                          Active
                        </Badge>
                      ) : user.status === "pending" ? (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-955/30 dark:text-amber-400 dark:border-amber-900/30 mt-0.5" variant="outline">
                          Pending
                        </Badge>
                      ) : (
                        <Badge className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30 mt-0.5" variant="outline">
                          Blocked
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      {user.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] h-8 bg-green-50 text-green-705 border-green-200 hover:bg-green-100 hover:text-green-800 font-bold gap-1 cursor-pointer"
                          onClick={() => handleApprove(user)}
                        >
                          Approve User
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[10px] h-8 gap-1.5"
                        disabled={user.id === currentUser?.id}
                        onClick={() => handleToggleRole(user)}
                      >
                        {user.role === "Admin" ? "Make Customer" : "Make Admin"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-md cursor-pointer"
                        disabled={user.id === currentUser?.id}
                        onClick={() => handleStartEdit(user)}
                        title="Edit User"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 dark:text-slate-405 hover:text-red-600 dark:hover:text-red-405 hover:bg-red-55 dark:hover:bg-red-955/20 rounded-md cursor-pointer"
                        disabled={user.id === currentUser?.id}
                        onClick={() => setDeletingUser(user)}
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
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
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-650 hover:bg-red-755 text-white">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
            <DialogDescription>
              Modify user settings for <strong className="text-slate-900 dark:text-slate-100">{editingUser?.email}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right font-medium">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right font-medium">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right font-medium">New Password</Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="Leave blank to keep current"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right font-medium">Role</Label>
              <div className="col-span-3">
                <Select value={editRole} onValueChange={(val: any) => setEditRole(val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right font-medium">Status</Label>
              <div className="col-span-3">
                <Select value={editStatus} onValueChange={(val: any) => setEditStatus(val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} disabled={editSaving}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={editSaving}>
              {editSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
