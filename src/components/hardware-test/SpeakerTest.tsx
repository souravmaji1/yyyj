"use client";

import { useState, useEffect, useRef } from 'react';

interface SpeakerTestProps {
  onBack: () => void;
}

export default function SpeakerTest({ onBack }: SpeakerTestProps) {
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentAudioContext, setCurrentAudioContext] = useState<AudioContext | null>(null);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [testResults, setTestResults] = useState({
    tone: null as boolean | null,
    voice: null as boolean | null,
    music: null as boolean | null,
    static: null as boolean | null,
    volume: 50
  });
  const [status, setStatus] = useState('Speaker test ready. Adjust volume and click test buttons.');
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');
  const [showConfirmations, setShowConfirmations] = useState({
    tone: false,
    voice: false,
    music: false,
    static: false
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  // Track gain nodes for real-time volume control
  const gainNodeRef = useRef<GainNode | null>(null);

  // Generate test tones
  const generateTone = (frequency: number, duration: number) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration - 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);

    return audioContext;
  };

  const playTestTone = () => {
    const volume = testResults.volume / 100;
    const audioContext = generateTone(440, 3); // A4 note for 3 seconds

    // Apply volume
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNodeRef.current = gainNode;

    setCurrentAudioContext(audioContext);
    setStatus('Playing test tone...');
    setStatusType('success');

    setTimeout(() => {
      stopTestTone();
    }, 3000);
  };

  const stopTestTone = () => {
    if (currentAudioContext) {
      currentAudioContext.close();
      setCurrentAudioContext(null);
    }
    setShowConfirmations(prev => ({ ...prev, tone: true }));
    setStatus('Did you hear the test tone?');
    setStatusType('info');
  };

  const playTestVoice = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        'This is a test of the speaker system. If you can hear this clearly, your speakers are working properly.'
      );
      utterance.volume = testResults.volume / 100;
      // Save utterance for volume control
      setCurrentUtterance(utterance);

      setStatus('Playing voice test...');
      setStatusType('success');

      utterance.onend = () => {
        setShowConfirmations(prev => ({ ...prev, voice: true }));
        setStatus('Did you hear the voice test?');
        setStatusType('info');
      };

      speechSynthesis.speak(utterance);
    } else {
      setStatus('Speech synthesis not supported in this browser');
      setStatusType('error');
    }
  };

  const stopTestVoice = () => {
    if (currentUtterance) {
      speechSynthesis.cancel();
      setCurrentUtterance(null);
    }
    setShowConfirmations(prev => ({ ...prev, voice: true }));
    setStatus('Did you hear the voice test?');
    setStatusType('info');
  };

  const playTestMusic = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const volume = testResults.volume / 100;

    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // C major scale
    let currentTime = audioContext.currentTime;

    setCurrentAudioContext(audioContext);
    setStatus('Playing music test...');
    setStatusType('success');

    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.2, currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.45);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + 0.5);

      currentTime += 0.5;
      if (index === 0) {
        gainNodeRef.current = gainNode;
      }
    });

    setTimeout(() => {
      stopTestMusic();
    }, 4000);
  };

  const stopTestMusic = () => {
    if (currentAudioContext) {
      currentAudioContext.close();
      setCurrentAudioContext(null);
    }
    setShowConfirmations(prev => ({ ...prev, music: true }));
    setStatus('Did you hear the music test?');
    setStatusType('info');
  };

  const playStaticTestAudio = () => {
    const audio = new Audio();
    audio.volume = testResults.volume / 100;
    setCurrentAudio(audio);

    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2.9);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 3);

    setCurrentAudioContext(audioContext);
    gainNodeRef.current = gainNode;
    setStatus('Playing static test audio...');
    setStatusType('success');

    setTimeout(() => {
      stopStaticTestAudio();
    }, 3000);
  };

  const stopStaticTestAudio = () => {
    if (currentAudioContext) {
      currentAudioContext.close();
      setCurrentAudioContext(null);
    }
    setShowConfirmations(prev => ({ ...prev, static: true }));
    setStatus('Did you hear the static test audio?');
    setStatusType('info');
  };

  const confirmAudio = (testType: keyof typeof testResults, heard: boolean) => {
    setTestResults(prev => ({ ...prev, [testType]: heard }));
    setShowConfirmations(prev => ({ ...prev, [testType]: false }));

    if (heard) {
      setStatus(`${testType.charAt(0).toUpperCase() + testType.slice(1)} test: Audio heard successfully!`);
      setStatusType('success');
    } else {
      setStatus(`${testType.charAt(0).toUpperCase() + testType.slice(1)} test: Audio not heard. Check volume and speakers.`);
      setStatusType('error');
    }
  };

  const updateTestResults = () => {
    const results = document.getElementById('testResults');
    if (!results) return;

    let html = '<h3 className="text-xl font-semibold mb-4">Test Summary:</h3><ul className="space-y-2">';

    // Volume test
    html += `<li>🔊 Volume Level: ${testResults.volume}%</li>`;

    // Tone test
    if (testResults.tone === true) {
      html += '<li>✅ Test Tone: Heard</li>';
    } else if (testResults.tone === false) {
      html += '<li>❌ Test Tone: Not heard</li>';
    } else {
      html += '<li>⏳ Test Tone: Not tested</li>';
    }

    // Voice test
    if (testResults.voice === true) {
      html += '<li>✅ Voice Test: Heard</li>';
    } else if (testResults.voice === false) {
      html += '<li>❌ Voice Test: Not heard</li>';
    } else {
      html += '<li>⏳ Voice Test: Not tested</li>';
    }

    // Music test
    if (testResults.music === true) {
      html += '<li>✅ Music Test: Heard</li>';
    } else if (testResults.music === false) {
      html += '<li>❌ Music Test: Not heard</li>';
    } else {
      html += '<li>⏳ Music Test: Not tested</li>';
    }

    // Static audio test
    if (testResults.static === true) {
      html += '<li>✅ Static Test Audio: Heard</li>';
    } else if (testResults.static === false) {
      html += '<li>❌ Static Test Audio: Not heard</li>';
    } else {
      html += '<li>⏳ Static Test Audio: Not tested</li>';
    }

    // Overall result
    const testKeys = ['tone', 'voice', 'music', 'static'];
    const passedTests = testKeys.filter(key => testResults[key as keyof typeof testResults] === true).length;
    const totalTests = testKeys.length;

    if (passedTests === totalTests) {
      html += '<li>🎉 Overall: All audio tests passed!</li>';
    } else if (passedTests > 0) {
      html += `<li>⚠️ Overall: ${passedTests}/${totalTests} tests passed</li>`;
    } else {
      html += '<li>❌ Overall: No audio tests passed</li>';
    }

    html += '</ul>';
    results.innerHTML = html;
  };

  useEffect(() => {
    updateTestResults();
  }, [testResults]);

  // Volume control handler
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseInt(e.target.value);
    setTestResults(prev => ({ ...prev, volume }));
    // Real-time update for currently playing audio
    if (currentAudio) {
      currentAudio.volume = volume / 100;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume / 100, (currentAudioContext?.currentTime || 0));
    }
    if (currentUtterance) {
      currentUtterance.volume = volume / 100;
    }
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
            <h1 className="text-4xl font-bold">🔊 Speaker Test</h1>
          </div>

          {/* Status */}
          <div className={`mb-6 p-4 rounded-lg ${statusType === 'success' ? 'bg-green-500/20 border border-green-500/50' :
              statusType === 'error' ? 'bg-red-500/20 border border-red-500/50' :
                'bg-blue-500/20 border border-blue-500/50'
            }`}>
            <p className="text-center">{status}</p>
          </div>

          {/* Volume Control */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Volume Control</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm">Volume:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={testResults.volume}
                onChange={handleVolumeChange}
                className="flex-1"
              />
              <span className="text-sm w-12">{testResults.volume}%</span>
            </div>
          </div>

          {/* Audio Tests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Test Tone */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-4">Test Tone</h3>
              <p className="text-gray-300 mb-4">Play a 440Hz test tone for 3 seconds.</p>

              <div className="space-y-4">
                <button
                  onClick={playTestTone}
                  className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                >
                  🔊 Play Test Tone
                </button>

                {showConfirmations.tone && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmAudio('tone', true)}
                      className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      ✅ Yes, I heard it
                    </button>
                    <button
                      onClick={() => confirmAudio('tone', false)}
                      className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      ❌ No, I didn't hear it
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Voice Test */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-4">Voice Test</h3>
              <p className="text-gray-300 mb-4">Play a synthesized voice message.</p>

              <div className="space-y-4">
                <button
                  onClick={playTestVoice}
                  className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                >
                  🗣️ Play Voice Test
                </button>

                {showConfirmations.voice && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmAudio('voice', true)}
                      className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      ✅ Yes, I heard it
                    </button>
                    <button
                      onClick={() => confirmAudio('voice', false)}
                      className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      ❌ No, I didn't hear it
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Music Test */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-4">Music Test</h3>
              <p className="text-gray-300 mb-4">Play a musical scale sequence.</p>

              <div className="space-y-4">
                <button
                  onClick={playTestMusic}
                  className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                >
                  🎵 Play Music Test
                </button>

                {showConfirmations.music && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmAudio('music', true)}
                      className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      ✅ Yes, I heard it
                    </button>
                    <button
                      onClick={() => confirmAudio('music', false)}
                      className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      ❌ No, I didn't hear it
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Static Audio Test */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-4">Static Audio Test</h3>
              <p className="text-gray-300 mb-4">Play a static beep sound.</p>

              <div className="space-y-4">
                <audio id="staticTestAudio" src="/assets/test-audio.mp3"></audio>
                <button
                  onClick={playStaticTestAudio}
                  className="w-full py-3 px-6 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-colors"
                >
                  📢 Play Static Test
                </button>

                {showConfirmations.static && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmAudio('static', true)}
                      className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      ✅ Yes, I heard it
                    </button>
                    <button
                      onClick={() => confirmAudio('static', false)}
                      className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      ❌ No, I didn't hear it
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div id="testResults">
              <h3 className="text-xl font-semibold mb-4">Test Summary:</h3>
              <p>Complete the audio tests above to see results...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 