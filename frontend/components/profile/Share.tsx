import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Share2 } from "lucide-react";

type ShareDialogProps = {
  id: string;
};

export function ShareDialog({id}: ShareDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost"><Share2 className="h-5 w-5"/></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              defaultValue={`${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/prompt/${id}`}
              readOnly
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
