"use client";

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/src/store';
import { fetchTryOnHistory, clearHistory, TryOnHistoryJob } from '@/src/store/slices/tryonHistorySlice';
import { useNotificationUtils } from '@/src/core/utils/notificationUtils';
import { Spinner } from '@/src/components/ui/spinner';
import { Button } from '@/src/components/ui/button';
import { X, Calendar, Clock, CheckCircle, XCircle, Loader, Eye, Download } from 'lucide-react';
import Image from 'next/image';

const TryOnHistoryPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showError } = useNotificationUtils();
  const { jobs, pagination, loading, error } = useSelector((state: RootState) => state.tryonHistory);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    // Clear previous data and fetch first page
    dispatch(clearHistory());
    dispatch(fetchTryOnHistory({ page: 1, limit: 10, sort: 'desc' }));
  }, [dispatch]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    dispatch(fetchTryOnHistory({ page, limit: 10, sort: 'desc' }));
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'processing':
        return 'Processing';
      case 'queued':
        return 'Queued';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProcessingTime = (job: TryOnHistoryJob) => {
    if (job.inputMeta?.ended_at && job.inputMeta?.started_at) {
      const start = new Date(job.inputMeta.started_at);
      const end = new Date(job.inputMeta.ended_at);
      const diffMs = end.getTime() - start.getTime();
      const diffSec = Math.round(diffMs / 1000);
      return `${diffSec}s`;
    }
    return null;
  };

  const removeQueryParams = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    } catch (error) {
      // If URL parsing fails, try to remove query params manually
      return url.split('?')[0] || url;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading History</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button 
            onClick={() => dispatch(fetchTryOnHistory({ page: 1, limit: 10, sort: 'desc' }))}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Virtual Try-On History</h1>
          <div className="text-gray-400">
            {pagination.total > 0 && `${pagination.total} total jobs`}
          </div>
        </div>

        {loading && jobs.length === 0 ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Try-On Jobs Yet</h2>
            <p className="text-gray-400">Your virtual try-on history will appear here once you create your first job.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {jobs.map((job: TryOnHistoryJob) => (
                <div key={job.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Job #{job.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {formatDate(job.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        job.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                        job.status === 'failed' ? 'bg-red-900/30 text-red-400' :
                        job.status === 'processing' ? 'bg-blue-900/30 text-blue-400' :
                        'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {getStatusText(job.status)}
                      </span>
                    </div>
                  </div>

                  {/* Input Images */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Input Images</h4>
                    <div className="flex gap-4">
                      {job.inputMeta?.modelImageUrl && (
                        <div className="relative group cursor-pointer" onClick={() => handleImageClick(removeQueryParams(job.inputMeta?.modelImageUrl || ''))}>
                          <Image
                            src={removeQueryParams(job.inputMeta.modelImageUrl)}
                            alt="Model Image"
                            width={120}
                            height={120}
                            className="rounded-lg object-cover border border-gray-600"
                            unoptimized
                          />
                          <span className="absolute bottom-1 left-1 text-xs bg-black/70 text-white px-2 py-1 rounded">
                            Model
                          </span>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      )}
                      {job.inputMeta?.garmentImageUrl && (
                        <div className="relative group cursor-pointer" onClick={() => handleImageClick(removeQueryParams(job.inputMeta?.garmentImageUrl || ''))}>
                          <Image
                            src={removeQueryParams(job.inputMeta.garmentImageUrl)}
                            alt="Garment Image"
                            width={120}
                            height={120}
                            className="rounded-lg object-cover border border-gray-600"
                            unoptimized
                          />
                          <span className="absolute bottom-1 left-1 text-xs bg-black/70 text-white px-2 py-1 rounded">
                            Garment
                          </span>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Result Images */}
                  {job.status === 'completed' && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Results</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {/* Show result from works array (main result) */}
                        {job.outputMeta?.works && job.outputMeta.works.length > 0 && job.outputMeta.works[0]?.image?.resource_without_watermark && (
                          <div className="relative group cursor-pointer" onClick={() => handleImageClick(job.outputMeta?.works?.[0]?.image?.resource_without_watermark || '')}>
                            <Image
                              src={job.outputMeta.works[0].image.resource_without_watermark}
                              alt="Try-On Result"
                              width={150}
                              height={150}
                              className="rounded-lg object-cover w-full h-32 border border-gray-600"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                              <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(job.outputMeta?.works?.[0]?.image?.resource_without_watermark || '', '_blank');
                                }}
                                className="p-1 bg-black/50 hover:bg-black/70 rounded-full"
                              >
                                <Download className="w-4 h-4 text-white" />
                              </button>
                            </div>
                            <span className="absolute bottom-1 left-1 text-xs bg-black/70 text-white px-2 py-1 rounded">
                              Result
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Job Details */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Quality:</span>
                      <span className="text-white ml-2 capitalize">
                        {job.inputMeta?.options?.quality || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Updated:</span>
                      <span className="text-white ml-2">
                        {formatDate(job.updatedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Warnings and Errors */}
                  {(job.warnings.length > 0 || (job.errors.length > 0 && job.errors.some(error => error !== 'Unknown error occurred'))) && (
                    <div className="mt-4 space-y-2">
                      {job.warnings.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-yellow-400 mb-1">Warnings</h5>
                          <ul className="text-sm text-yellow-300 space-y-1">
                            {job.warnings.map((warning, index) => (
                              <li key={index}>• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {job.errors.length > 0 && job.errors.some(error => error !== 'Unknown error occurred') && (
                        <div>
                          <h5 className="text-sm font-medium text-red-400 mb-1">Errors</h5>
                          <ul className="text-sm text-red-300 space-y-1">
                            {job.errors
                              .filter(error => error !== 'Unknown error occurred')
                              .map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrev || loading}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext || loading}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Full Screen Image Modal */}
      {isImageModalOpen && selectedImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <Image
              src={selectedImage}
              alt="Full screen result"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TryOnHistoryPage;
