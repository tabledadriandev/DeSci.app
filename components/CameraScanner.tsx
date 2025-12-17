'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface CameraScannerProps {
  onImageCapture: (imageBase64: string) => void;
  onImageRemove?: () => void;
  facingMode?: 'user' | 'environment';
  aspectRatio?: number;
  showUpload?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function CameraScanner({
  onImageCapture,
  onImageRemove,
  facingMode = 'user',
  aspectRatio = 16 / 9,
  showUpload = true,
  className = '',
  disabled = false,
}: CameraScannerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup: stop stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.92);
        setImage(imageData);
        onImageCapture(imageData);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImage(result);
        onImageCapture(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    stopCamera();
    if (onImageRemove) {
      onImageRemove();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="relative bg-gray-100 rounded-lg overflow-hidden"
        style={{ aspectRatio }}
      >
        {/* Video Stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${image ? 'hidden' : 'block'}`}
        />

        {/* Captured Image */}
        {image && (
          <img
            src={image}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        )}

        {/* Placeholder */}
        {!image && !isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-text-secondary">Camera not started</p>
            </div>
          </div>
        )}

        {/* Canvas (hidden) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Controls Overlay */}
        {isStreaming && !image && (
          <div className="absolute inset-0 flex items-end justify-center p-4 bg-gradient-to-t from-black/50 to-transparent">
            <button
              onClick={captureImage}
              disabled={disabled}
              className="px-8 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              Capture
            </button>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 mt-4">
        {!image ? (
          <>
            {!isStreaming ? (
              <>
                <button
                  onClick={startCamera}
                  disabled={disabled}
                  className="flex-1 px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Start Camera
                </button>
                {showUpload && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={disabled}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      Upload
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </>
                )}
              </>
            ) : (
              <button
                onClick={stopCamera}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Stop Camera
              </button>
            )}
          </>
        ) : (
          <button
            onClick={removeImage}
            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Remove & Retake
          </button>
        )}
      </div>
    </div>
  );
}

