"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store";
import { changePassword } from "@/src/store/slices/userSlice";
import { Icons } from "@/src/core/icons";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { useAuth } from "@/src/app/apis/auth/UserAuth";

interface ChangePasswordTabProps {
  user: any;
}

export function ChangePasswordTab({ user }: ChangePasswordTabProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccess, showError } = useNotificationUtils();
  const { logout } = useAuth();
  const { passwordChangeLoading, passwordChangeError } = useSelector((state: RootState) => state.user);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Current password validation
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    // New password validation
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (formData.newPassword.length > 24) {
      newErrors.newPassword = 'Password must be less than 24 characters long';
    } else if (!/(?=.*[a-z])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one number';
    } else if (!/(?=.*[@$!%*?&])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one special character (@$!%*?&)';
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.confirmPassword.length > 24) {
      newErrors.confirmPassword = 'Password must be less than 24 characters long';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Check if new password is same as current
    if (formData.currentPassword && formData.newPassword &&
      formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    // Clear error for this specific field when user starts typing
    if (errors[id as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [id]: undefined }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(changePassword(formData)).unwrap();

      showSuccess('Success', result.message || 'Password changed successfully');

      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Show logout confirmation
      showSuccess('Logout Required', 'For security reasons, you will be logged out. Please log in again with your new password.');

      // Logout after a short delay
      setTimeout(() => {
        logout();
      }, 2000);

    } catch (error: any) {
      showError('Password Change Failed', error || 'An error occurred while changing password');
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/(?=.*[a-z])/.test(password)) score++;
    if (/(?=.*[A-Z])/.test(password)) score++;
    if (/(?=.*\d)/.test(password)) score++;
    if (/(?=.*[@$!%*?&])/.test(password)) score++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'];

    return {
      score,
      label: labels[score - 1] || '',
      color: colors[score - 1] || ''
    };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Change Password</h2>
          <p className="text-[#667085] mt-1">Update your password to keep your account secure</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card className="bg-[var(--color-surface)]/50 border-[#667085]/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Icons.lock className="w-5 h-5 mr-2 text-[var(--color-primary)]" />
              Password Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <Label htmlFor="currentPassword" className="text-gray-300 text-sm font-medium">
                  Current Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={handleChange}
                    maxLength={24}
                    className={`bg-[var(--color-panel)] border-[#667085]/30 text-white focus:border-[var(--color-primary)] pr-10 ${errors.currentPassword ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                    placeholder="Enter your current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-white hover:text-[var(--color-primary)] hover:bg-[#374151]/50"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {!showPasswords.current ? (
                      <Icons.eyeOff className="h-4 w-4" />
                    ) : (
                      <Icons.eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.currentPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.currentPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <Label htmlFor="newPassword" className="text-gray-300 text-sm font-medium">
                  New Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`bg-[var(--color-panel)] border-[#667085]/30 text-white focus:border-[var(--color-primary)] pr-10 ${errors.newPassword ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                    placeholder="Enter your new password"
                    maxLength={24}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-white hover:text-[var(--color-primary)] hover:bg-[#374151]/50"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {!showPasswords.new ? (
                      <Icons.eyeOff className="h-4 w-4" />
                    ) : (
                      <Icons.eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {formData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 w-8 rounded-full ${level <= passwordStrength.score
                                ? passwordStrength.color.replace('text-', 'bg-')
                                : 'bg-gray-600'
                              }`}
                          />
                        ))}
                      </div>
                      <span className={`text-xs ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Password must contain at least 8 characters, including uppercase, lowercase, number, and special character
                    </div>
                  </div>
                )}
                {errors.newPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword" className="text-gray-300 text-sm font-medium">
                  Confirm New Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`bg-[var(--color-panel)] border-[#667085]/30 text-white focus:border-[var(--color-primary)] pr-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                    placeholder="Confirm your new password"
                    maxLength={24}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-white hover:text-[var(--color-primary)] hover:bg-[#374151]/50"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {!showPasswords.confirm ? (
                      <Icons.eyeOff className="h-4 w-4" />
                    ) : (
                      <Icons.eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Security Notice */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icons.info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-blue-400 font-medium mb-1">Security Notice</h4>
                    <p className="text-blue-300 text-sm">
                      For security reasons, you will be automatically logged out after changing your password.
                      You'll need to log in again with your new password.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={passwordChangeLoading}
                  className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all"
                >
                  {passwordChangeLoading && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
                  {passwordChangeLoading ? 'Changing Password...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 