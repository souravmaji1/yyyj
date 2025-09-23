"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store";
import { fetchUserAddresses, saveUserAddress, updateUserAddress, setDefaultAddress, deleteUserAddress, Address } from "@/src/store/slices/userSlice";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Icons } from "@/src/core/icons";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { AddressForm } from "./address-form";
import { ConfirmationDialog } from "@/src/components/ui/confirmation-dialog";

export function AddressesTab() {
  const dispatch = useDispatch<AppDispatch>();
  const { addresses, loading } = useSelector((state: RootState) => state.user);
  const { showSuccess, showError } = useNotificationUtils();
  
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  // Fetch addresses on component mount
  useEffect(() => {
    dispatch(fetchUserAddresses());
  }, [dispatch]);

  const handleSaveAddress = async (addressData: any) => {
    setIsSubmitting(true);
    
    // Improved parsing logic for building number, building name, and street name
    const fullAddress = addressData.streetAddress;
    
    // Extract building number (starts with digits)
    const buildingNoMatch = fullAddress.match(/^(\d+)/);
    const buildingNo = buildingNoMatch ? buildingNoMatch[1] : "";
    
    // Remove building number from the remaining address
    const remainingAddress = buildingNo ? fullAddress.replace(/^\d+\s*/, "").trim() : fullAddress;
    
    // Try to extract building name (usually 1-3 characters, often alphanumeric)
    // Look for patterns like "C5", "A1", "B2", etc.
    const buildingNameMatch = remainingAddress.match(/^([A-Z]\d{1,2}|[A-Z]{1,3})\s+/i);
    const buildingName = buildingNameMatch ? buildingNameMatch[1] : "";
    
    // Street name is what remains after building number and building name
    const streetName = buildingName ? remainingAddress.replace(/^[A-Z]\d{1,2}\s+|^[A-Z]{1,3}\s+/i, "").trim() : remainingAddress;
    
    const payload = {
      street: fullAddress, // Full merged address (e.g., "123 Main Street")
      city: addressData.city,
      state: addressData.state,
      country: addressData.country || "India",
      postalCode: addressData.pincode,
      isActive: true,
      fullName: addressData.fullName,
      phoneNumber: addressData.phoneNumber,
      alternatePhoneNumber: addressData.alternatePhone || "",
      location: "",
      houseNo: "", // Will be parsed by backend from street field
      buildingName: "", // Will be parsed by backend from street field
      typeOfAddress: addressData.type,
      setAsDefault: addressData.isDefault
    };

    try {
      if (editingAddress) {
        const result = await dispatch(updateUserAddress({ 
          addressId: editingAddress.id, 
          addressData: payload 
        })).unwrap();
        showSuccess('Address Updated', result.message || 'Address updated successfully!');
      } else {
        await dispatch(saveUserAddress(payload)).unwrap();
        showSuccess('Address Saved', 'Address saved successfully!');
      }
      setIsAddingAddress(false);
      setEditingAddress(null);
    } catch (error: any) {
      const errorMessage =  error || error?.message || 'Failed to save address';
      showError('Save Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (address: Address) => {
    try {
      await dispatch(setDefaultAddress(address.id)).unwrap();
      showSuccess('Default Set', 'Default address updated successfully!');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to set default address';
      showError('Update Failed', errorMessage);
    }
  };

  const handleDeleteClick = (address: Address) => {
    setAddressToDelete(address);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;

    setDeletingAddressId(addressToDelete.id);
    try {
      const result = await dispatch(deleteUserAddress(addressToDelete.id)).unwrap();
      showSuccess('Address Deleted', result.message || 'Address deleted successfully!');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to delete address';
      showError('Delete Failed', errorMessage);
    } finally {
      setDeletingAddressId(null);
      setAddressToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleEditAddress = (address: Address) => {
    const formData = {
      ...address,
      streetAddress: address.street || `${address.houseNo || ''} ${address.buildingName || ''}`.trim(), // Use street field first, fallback to houseNo + buildingName
      pincode: address.postalCode,
      alternatePhone: address.alternatePhoneNumber,
      isDefault: address.setAsDefault,
      type: address.typeOfAddress,
      country: address.country
    };
    setEditingAddress({ ...formData });
    setIsAddingAddress(true);
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'home':
        return <Icons.home className="w-4 h-4" />;
      case 'work':
        return <Icons.briefcase className="w-4 h-4" />;
      case 'office':
        return <Icons.building className="w-4 h-4" />;
      default:
        return <Icons.mapPin className="w-4 h-4" />;
    }
  };

  const getAddressTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'home':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'work':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'office':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Delivery Addresses</h2>
          <p className="text-[#667085] mt-1">Manage your shipping and delivery addresses</p>
        </div>
        {!isAddingAddress && (
          <Button 
            onClick={() => setIsAddingAddress(true)}
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all"
          >
            <Icons.plus className="h-4 w-4 mr-2" />
            Add Address
          </Button>
        )}
      </div>

      {loading && !isAddingAddress ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Icons.spinner className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
            <span className="text-gray-400">Loading addresses...</span>
          </div>
        </div>
      ) : isAddingAddress ? (
        <div className="max-w-2xl">
          <Card className="bg-[var(--color-surface)]/50 border-[#667085]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Icons.mapPin className="w-5 h-5 mr-2 text-[var(--color-primary)]" />
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddressForm
                initialData={editingAddress || {}}
                onSave={handleSaveAddress}
                onCancel={() => {
                  setIsAddingAddress(false);
                  setEditingAddress(null);
                }}
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {addresses.length === 0 ? (
            <Card className="bg-[var(--color-surface)]/50 border-[#667085]/20">
              <CardContent className="text-center py-12">
                <Icons.mapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No addresses found</h3>
                <p className="text-gray-400 mb-6">
                  You haven't added any delivery addresses yet. Add your first address to get started.
                </p>
                <Button 
                  onClick={() => setIsAddingAddress(true)}
                  className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all"
                >
                  <Icons.plus className="h-4 w-4 mr-2" />
                  Add Your First Address
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <Card 
                  key={address.id} 
                  className={`bg-[var(--color-surface)]/50 border-[#667085]/20 transition-all duration-200 hover:border-[var(--color-primary)]/30 ${
                    address.setAsDefault ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    {/* Header with type and default badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-[var(--color-primary)]/10">
                          {getAddressTypeIcon(address.typeOfAddress)}
                        </div>
                        <div>
                          <Badge className={getAddressTypeColor(address.typeOfAddress)}>
                            {address.typeOfAddress}
                          </Badge>
                          {address.setAsDefault && (
                            <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Address Details */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-white text-lg mb-1">
                          {address.fullName}
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {address.street || `${address.houseNo || ''} ${address.buildingName || ''}`.trim()}
                          <br />
                          {address.city}, {address.state} - {address.postalCode}
                          <br />
                          {address.country}
                        </p>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-2 pt-3 border-t border-[#667085]/20">
                        <div className="flex items-center gap-2 text-sm">
                          <Icons.phone className="w-4 h-4 text-[var(--color-primary)]" />
                          <span className="text-gray-300">{address.phoneNumber}</span>
                        </div>
                        {address.alternatePhoneNumber && (
                          <div className="flex items-center gap-2 text-sm">
                            <Icons.phone className="w-4 h-4 text-[var(--color-primary)]" />
                            <span className="text-gray-300">{address.alternatePhoneNumber}</span>
                            <span className="text-xs text-gray-500">(Alternate)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6 pt-4 border-t border-[#667085]/20">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditAddress(address)}
                        disabled={deletingAddressId === address.id}
                      >
                        <Icons.edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      {!address.setAsDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-green-500 text-green-400 hover:bg-green-500 hover:text-white transition-all"
                          onClick={() => handleSetDefault(address)}
                          disabled={deletingAddressId === address.id}
                        >
                          <Icons.check className="w-4 h-4 mr-2" />
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                        onClick={() => handleDeleteClick(address)}
                        disabled={deletingAddressId === address.id}
                      >
                        {deletingAddressId === address.id ? (
                          <Icons.spinner className="w-4 h-4 animate-spin" />
                        ) : (
                          <Icons.trash className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Address"
        description={`Are you sure you want to delete this address?\n\n${addressToDelete?.fullName}\n${addressToDelete?.street || `${addressToDelete?.houseNo || ''} ${addressToDelete?.buildingName || ''}`.trim()}, ${addressToDelete?.city}, ${addressToDelete?.state}`}
        confirmText="Delete Address"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        isLoading={deletingAddressId === addressToDelete?.id}
        variant="danger"
      />
    </div>
  );
}
