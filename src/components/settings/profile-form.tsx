'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, X, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useUpdateProfile } from '@/lib/api/hooks/use-user';
import { useUsernameCheck } from '@/hooks/use-username-check';
import { profileSchema, type ProfileFormData } from '@/lib/validations/profile';
import { cn } from '@/lib/utils';
import type { User } from '@/types/auth';

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [bioLength, setBioLength] = useState(user.bio?.length ?? 0);

  const updateMutation = useUpdateProfile();
  const { isAvailable, isChecking, error: usernameError, checkUsername } = useUsernameCheck(
    user.username
  );

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user.username,
      fullName: user.fullName,
      bio: user.bio ?? '',
      location: user.location ?? '',
      website: user.website ?? '',
      dateOfBirth: '',
      gender: '',
    },
  });

  const watchedUsername = form.watch('username');
  const watchedBio = form.watch('bio');

  // Check username availability when it changes
  useEffect(() => {
    if (watchedUsername && watchedUsername !== user.username) {
      checkUsername(watchedUsername);
    }
  }, [watchedUsername, user.username, checkUsername]);

  // Update bio length counter
  useEffect(() => {
    setBioLength(watchedBio?.length ?? 0);
  }, [watchedBio]);

  const onSubmit = async (data: ProfileFormData) => {
    // Don't submit if username is taken
    if (data.username !== user.username && !isAvailable) {
      return;
    }

    await updateMutation.mutateAsync({
      username: data.username,
      fullName: data.fullName,
      bio: data.bio || undefined,
      location: data.location || undefined,
      website: data.website || undefined,
    });
  };

  const handleReset = () => {
    form.reset({
      username: user.username,
      fullName: user.fullName,
      bio: user.bio ?? '',
      location: user.location ?? '',
      website: user.website ?? '',
      dateOfBirth: '',
      gender: '',
    });
  };

  const isUsernameValid =
    watchedUsername === user.username || (isAvailable && !isChecking && !usernameError);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Username */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="username"
                    {...field}
                    className={cn(
                      'pr-10',
                      watchedUsername !== user.username &&
                        (isUsernameValid
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : usernameError
                            ? 'border-destructive focus-visible:ring-destructive'
                            : '')
                    )}
                  />
                  {watchedUsername !== user.username && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isChecking ? (
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      ) : isUsernameValid ? (
                        <Check className="size-4 text-green-500" />
                      ) : (
                        <X className="size-4 text-destructive" />
                      )}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Your unique username. 3-20 characters, letters, numbers, and
                underscores only.
              </FormDescription>
              {usernameError && watchedUsername !== user.username && (
                <p className="text-sm text-destructive">{usernameError}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Full Name */}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bio */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <div className="flex justify-between text-sm text-muted-foreground">
                <FormDescription>
                  A brief description about yourself.
                </FormDescription>
                <span
                  className={cn(bioLength > 500 && 'text-destructive')}
                >
                  {bioLength}/500
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="City, Country" {...field} />
              </FormControl>
              <FormDescription>Your city or general area.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Website */}
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" type="url" {...field} />
              </FormControl>
              <FormDescription>Your personal website or blog.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date of Birth */}
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormDescription>
                This information is private and won&apos;t be shown publicly.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gender */}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                This information is private and won&apos;t be shown publicly.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={
              updateMutation.isPending ||
              (watchedUsername !== user.username && !isUsernameValid)
            }
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={updateMutation.isPending}
          >
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}
