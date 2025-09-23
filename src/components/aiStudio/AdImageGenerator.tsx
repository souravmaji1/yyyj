"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { motion } from "framer-motion";
import ImageGenerator from "./ImageGenerator";
import VideoGenerator from "./VideoGenerator";
import GenerationHistory from "@/src/components/aiStudio/GenerationHistory";
import XUTBalance from "@/src/components/aiStudio/XUTBalance"; 

export default function AdImageGenerator() {
  const { profile } = useSelector((state: RootState) => state.user);
  const { currentGeneration } = useSelector((state: RootState) => state.aiStudio);
  const [activeTab, setActiveTab] = useState("image");

  // Filter currentGeneration based on active tab
  const getFilteredGeneration = () => {
    if (!currentGeneration) return null;

    // Only show generation if it matches the current tab
    if (activeTab === "image" && currentGeneration.type === "image") {
      return currentGeneration;
    }
    if (activeTab === "video" && currentGeneration.type === "video") {
      return currentGeneration;
    }

    // Don't show generation data in history tab
    if (activeTab === "history") {
      return null;
    }

    return null;
  };

  const filteredGeneration = getFilteredGeneration();

  // Debug logging
  console.log(' AdImageGenerator - Tab filtering:', {
    activeTab,
    globalCurrentGeneration: currentGeneration,
    filteredGeneration,
    shouldShowGeneration: filteredGeneration !== null
  });

  // Log when tab changes
  useEffect(() => {
    console.log('Tab changed to:', activeTab, 'Filtered generation:', filteredGeneration);
  }, [activeTab, filteredGeneration]);

  return (
    <div className="w-full space-y-8 px-4 sm:px-6">
      {/* Header with XUT Balance */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
      >
        <div>
          {/* Responsive heading scaling */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-[var(--color-primary)] bg-clip-text text-transparent">
            Ad and Image Generator
          </h1>
          {/* Responsive paragraph scaling */}
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl">
            Create stunning images and videos with AI-powered generation tools. Choose your mode and start creating in seconds.
          </p>
        </div>
        {/* <XUTBalance /> */}
      </motion.div>

      {/* Main Content with Three Tabs */}
      <div className="bg-[#0F172A] backdrop-blur-xl rounded-2xl p-8 border border-[rgba(255,255,255,0.1)] shadow-2xl">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          {/* Tabs stack vertically on mobile */}
          <TabsList className="flex flex-col sm:flex-row w-full mb-8 bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-full p-1" aria-label="Generation modes">
            <TabsTrigger
              value="image"
              className="flex-1 w-full rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--color-primary)] data-[state=active]:to-[var(--color-secondary)] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <span className="mr-2">🖼️</span>
              Image Generator
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="flex-1 w-full rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--color-primary)] data-[state=active]:to-[var(--color-secondary)] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 mt-1 sm:mt-0"
            >
              <span className="mr-2">🎬</span>
              Video Generator
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex-1 w-full rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--color-primary)] data-[state=active]:to-[var(--color-secondary)] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 mt-1 sm:mt-0"
            >
              <span className="mr-2">📚</span>
              Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ImageGenerator filteredGeneration={filteredGeneration} />
            </motion.div>
          </TabsContent>

          <TabsContent value="video">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <VideoGenerator filteredGeneration={filteredGeneration} />
            </motion.div>
          </TabsContent>

          <TabsContent value="history">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GenerationHistory />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
}