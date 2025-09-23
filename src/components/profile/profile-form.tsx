"use client";

import { useState } from "react";
import Image from 'next/image';
// import { callPutApi } from "@/src/server";
import { Icons } from "@/src/core/icons";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

interface ProfileFormProps {
  user: any;
  onSave: any;
}

interface ProfileResponse {
  status: boolean;
  message?: string;
  data?: any;
}

export function ProfileForm({ user, onSave }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    userName: user?.userName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Validation function
  const validateForm = () => {
    if (!formData.firstName || formData.firstName.length < 2) {
      return "First name is required and should be at least 2 characters.";
    }
    if (!formData.lastName || formData.lastName.length < 2) {
      return "Last name is required and should be at least 2 characters.";
    }
    if (!formData.userName || formData.userName.length < 2) {
      return "Username is required and should be at least 2 characters.";
    }
    if (!formData.email) {
      return "Email is required.";
    }
    // Simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address.";
    }
    if (formData.phoneNumber) {
      // Simple phone regex (digits, +, -, spaces)
      const phoneRegex = /^[+\d][\d\s-]{7,}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        return "Please enter a valid phone number.";
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault();
    // setIsSubmitting(true);
    // setError(null);

    // // Validate form
    // const validationError = validateForm();
    // if (validationError) {
    //   setError(validationError);
    //   setIsSubmitting(false);
    //   return;
    // }

    // // Get userId from userAuthDetails in localStorage
    // const userAuthDetails = typeof window !== "undefined" ? localStorage.getItem("userAuthDetails") : null;
    // const userId = userAuthDetails ? JSON.parse(userAuthDetails).id : "";

    // if (!userId) {
    //   setError("User ID not found. Please sign in again.");
    //   setIsSubmitting(false);
    //   return;
    // }
    
    // try {
    //   const response = await callPutApi<ProfileResponse>('/users/profile', {
    //     userId, // send the DB id from localStorage
    //     firstName: formData.firstName,
    //     lastName: formData.lastName,
    //     userName: formData.userName,
    //     phoneNumber: formData.phoneNumber
    //   });

    //   if (response?.status) {
    //     if (onSave) {
    //       onSave(formData);
    //     }
    //   } else {
    //     setError(response?.message || 'Failed to update profile');
    //   }
    // } catch (error) {
    //   setError('An error occurred while updating profile');
    //   console.error('Profile update error:', error);
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  return (

   
   
    <div className="max-w-2xl mx-auto bg-[#232946] rounded-2xl shadow-2xl p-5 border border-[var(--color-secondary)]/30 profile-form">
      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[var(--color-primary)] shadow-lg bg-[#16161a]">
            <Image
              src={user.profilePicture ? user.profilePicture : '/icons/users.svg'} 
              alt="Profile"
              width={112}
              height={112}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            className="absolute bottom-2 right-2 bg-[var(--color-primary-50)] border border-[var(--color-primary)] text-[var(--color-primary)] p-2 rounded-full shadow hover:bg-[var(--color-primary)] hover:text-white transition"
            title="Change photo"
          >
            <Icons.camera className="w-5 h-5" />
          </button>
        </div>
      
        <div className="mt-4 text-lg font-semibold text-white">{formData.userName || 'Your Name'}</div>
        <div className="text-sm text-[#a1a1aa]">{formData.email}</div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500 text-sm">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 form-grid">
          <div className="form-group">
            <Label htmlFor="firstName" className="text-gray-300 text-sm form-label">First Name</Label>
            <Input 
              id="firstName" 
              value={formData.firstName}
              onChange={handleChange}
              className="bg-[var(--color-surface)]/50 border-[#667085]/30 text-white mt-1 form-input"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="lastName" className="text-gray-300 text-sm form-label">Last Name</Label>
            <Input 
              id="lastName" 
              value={formData.lastName}
              onChange={handleChange}
              className="bg-[var(--color-surface)]/50 border-[#667085]/30 text-white mt-1 form-input"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="userName" className="text-gray-300 text-sm form-label">Username</Label>
            <Input 
              id="userName" 
              value={formData.userName}
              onChange={handleChange}
              className="bg-[var(--color-surface)]/50 border-[#667085]/30 text-white mt-1 form-input"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="email" className="text-gray-300 text-sm form-label">Email</Label>
            <Input 
              id="email" 
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="bg-[var(--color-surface)]/50 border-[#667085]/30 text-white mt-1 form-input"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="phoneNumber" className="text-gray-300 text-sm form-label">Phone Number</Label>
            <Input 
              id="phoneNumber" 
              value={formData.phoneNumber}
              onChange={handleChange}
              className="bg-[var(--color-surface)]/50 border-[#667085]/30 text-white mt-1 form-input"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all px-8 py-3 rounded-lg text-[16px] font-semibold shadow form-button"
            disabled={isSubmitting}
          >
            {isSubmitting && <Icons.spinner className="w-5 h-5 mr-2 animate-spin" />}
            <Icons.save className={`w-5 h-5 mr-2 ${isSubmitting ? 'hidden' : 'block'}`} />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
   
  );
}
