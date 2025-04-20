
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RouteForm } from "@/components/routes/RouteForm";
import { RouteFormValues } from "@/types/route";

interface CreateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteCreated: (values: RouteFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export const CreateRouteModal = ({
  isOpen,
  onClose,
  onRouteCreated,
  isSubmitting,
}: CreateRouteModalProps) => {
  const handleSubmit = async (values: RouteFormValues) => {
    await onRouteCreated(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Route</DialogTitle>
        </DialogHeader>
        <RouteForm 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};
