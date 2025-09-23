// SocketConnection.tsx
import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Wifi, WifiOff, Upload, CheckCircle, XCircle } from "lucide-react";

let socket: Socket;

interface SocketConnectionProps {
  userId: string;
}

const SocketConnection: React.FC<SocketConnectionProps> = ({ userId }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Disconnected");

  useEffect(() => {
    const baseURL = process.env.NEXT_PUBLIC_API_GAME_BASE_URL;

    // Connect to /uploads namespace with correct path
    socket = io(`${baseURL}`, {
      path: `/socket.io/uploads?userId=${userId}`,
      // query: { userId },
      transports: ["websocket"],
      withCredentials: false,
    });

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
      setStatus("Connected");
    });

    socket.on("connected", (data) => {
      console.log("Server says:", data);
    });

    socket.on("upload-started", (data) => {
      console.log("📤 Upload started:", data);
      setStatus("Upload started");
      setProgress(0);
    });

    socket.on("upload-progress", (data) => {
      console.log("⏳ Progress:", data);
      setProgress(data.progressPercent);
    });

    socket.on("upload-completed", (data) => {
      console.log("🎉 Upload completed:", data);
      setStatus("Completed ✅");
      setProgress(100);
    });

    socket.on("upload-failed", (err) => {
      console.error("❌ Upload failed:", err);
      setStatus("Failed ❌");
    });

    socket.on("disconnect", () => {
      console.log("🔌 Disconnected");
      setStatus("Disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const getStatusIcon = () => {
    switch (status) {
      case "Connected":
        return <Wifi className="w-5 h-5 text-[#22c55e]" />;
      case "Upload started":
        return <Upload className="w-5 h-5 text-[#02a7fd]" />;
      case "Completed ✅":
        return <CheckCircle className="w-5 h-5 text-[#22c55e]" />;
      case "Failed ❌":
        return <XCircle className="w-5 h-5 text-[#ef4444]" />;
      default:
        return <WifiOff className="w-5 h-5 text-[#9AA3B2]" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "Connected":
        return "text-[#22c55e]";
      case "Upload started":
        return "text-[#02a7fd]";
      case "Completed ✅":
        return "text-[#22c55e]";
      case "Failed ❌":
        return "text-[#ef4444]";
      default:
        return "text-[#9AA3B2]";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div>
          <h3 className={`text-lg font-medium ${getStatusColor()}`}>
            Connection Status: {status}
          </h3>
          <p className="text-sm text-[#9AA3B2]">
            Real-time upload monitoring and progress tracking
          </p>
        </div>
      </div>

      {status === "Upload started" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#9AA3B2]">Upload Progress</span>
            <span className="text-[#E6E9F2] font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-[#0f1529]/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#02a7fd] to-[#7c3aed] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {status === "Disconnected" && (
        <div className="p-4 bg-[#0f1529]/30 border border-[#2e2d7b]/30 rounded-xl">
          <p className="text-sm text-[#9AA3B2] text-center">
            Waiting for connection...
          </p>
        </div>
      )}
    </div>
  );
};

export default SocketConnection;
