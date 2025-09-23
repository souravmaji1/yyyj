"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  FileText,
  Download,
  Bot,
  ChevronRight,
  Send,
  User,
  Loader2,
  ImageIcon,
  Video,
  Music,
  Box,
  RefreshCw,
  ChevronDown,
} from "lucide-react"
import { useNotificationUtils } from "@/src/core/utils/notificationUtils"
import { aiChatAxiosClient } from "@/src/app/apis/aiChatAxiosClient"

interface ChatMessage {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  conversionOptions?: ConversionOption[]
  isExpanded?: boolean
}

interface ConversionOption {
  id: string
  type: "image" | "video" | "audio" | "3d" | "swap"
  label: string
  icon: React.ComponentType<any>
  description: string
  credits: number
}

interface DocumentViewerModalProps {
  isOpen: boolean
  onClose: () => void
  file: File
  title: string
  description?: string
  onUseAIBot: (file: File, title: string) => void
}

const getFileIcon = (fileType: string) => {
  if (fileType.includes("pdf")) return FileText
  if (fileType.includes("powerpoint") || fileType.includes("presentation")) return FileText
  if (fileType.includes("excel") || fileType.includes("spreadsheet")) return FileText
  if (fileType.includes("text")) return FileText
  return FileText
}

const getFileTypeLabel = (fileType: string) => {
  if (fileType.includes("pdf")) return "PDF Document"
  if (fileType.includes("powerpoint") || fileType.includes("presentation")) return "PowerPoint Presentation"
  if (fileType.includes("excel") || fileType.includes("spreadsheet")) return "Excel Spreadsheet"
  if (fileType.includes("text")) return "Text Document"
  return "Document"
}

// Predefined prompts for document chat
const PREDEFINED_PROMPTS = [
  {
    id: "summarize",
    label: "Summarize this document",
    description: "Get a concise summary of the main points",
  },
  {
    id: "extract-key-points",
    label: "Extract key points",
    description: "Identify the most important information",
  },
  {
    id: "analyze-structure",
    label: "Analyze document structure",
    description: "Break down the document organization",
  },
  {
    id: "find-specific-info",
    label: "Find specific information",
    description: "Search for particular details or data",
  },
]

// Conversion options for AI responses
const CONVERSION_OPTIONS: ConversionOption[] = [
  {
    id: "convert-to-image",
    type: "image",
    label: "Convert to Image",
    icon: ImageIcon,
    description: "Transform content into visual representation",
    credits: 15,
  },
  {
    id: "convert-to-video",
    type: "video",
    label: "Convert to Video",
    icon: Video,
    description: "Create engaging video content",
    credits: 25,
  },
  {
    id: "convert-to-audio",
    type: "audio",
    icon: Music,
    label: "Convert to Audio",
    description: "Generate audio narration",
    credits: 20,
  },
  {
    id: "convert-to-3d",
    type: "3d",
    icon: Box,
    label: "Convert to 3D",
    description: "Create 3D visualization",
    credits: 30,
  },
  {
    id: "swap-content",
    type: "swap",
    icon: RefreshCw,
    label: "Swap Content",
    description: "Modify and enhance content",
    credits: 18,
  },
]

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function DocumentViewerModal({ isOpen, onClose, file, title, description, onUseAIBot }: DocumentViewerModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [documentProcessed, setDocumentProcessed] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { showSuccess, showError } = useNotificationUtils()

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  }, [messages])

  useEffect(() => {
    if (isChatOpen && messages.length === 0 && documentProcessed) {
      setIsProcessing(true)
      const newSessionId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setSessionId(newSessionId)

      setTimeout(() => {
        setMessages([
          {
            id: "1",
            type: "ai",
            content: `I understand you want to work with: "${title}". I can help you create, analyze, or transform this content in various ways. Here are some options to get you started.`,
            timestamp: new Date(),
            conversionOptions: CONVERSION_OPTIONS,
            isExpanded: false,
          },
        ])
        setIsProcessing(false)
      }, 2000)
    }
  }, [isChatOpen, title, documentProcessed])

  const handleUseAIBot = async () => {
    setIsLoading(true)
    try {
      await onUseAIBot(file, title)
      setDocumentProcessed(true)
      setIsChatOpen(true)
    } catch (error) {
      showError("Processing Failed", "Failed to process document for AI Bot")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isChatLoading || !sessionId) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentMessage = inputMessage.trim()
    setInputMessage("")
    setIsChatLoading(true)

    try {
      const response = await aiChatAxiosClient.post("/api/ai-chat/chat", {
        message: currentMessage,
        session_id: sessionId,
        context: {
          document_title: title,
          document_type: file.type,
          document_name: file.name,
        },
      })

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response.data?.message || "I apologize, but I couldn't process your request. Please try again.",
        timestamp: new Date(),
        conversionOptions: CONVERSION_OPTIONS,
        isExpanded: false,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Chat API Error:", error)
      showError("Chat Error", "Failed to send message. Please try again.")
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handlePredefinedPrompt = (prompt: (typeof PREDEFINED_PROMPTS)[0]) => {
    setInputMessage(prompt.label)
    setIsInputFocused(false)
  }

  const handleConversionOption = (option: ConversionOption, messageId: string) => {
    console.log("Conversion option selected:", option, "for message:", messageId)
    showSuccess("Conversion Started", `Converting to ${option.label.toLowerCase()}...`)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleDownload = () => {
    const url = URL.createObjectURL(file)
    const a = document.createElement("a")
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const FileIcon = getFileIcon(file.type)
  const fileTypeLabel = getFileTypeLabel(file.type)

  const toggleMessageExpansion = (messageId: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, isExpanded: !msg.isExpanded } : msg)))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#0F1629] backdrop-blur-sm z-50 max-w-[1340px] mx-auto h-[90vh] mt-8 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose()
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full h-full bg-[#0F1629] overflow-hidden flex"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-6 right-6 z-10 w-12 h-12 bg-[rgba(255,255,255,0.1)] backdrop-blur-sm border border-[rgba(255,255,255,0.2)] rounded-full flex items-center justify-center text-white hover:bg-[rgba(255,255,255,0.2)] transition-all duration-300"
            >
              <span className="text-2xl">×</span>
            </motion.button>

            <div className="w-1/2">
              <div className="p-8 h-full">
                <h3 className="text-lg font-medium text-gray-400 mb-4">Document Preview</h3>
                <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-2xl p-8 min-h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <FileIcon className="w-24 h-24 text-slate-400 mx-auto mb-4" />
                    <h4 className="text-xl font-medium text-white mb-2">{fileTypeLabel}</h4>
                    <p className="text-slate-400 mb-4">Preview not available for this document type</p>
                    <p className="text-sm text-slate-500">Click "Use AI Bot" to process and chat with this document</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-1/2 relative flex flex-col">
              <div className="p-8 border-b border-white/10 bg-[#0F1629]">
                <h2 className="text-4xl font-semibold text-white mb-4">Document Viewer</h2>
              </div>

              <div className="p-8 overflow-y-auto bg-[#0F1629] flex-1">
                <div className="space-y-8">
                  <h3 className="text-lg font-medium text-gray-400 mb-4">Document Information</h3>

                  <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <FileIcon className="w-6 h-6 text-blue-400" />
                      <h4 className="text-lg font-medium text-white">{title}</h4>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">File Name</span>
                        <span className="text-white text-sm">{file.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">File Type</span>
                        <span className="text-white text-sm">{fileTypeLabel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">File Size</span>
                        <span className="text-white text-sm">{formatFileSize(file.size)}</span>
                      </div>
                      {description && (
                        <div className="pt-3 border-t border-white/10">
                          <span className="text-slate-400 text-sm">Description</span>
                          <p className="text-white text-sm mt-1">{description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleUseAIBot}
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Bot className="w-5 h-5" />
                          Use AI Bot
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownload}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <Download className="w-4 h-4" />
                      Download Document
                    </motion.button>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400 text-sm font-medium">AI Bot Features</span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1">
                      <li>• Ask questions about the document</li>
                      <li>• Extract key information</li>
                      <li>• Generate summaries</li>
                      <li>• Create prompts from content</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isChatOpen && (
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="absolute top-0 right-0 w-1/2 h-full border-l border-white/10 flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-10 overflow-hidden"
                >
                  <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">AI Bot</h3>
                        <p className="text-sm text-slate-300">Chat with document</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsChatOpen(false)}
                      className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 border border-white/10"
                    >
                      <X className="w-5 h-5 text-slate-300" />
                    </motion.button>
                  </div>

                  <div className="p-4 border-b border-white/10 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <span className="text-slate-400">Document:</span>
                        <span className="text-white ml-2 font-medium truncate">{title}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent to-slate-900/20">
                    {isProcessing && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl backdrop-blur-sm"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                        </div>
                        <div>
                          <span className="text-blue-400 font-semibold">Processing document...</span>
                          <p className="text-blue-300/70 text-sm mt-1">Analyzing content and preparing AI responses</p>
                        </div>
                      </motion.div>
                    )}

                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className={`flex gap-4 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {message.type === "ai" && (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                        )}

                        <div className={`max-w-[85%] ${message.type === "user" ? "order-first" : ""}`}>
                          <motion.div
                            whileHover={message.type === "ai" && message.conversionOptions ? { scale: 1.02 } : {}}
                            onClick={() =>
                              message.type === "ai" && message.conversionOptions && toggleMessageExpansion(message.id)
                            }
                            className={`p-5 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 ${
                              message.type === "user"
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                : "bg-gradient-to-br from-slate-800/80 to-slate-700/80 text-white border border-white/10 backdrop-blur-sm hover:border-white/20"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm leading-relaxed flex-1">{message.content}</p>
                              {message.type === "ai" && message.conversionOptions && (
                                <motion.div
                                  animate={{ rotate: message.isExpanded ? 180 : 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                </motion.div>
                              )}
                            </div>
                          </motion.div>

                          <AnimatePresence>
                            {message.type === "ai" && message.conversionOptions && message.isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="mt-4 overflow-hidden"
                              >
                                <div className="p-5 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-2xl border border-white/10 backdrop-blur-sm">
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
                                    <span className="text-sm font-semibold text-slate-200">Transform this content</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    {message.conversionOptions.map((option) => {
                                      const IconComponent = option.icon
                                      return (
                                        <motion.button
                                          key={option.id}
                                          whileHover={{ scale: 1.05, y: -2 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleConversionOption(option, message.id)
                                          }}
                                          className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-white/8 to-white/4 hover:from-white/12 hover:to-white/8 text-slate-200 hover:text-white transition-all duration-300 border border-white/10 hover:border-white/20 backdrop-blur-sm group"
                                        >
                                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all duration-300">
                                            <IconComponent className="w-4 h-4" />
                                          </div>
                                          <div className="flex-1 text-left">
                                            <div className="font-semibold text-sm">{option.label}</div>
                                            <div className="text-xs text-slate-400">{option.credits} credits</div>
                                          </div>
                                        </motion.button>
                                      )
                                    })}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <p className="text-xs text-slate-500 mt-2 px-1">{formatTime(message.timestamp)}</p>
                        </div>

                        {message.type === "user" && (
                          <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {isChatLoading && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                          <div className="flex gap-2">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  <div className="border-t border-white/10 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm">
                    <AnimatePresence>
                      {isInputFocused && !isProcessing && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="p-4 border-b border-white/10 overflow-hidden"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-sm font-semibold text-slate-200">Quick Actions</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {PREDEFINED_PROMPTS.map((prompt) => (
                              <motion.button
                                key={prompt.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handlePredefinedPrompt(prompt)}
                                className="flex items-center justify-between p-3 text-sm rounded-xl bg-gradient-to-r from-white/8 to-white/4 hover:from-white/12 hover:to-white/6 text-slate-200 hover:text-white transition-all duration-300 border border-white/10 hover:border-white/20 backdrop-blur-sm group"
                              >
                                <span className="font-medium">{prompt.label}</span>
                                <ChevronRight className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="p-6">
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => setTimeout(() => setIsInputFocused(false), 150)}
                            placeholder="Ask about the document..."
                            className="w-full bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-white/20 rounded-4xl px-6 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 "
                            disabled={isChatLoading || isProcessing}
                          />
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim() || isChatLoading || isProcessing}
                          className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 shadow-lg disabled:shadow-none"
                        >
                          {isChatLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default DocumentViewerModal  
