import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function DeleteButton({
  name,
  description,
  onDelete,
}: {
  name: string;
  description: string;
  onDelete: () => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const remove = async () => {
    setPending(true);
    setError("");
    try {
      await onDelete();
      setOpen(false);
    } catch (cause) {
      const failure = cause as { response?: { data?: { message?: string } } };
      setError(
        failure.response?.data?.message ||
          "Could not delete this record. Please try again.",
      );
    } finally {
      setPending(false);
    }
  };
  return (
    <span
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!pending) {
            setOpen(value);
            setError("");
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm" aria-label={`Delete ${name}`}>
            <Trash2 size={14} />
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent
          className="bg-card sm:max-w-lg"
          showCloseButton={!pending}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement)
              .querySelector<HTMLButtonElement>("[data-cancel-delete]")
              ?.focus();
          }}
        >
          <DialogTitle>Delete {name}?</DialogTitle>
          <DialogDescription>
            {description} This permanently deletes the records and cannot be
            undone.
          </DialogDescription>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              data-cancel-delete
              variant="outline"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" disabled={pending} onClick={remove}>
              {pending ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </span>
  );
}
