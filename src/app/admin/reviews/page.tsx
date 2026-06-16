"use client"

import { useEffect, useState } from "react";
import { Star, Trash2, Check, Loader2, StarHalf, MessageSquare, AlertCircle } from "lucide-react";

import { useStore } from "@/store";
import { Review } from "@/types";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function ReviewsPage() {
  const { reviews, approveReview, deleteReview } = useStore();
  const [mounted, setMounted] = useState(false);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);

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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "fill-amber-400 text-amber-400" : "text-slate-350 dark:text-slate-700"
            }`}
          />
        ))}
      </div>
    );
  };

  const handleDeleteConfirm = () => {
    if (deletingReview) {
      deleteReview(deletingReview.id);
      setDeletingReview(null);
    }
  };

  const pendingReviews = reviews.filter((r) => !r.approved);
  const approvedReviews = reviews.filter((r) => r.approved);

  const ReviewTable = ({ list }: { list: Review[] }) => {
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 border border-dashed rounded-lg border-slate-200 dark:border-slate-800">
          <MessageSquare className="h-8 w-8 stroke-1 mb-2" />
          <p className="text-sm font-medium">No reviews found in this category.</p>
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Product</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="max-w-xs">Comment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px] text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((review) => (
              <TableRow key={review.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                <TableCell className="font-semibold text-slate-900 dark:text-slate-100 pl-6">
                  {review.productName}
                </TableCell>
                <TableCell className="font-medium text-slate-700 dark:text-slate-300">{review.customerName}</TableCell>
                <TableCell>{renderStars(review.rating)}</TableCell>
                <TableCell className="max-w-xs text-sm font-normal text-slate-500 dark:text-slate-400 truncate" title={review.comment}>
                  {review.comment}
                </TableCell>
                <TableCell className="text-slate-400 text-xs font-mono">{review.date}</TableCell>
                <TableCell>
                  {review.approved ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800" variant="outline">Approved</Badge>
                  ) : (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800" variant="outline">Pending</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-2">
                    {!review.approved && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                        onClick={() => approveReview(review.id)}
                        title="Approve Review"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-red-650 dark:hover:text-red-455 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md"
                      onClick={() => setDeletingReview(review)}
                      title="Delete Review"
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
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Product Reviews</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Moderate review comments left by customers, approve verified reviews, or delete inappropriate content.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="all">All Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingReviews.length})
            {pendingReviews.length > 0 && (
              <span className="ml-1.5 flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedReviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ReviewTable list={reviews} />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <ReviewTable list={pendingReviews} />
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <ReviewTable list={approvedReviews} />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deletingReview} onOpenChange={(open) => !open && setDeletingReview(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the review left by{" "}
              <strong className="text-slate-900 dark:text-slate-100">&quot;{deletingReview?.customerName}&quot;</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-650 hover:bg-red-750 text-white">
              Delete Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
