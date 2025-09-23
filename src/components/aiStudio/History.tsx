"use client";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { deleteGeneration, fetchGenerationHistory, Generation } from "@/src/store/slices/aiStudioSlice";
import { logAPICall } from "@/src/utils/aiStudioParity";

export default function History() {
  const dispatch = useDispatch();
  const { history, isLoading } = useSelector((state: RootState) => state.aiStudio);
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'enhancement'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);

  useEffect(() => {
    // Log API call for parity tracking
    logAPICall({
      url: '/ai-studio/history',
      method: 'GET',
      timestamp: Date.now(),
      source: 'ai-studio',
      params: { page: 1, limit: 10 }
    });

    dispatch(fetchGenerationHistory({
      page: 1,
      limit: 10
    }) as any);
  }, [dispatch]);

  const filteredHistory = history.filter((item: Generation) => { 
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = item.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteGeneration(id) as any);
      toast.success('Generation deleted successfully');
    } catch (error) {
      toast.error('Failed to delete generation');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎬';
      case 'enhancement': return '✨';
      default: return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'processing': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return '✅';
      case 'failed': return '❌';
      case 'processing': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-[#0F172A] backdrop-blur-xl rounded-2xl p-8 border border-[rgba(255,255,255,0.1)] shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Generation History</h1>
            <p className="text-gray-300 text-lg">Track all your AI-generated content and manage your creations</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-gray-400 text-sm">Total Generations</p>
              <p className="text-2xl font-bold text-white">{history.length}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-xl rounded-2xl p-6 border border-[rgba(255,255,255,0.1)] shadow-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Type Filter */}
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2 text-white">Filter by Type</label>
            <div className="flex gap-2">
              {(['all', 'image', 'video', 'enhancement'] as const).map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    filter === type
                      ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-lg'
                      : 'bg-[rgba(255,255,255,0.05)] text-gray-300 hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)]'
                  }`}
                >
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2 text-white">Search Prompts</label>
            <input
              type="text"
              placeholder="Search your generations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder-gray-400 focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-xl rounded-2xl border border-[rgba(255,255,255,0.1)] shadow-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your generation history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Generations Found</h3>
            <p className="text-gray-400">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Start creating amazing content with AI Studio!'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.1)]">
            {filteredHistory.map((generation: Generation) => (
              <motion.div
                key={generation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-[rgba(255,255,255,0.02)] transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Preview */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
                      {generation.type === 'image' && generation.imageUrl && (
                        <img 
                          src={generation.imageUrl} 
                          alt="Generated image" 
                          className="w-full h-full object-cover"
                        />
                      )}
                      {generation.type === 'video' && generation.videoUrl && (
                        <video 
                          src={generation.videoUrl} 
                          className="w-full h-full object-cover"
                          muted
                        />
                      )}
                      {generation.type === 'video' && !generation.videoUrl && (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-xs">No video URL</span>
                        </div>
                      )}
                      {generation.type === 'enhancement' && generation.enhancedImageUrl && (
                        <img 
                          src={generation.enhancedImageUrl} 
                          alt="Enhanced image" 
                          className="w-full h-full object-cover"
                        />
                      )}
                      {!generation.imageUrl && !generation.videoUrl && !generation.enhancedImageUrl && (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-4xl">{getTypeIcon(generation.type)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTypeIcon(generation.type)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-white capitalize">
                            {generation.type} Generation
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${getStatusColor(generation.status)}`}>
                              {getStatusIcon(generation.status)} {generation.status}
                            </span>
                            {generation.retryCount > 0 && (
                              <span className="text-xs text-gray-400 bg-[rgba(255,255,255,0.05)] px-2 py-1 rounded-full">
                                {generation.retryCount} retries
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Cost</p>
                        <p className="text-lg font-bold text-[var(--color-primary)]">{generation.cost} XUT</p>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-3 line-clamp-2">{generation.prompt}</p>

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{formatDistanceToNow(new Date(generation.createdAt), { addSuffix: true })}</span>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedGeneration(generation)}
                          className="px-3 py-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-gray-300 hover:text-white hover:border-[var(--color-primary)]/50 transition-all duration-300"
                        >
                          View Details
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(generation.id)}
                          className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all duration-300"
                        >
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Generation Details Modal */}
      {selectedGeneration && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-[#0F172A] rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[rgba(255,255,255,0.1)] shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Generation Details</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedGeneration(null)}
                className="p-2 hover:bg-[rgba(255,255,255,0.05)] rounded-xl transition-colors"
              >
                <span className="text-2xl text-gray-400">×</span>
              </motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Preview */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Preview</h3>
                <div className="aspect-square rounded-2xl overflow-hidden bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
                  {selectedGeneration.type === 'image' && selectedGeneration.imageUrl && (
                    <img 
                      src={selectedGeneration.imageUrl} 
                      alt="Generated image" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  {selectedGeneration.type === 'video' && selectedGeneration.videoUrl && (
                    <video 
                      src={selectedGeneration.videoUrl} 
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                  {selectedGeneration.type === 'enhancement' && selectedGeneration.enhancedImageUrl && (
                    <img 
                      src={selectedGeneration.enhancedImageUrl} 
                      alt="Enhanced image" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white capitalize">{selectedGeneration.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`${getStatusColor(selectedGeneration.status)}`}>
                        {getStatusIcon(selectedGeneration.status)} {selectedGeneration.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cost:</span>
                      <span className="text-[var(--color-primary)] font-semibold">{selectedGeneration.cost} XUT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white">
                        {new Date(selectedGeneration.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedGeneration.retryCount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Retries:</span>
                        <span className="text-yellow-400">{selectedGeneration.retryCount}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Prompt</h3>
                  <p className="text-gray-300 bg-[rgba(255,255,255,0.05)] p-3 rounded-xl border border-[rgba(255,255,255,0.1)]">
                    {selectedGeneration.prompt}
                  </p>
                </div>

                {selectedGeneration.type === 'enhancement' && selectedGeneration.originalImageUrl && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Original Image</h3>
                    <img 
                      src={selectedGeneration.originalImageUrl} 
                      alt="Original image" 
                      className="w-full h-32 object-cover rounded-xl border border-[rgba(255,255,255,0.1)]"
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
