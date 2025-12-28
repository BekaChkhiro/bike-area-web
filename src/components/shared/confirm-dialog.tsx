'use client';

import { useState, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from './spinner';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  trigger?: ReactNode;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
  open: controlledOpen,
  onOpenChange,
  disabled = false,
}: ConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      setOpen(false);
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}

      <AlertDialogContent>
        <AlertDialogHeader>
          {variant === 'destructive' && (
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-destructive/10 to-destructive/20 shadow-sm">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
          )}
          <AlertDialogTitle className={variant === 'destructive' ? 'text-center' : ''}>
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription className={variant === 'destructive' ? 'text-center' : ''}>
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className={cn('gap-3', variant === 'destructive' ? 'sm:justify-center' : '')}>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || disabled}
            className={cn(
              variant === 'destructive' &&
                'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md hover:shadow-destructive/20'
            )}
          >
            {isLoading && <Spinner size="sm" variant="white" className="mr-2" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Delete confirmation dialog
interface DeleteDialogProps {
  trigger?: ReactNode;
  itemName?: string;
  onDelete: () => void | Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteDialog({
  trigger,
  itemName = 'this item',
  onDelete,
  open,
  onOpenChange,
}: DeleteDialogProps) {
  return (
    <ConfirmDialog
      trigger={trigger}
      title="Are you sure?"
      description={`This will permanently delete ${itemName}. This action cannot be undone.`}
      confirmText="Delete"
      variant="destructive"
      onConfirm={onDelete}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

// Logout confirmation dialog
interface LogoutDialogProps {
  trigger?: ReactNode;
  onLogout: () => void | Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LogoutDialog({
  trigger,
  onLogout,
  open,
  onOpenChange,
}: LogoutDialogProps) {
  return (
    <ConfirmDialog
      trigger={trigger}
      title="Log out"
      description="Are you sure you want to log out of your account?"
      confirmText="Log out"
      onConfirm={onLogout}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

// Discard changes dialog
interface DiscardChangesDialogProps {
  trigger?: ReactNode;
  onDiscard: () => void | Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DiscardChangesDialog({
  trigger,
  onDiscard,
  open,
  onOpenChange,
}: DiscardChangesDialogProps) {
  return (
    <ConfirmDialog
      trigger={trigger}
      title="Discard changes?"
      description="You have unsaved changes. Are you sure you want to discard them?"
      confirmText="Discard"
      cancelText="Keep editing"
      variant="destructive"
      onConfirm={onDiscard}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

// Confirmation button with built-in dialog
interface ConfirmButtonProps extends React.ComponentProps<typeof Button> {
  dialogTitle: string;
  dialogDescription?: string;
  confirmText?: string;
  onConfirm: () => void | Promise<void>;
  destructive?: boolean;
  children: React.ReactNode;
}

export function ConfirmButton({
  dialogTitle,
  dialogDescription,
  confirmText = 'Confirm',
  onConfirm,
  destructive = false,
  children,
  ...buttonProps
}: ConfirmButtonProps) {
  return (
    <ConfirmDialog
      trigger={<Button {...buttonProps}>{children}</Button>}
      title={dialogTitle}
      description={dialogDescription}
      confirmText={confirmText}
      variant={destructive ? 'destructive' : 'default'}
      onConfirm={onConfirm}
    />
  );
}
