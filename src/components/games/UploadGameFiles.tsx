'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, Folder, FileText, ExternalLink, ArrowLeft, HelpCircle, MessageCircle, X, Bold, Italic, Underline, Link, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Plus } from 'lucide-react';
import RichTextEditor from '../common/RichTextEditor';

interface UploadGameFilesProps {
  onBack?: () => void;
  onDataChange?: (data: any) => void;
  formData?: any;
}

export default function UploadGameFiles({ onBack, onDataChange, formData }: UploadGameFilesProps) {
  const [uploadProgress, setUploadProgress] = useState(81);
  const [gameType, setGameType] = useState('HTML5');
  const [mobileSupport, setMobileSupport] = useState('no');
  const [multiplayer, setMultiplayer] = useState('no');
  const [inGamePurchases, setInGamePurchases] = useState('no');
  const [orientation, setOrientation] = useState('portrait');
  const [gameCategories, setGameCategories] = useState(['Adventure', 'Card', 'PVP']);
  const [gameControls, setGameControls] = useState('**Move Left:**\nPress the Left Arrow key ←\n\n**Move Right:**\nPress the Right Arrow key →\n\n**Jump:**\nPress the Spacebar _');
  const [steps, setSteps] = useState([{ id: 1, title: 'Game Controls', content: '' }]);
  const [sdkIntegration, setSdkIntegration] = useState('no');
  const [tournamentPlay, setTournamentPlay] = useState('no');
  const [leaderboard, setLeaderboard] = useState('no');
  const [entryFee, setEntryFee] = useState('500000');
  const [firstPrize, setFirstPrize] = useState('');
  const [runnerUpPrize, setRunnerUpPrize] = useState('');
  const [thirdPrize, setThirdPrize] = useState('');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [initializationCode, setInitializationCode] = useState('');
  const [serverPath, setServerPath] = useState('');
  


    // Function to update parent component - simple function without useCallback
  const updateParentData = () => {
    if (onDataChange) {
      // Get current state values directly
      const dataToSend = {
        zipFile: zipFile,
        initializationCode: initializationCode,
        serverPath: serverPath,
        gameType: gameType,
        steps: steps,
        supportsMobile: mobileSupport === 'yes',
        isMultiplayer: multiplayer === 'yes',
        hasInGamePurchases: inGamePurchases === 'yes',
        orientation: orientation as 'portrait' | 'landscape' | 'both',
        gameCategories: gameCategories,
        gameControls: gameControls,
        sdkIntegrated: sdkIntegration === 'yes',
        hasTournament: tournamentPlay === 'yes',
        hasLeaderboard: leaderboard === 'yes',
        entryFee: entryFee,
        firstPrize: firstPrize,
        runnerUpPrize: runnerUpPrize, // AddGame expects runnerUpPrize
        thirdPrize: thirdPrize,
      };
      
      onDataChange(dataToSend);
    }
  };

  // Initialize component state with existing form data - only run once on mount
  useEffect(() => {
    if (formData && !hasInitialized.current) {
      if (formData.zipFile) {
        setZipFile(formData.zipFile);
      }
      if (formData.initializationCode) setInitializationCode(formData.initializationCode);
      if (formData.serverPath) setServerPath(formData.serverPath);
      if (formData.gameType) setGameType(formData.gameType);
      if (formData.steps) setSteps(formData.steps);
      if (formData.gameCategories) setGameCategories(formData.gameCategories);
      if (formData.gameControls) setGameControls(formData.gameControls);
      if (formData.entryFee) setEntryFee(formData.entryFee);
      if (formData.firstPrize) setFirstPrize(formData.firstPrize);
      if (formData.runnerUpPrize) setRunnerUpPrize(formData.runnerUpPrize);
      if (formData.thirdPrize) setThirdPrize(formData.thirdPrize);
    }
  }, []); // Empty dependency array - only run once on mount

  // Update parent on mount - only run once
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      // Always update parent on mount to send default values
      setTimeout(() => {
        updateParentData();
      }, 0);
    }
  }, []); // No dependencies needed since updateParentData is now a simple function





  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file) {
        setZipFile(file);
        updateParentData();
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file) {
        setZipFile(file);
        updateParentData();
      }
    }
  };


  
  return (
    <div className="mt-8">
    <div className="max-w-8xl">
      {/* Main Content */}
      <div className="bg-[#0c1120]/80 backdrop-blur-sm border border-[#1e1b4d]/30 rounded-2xl shadow-2xl p-8 hover:border-[#2e2d7b]/50 transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - File Upload */}
          <div>
                         <h2 className="text-lg font-semibold text-[#E6E9F2] mb-6">Upload Zip Files</h2>
            
                                       {/* Upload Area */}
                             <div 
                className="border-2 border-dashed border-[#02a7fd] rounded-xl p-8 text-center cursor-pointer hover:border-[#02a7fd]/80 transition-colors bg-[#0f1529]/30 hover:bg-[#0f1529]/50"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
              <input
                type="file"
                accept=".zip"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                multiple
              />
                              <label htmlFor="file-upload" className="cursor-pointer">
                                    <Upload className="h-12 w-12 text-[#02a7fd] mx-auto mb-4" />
                  <p className="text-lg font-medium text-[#E6E9F2] mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-[#9AA3B2]">
                    zip format (max. 50 GB)
                  </p>
               </label>
            </div>

                          {/* File Display */}
                            {zipFile && (
                <div className="mt-4 p-4 bg-[#0f1529]/50 border border-[#22c55e]/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Folder className="h-5 w-5 text-[#22c55e]" />
                      <div>
                        <p className="text-sm font-medium text-[#22c55e]">
                          {zipFile.name}
                        </p>
                        <p className="text-xs text-[#22c55e]/80">
                          {(zipFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setZipFile(null);
                        updateParentData();
                      }}
                      className="text-[#ef4444] hover:text-[#dc2626] transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

           {/* Upload Progress */}
           {/* <div className="mt-6">
             <div className="flex items-center gap-2 mb-2">
               <Folder className="h-4 w-4 text-[#5171AF]" />
               <span className="text-sm font-medium text-text dark:text-text-dark">Uploading Files</span>
             </div>
             <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
               <div 
                 className="bg-[#5171AF] h-2 rounded-full transition-all duration-300"
                 style={{ width: `${uploadProgress}%` }}
               ></div>
             </div>
             <p className="text-xs text-text-muted dark:text-text-muted-dark mt-1">
               {uploadProgress}% complete
             </p>
           </div> */}
          </div>

                     {/* Right Side - Game Configuration */}
          <div>
            <h2 className="text-lg font-semibold text-[#E6E9F2] mb-6">Game Configuration</h2>
           
           {/* Game Type */}
           <div className="mb-6">
                             <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[#9AA3B2]">
                  Game Type
                </label>
                <button type="button" className="flex items-center gap-1 text-[#02a7fd] hover:text-[#02a7fd]/80 text-sm transition-colors duration-200">
                  <ExternalLink size={14} />
                  SDK documentation
                </button>
              </div>
                                                           <select
                 value={gameType}
                 onChange={(e) => {
                   setGameType(e.target.value);
                   // Debounce the update to avoid rapid calls
                   setTimeout(() => {
                     updateParentData();
                   }, 100);
                 }}
                 className="w-full px-4 py-3 border border-[#2e2d7b]/30 rounded-xl bg-[#0f1529]/50 text-[#E6E9F2] focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent transition-all duration-200"
               >
               <option value="HTML5">HTML5</option>
               <option value="Web only">Web only</option>
               <option value="Unity">Unity</option>
               <option value="Unreal">Unreal</option>
             </select>
           </div>

           {/* Initial Script */}
           {gameType === 'HTML5' && (
             <div className="mb-6">
                                    <label className="block text-sm font-medium text-[#9AA3B2] mb-2">
                  Initial Script (only HTML 5)
                </label>
                                    <textarea
                  rows={8}
                  value={initializationCode}
                  onChange={(e) => {
                   setInitializationCode(e.target.value);
                   // Debounce the update to avoid rapid calls
                   setTimeout(() => {
                     updateParentData();
                   }, 100);
                 }}
                  className="w-full p-4 border border-[#2e2d7b]/30 rounded-xl bg-[#0f1529]/50 text-[#E6E9F2] focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent font-mono text-sm resize-none transition-all duration-200 placeholder-[#6B7280]"
                  placeholder="Enter your initial script here..."
                />
             </div>
           )}

           {/* Server or Local Path */}
           <div className="mb-6">
                              <label className="block text-sm font-medium text-[#9AA3B2] mb-2">
                  Server or Local Path
                </label>
                              <input
                  type="url"
                  value={serverPath}
                                   onChange={(e) => {
                    setServerPath(e.target.value);
                    // Debounce the update to avoid rapid calls
                    setTimeout(() => {
                      updateParentData();
                    }, 100);
                  }}
                  className="w-full px-4 py-3 border border-[#2e2d7b]/30 rounded-xl bg-[#0f1529]/50 text-[#E6E9F2] focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent transition-all duration-200 placeholder-[#6B7280]"
                  placeholder="https://example.com/game-path"
                />
           </div>
         </div>
       </div>
      </div>

             {/* Gameplay & Platform Support Section */}
    <div className="bg-[#0c1120]/80 backdrop-blur-sm border border-[#1e1b4d]/30 rounded-2xl shadow-2xl p-8 mt-6 hover:border-[#2e2d7b]/50 transition-all duration-300">
      <h2 className="text-xl font-semibold text-[#E6E9F2] mb-6">Gameplay & Platform Support</h2>
     
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Mobile Support */}
      <div>
                         <p className="text-sm font-medium text-[#9AA3B2] mb-3">Does your game support mobile devices?</p>
                          <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-[#2e2d7b]/30 rounded-lg hover:bg-[#0f1529]/30 transition-colors bg-[#0f1529]/20">
                                                                                                               <input
                                         type="radio"
                     name="mobileSupport"
                     value="yes"
                     checked={mobileSupport === 'yes'}
                     onChange={(e) => {
                       console.log('Mobile Support changed to:', e.target.value);
                       setMobileSupport(e.target.value);
                       // Debounce the update to avoid rapid calls
                       setTimeout(() => {
                         updateParentData();
                       }, 100);
                     }}
                    className="w-4 h-4 text-[#02a7fd] bg-[#0f1529]/50 border-[#2e2d7b]/50 focus:ring-[#02a7fd] focus:ring-offset-[#0c1120] focus:ring-2"
                  />
                 <span className="text-sm text-[#E6E9F2]">Yes</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-[#2e2d7b]/30 rounded-lg hover:bg-[#0f1529]/30 transition-colors bg-[#0f1529]/20">
                                                                                                               <input
                                         type="radio"
                     name="mobileSupport"
                     value="no"
                     checked={mobileSupport === 'no'}
                     onChange={(e) => {
                       setMobileSupport(e.target.value);
                       // Debounce the update to avoid rapid calls
                       setTimeout(() => {
                         updateParentData();
                       }, 100);
                     }}
                    className="w-4 h-4 text-[#02a7fd] bg-[#0f1529]/50 border-[#2e2d7b]/50 focus:ring-[#02a7fd] focus:ring-offset-[#0c1120] focus:ring-2"
                  />
                 <span className="text-sm text-[#E6E9F2]">No</span>
               </label>
             </div>
         </div>

         {/* Multiplayer */}
         <div>
                         <p className="text-sm font-medium text-[#9AA3B2] mb-3">Is your game an online multiplayer experience?</p>
                          <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-[#2e2d7b]/30 rounded-lg hover:bg-[#0f1529]/30 transition-colors bg-[#0f1529]/20">
                                                                                                               <input
                                         type="radio"
                     name="multiplayer"
                     value="yes"
                     checked={multiplayer === 'yes'}
                     onChange={(e) => {
                       setMultiplayer(e.target.value);
                       // Debounce the update to avoid rapid calls
                       setTimeout(() => {
                         updateParentData();
                       }, 100);
                     }}
                    className="w-4 h-4 text-[#02a7fd] bg-[#0f1529]/50 border-[#2e2d7b]/50 focus:ring-[#02a7fd] focus:ring-offset-[#0c1120] focus:ring-2"
                  />
                 <span className="text-sm text-[#E6E9F2]">Yes</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-[#2e2d7b]/30 rounded-lg hover:bg-[#0f1529]/30 transition-colors bg-[#0f1529]/20">
                                                                                                               <input
                                         type="radio"
                     name="multiplayer"
                     value="no"
                     checked={multiplayer === 'no'}
                     onChange={(e) => {
                       setMultiplayer(e.target.value);
                       // Debounce the update to avoid rapid calls
                       setTimeout(() => {
                         updateParentData();
                       }, 100);
                     }}
                    className="w-4 h-4 text-[#02a7fd] bg-[#0f1529]/50 border-[#2e2d7b]/50 focus:ring-[#02a7fd] focus:ring-offset-[#0c1120] focus:ring-2"
                  />
                 <span className="text-sm text-[#E6E9F2]">No</span>
               </label>
             </div>
         </div>

         {/* In-Game Purchases */}
         <div>
                         <p className="text-sm font-medium text-[#9AA3B2] mb-3">Does your game offer in-game purchases?</p>
                          <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-[#2e2d7b]/30 rounded-lg hover:bg-[#0f1529]/30 transition-colors bg-[#0f1529]/20">
                                                       <input
                   type="radio"
                   name="inGamePurchases"
                   value="yes"
                   checked={inGamePurchases === 'yes'}
                   onChange={(e) => {
                     setInGamePurchases(e.target.value);
                     // Debounce the update to avoid rapid calls
                     setTimeout(() => {
                       updateParentData();
                     }, 100);
                   }}
                   className="w-4 h-4 text-[#02a7fd] bg-[#0f1529]/50 border-[#2e2d7b]/50 focus:ring-[#02a7fd] focus:ring-offset-[#0c1120] focus:ring-2"
                 />
                 <span className="text-sm text-[#E6E9F2]">Yes</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-[#2e2d7b]/30 rounded-lg hover:bg-[#0f1529]/30 transition-colors bg-[#0f1529]/20">
                                                       <input
                   type="radio"
                   name="inGamePurchases"
                   value="no"
                   checked={inGamePurchases === 'no'}
                   onChange={(e) => {
                     setInGamePurchases(e.target.value);
                     // Debounce the update to avoid rapid calls
                     setTimeout(() => {
                       updateParentData();
                     }, 100);
                   }}
                   className="w-4 h-4 text-[#02a7fd] bg-[#0f1529]/50 border-[#2e2d7b]/50 focus:ring-[#02a7fd] focus:ring-offset-[#0c1120] focus:ring-2"
                 />
                 <span className="text-sm text-[#E6E9F2]">No</span>
               </label>
             </div>
         </div>
       </div>
     </div>

             {/* Orientation and Gameplay Details Section */}
    <div className="bg-[#0c1120]/80 backdrop-blur-sm border border-[#1e1b4d]/30 rounded-2xl shadow-2xl p-8 mt-6 hover:border-[#2e2d7b]/50 transition-all duration-300">
      <h2 className="text-xl font-semibold text-[#E6E9F2] mb-6">Orientation and Gameplay Details</h2>
     
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      {/* Orientation Support */}
      <div>
                         <h3 className="text-lg font-medium text-[#E6E9F2] mb-4">Orientation Support</h3>
                          <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer px-3 py-2 border border-[#2e2d7b]/30 rounded-lg hover:bg-[#0f1529]/30 transition-colors bg-[#0f1529]/20">
                                                       <input
                   type="radio"
                   name="orientation"
                   value="portrait"
                   checked={orientation === 'portrait'}
                   onChange={(e) => {
                     setOrientation(e.target.value);
                     // Debounce the update to avoid rapid calls
                     setTimeout(() => {
                       updateParentData();
                     }, 100);
                   }}
                                            className="w-4 h-4 text-[#02a7fd] bg-[#0f1529]/50 border-[#2e2d7b]/50 focus:ring-[#02a7fd] focus:ring-offset-[#0c1120] focus:ring-2"
                 />
                 <span className="text-sm text-[#E6E9F2]">Portrait</span>
               </label>
               <label className="flex items-center gap-3 cursor-pointer px-3 py-2 border border-[#2e2d7b]/30 rounded-lg hover:bg-[#0f1529]/30 transition-colors bg-[#0f1529]/20">
                                                       <input
                   type="radio"
                   name="orientation"
                   value="landscape"
                   checked={orientation === 'landscape'}
                   onChange={(e) => {
                     setOrientation(e.target.value);
                     // Debounce the update to avoid rapid calls
                     setTimeout(() => {
                       updateParentData();
                     }, 100);
                   }}
                   className="w-4 h-4 text-[#02a7fd] bg-[#0f1529]/50 border-[#2e2d7b]/50 focus:ring-[#02a7fd] focus:ring-offset-[#0c1120] focus:ring-2"
                 />
                 <span className="text-sm text-[#E6E9F2]">Landscape</span>
               </label>
               <label className="flex items-center gap-3 cursor-pointer px-3 py-2 border border-[#2e2d7b]/30 rounded-lg hover:bg-[#0f1529]/30 transition-colors bg-[#0f1529]/20">
                                                       <input
                   type="radio"
                   name="orientation"
                   value="both"
                   checked={orientation === 'both'}
                   onChange={(e) => {
                     setOrientation(e.target.value);
                     // Debounce the update to avoid rapid calls
                     setTimeout(() => {
                       updateParentData();
                     }, 100);
                   }}
                   className="w-4 h-4 text-[#02a7fd] bg-[#0f1529]/50 border-[#2e2d7b]/50 focus:ring-[#02a7fd] focus:ring-offset-[#0c1120] focus:ring-2"
                 />
                 <span className="text-sm text-[#E6E9F2]">Both</span>
               </label>
             </div>
         </div>

                    {/* Game Category */}
         <div>
           <h3 className="text-lg font-medium text-[#E6E9F2] mb-4">Game Category</h3>

           <div className="flex flex-wrap gap-2 mb-3">
             {gameCategories.map((category, index) => (
               <span
                 key={`${category}-${index}`}
                 className="inline-flex items-center gap-2 px-3 py-1 bg-[#02a7fd] text-white text-sm rounded-full"
               >
                 {category}
                 <button
                   type="button"
                   onClick={() => {
                     setGameCategories(prevCategories => {
                       const newCategories = prevCategories.filter((_, i) => i !== index);
                       return newCategories;
                     });
                     // Update parent after state change
                     updateParentData();
                   }}
                   className="hover:bg-white/20 rounded-full p-0.5 flex items-center justify-center"
                 >
                   <X size={12} />
                 </button>
               </span>
             ))}
           </div>
           <input
             type="text"
             placeholder="Add category..."
             className="w-full px-4 py-3 border border-[#2e2d7b]/30 rounded-xl bg-[#0f1529]/50 text-[#E6E9F2] focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent transition-all duration-200 placeholder-[#6B7280]"
             onKeyPress={(e) => {
               if (e.key === 'Enter') {
                 e.preventDefault(); // Prevent form submission
                 if (e.currentTarget.value.trim()) {
                   const newCategory = e.currentTarget.value.trim();
                   setGameCategories(prevCategories => {
                     const newCategories = [...prevCategories, newCategory];
                     return newCategories;
                   });
                   e.currentTarget.value = '';
                   // Update parent after state change
                   updateParentData();
                 }
               }
             }}
           />
         </div>
      </div>

      {/* Game Controls / How to Play */}
      <div>
                    <h3 className="text-lg font-medium text-[#E6E9F2] mb-4">Game Controls / How to Play</h3>
         
                    {steps.map((step, index) => (
        <div key={step.id} className="mb-12 relative z-1">
          <div className="flex items-center justify-between mb-3">
           <div className="flex items-center gap-3">
             <input
               type="text"
               value={step?.title || ''}
                                  onChange={(e) => {
                     const newSteps = [...steps];
                     if (newSteps[index]) {
                       newSteps[index].title = e.target.value;
                       setSteps(newSteps);
                       // Debounce the update to avoid rapid calls
                       setTimeout(() => {
                         updateParentData();
                       }, 100);
                     }
                   }}
                                            className="text-lg font-medium text-[#E6E9F2] bg-transparent border-none focus:outline-none"
             />
           </div>
                            <div className="flex items-center gap-2">
                                  <button type="button" className="p-1 text-[#9AA3B2] hover:text-[#E6E9F2] transition-colors duration-200">
                     <FileText size={16} />
                   </button>
                  {steps.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => {
                        const newSteps = steps.filter((_, i) => i !== index);
                        setSteps(newSteps);
                        // Debounce the update to avoid rapid calls
                        setTimeout(() => {
                          updateParentData();
                        }, 100);
                      }}
                                              className="p-1 text-[#ef4444] hover:text-[#dc2626] transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
             </div>

                            {/* Rich Text Editor */}
          <div className="relative z-1 mb-6">
            <RichTextEditor
              value={index === 0 ? gameControls : (step?.content || '')}
              onChange={(value) => {
                if (index === 0) {
                  setGameControls(value);
                  // Debounce the update to avoid rapid calls
                  setTimeout(() => {
                    updateParentData();
                  }, 100);
                } else {
                  const newSteps = [...steps];
                  if (newSteps[index]) {
                    newSteps[index].content = value;
                    setSteps(newSteps);
                    // Debounce the update to avoid rapid calls
                    setTimeout(() => {
                      updateParentData();
                    }, 100);
                  }
                }
              }}
              placeholder="Enter game controls and instructions..."
              height="200px"
            />
          </div>
        </div>
      ))}

                    {/* Add More Steps Button */}
         {steps.length < 5 && (
           <div className="mt-6 mb-4 relative z-10">
             <button
               type="button"
               onClick={() => {
                 const newStepNumber = steps.length + 1;
                 setSteps([...steps, { id: newStepNumber, title: `Step ${newStepNumber}`, content: '' }]);
                 // Debounce the update to avoid rapid calls
                 setTimeout(() => {
                   updateParentData();
                 }, 100);
               }}
               className="flex items-center gap-2 text-[#02a7fd] hover:text-[#02a7fd]/80 transition-colors px-4 py-3 border border-[#02a7fd] rounded-xl hover:bg-[#02a7fd] hover:text-white bg-[#0f1529]/30"
             >
               <Plus size={16} />
               Add more Steps ({steps.length}/5)
             </button>
           </div>
         )}
         {steps.length >= 5 && (
           <div className="mt-6 mb-4 relative z-10">
                            <p className="text-sm text-[#9AA3B2]">
               Maximum 5 steps reached. Remove some to add more.
             </p>
           </div>
         )}
      </div>

      {/* Note: All data is automatically saved. Use the "Create Game" button at the bottom to submit the form. */}
    </div>

             {/* SDK & Competition Setup Section */}
    <div className="bg-[#0c1120]/80 backdrop-blur-sm border border-[#1e1b4d]/30 rounded-2xl shadow-2xl p-8 mt-6 hover:border-[#2e2d7b]/50 transition-all duration-300">
      <h2 className="text-xl font-semibold text-[#E6E9F2] mb-6">SDK & Competition Setup</h2>
     
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* SDK Integration */}
      <div>
                         <p className="text-sm font-medium text-[#9AA3B2] mb-3">SDK Integration Confirmation</p>
         <div className="flex gap-4">
           <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-[#2e2d7b]/30 rounded-lg hover:bg-[#0f1529]/30 transition-colors bg-[#0f1529]/20">
                                   <input
                   type="radio"
                   name="sdkIntegration"
                   value="yes"
                   checked={sdkIntegration === 'yes'}
                   onChange={(e) => {
                     setSdkIntegration(e.target.value);
                     // Debounce the update to avoid rapid calls
                     setTimeout(() => {
                       updateParentData();
                     }, 100);
                   }}
                   className="w-4 h-4 text-[#02a7fd] bg-[#0f1529]/50 border border-[#2e2d7b]/50 focus:ring-[#02a7fd] focus:ring-offset-[#0c1120] focus:ring-2"
                 />
                <span className="text-sm text-[#E6E9F2]">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-[#2e2d7b]/30 rounded-lg hover:bg-[#0f1529]/30 transition-colors bg-[#0f1529]/20">
                                   <input
                   type="radio"
                   name="sdkIntegration"
                   value="no"
                   checked={sdkIntegration === 'no'}
                   onChange={(e) => {
                     setSdkIntegration(e.target.value);
                     // Debounce the update to avoid rapid calls
                     setTimeout(() => {
                       updateParentData();
                     }, 100);
                   }}
                   className="w-4 h-4 text-[#02a7fd] bg-[#0f1529]/50 border border-[#2e2d7b]/50 focus:ring-[#02a7fd] focus:ring-offset-[#0c1120] focus:ring-2"
                 />
                <span className="text-sm text-[#E6E9F2]">No</span>
              </label>
            </div>
         </div>

         {/* Tournament Play */}
         <div>
                         <p className="text-sm font-medium text-[#9AA3B2] mb-3">Will Your Game Be Played in a Tournament?</p>
         <div className="flex gap-4">
           <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-[#2e2d7b]/30 rounded-lg hover:bg-[#0f1529]/30 transition-colors bg-[#0f1529]/20">
             <input
               type="radio"
               name="tournamentPlay"
               value="yes"
               checked={tournamentPlay === 'yes'}
               onChange={(e) => {
                 setTournamentPlay(e.target.value);
                 // Debounce the update to avoid rapid calls
                 setTimeout(() => {
                   updateParentData();
                 }, 100);
               }}
               className="w-4 h-4 text-[#02a7fd] bg-[#0f1529]/50 border border-[#2e2d7b]/50 focus:ring-[#02a7fd] focus:ring-offset-[#0c1120] focus:ring-2"
             />
             <span className="text-sm text-[#E6E9F2]">Yes</span>
           </label>
           <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-[#2e2d7b]/30 rounded-lg hover:bg-[#0f1529]/30 transition-colors bg-[#0f1529]/20">
             <input
               type="radio"
               name="tournamentPlay"
               value="no"
               checked={tournamentPlay === 'no'}
               onChange={(e) => {
                 setTournamentPlay(e.target.value);
                 // Debounce the update to avoid rapid calls
                 setTimeout(() => {
                   updateParentData();
                 }, 100);
               }}
               className="w-4 h-4 text-[#02a7fd] bg-[#0f1529]/50 border border-[#2e2d7b]/50 focus:ring-[#02a7fd] focus:ring-offset-[#0c1120] focus:ring-2"
             />
             <span className="text-sm text-[#E6E9F2]">No</span>
           </label>
         </div>
         </div>

         {/* Leaderboard */}
         <div>
                         <p className="text-sm font-medium text-[#9AA3B2] mb-3">Does Your Game Have a Leaderboard?</p>
         <div className="flex gap-4">
           <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-[#2e2d7b]/30 rounded-lg hover:bg-[#0f1529]/30 transition-colors bg-[#0f1529]/20">
             <input
               type="radio"
               name="leaderboard"
               value="yes"
               checked={leaderboard === 'yes'}
               onChange={(e) => {
                 setLeaderboard(e.target.value);
                 // Debounce the update to avoid rapid calls
                 setTimeout(() => {
                   updateParentData();
                 }, 100);
               }}
               className="w-4 h-4 text-[#02a7fd] bg-[#0f1529]/50 border border-[#2e2d7b]/50 focus:ring-[#02a7fd] focus:ring-offset-[#0c1120] focus:ring-2"
             />
             <span className="text-sm text-[#E6E9F2]">Yes</span>
           </label>
           <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-[#2e2d7b]/30 rounded-lg hover:bg-[#0f1529]/30 transition-colors bg-[#0f1529]/20">
             <input
               type="radio"
               name="leaderboard"
               value="no"
               checked={leaderboard === 'no'}
               onChange={(e) => {
                 setLeaderboard(e.target.value);
                 // Debounce the update to avoid rapid calls
                 setTimeout(() => {
                   updateParentData();
                 }, 100);
               }}
               className="w-4 h-4 text-[#02a7fd] bg-[#0f1529]/50 border border-[#2e2d7b]/50 focus:ring-[#02a7fd] focus:ring-offset-[#0c1120] focus:ring-2"
             />
             <span className="text-sm text-[#E6E9F2]">No</span>
           </label>
         </div>
         </div>
       </div>
     </div>

             {/* Tournament Prize Information Section */}
    <div className="bg-[#0c1120]/80 backdrop-blur-sm border border-[#1e1b4d]/30 rounded-2xl shadow-2xl p-8 mt-6 hover:border-[#2e2d7b]/50 transition-all duration-300">
      <h2 className="text-xl font-semibold text-[#E6E9F2] mb-6">Tournament Prize Information</h2>
     
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Entry Fee */}
      <div>
                         <label className="block text-sm font-medium text-[#9AA3B2] mb-2">Enter Entry Fee</label>
         <div className="flex gap-2">
           <input
             type="number"
             value={entryFee}
             onChange={(e) => {
               setEntryFee(e.target.value);
               // Debounce the update to avoid rapid calls
               setTimeout(() => {
                 updateParentData();
               }, 100);
             }}
             className="flex-1 px-4 py-3 border border-[#2e2d7b]/30 rounded-xl bg-[#0f1529]/50 text-[#E6E9F2] focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent transition-all duration-200 placeholder-[#6B7280]"
             placeholder="Enter amount"
           />
           <button type="button" className="px-4 py-3 bg-[#0f1529]/30 text-[#02a7fd] rounded-xl font-medium border border-[#2e2d7b]/30 hover:bg-[#0f1529]/50 transition-all duration-200">
             TKN
           </button>
         </div>
      </div>

      {/* First Prize */}
      <div>
                         <label className="block text-sm font-medium text-[#9AA3B2] mb-2">First Price</label>
         <select
           value={firstPrize}
           onChange={(e) => {
             setFirstPrize(e.target.value);
             // Debounce the update to avoid rapid calls
             setTimeout(() => {
               updateParentData();
             }, 100);
           }}
           className="w-full px-4 py-3 border border-[#2e2d7b]/30 rounded-xl bg-[#0f1529]/50 text-[#E6E9F2] focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent transition-all duration-200"
         >
          <option value="">Select NFT reward</option>
          <option value="nft1">Rare NFT #1</option>
          <option value="nft2">Epic NFT #2</option>
          <option value="nft3">Legendary NFT #3</option>
        </select>
      </div>

      {/* Runner-up Prize */}
      <div>
                         <label className="block text-sm font-medium text-[#9AA3B2] mb-2">Runner-up Prize</label>
         <select
           value={runnerUpPrize}
           onChange={(e) => {
             setRunnerUpPrize(e.target.value);
             // Debounce the update to avoid rapid calls
             setTimeout(() => {
               updateParentData();
             }, 100);
           }}
           className="w-full px-4 py-3 border border-[#2e2d7b]/30 rounded-xl bg-[#0f1529]/50 text-[#E6E9F2] focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent transition-all duration-200"
         >
          <option value="">Select NFT reward</option>
          <option value="nft1">Rare NFT #1</option>
          <option value="nft2">Epic NFT #2</option>
          <option value="nft3">Legendary NFT #3</option>
        </select>
      </div>

      {/* Third Prize */}
      <div>
                         <label className="block text-sm font-medium text-[#9AA3B2] mb-2">Third Prize Fee</label>
         <select
           value={thirdPrize}
           onChange={(e) => {
             setThirdPrize(e.target.value);
             // Debounce the update to avoid rapid calls
             setTimeout(() => {
               updateParentData();
             }, 100);
           }}
           className="w-full px-4 py-3 border border-[#2e2d7b]/30 rounded-xl bg-[#0f1529]/50 text-[#E6E9F2] focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent transition-all duration-200"
         >
          <option value="">Select NFT reward</option>
          <option value="nft1">Rare NFT #1</option>
          <option value="nft2">Epic NFT #2</option>
          <option value="nft3">Legendary NFT #3</option>
        </select>
      </div>
    </div>
  </div>


    </div>
    </div>
  );
} 