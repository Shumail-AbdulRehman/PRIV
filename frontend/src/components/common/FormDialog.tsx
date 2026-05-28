import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FormDialogProps {
  title: string;
  triggerText: string;
  onSubmit: (e:any) => void;
  children: React.ReactNode;
}

const FormDialog= ({ title, triggerText, onSubmit, children }: FormDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{triggerText}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          <div className="flex justify-end space-x-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="submit">{triggerText}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormDialog;