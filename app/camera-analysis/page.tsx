'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Heart, Eye, User, Activity, Zap } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type AnalysisType = 'facial' | 'body_composition' | 'vital_signs' | 'posture';

const analysisTypes = [
  { id: 'facial' as AnalysisType, label: 'Facial Scan', icon: User, description: 'Skin health, stress' },
  { id: 'body_composition' as AnalysisType, label: 'Body Scan', icon: Activity, description: 'Body fat, muscle' },
  { id: 'vital_signs' as AnalysisType, label: 'Vitals Scan', icon: Heart, description: 'Heart & breathing rate' },
  { id: 'posture' as AnalysisType, label: 'Posture Scan', icon: Eye, description: 'Spinal alignment' },
];

export default function CameraAnalysisPage() {
  const [analysisType, setAnalysisType] = useState<AnalysisType>('facial');
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: analysisType === 'facial' ? 'user' : 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  }, [analysisType]);

  const handleImageCapture = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      setImage(canvas.toDataURL('image/jpeg'));
      if (video.srcObject) (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setAnalyzing(true);
    setResults(null);
    // Mock analysis
    setTimeout(() => {
      setResults({ facialSymmetry: 85 + Math.random() * 10, stressLevel: Math.floor(Math.random() * 5) + 1 });
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
            AI Health Scanner
          </h1>
          <p className="text-base text-text-secondary max-w-2xl">
            Use your camera to get real-time insights into your health.
          </p>
        </motion.div>

        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8" variants={staggerContainer} initial="hidden" animate="visible">
          {analysisTypes.map(type => (
            <motion.button
              key={type.id}
              variants={fadeInUp}
              onClick={() => { setAnalysisType(type.id); setImage(null); setResults(null); }}
              className={`glass-card-hover p-4 text-center ${analysisType === type.id ? 'ring-2 ring-accent-primary' : ''}`}
            >
              <type.icon className={`w-8 h-8 mx-auto mb-2 ${analysisType === type.id ? 'text-accent-primary' : 'text-text-secondary'}`} />
              <h3 className="font-semibold text-sm text-text-primary">{type.label}</h3>
            </motion.button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div className="glass-card p-6" variants={fadeInUp}>
            <h2 className="text-xl font-semibold mb-4">1. Capture Image</h2>
            {!image ? (
              <div className="space-y-4">
                <div className="relative aspect-video bg-bg-elevated rounded-lg overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-4">
                  <button onClick={startCamera} className="btn-secondary flex-1">Start Camera</button>
                  <button onClick={handleImageCapture} className="btn-primary flex-1">Capture</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <img src={image} alt="Captured" className="w-full rounded-lg" />
                <button onClick={() => { setImage(null); setResults(null); }} className="btn-secondary w-full">Retake</button>
              </div>
            )}
          </motion.div>

          <motion.div className="glass-card p-6" variants={fadeInUp}>
            <h2 className="text-xl font-semibold mb-4">2. Analyze & View Results</h2>
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              {analyzing ? <LoadingSpinner text="Analyzing..." /> :
               results ? <ResultDisplay results={results} /> :
               <button onClick={analyzeImage} disabled={!image} className="btn-primary">Analyze Image</button>
              }
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

function ResultDisplay({ results }: { results: any }) {
  return (
    <div className="text-center">
      <p className="text-lg text-text-secondary">Facial Symmetry</p>
      <p className="text-5xl font-bold text-accent-primary mb-4">{results.facialSymmetry.toFixed(1)}%</p>
      <p className="text-lg text-text-secondary">Stress Level</p>
      <p className="text-5xl font-bold text-accent-primary">{results.stressLevel}/10</p>
    </div>
  );
}

