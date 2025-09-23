 "use client";
    import React, { useState, useEffect } from "react";
    import { useSelector, useDispatch } from "react-redux";
    import { RootState } from "@/src/store";
    import { motion } from "framer-motion";
    import { fetchGenerationHistory, deleteGeneration, Generation } from "@/src/store/slices/aiStudioSlice";
    import { logAPICall } from "@/src/utils/aiStudioParity";
    import GenerationPreview from "./GenerationPreview";

    const FILTER_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
    { value: 'music', label: 'Music' },
    { value: '3d', label: '3D Models' },
    { value: 'completed', label: 'Completed' },
    { value: 'processing', label: 'Processing' }
    ];

    export default function GenerationHistory() {
    const dispatch = useDispatch();
    const { history, isLoading } = useSelector((state: RootState) => state.aiStudio);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(6); // Show 6 items per page

    useEffect(() => {
        // Log API call for parity tracking
        logAPICall({
            url: '/ai-studio/history',
            method: 'GET',
            timestamp: Date.now(),
            source: 'ai-studio',
            params: { page, limit }
        });

        dispatch(fetchGenerationHistory({
            page,
            limit
        }) as any);
    }, [dispatch, page, limit]);

    // Reset to page 1 when filter changes
    useEffect(() => {
        setPage(1);
    }, [filter]);

    const filteredHistory = history.filter(item => {
        // For video tab: ONLY show completed videos with actual video URLs
        if (filter === 'video') {
            return item.type === 'video' && 
                   (item.status === 'completed' || item.status === 'success') && 
                   item.videoUrl && 
                   item.videoUrl.length > 0;
        }

        // For audio/music filters
        if (filter === 'audio') {
            return item.type === 'audio' && 
                   (item.status === 'completed' || item.status === 'success') && 
                   item.audioUrl && 
                   item.audioUrl.length > 0;
        }

        if (filter === 'music') {
            return item.type === 'music' && 
                   (item.status === 'completed' || item.status === 'success') && 
                   (item.musicUrl || item.audioUrl) && 
                   ((item.musicUrl?.length || 0) > 0 || (item.audioUrl?.length || 0) > 0);
        }

        // For 3D filter
        if (filter === '3d') {
            return item.type === '3d' && 
                   (item.status === 'completed' || item.status === 'success') && 
                   item.threeDUrl && 
                   item.threeDUrl.length > 0;
        }

        // For all filter: ONLY show completed items with valid media URLs
        if (filter === 'all') {
            return (item.status === 'completed' || item.status === 'success') && 
                   ((item.type === 'video' && item.videoUrl && item.videoUrl.length > 0) ||
                    (item.type === 'image' && item.imageUrl && item.imageUrl.length > 0) ||
                    (item.type === 'audio' && item.audioUrl && item.audioUrl.length > 0) ||
                    (item.type === 'music' && (item.musicUrl || item.audioUrl) && ((item.musicUrl?.length || 0) > 0 || (item.audioUrl?.length || 0) > 0)) ||
                    (item.type === '3d' && item.threeDUrl && item.threeDUrl.length > 0));
        }

        // For image filter: ONLY show completed images with valid image URLs
        if (filter === 'image') {
            return item.type === 'image' && 
                   (item.status === 'completed' || item.status === 'success') && 
                   item.imageUrl && 
                   item.imageUrl.length > 0;
        }

        // For completed filter: ONLY show completed items with valid media URLs
        if (filter === 'completed') {
            return (item.status === 'completed' || item.status === 'success') && 
                   ((item.type === 'video' && item.videoUrl && item.videoUrl.length > 0) ||
                    (item.type === 'image' && item.imageUrl && item.imageUrl.length > 0));
        }

        // For processing filter: show only processing items
        if (filter === 'processing') {
            return item.status === 'processing';
        }

        return false; // Don't show anything else
    }).sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'cost') return b.cost - a.cost;
        return 0;
    });

    // Debug logging for video generations
    useEffect(() => {
        const videoGenerations = history.filter(item => item.type === 'video');
        console.log('🎬 Video Generations in History:', videoGenerations.map(item => ({
            id: item.id,
            prompt: item.prompt,
            status: item.status,
            videoUrl: item.videoUrl,
            cost: item.cost,
            hasVideoUrl: !!item.videoUrl
        })));
    }, [history]);

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this generation?')) {
        dispatch(deleteGeneration(id) as any);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        
        // Log API call for parity tracking
        logAPICall({
            url: '/ai-studio/history',
            method: 'GET',
            timestamp: Date.now(),
            source: 'ai-studio',
            params: { page: nextPage, limit }
        });

        dispatch(fetchGenerationHistory({
            page: nextPage,
            limit
        }) as any);
    };

    const hasMoreItems = filteredHistory.length >= page * limit;

    if (isLoading) {
        return (
        <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
        {/* Filters */}
        <div className="bg-[#181F36] rounded-xl p-4 mb-6 border border-[#667085]/30">
            <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((option) => (
                <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFilter(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    filter === option.value
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-surface)] text-gray-300 hover:text-white'
                    }`}
                >
                    {option.label}
                </motion.button>
                ))}
            </div>

            <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-[var(--color-surface)] border border-[#667085]/30 rounded-lg text-white text-sm focus:border-[var(--color-primary)] focus:outline-none"
            >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="cost">Highest Cost</option>
            </select>
            </div>
        </div>

        {/* History Grid */}
        {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No generations yet</h3>
            <p className="text-gray-400">Start creating images and videos to see your history here</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHistory.map((item) => (
                <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#181F36] rounded-xl border border-[#667085]/30 overflow-hidden"
                >
                {/* Preview */}
                <div className="aspect-square relative">
                    <GenerationPreview generation={item} />

                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'completed' || item.status === 'success' ? 'bg-green-500/20 text-green-400' :
                        item.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                    }`}>
                        {item.status === 'success' ? 'completed' : item.status}
                    </span>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-full text-xs font-semibold">
                        {item.type === 'image' ? '🖼️' : '🎬'} {item.type}
                    </span>
                    </div>
                </div>

                {/* Details */}
                <div className="p-4">
                    <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                    {item.prompt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    <span className="text-[var(--color-primary)]">{item.cost || 0} XUT</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                    {(item.status === 'completed' || item.status === 'success') && (
                        <>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {/* Handle regenerate */}}
                            className="flex-1 py-2 px-3 bg-[var(--color-surface)] border border-[#667085]/30 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                        >
                            🔄 Regenerate
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleDelete(item.id)}
                            className="py-2 px-3 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                            🗑️
                        </motion.button>
                        </>
                    )}
                    </div>
                </div>
                </motion.div>
            ))}
            </div>
        )}

        {/* Load More */}
        {filteredHistory.length > 0 && (
            <div className="text-center mt-8">
                {hasMoreItems ? (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLoadMore}
                        className="px-6 py-3 bg-[var(--color-primary)] hover:bg-[#0291D8] text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl"
                    >
                        📥 Load More ({limit} more)
                    </motion.button>
                ) : (
                    <div className="text-center py-4">
                        <div className="text-2xl mb-2">🎉</div>
                        <p className="text-gray-400 text-sm">
                            {filteredHistory.length === 0 
                                ? "No completed generations found" 
                                : "You've reached the end of your history"
                            }
                        </p>
                        {filteredHistory.length === 0 && (
                            <p className="text-gray-500 text-xs mt-1">
                                Try generating some videos or images first
                            </p>
                        )}
                    </div>
                )}
            </div>
        )}
        </div>
    );
    }