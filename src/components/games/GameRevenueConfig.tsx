'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Check } from 'lucide-react';

interface GameRevenueConfigProps {
  onSave?: () => void;
  onCancel?: () => void;
  onDataChange?: (data: any) => void;
  formData?: any;
}

export default function GameRevenueConfig({ onSave, onCancel, onDataChange, formData }: GameRevenueConfigProps) {
  const [revenueSources, setRevenueSources] = useState({
    ads: true,
    subscriptions: true
  });

  const [adsSettings, setAdsSettings] = useState({
    publisherId: '',
    networkIntegration: '',
    frequencySettings: '',
    adPlacementTypes: ''
  });

  const [subscriptionTiers, setSubscriptionTiers] = useState([
    {
      id: 1,
      price: '',
      tierName: '',
      features: {
        noAds: true,
        extraLevels: false,
        specialNfts: false
      },
      customFeature: '',
      showCustomFeatureInput: false,
      duration: ''
    }
  ]);

  // Function to update parent component
  const updateParentData = useCallback(() => {
    if (onDataChange) {
      const dataToSend = {
        revenueSources,
        adsPublisherId: adsSettings.publisherId,
        adsNetworkIntegration: adsSettings.networkIntegration,
        adsFrequency: adsSettings.frequencySettings,
        adsPlacementTypes: adsSettings.adPlacementTypes,
        subscriptionTiers,
      };
      onDataChange(dataToSend);
    }
  }, [
    onDataChange, revenueSources, adsSettings, subscriptionTiers
  ]);

  // Update parent on mount
  useEffect(() => {
    updateParentData();
  }, [updateParentData]);

  const handleRevenueSourceChange = (source: 'ads' | 'subscriptions') => {
    setRevenueSources(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
    setTimeout(updateParentData, 0);
  };

  const handleAdsSettingChange = (field: string, value: string) => {
    setAdsSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setTimeout(updateParentData, 0);
  };

  const handleSubscriptionTierChange = (index: number, field: string, value: any) => {
    const newTiers = [...subscriptionTiers];
    if (field === 'features') {
      if (newTiers[index]) {
        newTiers[index] = {
          ...newTiers[index],
          features: {
            ...newTiers[index].features,
            ...value
          }
        };
      }
    } else {
      if (newTiers[index]) {
        newTiers[index] = {
          ...newTiers[index],
          [field]: value
        };
      }
    }
    setSubscriptionTiers(newTiers);
    setTimeout(updateParentData, 0);
  };

  const handleSubscriptionFieldChange = (tierId: number, field: string, value: string) => {
    setSubscriptionTiers(prev => prev.map(tier => 
      tier.id === tierId 
        ? { ...tier, [field]: value }
        : tier
    ));
    setTimeout(updateParentData, 0);
  };

  const handleSubscriptionBooleanFieldChange = (tierId: number, field: string, value: boolean) => {
    setSubscriptionTiers(prev => prev.map(tier => 
      tier.id === tierId 
        ? { ...tier, [field]: value }
        : tier
    ));
    setTimeout(updateParentData, 0);
  };

  const addSubscriptionTier = () => {
    const newTier = {
      id: subscriptionTiers.length + 1,
      price: '',
      tierName: '',
      features: {
        noAds: false,
        extraLevels: false,
        specialNfts: false
      },
      customFeature: '',
      showCustomFeatureInput: false,
      duration: ''
    };
    setSubscriptionTiers(prev => [...prev, newTier]);
    setTimeout(updateParentData, 0);
  };

  const removeSubscriptionTier = (tierId: number) => {
    setSubscriptionTiers(prev => prev.filter(tier => tier.id !== tierId));
    setTimeout(updateParentData, 0);
  };

  const addCustomFeature = (tierId: number) => {
    const tier = subscriptionTiers.find(t => t.id === tierId);
    if (tier && tier.customFeature.trim()) {
      // Add custom feature logic here
      handleSubscriptionFieldChange(tierId, 'customFeature', '');
    }
  };

  const removeCustomFeature = (tierId: number) => {
    handleSubscriptionFieldChange(tierId, 'customFeature', '');
  };

  return (
    <div className="w-full max-w-8xl">
      <div className="mt-6">
        <div className="w-full">
          <div className="bg-[#0c1120]/80 backdrop-blur-sm border border-[#1e1b4d]/30 rounded-2xl shadow-2xl p-8 hover:border-[#2e2d7b]/50 transition-all duration-300">
            <h1 className="text-2xl font-bold text-[#E6E9F2] mb-8">
              Game Revenue Source Configuration Flow
            </h1>

            {/* Select Revenue Source */}
            <div className="mb-8">
                              <h2 className="text-lg font-semibold text-[#E6E9F2] mb-4">Select Revenue Source</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center p-4 border border-[#2e2d7b]/30 rounded-xl cursor-pointer hover:bg-[#0f1529]/30 transition-colors bg-[#0f1529]/20">
                                   <input
                   type="checkbox"
                   checked={revenueSources.ads}
                   onChange={() => handleRevenueSourceChange('ads')}
                   className="w-1.5 h-1.5 text-[#02a7fd] bg-[#0f1529]/50 border-[#2e2d7b]/50 rounded focus:ring-[#02a7fd] focus:ring-offset-[#0c1120]"
                 />
                  <span className="ml-3 text-[#E6E9F2] font-medium">Ads</span>
                </label>
                <label className="flex items-center p-4 border border-[#2e2d7b]/30 rounded-xl cursor-pointer hover:bg-[#0f1529]/30 transition-colors bg-[#0f1529]/20">
                                   <input
                   type="checkbox"
                   checked={revenueSources.subscriptions}
                   onChange={() => handleRevenueSourceChange('subscriptions')}
                   className="w-1.5 h-1.5 text-[#02a7fd] bg-[#0f1529]/50 border-[#2e2d7b]/50 rounded focus:ring-[#02a7fd] focus:ring-offset-[#0c1120]"
                 />
                  <span className="ml-3 text-[#E6E9F2] font-medium">Subscriptions</span>
                </label>
              </div>
            </div>

            {/* Ads Setting */}
            {revenueSources.ads && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-[#E6E9F2] mb-4">Ads Setting</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                                          <label className="block text-sm font-medium text-[#9AA3B2] mb-2">
                        Publisher ID / API Key
                      </label>
                      <input
                        type="text"
                        value={adsSettings.publisherId}
                        onChange={(e) => handleAdsSettingChange('publisherId', e.target.value)}
                        placeholder="Enter ID/API key"
                        className="w-full px-4 py-3 border border-[#2e2d7b]/30 rounded-xl bg-[#0f1529]/50 text-[#E6E9F2] focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent transition-all duration-200 placeholder-[#6B7280]"
                      />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9AA3B2] mb-2">
                      Network Integration
                    </label>
                    <input
                      type="text"
                      value={adsSettings.networkIntegration}
                      onChange={(e) => handleAdsSettingChange('networkIntegration', e.target.value)}
                      placeholder="Enter network integration"
                      className="w-full px-4 py-3 border border-[#2e2d7b]/30 rounded-xl bg-[#0f1529]/50 text-[#E6E9F2] focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent transition-all duration-200 placeholder-[#6B7280]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9AA3B2] mb-2">
                      Frequency Settings
                    </label>
                    <input
                      type="text"
                      value={adsSettings.frequencySettings}
                      onChange={(e) => handleAdsSettingChange('frequencySettings', e.target.value)}
                      placeholder="Enter frequency settings"
                      className="w-full px-4 py-3 border border-[#2e2d7b]/30 rounded-xl bg-[#0f1529]/50 text-[#E6E9F2] focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent transition-all duration-200 placeholder-[#6B7280]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#9AA3B2] mb-2">
                      Ad Placement Types
                    </label>
                    <input
                      type="text"
                      value={adsSettings.adPlacementTypes}
                      onChange={(e) => handleAdsSettingChange('adPlacementTypes', e.target.value)}
                      placeholder="Enter ad placement types"
                      className="w-full px-4 py-3 border border-[#2e2d7b]/30 rounded-xl bg-[#0f1529]/50 text-[#E6E9F2] focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent transition-all duration-200 placeholder-[#6B7280]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Subscriptions Setting */}
            {revenueSources.subscriptions && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-[#E6E9F2] mb-4">Subscriptions Setting</h2>
                {subscriptionTiers.map((tier) => (
                  <div key={tier.id} className="mb-6 p-4 border border-[#2e2d7b]/30 rounded-xl bg-[#0f1529]/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                                                  <label className="block text-sm font-medium text-[#9AA3B2] mb-2">
                            Price
                          </label>
                          <input
                            type="text"
                            value={tier.price}
                            onChange={(e) => handleSubscriptionFieldChange(tier.id, 'price', e.target.value)}
                            placeholder="Enter price"
                            className="w-full px-4 py-3 border border-[#2e2d7b]/30 rounded-xl bg-[#0f1529]/50 text-[#E6E9F2] focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent transition-all duration-200 placeholder-[#6B7280]"
                          />
                      </div>
                      <div>
                                                  <label className="block text-sm font-medium text-[#9AA3B2] mb-2">
                            Tier Name
                          </label>
                          <input
                            type="text"
                            value={tier.tierName}
                            onChange={(e) => handleSubscriptionFieldChange(tier.id, 'tierName', e.target.value)}
                            placeholder="Enter tier name"
                            className="w-full px-4 py-3 border border-[#2e2d7b]/30 rounded-xl bg-[#0f1529]/50 text-[#E6E9F2] focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent transition-all duration-200 placeholder-[#6B7280]"
                          />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      {/* Features Unlocked */}
                      <div>
                        <label className="block text-sm font-medium text-[#E6E9F2] mb-2">
                          Features Unlocked
                        </label>
                        <div className="flex flex-wrap gap-4 mb-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={tier.features.noAds}
                              onChange={(e) => handleSubscriptionTierChange(subscriptionTiers.findIndex(t => t.id === tier.id), 'features', { noAds: e.target.checked })}
                              className="w-1.5 h-1.5 text-[#02a7fd] bg-[#0f1529]/50 border-[#2e2d7b]/50 rounded focus:ring-[#02a7fd] focus:ring-offset-[#0c1120]"
                            />
                            <span className="ml-2 text-sm text-[#E6E9F2]">No Ads</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={tier.features.extraLevels}
                              onChange={(e) => handleSubscriptionTierChange(subscriptionTiers.findIndex(t => t.id === tier.id), 'features', { extraLevels: e.target.checked })}
                              className="w-1.5 h-1.5 text-[#02a7fd] bg-[#0f1529]/50 border-[#2e2d7b]/50 rounded focus:ring-[#02a7fd] focus:ring-offset-[#0c1120]"
                            />
                            <span className="ml-2 text-[#E6E9F2]">Extra Levels</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={tier.features.specialNfts}
                              onChange={(e) => handleSubscriptionTierChange(subscriptionTiers.findIndex(t => t.id === tier.id), 'features', { specialNfts: e.target.checked })}
                              className="w-1.5 h-1.5 text-[#02a7fd] bg-[#0f1529]/50 border-[#2e2d7b]/50 rounded focus:ring-[#02a7fd] focus:ring-offset-[#0c1120]"
                            />
                            <span className="ml-2 text-[#E6E9F2]">Special NFTs</span>
                          </label>
                          
                          {/* Display saved custom features as checkboxes */}
                          {tier.customFeature && !tier.showCustomFeatureInput && (
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={true}
                                readOnly
                                className="w-1.5 h-1.5 text-[#02a7fd] bg-[#0f1529]/50 border-[#2e2d7b]/50 rounded focus:ring-[#02a7fd] focus:ring-offset-[#0c1120]"
                              />
                              <span className="ml-2 text-sm text-[#E6E9F2]">{tier.customFeature}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  handleSubscriptionFieldChange(tier.id, 'customFeature', '');
                                }}
                                className="ml-2 text-red-500 hover:text-red-600"
                              >
                                <X size={12} />
                              </button>
                            </label>
                          )}
                        </div>
                        
                        {/* Custom Feature Button/Input */}
                        {!tier.showCustomFeatureInput ? (
                          <button
                            type="button"
                            onClick={() => handleSubscriptionBooleanFieldChange(tier.id, 'showCustomFeatureInput', true)}
                            className="flex items-center gap-2 text-[#02a7fd] hover:text-[#02a7fd]/80 transition-colors px-4 py-3 border border-[#02a7fd] rounded-xl hover:bg-[#02a7fd] hover:text-white bg-[#0f1529]/30"
                          >
                            <Plus size={16} />
                            Add more features
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={tier.customFeature}
                              onChange={(e) => handleSubscriptionFieldChange(tier.id, 'customFeature', e.target.value)}
                              placeholder="Enter name"
                              className="flex-1 px-4 py-3 border border-[#2e2d7b]/30 rounded-xl bg-[#0f1529]/50 text-[#E6E9F2] focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent transition-all duration-200 placeholder-[#6B7280]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (tier.customFeature.trim()) {
                                  // Save the custom feature
                                  handleSubscriptionBooleanFieldChange(tier.id, 'showCustomFeatureInput', false);
                                }
                              }}
                              className="p-2 text-green-600 hover:text-green-700"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleSubscriptionFieldChange(tier.id, 'customFeature', '');
                                handleSubscriptionBooleanFieldChange(tier.id, 'showCustomFeatureInput', false);
                              }}
                              className="p-2 text-red-500 hover:text-red-600"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Duration */}
                      <div>
                        <label className="block text-sm font-medium text-[#9AA3B2] mb-2">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={tier.duration}
                          onChange={(e) => handleSubscriptionFieldChange(tier.id, 'duration', e.target.value)}
                          placeholder="Enter duration"
                          className="w-full px-4 py-3 border border-[#2e2d7b]/30 rounded-xl bg-[#0f1529]/50 text-[#E6E9F2] focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent transition-all duration-200 placeholder-[#6B7280]"
                        />
                      </div>
                    </div>
                    
                    {/* Remove Tier Button */}
                    <div className="flex justify-end">
                      {subscriptionTiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSubscriptionTier(tier.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                        >
                          Remove Tier
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex justify-end mt-6 mb-4 relative z-10">
                  <button
                    type="button"
                    onClick={addSubscriptionTier}
                    className="flex items-center gap-2 text-[#02a7fd] hover:text-[#02a7fd]/80 transition-colors px-4 py-3 border border-[#02a7fd] rounded-xl hover:bg-[#02a7fd] hover:text-white bg-[#0f1529]/30"
                  >
                    <Plus size={16} />
                    Add More Tier
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 