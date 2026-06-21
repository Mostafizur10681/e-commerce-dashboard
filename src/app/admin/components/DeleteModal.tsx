"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ open, onClose, onConfirm, name }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete Subscription</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete <strong className="text-white">{name}</strong>? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="space-x-2">
        <DialogClose className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
          Cancel
        </DialogClose>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
        >
          Delete
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
