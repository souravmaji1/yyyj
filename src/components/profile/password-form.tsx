"use client";

import { useState } from "react";
import { Icons } from "@/src/core/icons";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

interface PasswordFormProps {
  onSave: (data: any) => Promise<void>;
}

export function PasswordForm({ onSave }: PasswordFormProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault();
    // // Basic validation
    // if (formData.newPassword !== formData.confirmPassword) {
    //   setError('New passwords do not match');
    //   return;
    // }
    // if (formData.newPassword.length < 8) {
    //   setError('Password must be at least 8 characters long');
    //   return;
    // }

    // // Get userId from userAuthDetails in localStorage
    // const userAuthDetails = typeof window !== "undefined" ? localStorage.getItem("userAuthDetails") : null;
    // const userId = userAuthDetails ? JSON.parse(userAuthDetails).id : "";
    // if (!userId) {
    //   setError("User ID not found. Please sign in again.");
    //   return;
    // }

    // setIsSubmitting(true);
    // try {
    //   await callPutApi('/users/change-password', {
    //     userId,
    //     currentPassword: formData.currentPassword,
    //     newPassword: formData.newPassword,
    //     confirmPassword:formData.confirmPassword

    //   });
    //   // Reset form after successful save
    //   setFormData({
    //     currentPassword: '',
    //     newPassword: '',
    //     confirmPassword: '',
    //   });
    //   if (onSave) await onSave(formData);
    // } catch (err) {
    //   console.error(err);
    //   setError('Failed to update password');
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  return (
    <>
      <h2 className="max-w-2xl mx-auto mt-6 text-white text-2xl font-semibold">Change Password</h2>
      <div className="max-w-2xl mx-auto bg-[#232946] rounded-2xl shadow-2xl p-5 border border-[var(--color-secondary)]/30 mt-3">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="currentPassword" className="text-gray-300 text-sm">Current Password</Label>
              <Input 
                id="currentPassword" 
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                className="bg-[var(--color-surface)]/50 border-[#667085]/30 text-white mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="newPassword" className="text-gray-300 text-sm">New Password</Label>
              <Input 
                id="newPassword" 
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                className="bg-[var(--color-surface)]/50 border-[#667085]/30 text-white mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-300 text-sm">Confirm New Password</Label>
              <Input 
                id="confirmPassword" 
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bg-[var(--color-surface)]/50 border-[#667085]/30 text-white mt-1"
                required
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button 
                type="submit"
                className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
                <Icons.save className={`w-4 h-4 mr-2 ${isSubmitting ? 'hidden' : 'block'}`} />
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
