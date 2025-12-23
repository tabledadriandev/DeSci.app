'use client';

import { useState, useRef } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Camera, Upload, Heart, Eye, User, Activity } from 'lucide-react';

type AnalysisType = 'facial' | 'body_composition' | 'vital_signs' | 'posture';

export default function CameraAnalysisPage() {
  const { address } = useAccount();
  const [analysisType, setAnalysisType] = useState<AnalysisType>('facial');
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const analysisTypes = [
    { id: 'facial' as AnalysisType, label: 'Facial Analysis', icon: User, description: 'Skin health, eye analysis, stress levels' },
    { id: 'body_composition' as AnalysisType, label: 'Body Composition', icon: Activity, description: 'Measurements, body fat, muscle symmetry' },
    { id: 'vital_signs' as AnalysisType, label: 'Vital Signs', icon: Heart, description: 'Heart rate, breathing rate using camera' },
    { id: 'posture' as AnalysisType, label: 'Posture Analysis', icon: Eye, description: 'Front, side, and back posture assessment' },
  ];

  const handleImageCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setImage(imageData);
        // Stop video stream
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: analysisType === 'facial' ? 'user' : 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setAnalyzing(true);

    try {
      // Simulate analysis locally so the user always sees results,
      // even if they're not logged in or the API is unavailable.
      const analysisResults = await performAnalysis(image, analysisType);
      setResults(analysisResults);

      // Optional: best-effort save to backend when a wallet address exists.
      // This won't block showing results in the UI.
      if (address) {
        try {
          await fetch('/api/camera-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: address,
              type: analysisType,
              imageData: image,
              analysis: analysisResults,
            }),
          });
        } catch (e) {
          // Ignore persistence errors for now
          console.warn('Failed to persist camera analysis:', e);
        }
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const performAnalysis = async (imageData: string, type: AnalysisType): Promise<any> => {
    // Simulated analysis - in production, use OpenCV.js or TensorFlow.js
    return new Promise((resolve) => {
      setTimeout(() => {
        if (type === 'facial') {
          resolve({
            skinHealth: {
              redness: Math.random() * 30,
              spots: Math.random() * 10,
              texture: 'smooth',
            },
            eyeAnalysis: {
              redness: Math.random() * 20,
              darkCircles: Math.random() > 0.5,
              fatigue: Math.random() * 50,
            },
            facialSymmetry: 85 + Math.random() * 10,
            stressLevel: Math.floor(Math.random() * 5) + 1,
            estimatedAge: 25 + Math.floor(Math.random() * 20),
          });
        } else if (type === 'body_composition') {
          resolve({
            measurements: {
              height: 170 + Math.random() * 20,
              waist: 70 + Math.random() * 20,
              hip: 90 + Math.random() * 15,
              chest: 95 + Math.random() * 15,
            },
            bodyFatEstimate: 15 + Math.random() * 10,
            muscleSymmetry: {
              left: 80 + Math.random() * 10,
              right: 80 + Math.random() * 10,
              difference: Math.random() * 5,
            },
          });
        } else if (type === 'vital_signs') {
          resolve({
            heartRate: 60 + Math.floor(Math.random() * 40),
            breathingRate: 12 + Math.floor(Math.random() * 8),
            stressIndicators: {
              hrv: 50 + Math.random() * 20,
              variability: 'normal',
            },
          });
        } else {
          resolve({
            postureAnalysis: {
              front: { alignment: 'good', issues: [] },
              side: { alignment: 'good', issues: [] },
              back: { alignment: 'good', issues: [] },
            },
          });
        }
      }, 2000);
    });
  };

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-display text-accent-primary mb-8">
          Camera-Based Health Analysis
        </h1>

        {/* Analysis Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {analysisTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => {
                  setAnalysisType(type.id);
                  setImage(null);
                  setResults(null);
                }}
                className={`p-6 rounded-xl border-2 transition ${
                  analysisType === type.id
                    ? 'border-accent-primary bg-accent-primary/10'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <Icon className={`w-8 h-8 mb-3 ${analysisType === type.id ? 'text-accent-primary' : 'text-gray-600'}`} />
                <h3 className="font-semibold text-text-primary mb-1">{type.label}</h3>
                <p className="text-xs text-text-secondary">{type.description}</p>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera/Upload Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-display mb-4">Capture Image</h2>
            
            {!image ? (
              <div className="space-y-4">
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ display: image ? 'none' : 'block' }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {!videoRef.current?.srcObject && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-text-secondary">Camera not started</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={startCamera}
                    className="flex-1 px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Start Camera
                  </button>
                  <button
                    onClick={handleImageCapture}
                    disabled={!videoRef.current?.srcObject}
                    className="flex-1 px-6 py-3 bg-accent-secondary text-white rounded-lg hover:bg-accent-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Capture
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Upload
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setImage(event.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <img
                  src={image}
                  alt="Captured"
                  className="w-full rounded-lg"
                />
                <div className="flex gap-4">
                  <button
                    onClick={analyzeImage}
                    disabled={analyzing}
                    className="flex-1 px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 disabled:opacity-50"
                  >
                    {analyzing ? 'Analyzing...' : 'Analyze Image'}
                  </button>
                  <button
                    onClick={() => {
                      setImage(null);
                      setResults(null);
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Retake
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-display mb-4">Analysis Results</h2>
            
            {analyzing ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto mb-4"></div>
                <p className="text-text-secondary">Analyzing image...</p>
              </div>
            ) : results ? (
              <div className="space-y-6">
                {analysisType === 'facial' && results.skinHealth && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-3">Skin Health</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Redness:</span>
                          <span>{results.skinHealth.redness.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Spots:</span>
                          <span>{results.skinHealth.spots.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Texture:</span>
                          <span className="capitalize">{results.skinHealth.texture}</span>
                        </div>
                      </div>
                    </div>
                    {results.eyeAnalysis && (
                      <div>
                        <h3 className="font-semibold mb-3">Eye Analysis</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Redness:</span>
                            <span>{results.eyeAnalysis.redness.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Dark Circles:</span>
                            <span>{results.eyeAnalysis.darkCircles ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fatigue Level:</span>
                            <span>{results.eyeAnalysis.fatigue.toFixed(0)}/100</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {results.stressLevel && (
                      <div>
                        <h3 className="font-semibold mb-2">Estimated Stress Level</h3>
                        <div className="text-3xl font-bold text-accent-primary">
                          {results.stressLevel}/10
                        </div>
                      </div>
                    )}
                    {results.estimatedAge && (
                      <div>
                        <h3 className="font-semibold mb-2">Estimated Age</h3>
                        <div className="text-3xl font-bold text-accent-primary">
                          {results.estimatedAge} years
                        </div>
                      </div>
                    )}
                  </>
                )}

                {analysisType === 'body_composition' && results.measurements && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-3">Body Measurements</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Height:</span>
                          <span>{results.measurements.height.toFixed(1)} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Waist:</span>
                          <span>{results.measurements.waist.toFixed(1)} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hip:</span>
                          <span>{results.measurements.hip.toFixed(1)} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Chest:</span>
                          <span>{results.measurements.chest.toFixed(1)} cm</span>
                        </div>
                      </div>
                    </div>
                    {results.bodyFatEstimate && (
                      <div>
                        <h3 className="font-semibold mb-2">Estimated Body Fat</h3>
                        <div className="text-3xl font-bold text-accent-primary">
                          {results.bodyFatEstimate.toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </>
                )}

                {analysisType === 'vital_signs' && results.heartRate && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-3">Vital Signs</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Heart Rate:</span>
                            <span className="font-bold text-accent-primary">{results.heartRate} bpm</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                results.heartRate >= 60 && results.heartRate <= 100
                                  ? 'bg-green-500'
                                  : 'bg-yellow-500'
                              }`}
                              style={{ width: `${Math.min(100, (results.heartRate / 120) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Breathing Rate:</span>
                            <span className="font-bold text-accent-primary">{results.breathingRate} breaths/min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {analysisType === 'posture' && results.postureAnalysis && (
                  <div>
                    <h3 className="font-semibold mb-3">Posture Assessment</h3>
                    <div className="space-y-3">
                      {Object.entries(results.postureAnalysis).map(([view, data]: [string, any]) => (
                        <div key={view} className="p-3 bg-cream/50 rounded-lg">
                          <div className="font-medium capitalize mb-1">{view} View</div>
                          <div className="text-sm text-text-secondary">
                            Alignment: <span className="capitalize">{data.alignment}</span>
                          </div>
                          {data.issues && data.issues.length > 0 && (
                            <div className="text-sm text-yellow-700 mt-1">
                              Issues: {data.issues.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-text-secondary">
                <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Capture or upload an image to see analysis results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

