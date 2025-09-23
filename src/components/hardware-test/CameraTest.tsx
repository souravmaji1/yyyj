"use client";

import { useState, useEffect, useRef } from 'react';

interface CameraTestProps {
  onBack: () => void;
}

export default function CameraTest({ onBack }: CameraTestProps) {
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [testResults, setTestResults] = useState({
    cameraAccess: false,
    snapshotCapture: false,
    videoStream: false
  });
  const [status, setStatus] = useState('Ready to start camera test...');
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');
  const [noCameras, setNoCameras] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initCamera();
    checkCameraPermissions();
  }, []);

  const initCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);
      if (videoDevices.length === 0) {
        setNoCameras(true);
        setStatus('No cameras found');
        setStatusType('error');
        return;
      } else {
        setNoCameras(false);
      }
      setStatus('Camera enumeration completed. Select a camera and click Start Camera.');
      setStatusType('info');
    } catch (error) {
      setStatus(`Error enumerating devices: ${error}`);
      setStatusType('error');
    }
  };

  const checkCameraPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setStatus('Camera access granted');
      setStatusType('success');
    } catch (error) {
      setStatus('Camera access denied. Please allow camera permissions.');
      setStatusType('error');
    }
  };

  const startCamera = async () => {
    try {
      const constraints: any = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      };

      if (selectedCameraId) {
        constraints.video.deviceId = { exact: selectedCameraId };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setVideoStream(stream);
      setIsCameraActive(true);
      setTestResults(prev => ({ ...prev, cameraAccess: true, videoStream: true }));
      setStatus('Camera started successfully');
      setStatusType('success');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setStatus(`Error starting camera: ${error}`);
      setStatusType('error');
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
      setIsCameraActive(false);
      setStatus('Camera stopped');
      setStatusType('info');
    }
  };

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        const snapshotUrl = canvas.toDataURL('image/png');
        setSnapshotUrl(snapshotUrl);
        setTestResults(prev => ({ ...prev, snapshotCapture: true }));
        setStatus('Snapshot captured successfully!');
        setStatusType('success');
      }
    }
  };

  const downloadSnapshot = () => {
    if (snapshotUrl) {
      const link = document.createElement('a');
      link.download = `camera-snapshot-${Date.now()}.png`;
      link.href = snapshotUrl;
      link.click();
    }
  };

  const handleCameraChange = (cameraId: string) => {
    setSelectedCameraId(cameraId);
    if (isCameraActive) {
      stopCamera();
      setTimeout(() => {
        if (cameraId) {
          startCamera();
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to Hardware Test
            </button>
            <h1 className="text-4xl font-bold">📷 Camera Test</h1>
          </div>

          {/* Status */}
          <div className={`mb-6 p-4 rounded-lg ${statusType === 'success' ? 'bg-green-500/20 border border-green-500/50' :
              statusType === 'error' ? 'bg-red-500/20 border border-red-500/50' :
                'bg-blue-500/20 border border-blue-500/50'
            }`}>
            <p className="text-center">{status}</p>
          </div>

          {/* Camera Controls */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Camera Preview & Snapshot Test</h2>
            <p className="text-gray-300 mb-6">
              This test allows you to preview your camera feed and capture snapshots to verify camera functionality.
            </p>

            <div className="space-y-4">
              {/* Camera Selection */}
              <div className="flex flex-col gap-2 items-start">
                <label htmlFor="cameraSelect" className="text-sm font-medium text-blue-200">Select Camera:</label>
                <select
                  id="cameraSelect"
                  value={selectedCameraId}
                  onChange={(e) => handleCameraChange(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">{cameras.length === 0 ? 'No cameras found' : 'Select Camera...'}</option>
                  {cameras.map((camera, index) => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Camera ${index + 1}`}
                    </option>
                  ))}
                </select>
                {noCameras && (
                  <span className="text-red-400 text-sm mt-2">No cameras detected on this device.</span>
                )}
              </div>

              {/* Control Buttons */}
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={isCameraActive ? stopCamera : startCamera}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${isCameraActive
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  {isCameraActive ? '⏹️ Stop Camera' : '📹 Start Camera'}
                </button>

                <button
                  onClick={takeSnapshot}
                  disabled={!isCameraActive}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                >
                  📸 Take Snapshot
                </button>

                <button
                  onClick={downloadSnapshot}
                  disabled={!snapshotUrl}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                >
                  💾 Download Snapshot
                </button>
              </div>
            </div>
          </div>

          {/* Camera Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Live Preview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-4 text-center">Live Preview</h3>
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-64 object-cover"
                />
                {!isCameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <p className="text-gray-400">Camera not active</p>
                  </div>
                )}
              </div>
            </div>

            {/* Snapshot */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-4 text-center">Snapshot</h3>
              <div className="relative bg-black rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full h-64 object-cover"
                />
                {!snapshotUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <p className="text-gray-400">No snapshot taken</p>
                  </div>
                )}
                {snapshotUrl && (
                  <img
                    src={snapshotUrl}
                    alt="Camera snapshot"
                    className="w-full h-64 object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold mb-4">Test Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {testResults.cameraAccess ? '✅' : '⏳'}
                </span>
                <div>
                  <p className="font-medium">Camera Access</p>
                  <p className="text-sm text-gray-300">
                    {testResults.cameraAccess ? 'Working' : 'Not tested'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {testResults.snapshotCapture ? '✅' : '⏳'}
                </span>
                <div>
                  <p className="font-medium">Snapshot Capture</p>
                  <p className="text-sm text-gray-300">
                    {testResults.snapshotCapture ? 'Working' : 'Not tested'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {testResults.videoStream ? '✅' : '⏳'}
                </span>
                <div>
                  <p className="font-medium">Video Stream</p>
                  <p className="text-sm text-gray-300">
                    {testResults.videoStream ? 'Active' : 'Not active'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 