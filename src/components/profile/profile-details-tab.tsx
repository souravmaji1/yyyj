"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store";
import {
  fetchUserProfile,
  updateUserProfile,
} from "@/src/store/slices/userSlice";
import { Icons } from "@/src/core/icons";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { isKioskInterface } from "@/src/core/utils";
import { PhoneVerificationModal } from "@/src/components/auth/PhoneVerificationModal";
import { initiatePhoneVerification } from "@/src/store/slices/phoneVerificationSlice";

interface ProfileDetailsTabProps {
  user: any;
  onProfileUpdate: (data: any) => Promise<void>;
}

export function ProfileDetailsTab({
  user,
  onProfileUpdate,
}: ProfileDetailsTabProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccess, showError } = useNotificationUtils();
  const { loading, error } = useSelector((state: RootState) => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    userName: user?.userName || "",
    age: user?.age || "",
    phoneNumber: user?.phoneNumber || "",
  });
  const [ageError, setAgeError] = useState("");

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return (
      formData.firstName !== (user?.firstName || "") ||
      formData.lastName !== (user?.lastName || "") ||
      formData.userName !== (user?.userName || "") ||
      formData.age !== (user?.age || "") ||
      formData.phoneNumber !== (user?.phoneNumber || "")
    );
  };

  // Check if required fields are filled
  const isFormValid = () => {
    const hasRequiredFields =
      formData.firstName.trim() !== "" && formData.userName.trim() !== "";

    // Check phone number validation
    const phoneValidationError = getPhoneValidationError();
    const isPhoneValid = !phoneValidationError;

    return hasRequiredFields && isPhoneValid;
  };

  // Fetch user profile on component mount if not already loaded
  useEffect(() => {
    if (!user?.id) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user?.id]);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        userName: user.userName || "",
        age: user.age || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === "age") {
      // Only allow positive integers greater than 0
      const num = Number(value);
      if (value === "" || (/^\d+$/.test(value) && num > 0)) {
        setFormData((prev) => ({ ...prev, [id]: value }));
        setAgeError("");
      } else {
        setAgeError("Age must be a positive number greater than 0");
      }
    } else if (id === "phoneNumber") {
      // Only allow numbers for phone number
      const numbersOnly = value.replace(/[^0-9]/g, '');
      // Automatically add "+" prefix if not empty
      const phoneWithPlus = numbersOnly ? `+${numbersOnly}` : '';
      setFormData((prev) => ({ ...prev, [id]: phoneWithPlus }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSave = async () => {
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        userName: formData.userName,
        age: formData.age ? parseInt(formData.age) : null,
        phoneNumber: formData.phoneNumber,
      };

      if (isFormValid()) {
        const result = await dispatch(updateUserProfile(updateData)).unwrap();

        showSuccess(
          "Success",
          result.message || "Profile updated successfully"
        );
        setIsEditing(false);

        // Refresh user data to get updated profile information
        dispatch(fetchUserProfile());

        if (onProfileUpdate) {
          await onProfileUpdate(result.data);
        }
      }
    } catch (error: any) {
      showError(
        "Update Failed",
        error || "An error occurred while updating profile"
      );
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      userName: user?.userName || "",
      age: user?.age || "",
      phoneNumber: user?.phoneNumber || "",
    });
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "verified":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            Not Verified
          </Badge>
        );
    }
  };

  const getAccountStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Active
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            Suspended
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            Unknown
          </Badge>
        );
    }
  };

  const handleSendPhoneVerification = async () => {
    if (formData.phoneNumber && formData.phoneNumber !== (user?.phoneNumber || "")) {
      try {
        // Call the send OTP API first
        const result = await dispatch(initiatePhoneVerification(formData.phoneNumber)).unwrap();

        // Only open modal if API is successful
        if (result.status === true) {
          showSuccess('OTP Sent', 'Verification code sent to your phone');
          setShowPhoneVerification(true);
        } else {
          showError('OTP Error', result.message || 'Failed to send OTP');
        }
      } catch (error: any) {
        showError('OTP Error', error || 'Failed to send verification code');
      }
    }
  }

  const handlePhoneVerificationSuccess = async () => {
    try {
      showSuccess('Phone Verification', 'Phone number verified successfully!');

      dispatch(fetchUserProfile());

      setShowPhoneVerification(false);
    } catch (error: any) {
      showError('Verification Error', 'Failed to save verified phone number');
    }
  };

  const getPhoneVerificationBadge = (isVerified: boolean) => {
    return isVerified ? (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
        Verified
      </Badge>
    ) : (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
        Not Verified
      </Badge>
    );
  };

  // Phone number validation helper
  const validatePhoneNumber = (phone: string): string | null => {
    const trimmed = phone.trim();
    if (!trimmed) return null; // Allow empty (optional field)

    // Remove the "+" prefix for validation
    const phoneWithoutPlus = trimmed.startsWith('+') ? trimmed.substring(1) : trimmed;
    
    // Check if it's only numbers and has correct length (7 to 15 digits)
    const phoneRegex = /^[0-9]{7,15}$/;
    return phoneRegex.test(phoneWithoutPlus)
      ? null
      : "Please enter a valid phone number (7 to 15 digits)";
  };

  const getPhoneValidationError = () => {
    return validatePhoneNumber(formData.phoneNumber);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <Icons.spinner className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
          <span className="text-gray-400">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Icons.alertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">Failed to load profile</p>
          <Button
            onClick={() => dispatch(fetchUserProfile())}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Profile Details</h2>
          <p className="text-[#667085] mt-1">
            Manage your personal information and account settings
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all"
        >
          {isEditing ? (
            <>
              <Icons.eye className="w-4 h-4 mr-2" />
              View Mode
            </>
          ) : (
            <>
              <Icons.edit className="w-4 h-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[var(--color-surface)]/50 border-[#667085]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Icons.user className="w-5 h-5 mr-2 text-[var(--color-primary)]" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="firstName"
                    className="text-gray-300 text-sm font-medium"
                  >
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="bg-[var(--color-panel)] border-[#667085]/30 text-white mt-1 focus:border-[var(--color-primary)] truncate"
                      placeholder="Enter first name"
                      maxLength={50}
                    />
                  ) : (
                    <p className="text-white mt-1 truncate">
                      {user?.firstName || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="lastName"
                    className="text-gray-300 text-sm font-medium"
                  >
                    Last Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="bg-[var(--color-panel)] border-[#667085]/30 text-white mt-1 focus:border-[var(--color-primary)] truncate"
                      placeholder="Enter last name"
                      maxLength={50}
                    />
                  ) : (
                    <p className="text-white mt-1 truncate">
                      {user?.lastName || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="userName"
                    className="text-gray-300 text-sm font-medium"
                  >
                    Username <span className="text-red-500">*</span>
                  </Label>
                  {isEditing ? (
                    <Input
                      id="userName"
                      value={formData.userName}
                      onChange={handleChange}
                      className="bg-[var(--color-panel)] border-[#667085]/30 text-white mt-1 focus:border-[var(--color-primary)] truncate"
                      placeholder="Enter username"
                      maxLength={30}
                    />
                  ) : (
                    <p className="text-white mt-1 truncate">
                      {user?.userName || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="age"
                    className="text-gray-300 text-sm font-medium"
                  >
                    Age
                  </Label>
                  {isEditing ? (
                    <>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                        className="bg-[var(--color-panel)] border-[#667085]/30 text-white mt-1 focus:border-[var(--color-primary)]"
                        placeholder="Enter age"
                        min="1"
                        max="150"
                        onKeyPress={(e) => {
                          const value = parseInt(e.currentTarget.value + e.key);
                          if (value > 150 || value < 1) {
                            e.preventDefault();
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value);
                          if (value > 150) {
                            e.target.value = "150";
                            setFormData((prev) => ({ ...prev, age: "150" }));
                          } else if (value < 1) {
                            e.target.value = "1";
                            setFormData((prev) => ({ ...prev, age: "1" }));
                          }
                        }}
                      />
                      {ageError && (
                        <p className="text-red-400 text-xs mt-1">{ageError}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-white mt-1">
                      {user?.age || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="text-gray-300 text-sm font-medium"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-[var(--color-panel)]/50 border-[#667085]/30 text-gray-400 mt-1 cursor-not-allowed truncate"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="phoneNumber"
                    className="text-gray-300 text-sm font-medium"
                  >
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className={`flex-1 bg-[var(--color-panel)] border-[#667085]/30 text-white focus:border-[var(--color-primary)] ${getPhoneValidationError()
                            ? "border-red-500 focus:border-red-500"
                            : ""
                            }`}
                          placeholder="Enter phone number (numbers only)"
                          maxLength={16}
                        />
                        {formData.phoneNumber && formData.phoneNumber !== (user?.phoneNumber || "") && (
                          <Button
                            onClick={handleSendPhoneVerification}
                            size="sm"
                            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 text-white whitespace-nowrap"
                          >
                            Verify
                          </Button>
                        )}
                      </div>
                      {getPhoneValidationError() && (
                        <p className="text-red-400 text-xs mt-1">
                          {getPhoneValidationError()}
                        </p>
                      )}
                      {formData.phoneNumber && formData.phoneNumber !== (user?.phoneNumber || "") && (
                        <p className="text-yellow-400 text-xs mt-1">
                          Please verify your phone number before saving
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-white">
                        {user?.phoneNumber || "Not provided"}
                      </p>
                      {user?.phoneNumber && (
                        <div className="flex items-center space-x-2">
                          {getPhoneVerificationBadge(true)}
                          <Button
                            onClick={handleSendPhoneVerification}
                            size="sm"
                            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 text-white text-xs"
                          >
                            Verify
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-[#667085]/20">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="border-[#667085]/30 text-black hover:bg-[#667085]/10 hover:text-black"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading || !hasUnsavedChanges() || !isFormValid()}
                    className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all"
                  >
                    {loading && (
                      <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {loading
                      ? "Saving..."
                      : !isFormValid()
                        ? "Fill Required Fields"
                        : !hasUnsavedChanges()
                          ? "No Changes"
                          : "Save Changes"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Status & Additional Info */}
        <div className="space-y-6">
          <Card className="bg-[var(--color-surface)]/50 border-[#667085]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Icons.shield className="w-5 h-5 mr-2 text-[var(--color-primary)]" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                {isKioskInterface() && (
                  <>
                    <span className="text-gray-300 text-sm">KYC Status</span>
                    {getStatusBadge(user?.kycStatus)}
                  </>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Account Status</span>
                {getAccountStatusBadge(user?.accountStatus)}
              </div>
              {user?.age ? (
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Adult Status</span>
                  <Badge
                    className={
                      user.age >= 18
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }
                  >
                    {user.age >= 18 ? "Adult" : "Minor"}
                  </Badge>
                </div>
              ) : (
                <></>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-surface)]/50 border-[#667085]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Icons.wallet className="w-5 h-5 mr-2 text-[var(--color-primary)]" />
                Wallet Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Token Balance</span>
                <div className="flex items-center">
                  <Icons.token className="w-4 h-4 text-[var(--color-primary)] mr-1" />
                  <span className="text-white font-semibold">
                    {user?.tokenBalance || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-surface)]/50 border-[#667085]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Icons.clock className="w-5 h-5 mr-2 text-[var(--color-primary)]" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-gray-300 text-sm">Member Since</span>
                <p className="text-white text-sm mt-1">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
              <div>
                <span className="text-gray-300 text-sm">Last Updated</span>
                <p className="text-white text-sm mt-1">
                  {user?.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={showPhoneVerification}
        onClose={() => setShowPhoneVerification(false)}
        phoneNumberUser={formData.phoneNumber}
        onSuccess={handlePhoneVerificationSuccess}
      />
    </div>
  );
}
