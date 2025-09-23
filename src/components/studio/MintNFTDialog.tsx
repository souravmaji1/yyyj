"use client";

import React, { useState } from 'react';
import { X, Coins, Upload, Globe, Percent, Zap, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Slider } from '@/src/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Switch } from '@/src/components/ui/switch';
import { Badge } from '@/src/components/ui/badge';
import { useStudioStore } from '@/src/lib/store/studio/studio';
import { useStudioWalletStore } from '@/src/lib/store/studio/wallet';
import { COSTS } from '@/src/lib/studio/costs';
import { mintNFT, listNFT } from '@/src/lib/studio/api';
import { motion, AnimatePresence } from 'framer-motion';

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  animation_url?: string;
}

interface MintStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

const BLOCKCHAIN_OPTIONS = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    fees: 'High fees, most popular',
    icon: '🟦',
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    fees: 'Low fees, fast transactions',
    icon: '🟣',
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    fees: 'Very low fees, fastest',
    icon: '🟢',
  },
];

const MARKETPLACE_OPTIONS = [
  {
    id: 'opensea',
    name: 'OpenSea',
    description: 'Largest NFT marketplace',
    supported: ['ethereum', 'polygon'],
  },
  {
    id: 'magic-eden',
    name: 'Magic Eden',
    description: 'Leading Solana marketplace',
    supported: ['solana'],
  },
  {
    id: 'foundation',
    name: 'Foundation',
    description: 'Curated art platform',
    supported: ['ethereum'],
  },
];

export function MintNFTDialog() {
  const { closeMintDialog } = useStudioStore();
  const { charge } = useStudioWalletStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // NFT Configuration
  const [nftName, setNftName] = useState('My AI Creation');
  const [nftDescription, setNftDescription] = useState('Created with AI Studio Designer');
  const [royalties, setRoyalties] = useState(10);
  const [blockchain, setBlockchain] = useState('polygon');
  const [marketplace, setMarketplace] = useState('opensea');
  const [listImmediately, setListImmediately] = useState(true);
  const [listingPrice, setListingPrice] = useState(0.1);
  const [externalUrl, setExternalUrl] = useState('');
  
  // Minting Process
  const [mintSteps, setMintSteps] = useState<MintStep[]>([
    { id: 'metadata', label: 'Upload metadata to IPFS', status: 'pending' },
    { id: 'mint', label: 'Mint NFT on blockchain', status: 'pending' },
    { id: 'list', label: 'List on marketplace', status: 'pending' },
  ]);
  
  const [mintResult, setMintResult] = useState<{
    tokenId: string;
    transactionHash: string;
    marketplaceUrl?: string;
  } | null>(null);

  const totalCost = COSTS.nft.mint + (listImmediately ? COSTS.nft.list : 0);

  const updateStepStatus = (stepId: string, status: MintStep['status']) => {
    setMintSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const handleMint = async () => {
    const success = charge(totalCost, 'Mint NFT');
    if (!success) return;

    setIsProcessing(true);
    setCurrentStep(1);

    try {
      // Step 1: Upload metadata
      updateStepStatus('metadata', 'processing');
      await new Promise(resolve => setTimeout(resolve, 2000));
      updateStepStatus('metadata', 'completed');

      // Step 2: Mint NFT
      updateStepStatus('mint', 'processing');
      const mintResult = await mintNFT({
        assetUrl: 'https://example.com/asset.png',
        name: nftName,
        royalties,
      });
      updateStepStatus('mint', 'completed');

      // Step 3: List on marketplace (if enabled)
      if (listImmediately) {
        updateStepStatus('list', 'processing');
        const listResult = await listNFT(mintResult.tokenId);
        updateStepStatus('list', 'completed');
        
        setMintResult({
          tokenId: mintResult.tokenId,
          transactionHash: mintResult.tx,
          marketplaceUrl: listResult.listingUrl,
        });
      } else {
        setMintResult({
          tokenId: mintResult.tokenId,
          transactionHash: mintResult.tx,
        });
      }

      setCurrentStep(2);
      
      window.dispatchEvent(new CustomEvent('studio-toast', {
        detail: {
          type: 'success',
          title: 'NFT Minted Successfully!',
          description: `Token ID: ${mintResult.tokenId}`
        }
      }));

    } catch (error) {
      console.error('Minting error:', error);
      
      // Mark current processing step as error
      const processingStep = mintSteps.find(step => step.status === 'processing');
      if (processingStep) {
        updateStepStatus(processingStep.id, 'error');
      }
      
      window.dispatchEvent(new CustomEvent('studio-toast', {
        detail: {
          type: 'error',
          title: 'Minting Failed',
          description: 'Please try again later'
        }
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    window.dispatchEvent(new CustomEvent('studio-toast', {
      detail: {
        type: 'success',
        title: 'Copied!',
        description: `${label} copied to clipboard`
      }
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[#E6EEFF]">NFT Details</h3>
              
              <div>
                <Label htmlFor="nft-name" className="text-sm text-gray-300">Name *</Label>
                <Input
                  id="nft-name"
                  value={nftName}
                  onChange={(e) => setNftName(e.target.value)}
                  placeholder="Enter NFT name"
                  className="bg-[var(--color-surface)] border-white/20 text-[#E6EEFF]"
                />
              </div>

              <div>
                <Label htmlFor="nft-description" className="text-sm text-gray-300">Description</Label>
                <Textarea
                  id="nft-description"
                  value={nftDescription}
                  onChange={(e) => setNftDescription(e.target.value)}
                  placeholder="Describe your NFT"
                  className="bg-[var(--color-surface)] border-white/20 text-[#E6EEFF] h-20"
                />
              </div>

              <div>
                <Label htmlFor="external-url" className="text-sm text-gray-300">External URL (optional)</Label>
                <Input
                  id="external-url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="bg-[var(--color-surface)] border-white/20 text-[#E6EEFF]"
                />
              </div>

              <div>
                <Label className="text-sm text-gray-300">Royalties: {royalties}%</Label>
                <p className="text-xs text-gray-400 mb-2">
                  Percentage you'll earn from future sales
                </p>
                <Slider
                  value={[royalties]}
                  onValueChange={(value) => setRoyalties(value[0] || 10)}
                  min={0}
                  max={20}
                  step={0.5}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Blockchain Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[#E6EEFF]">Blockchain</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {BLOCKCHAIN_OPTIONS.map((option) => (
                  <motion.div
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setBlockchain(option.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      blockchain === option.id
                        ? 'border-indigo-400 bg-indigo-500/10'
                        : 'border-white/10 bg-[var(--color-surface)] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-sm font-medium text-[#E6EEFF]">
                        {option.name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {option.fees}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Marketplace Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-[#E6EEFF]">Marketplace Listing</h3>
                <Switch
                  checked={listImmediately}
                  onCheckedChange={setListImmediately}
                />
              </div>
              
              {listImmediately && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {MARKETPLACE_OPTIONS
                      .filter(option => option.supported.includes(blockchain))
                      .map((option) => (
                        <motion.div
                          key={option.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setMarketplace(option.id)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                            marketplace === option.id
                              ? 'border-indigo-400 bg-indigo-500/10'
                              : 'border-white/10 bg-[var(--color-surface)] hover:border-white/20'
                          }`}
                        >
                          <div className="text-sm font-medium text-[#E6EEFF] mb-1">
                            {option.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {option.description}
                          </div>
                        </motion.div>
                      ))}
                  </div>

                  <div>
                    <Label htmlFor="listing-price" className="text-sm text-gray-300">
                      Listing Price ({BLOCKCHAIN_OPTIONS.find(b => b.id === blockchain)?.symbol})
                    </Label>
                    <Input
                      id="listing-price"
                      type="number"
                      step="0.001"
                      value={listingPrice}
                      onChange={(e) => setListingPrice(Number(e.target.value))}
                      placeholder="0.1"
                      className="bg-[var(--color-surface)] border-white/20 text-[#E6EEFF]"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Cost Summary */}
            <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-white/10">
              <h4 className="text-sm font-medium text-[#E6EEFF] mb-3">Cost Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Minting fee</span>
                  <span className="text-[#E6EEFF]">{COSTS.nft.mint} XUT</span>
                </div>
                {listImmediately && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Marketplace listing</span>
                    <span className="text-[#E6EEFF]">{COSTS.nft.list} XUT</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span className="text-[#E6EEFF]">Total</span>
                    <span className="text-[#E6EEFF]">{totalCost} XUT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="h-16 w-16 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-medium text-[#E6EEFF] mb-2">Minting Your NFT</h3>
              <p className="text-gray-400">Please wait while we process your NFT on the blockchain</p>
            </div>

            <div className="space-y-4">
              {mintSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    step.status === 'completed' ? 'bg-green-500/10 border border-green-500/20' :
                    step.status === 'processing' ? 'bg-blue-500/10 border border-blue-500/20' :
                    step.status === 'error' ? 'bg-red-500/10 border border-red-500/20' :
                    'bg-[var(--color-surface)] border border-white/10'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    step.status === 'completed' ? 'bg-green-500 text-white' :
                    step.status === 'processing' ? 'bg-blue-500 text-white animate-spin' :
                    step.status === 'error' ? 'bg-red-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {step.status === 'completed' ? '✓' :
                     step.status === 'processing' ? '⟳' :
                     step.status === 'error' ? '✗' :
                     index + 1}
                  </div>
                  <span className={`text-sm ${
                    step.status === 'completed' ? 'text-green-400' :
                    step.status === 'processing' ? 'text-blue-400' :
                    step.status === 'error' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="h-16 w-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Zap className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-medium text-[#E6EEFF] mb-2">NFT Minted Successfully!</h3>
              <p className="text-gray-400">Your creation is now a unique digital collectible</p>
            </div>

            {mintResult && (
              <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Token ID</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">#{mintResult.tokenId}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(mintResult.tokenId, 'Token ID')}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Transaction</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 font-mono">
                      {mintResult.transactionHash.slice(0, 10)}...
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(mintResult.transactionHash, 'Transaction hash')}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {mintResult.marketplaceUrl && (
                  <div className="pt-2 border-t border-white/10">
                    <Button
                      onClick={() => window.open(mintResult.marketplaceUrl, '_blank')}
                      className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on {marketplace}
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="text-center">
              <Button
                onClick={closeMintDialog}
                variant="outline"
                className="border-white/20 hover:bg-white/10"
              >
                Close
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={currentStep === 0 ? closeMintDialog : undefined}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0F1629] border border-white/20 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
                  <Coins className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#E6EEFF]">Mint as NFT</h2>
                  <p className="text-sm text-gray-400">
                    Turn your creation into a digital collectible
                  </p>
                </div>
              </div>
              
              {currentStep === 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeMintDialog}
                  className="hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Progress Steps */}
            <div className="flex items-center space-x-2 mt-4">
              {['Configure', 'Minting', 'Complete'].map((step, index) => (
                <React.Fragment key={step}>
                  <div className={`flex items-center space-x-2 ${
                    index <= currentStep ? 'text-indigo-400' : 'text-gray-500'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      index < currentStep ? 'bg-indigo-600 text-white' :
                      index === currentStep ? 'bg-indigo-600 text-white' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {index < currentStep ? '✓' : index + 1}
                    </div>
                    <span className="text-sm">{step}</span>
                  </div>
                  {index < 2 && (
                    <div className={`flex-1 h-px ${
                      index < currentStep ? 'bg-indigo-600' : 'bg-gray-600'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {renderStepContent()}
          </div>

          {/* Footer */}
          {currentStep === 0 && (
            <div className="p-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Total cost: {totalCost} XUT
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={closeMintDialog}
                    className="border-white/20 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleMint}
                    disabled={isProcessing || !nftName.trim()}
                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                  >
                    {isProcessing ? 'Processing...' : 'Mint NFT'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}