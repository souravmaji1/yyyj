import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Icons } from '@/src/core/icons';
import { X } from 'lucide-react';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'danger'
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Icons.alertTriangle className="h-6 w-6 text-red-500" />,
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
          titleColor: 'text-red-500'
        };
      case 'warning':
        return {
          icon: <Icons.alertCircle className="h-6 w-6 text-yellow-500" />,
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600',
          titleColor: 'text-yellow-500'
        };
      case 'info':
        return {
          icon: <Icons.info className="h-6 w-6 text-blue-500" />,
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
          titleColor: 'text-blue-500'
        };
      default:
        return {
          icon: <Icons.alertTriangle className="h-6 w-6 text-red-500" />,
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
          titleColor: 'text-red-500'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[var(--color-bg)] border-[#667085]/20 [&>button]:hidden">
        <div className="text-white relative">
          <div className="flex items-center justify-between mb-6 bg-[var(--color-bg)] py-2 z-10">
          <DialogTitle className={`flex items-center gap-2 ${styles.titleColor}`}>
            {styles.icon}
            {title}
          </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-white font-bold hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <DialogDescription className="text-gray-300 mb-6">
            {description}
          </DialogDescription>
          
        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
              className="border-[#667085] text-gray-300 bg-transparent hover:bg-[#374151] hover:text-white hover:border-[#667085]"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={styles.confirmButton}
          >
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
} 