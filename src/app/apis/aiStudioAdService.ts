/**
 * AI Studio Ad Service
 * Handles the submission of AI Studio generated content as kiosk advertisements
 */

import { AIStudioAdSubmissionParams, AIStudioAdSubmissionResponse } from "@/src/types/aiStudioAd";
import { AIStudioAdSubmission } from "@/src/types/aiStudioAd";

// import { 
//   AIStudioAdSubmission, 
//   AIStudioAdSubmissionResponse, 
//   AIStudioAdSubmissionParams 
// } from '@/src/types/aiStudioAd';

/**
 * Submit AI Studio generation as a kiosk ad
 * @param submission - The ad submission data
 * @returns Promise with submission result
 */
export const submitAIStudioGenerationAsAd = async (
  submission: AIStudioAdSubmission
): Promise<AIStudioAdSubmissionResponse> => {
  try {
    console.log('Submitting AI Studio generation as kiosk ad:', submission);

    // For now, we'll redirect to the kiosk ad submission page
    // In the future, this could make an API call to pre-create the ad
    const kioskAdUrl = `/kiosk/ads/submit?aiStudio=true&generationId=${submission.generationId}&type=${submission.type}&prompt=${encodeURIComponent(submission.prompt)}&mediaUrl=${encodeURIComponent(submission.mediaUrl)}`;

    // Store submission data in localStorage for the kiosk ad form to use
    localStorage.setItem('aiStudioAdSubmission', JSON.stringify(submission));

    // Redirect to kiosk ad submission
    window.location.href = kioskAdUrl;

    return {
      success: true,
      data: {
        submissionId: 'redirecting',
        status: 'redirecting',
        message: 'Redirecting to kiosk ad submission form...',
        redirectUrl: kioskAdUrl
      }
    };
  } catch (error) {
    console.error(' Error submitting AI Studio generation as ad:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit as kiosk ad'
    };
  }
};

/**
 * Get AI Studio ad submission data from localStorage
 * @returns The stored submission data or null if not found
 */
export const getAIStudioAdSubmission = (): AIStudioAdSubmission | null => {
  try {
    const stored = localStorage.getItem('aiStudioAdSubmission');
    if (stored) {
      const submission = JSON.parse(stored);
      // Clean up localStorage after retrieving
      localStorage.removeItem('aiStudioAdSubmission');
      return submission;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving AI Studio ad submission:', error);
    return null;
  }
};

/**
 * Check if current page is an AI Studio ad submission
 * @returns True if the current page is an AI Studio ad submission
 */
export const isAIStudioAdSubmission = (): boolean => {
  if (typeof window === 'undefined') return false;

  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('aiStudio') === 'true';
};

/**
 * Get AI Studio submission parameters from URL
 * @returns Object with submission parameters
 */
export const getAIStudioSubmissionParams = (): AIStudioAdSubmissionParams | null => {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);

  return {
    aiStudio: urlParams.get('aiStudio') === 'true',
    generationId: urlParams.get('generationId') || undefined,
    type: urlParams.get('type') || undefined,
    prompt: urlParams.get('prompt') || undefined,
    mediaUrl: urlParams.get('mediaUrl') || undefined,
    machineId: urlParams.get('machineId') || undefined
  };
};

/**
 * Clear AI Studio submission data
 */
export const clearAIStudioSubmissionData = (): void => {
  try {
    localStorage.removeItem('aiStudioAdSubmission');
  } catch (error) {
    console.error(' Error clearing AI Studio submission data:', error);
  }
};