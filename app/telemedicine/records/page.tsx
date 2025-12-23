'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { FileText, Share2, Stethoscope, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

interface MedicalRecord {
  id: string;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  createdAt: string;
  provider?: {
    id: string;
    fullName: string;
  } | null;
  sharedWithProviderIds: string[];
}

export default function TelemedicineRecordsPage() {
  const { address } = useAccount();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!address) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/telemedicine/records/list?userId=${encodeURIComponent(address)}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data?.records) {
          setRecords(data.records);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [address]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !title) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/telemedicine/records/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: address,
          title,
          description: description || undefined,
          fileUrl: fileUrl || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.record) {
          setRecords((prev) => [data.record, ...prev]);
          setTitle('');
          setDescription('');
          setFileUrl('');
          showToast({
            title: 'Record saved',
            description: 'Your medical record has been added to Telemedicine.',
            variant: 'success',
          });
        }
      } else {
        const body = await res.json().catch(() => ({}));
        const msg = body.error || 'Could not save record. Please try again.';
        showToast({
          title: 'Save failed',
          description: msg,
          variant: 'error',
        });
      }
    } catch (err) {
      console.error('Error uploading record:', err);
      showToast({
        title: 'Unexpected error',
        description: 'Something went wrong while saving your record.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen  flex flex-col">
      <header className="w-full border-b border-border-light bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => window.location.assign('/telemedicine')}
              className="px-3 py-1 text-xs sm:text-sm border border-border-light rounded-full hover:bg-cream whitespace-nowrap"
            >
              Telemedicine
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <img src="/logo.ico" alt="Logo" className="w-6 h-6 flex-shrink-0" />
              <span className="font-semibold text-sm sm:text-base">
                Table d&apos;Adrian Wellness
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 md:px-8 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-sans font-bold text-accent-primary flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Medical Records &amp; Documents
            </h1>
          </div>

          {/* Upload section (metadata only – actual file storage handled elsewhere) */}
          <section className="bg-white rounded-xl shadow-md p-5">
            <h2 className="text-lg font-sans font-semibold mb-3 flex items-center gap-2">
              <Upload className="w-5 h-5 text-accent-primary" />
              Add a Record
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mb-4">
              Store metadata and links to lab PDFs, imaging reports, or letters. Physical storage and
              secure file hosting would be handled by a HIPAA/GDPR-compliant provider.
            </p>
            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full border border-border-light rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. Blood panel – Nov 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-border-light rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Short note about this record…"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  File URL (optional)
                </label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full border border-border-light rounded-lg px-3 py-2 text-sm"
                  placeholder="https://secure-storage/your-report.pdf"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !address}
                  className="btn-primary text-sm px-5 py-2 disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : 'Save Record'}
                </button>
              </div>
            </form>
          </section>

          {/* Records list */}
          <section className="bg-white rounded-xl shadow-md p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-sans font-semibold flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-accent-primary" />
                Your Records
              </h2>
            </div>

            {loading ? (
              <div className="text-sm text-text-secondary py-4">Loading records…</div>
            ) : records.length === 0 ? (
              <div className="text-sm text-text-secondary py-4">
                No records saved yet. Use the form above to add your first lab result or document note.
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="border border-border-light rounded-lg p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-sm sm:text-base text-text-primary">
                          {record.title}
                        </div>
                        {record.description && (
                          <div className="text-xs sm:text-sm text-text-secondary mt-1">
                            {record.description}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {record.provider && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-blue-50 text-blue-800">
                            <Stethoscope className="w-3 h-3" />
                            {record.provider.fullName}
                          </span>
                        )}
                        {record.sharedWithProviderIds.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-green-50 text-green-800">
                            <Share2 className="w-3 h-3" />
                            Shared with {record.sharedWithProviderIds.length} provider
                            {record.sharedWithProviderIds.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-text-secondary mt-1">
                      <span>
                        Added on{' '}
                        {new Date(record.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      {record.fileUrl && (
                        <a
                          href={record.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-accent-primary hover:underline"
                        >
                          <FileText className="w-3 h-3" />
                          Open file
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}


