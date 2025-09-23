"use client";

import { useState, useEffect, useRef } from 'react';

// Remove top-level window usage
// declare global {
//   interface Window {
//     SpeechRecognition: typeof SpeechRecognition;
//     webkitSpeechRecognition: typeof SpeechRecognition;
//   }
// }

interface MicrophoneTestProps {
  onBack: () => void;
}

export default function MicrophoneTest({ onBack }: MicrophoneTestProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [testResults, setTestResults] = useState({
    recording: false,
    playback: false,
    speechRecognition: false
  });
  const [status, setStatus] = useState('Ready to start microphone test...');
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setTranscript(prev => prev + finalTranscript + ' ');
            setTestResults(prev => ({ ...prev, speechRecognition: true }));
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setStatus(`Speech recognition error: ${event.error}`);
          setStatusType('error');
        };
      }
    }
    // Check microphone permissions
    checkMicrophonePermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkMicrophonePermissions = async () => {
    if (typeof window === 'undefined') return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setStatus('Microphone access granted');
      setStatusType('success');
    } catch (error) {
      setStatus('Microphone access denied. Please allow microphone permissions.');
      setStatusType('error');
    }
  };

  const startRecording = async () => {
    if (typeof window === 'undefined') return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        setTestResults(prev => ({ ...prev, recording: true }));
        setStatus('Recording completed! Click Play to hear your recording.');
        setStatusType('success');
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatus('Recording... Speak into your microphone.');
      setStatusType('info');
    } catch (error) {
      setStatus(`Error starting recording: ${error}`);
      setStatusType('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioUrl && typeof window !== 'undefined') {
      if (!isPlaying) {
        if (!audioRef.current) {
          audioRef.current = new Audio(audioUrl);
        }
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsPlaying(true);
        setStatus('Playing recorded audio...');
        setStatusType('info');
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setPlaybackProgress(0);
        };
        audioRef.current.ontimeupdate = () => {
          setPlaybackProgress(
            (audioRef.current!.currentTime / audioRef.current!.duration) * 100
          );
        };
      } else {
        audioRef.current?.pause();
        setIsPlaying(false);
      }
    }
  };

  // Clean up audio element on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const startSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
      setStatus('Listening... Speak now!');
      setStatusType('info');
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setStatus('Speech recognition stopped.');
      setStatusType('info');
    }
  };

  const clearTranscript = () => {
    setTranscript('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to Hardware Test
            </button>
            <h1 className="text-4xl font-bold">🎤 Microphone Test</h1>
          </div>

          {/* Status */}
          <div className={`mb-6 p-4 rounded-lg ${statusType === 'success' ? 'bg-green-500/20 border border-green-500/50' :
              statusType === 'error' ? 'bg-red-500/20 border border-red-500/50' :
                'bg-blue-500/20 border border-blue-500/50'
            }`}>
            <p className="text-center">{status}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recording Test */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-semibold mb-4">Audio Recording Test</h2>
              <p className="text-gray-300 mb-6">
                Test microphone functionality by recording and playing back audio.
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${isRecording
                        ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                        : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                  >
                    {isRecording ? '⏹️ Stop Recording' : '🎙️ Start Recording'}
                  </button>
                </div>

                {audioUrl && (
                  <div className="space-y-4">
                    <button
                      onClick={playRecording}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${isPlaying ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      {isPlaying ? '⏸️ Pause' : '▶️ Play Recording'}
                    </button>
                    <audio controls src={audioUrl} className="w-full" style={{ display: 'none' }} />
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-2 bg-green-400 transition-all" style={{ width: `${playbackProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Speech Recognition Test */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-semibold mb-4">Speech Recognition Test</h2>
              <p className="text-gray-300 mb-6">
                Test real-time speech recognition capabilities.
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={isListening ? stopSpeechRecognition : startSpeechRecognition}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${isListening
                        ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                        : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                  >
                    {isListening ? '⏹️ Stop Listening' : '🎧 Start Listening'}
                  </button>
                </div>

                {transcript && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Transcript:</h3>
                      <button
                        onClick={clearTranscript}
                        className="text-sm bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="bg-black/30 p-4 rounded-lg max-h-32 overflow-y-auto">
                      <p className="text-sm">{transcript || 'No speech detected yet...'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold mb-4">Test Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {testResults.recording ? '✅' : '⏳'}
                </span>
                <div>
                  <p className="font-medium">Audio Recording</p>
                  <p className="text-sm text-gray-300">
                    {testResults.recording ? 'Working' : 'Not tested'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {testResults.playback ? '✅' : '⏳'}
                </span>
                <div>
                  <p className="font-medium">Audio Playback</p>
                  <p className="text-sm text-gray-300">
                    {testResults.playback ? 'Working' : 'Not tested'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {testResults.speechRecognition ? '✅' : '⏳'}
                </span>
                <div>
                  <p className="font-medium">Speech Recognition</p>
                  <p className="text-sm text-gray-300">
                    {testResults.speechRecognition ? 'Working' : 'Not tested'}
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