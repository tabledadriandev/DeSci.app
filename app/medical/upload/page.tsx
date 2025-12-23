'use client';

import { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';
import { cn } from '@/lib/utils/cn';

export default function MedicalUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testDate, setTestDate] = useState<string>('');
  const [labName, setLabName] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', 'current-user-id'); // Would get from auth
      if (testDate) formData.append('testDate', testDate);
      if (labName) formData.append('labName', labName);

      const uploadResponse = await fetch('/api/medical/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();

      // Now extract biomarkers
      setExtracting(true);
      const extractResponse = await fetch('/api/medical/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl: uploadData.data.dataUrl,
          userId: 'current-user-id',
          testDate: testDate || new Date().toISOString(),
          labName: labName || null,
          testType: 'blood',
        }),
      });

      if (!extractResponse.ok) {
        throw new Error('Extraction failed');
      }

      const extractData = await extractResponse.json();
      setResult(extractData.data);
    } catch (err: any) {
      setError(err.message || 'Failed to upload and extract medical results');
    } finally {
      setUploading(false);
      setExtracting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-bg-primary">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          variants={glassEntranceAnimation}
          initial="initial"
          animate="animate"
        >
          <h1 className="text-3xl font-bold text-text-primary mb-2">Upload Medical Results</h1>
          <p className="text-text-secondary">
            Upload your blood test PDF or image and AI will extract all biomarkers automatically
          </p>
        </motion.div>

        {/* Upload Form */}
        <motion.div
          variants={glassEntranceAnimation}
          initial="initial"
          animate="animate"
          className="glass-card p-6 rounded-2xl"
        >
          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="form-label">Medical Result File</label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <span className="btn-primary inline-flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Choose File
                  </span>
                </label>
                {file && (
                  <span className="text-sm text-text-secondary">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>
            </div>

            {/* Test Date */}
            <div>
              <label className="form-label">Test Date</label>
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Lab Name */}
            <div>
              <label className="form-label">Lab Name (Optional)</label>
              <input
                type="text"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                placeholder="e.g., Quest Diagnostics, LabCorp"
                className="form-input"
              />
            </div>

            {/* Preview */}
            {preview && (
              <div>
                <p className="text-sm font-medium text-text-secondary mb-2">Preview</p>
                <img
                  src={preview}
                  alt="Medical result preview"
                  className="w-full rounded-lg max-h-96 object-contain bg-bg-elevated"
                />
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading || extracting}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : extracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extracting biomarkers...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Upload & Extract
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Results */}
        {result && (
          <motion.div
            variants={glassEntranceAnimation}
            initial="initial"
            animate="animate"
            className="glass-card p-6 rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <h2 className="text-xl font-semibold text-text-primary">Extraction Complete</h2>
            </div>

            {/* Flagged Results */}
            {result.flagged && (
              <div className="space-y-3 mb-4">
                {result.flagged.red.length > 0 && (
                  <div className="p-3 rounded-lg bg-error/10 border border-error/20">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-error" />
                      <span className="text-sm font-medium text-error">Needs Medical Attention</span>
                    </div>
                    <ul className="text-xs text-text-primary space-y-1">
                      {result.flagged.red.map((b: any, idx: number) => (
                        <li key={idx}>• {b.name}: {b.value} {b.unit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.flagged.yellow.length > 0 && (
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-warning" />
                      <span className="text-sm font-medium text-warning">Suboptimal - Actionable</span>
                    </div>
                    <ul className="text-xs text-text-primary space-y-1">
                      {result.flagged.yellow.map((b: any, idx: number) => (
                        <li key={idx}>• {b.name}: {b.value} {b.unit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.flagged.green.length > 0 && (
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-success">Excellent</span>
                    </div>
                    <ul className="text-xs text-text-primary space-y-1">
                      {result.flagged.green.map((b: any, idx: number) => (
                        <li key={idx}>• {b.name}: {b.value} {b.unit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* All Biomarkers */}
            <div className="mb-4">
              <p className="text-sm font-medium text-text-secondary mb-2">All Biomarkers</p>
              <div className="space-y-2">
                {result.biomarkers.map((b: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-bg-elevated">
                    <span className="text-sm text-text-primary">{b.name}</span>
                    <span className="text-sm font-mono font-semibold text-primary">
                      {b.value} {b.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Token Reward */}
            {result.tokenReward && (
              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <p className="text-sm text-text-primary">
                  <span className="font-medium">Token Reward: </span>
                  <span className="font-mono font-bold text-success">+{result.tokenReward} $TA</span>
                </p>
              </div>
            )}

            <button
              onClick={() => window.location.href = '/medical/results'}
              className="btn-primary w-full mt-4"
            >
              View Full Results
            </button>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div className="glass-card p-4 rounded-2xl border-2 border-error/50 bg-error/10">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-error" />
              <span className="text-sm font-medium text-error">Error</span>
            </div>
            <p className="text-sm text-error">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
