"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store";
import { Plus, MapPin, Truck, ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { AddressForm } from "@/src/components/profile/address-form";
import { Icons } from "@/src/core/icons";
import { saveUserAddress, fetchUserAddresses, updateSelectedAddressId, updateUserAddress, setDefaultAddress, deleteUserAddress, Address } from "@/src/store/slices/userSlice";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { ConfirmationDialog } from "@/src/components/ui/confirmation-dialog";

export default function AddressesPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccess, showError } = useNotificationUtils();
  const { addresses, loading, selectedAddressId } = useSelector((state: RootState) => state.user);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address & { index: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  // Set default address when addresses are loaded
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(addr => addr.setAsDefault);
      if (defaultAddress) {
        dispatch(updateSelectedAddressId(defaultAddress.id));
      } else if (addresses[0]) {
        // If no default address, select the first one
        dispatch(updateSelectedAddressId(addresses[0].id));
      }
    }
  }, [addresses]);


  useEffect(() => {
    dispatch(fetchUserAddresses());
  }, []);

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
        setShowAddressForm(false);
        setEditingAddress(null);
      } else {
        await dispatch(saveUserAddress(payload)).unwrap();
        showSuccess('Address Saved', 'Address saved successfully!');
        setShowAddressForm(false);
        setEditingAddress(null);
      }
    } catch (error: any) {
      const errorMessage = error || error?.message || 'Failed to save address';
      showError('Save Failed', errorMessage);
      // Don't close the form on error - let user fix the issue
      // The form will preserve the user's input
    } finally {
      setIsSubmitting(false);
    } 
  };


  const handleSetDefault = async (index: number) => {
    const address = addresses[index];
    if (!address) {
      showError('Error', 'Address not found');
      return;
    }
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

  return (
    <div className=" mx-auto py-10 px-4 mt-0 min-h-screen bg-[var(--color-surface)]">
      <Button
        variant="outline"
        className="mb-6 border-[var(--color-primary)] text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:text-white transition-all duration-200"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Cart
      </Button>

      <h1 className="text-3xl font-bold mb-8 text-white flex items-center">
        <MapPin className="mr-3 h-7 w-7 text-[var(--color-primary)]" />
        Manage Delivery Addresses
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Icons.spinner className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : showAddressForm ? (
        <AddressForm
          initialData={editingAddress || {}}
          onSave={handleSaveAddress}
          onCancel={() => setShowAddressForm(false)}
          isSubmitting={isSubmitting}
          currentAddressesCount={addresses.length}
          existingAddressTypes={editingAddress ? 
            addresses.filter(addr => addr.id !== editingAddress.id).map(addr => addr.typeOfAddress) :
            addresses.map(addr => addr.typeOfAddress)
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white">Your Addresses</h2>
              <div className="text-sm text-gray-400">
                {addresses.length}/5 addresses
                {addresses.length >= 5 && (
                  <span className="text-red-400 ml-2">(Limit reached)</span>
                )}
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-[var(--color-primary)]/20"
              onClick={() => setShowAddressForm(true)}
              disabled={loading || addresses.length >= 5}
            >
              {loading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add New Address
            </Button>
          </div>

          {addresses.length > 0 ? (
            <div className="space-y-4">
              <RadioGroup
                value={selectedAddressId || ""}
                onValueChange={(value) => {
                  dispatch(updateSelectedAddressId(value));
                }}
              >
                {addresses.map((address, index) => (
                  <div
                    key={address.id}
                    className={`border ${selectedAddressId === address.id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-gray-700'} rounded-lg p-4 relative transition-all hover:border-[var(--color-primary)]/70`}
                  >
                    <RadioGroupItem
                      value={address.id}
                      id={`address-${address.id}`}
                      className="absolute top-4 left-4 border-gray-500"
                    />
                    <div className="pl-8">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{address.fullName}</span>
                        {address.setAsDefault && (
                          <span className="bg-[var(--color-panel)] text-xs px-2 py-0.5 rounded text-[var(--color-primary)]">DEFAULT</span>
                        )}
                        <span className="bg-[var(--color-panel)] text-xs px-2 py-0.5 rounded text-gray-300 capitalize">
                          {address.typeOfAddress}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {address.street || `${address.houseNo || ''} ${address.buildingName || ''}`.trim()}, {address.city}, {address.state} - {address.postalCode} , {address.country}
                      </p>
                      <p className="text-gray-300 text-sm mt-1">
                        Phone: {address.phoneNumber}
                      </p>

                      <p className="text-gray-300 text-sm mt-1">
                        Alternate Phone: {address.alternatePhoneNumber}
                      </p>

                      <div className="flex gap-4 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[var(--color-primary)] text-white bg-[var(--color-primary)] hover:text-white hover:bg-[var(--color-primary)]/10 transition-all duration-200"
                          onClick={() => {
                            const formData = {
                              ...address,
                              streetAddress: address.street || `${address.houseNo || ''} ${address.buildingName || ''}`.trim(), // Use street field first, fallback to houseNo + buildingName
                              pincode: address.postalCode,
                              alternatePhone: address.alternatePhoneNumber,
                              isDefault: address.setAsDefault,
                              type: address.typeOfAddress,
                              country: address.country
                            };
                            setEditingAddress({ ...formData, index });
                            setShowAddressForm(true);
                          }}
                          disabled={loading || deletingAddressId === address.id}
                        >
                          {loading ? (
                            <Icons.spinner className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <Icons.edit className="mr-1 h-3 w-3" />
                          )}
                          Edit
                        </Button>
                        {!address.setAsDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent hover:text-white hover:bg-[var(--color-primary)]/10 transition-all duration-200"
                            onClick={() => handleSetDefault(index)}
                            disabled={deletingAddressId === address.id}
                          >
                            <Icons.check className="mr-1 h-3 w-3" />
                            Set as Default
                          </Button>
                        )}
                        {address.setAsDefault && (
                          <div className="flex items-center justify-center px-3 py-1 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-xs">
                            <Icons.check className="mr-1 h-3 w-3" />
                            Default
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500 text-red-400 bg-transparent hover:text-white hover:bg-red-500/10 transition-all duration-200"
                          onClick={() => handleDeleteClick(address)}
                          disabled={deletingAddressId === address.id}
                        >
                          {deletingAddressId === address.id ? (
                            <Icons.spinner className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <Icons.trash className="mr-1 h-3 w-3" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-end gap-4 mt-6">
                <Button
                  variant="outline"
                  className="border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent hover:text-white hover:bg-[var(--color-primary)]/10 transition-all duration-200"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-[var(--color-primary)]/20 px-6"
                  onClick={() => {
                    if (selectedAddressId) {
                      // Navigate back to the previous page (cart/checkout)
                      router.back();
                    } 
                  }}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Deliver to this Address
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--color-surface)] rounded-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <MapPin className="h-16 w-16 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-white">No addresses found</h2>
              <p className="text-gray-400 mb-6">
                You haven&apos;t added any delivery addresses yet.
              </p>
              <Button
                className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-[var(--color-primary)]/20"
                onClick={() => setShowAddressForm(true)}
                disabled={addresses.length >= 5}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Address
              </Button>
              {addresses.length >= 5 && (
                <p className="text-red-400 text-sm mt-2">
                  Address limit reached. Please delete an existing address first.
                </p>
              )}
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