'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { deleteAccountSchema, type DeleteAccountFormData } from '@/lib/validations/settings';

const deleteReasons = [
  { value: 'not-useful', label: "I don't find it useful" },
  { value: 'privacy', label: 'Privacy concerns' },
  { value: 'too-many-notifications', label: 'Too many notifications' },
  { value: 'found-alternative', label: 'Found a better alternative' },
  { value: 'temporary', label: 'Taking a break' },
  { value: 'other', label: 'Other reason' },
];

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
}: DeleteAccountDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<'reason' | 'confirm'>('reason');
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: '',
      reason: '',
      confirmation: '' as 'DELETE',
    },
  });

  const handleClose = () => {
    setStep('reason');
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = async (_data: DeleteAccountFormData) => {
    if (step === 'reason') {
      setStep('confirm');
      return;
    }

    setIsDeleting(true);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Account deleted successfully');
      handleClose();
      router.push('/goodbye');
    } catch {
      toast.error('Failed to delete account. Please check your password.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            {step === 'reason'
              ? 'We\'re sorry to see you go. Please let us know why you\'re leaving.'
              : 'This action cannot be undone. Please confirm by entering your password and typing DELETE.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 'reason' ? (
              <>
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why are you leaving?</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a reason (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {deleteReasons.map((reason) => (
                            <SelectItem key={reason.value} value={reason.value}>
                              {reason.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-lg bg-destructive/10 p-4 text-sm">
                  <p className="font-medium text-destructive">
                    What happens when you delete your account:
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                    <li>Your profile will be permanently deleted</li>
                    <li>Your posts, comments, and messages will be removed</li>
                    <li>Your marketplace listings will be deleted</li>
                    <li>You will lose access to all your data</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter your password to confirm deletion.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type DELETE to confirm</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="DELETE"
                          {...field}
                          className="uppercase"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              {step === 'confirm' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('reason')}
                  disabled={isDeleting}
                >
                  Back
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Deleting...
                  </>
                ) : step === 'reason' ? (
                  'Continue'
                ) : (
                  'Delete My Account'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
