'use client';

export function BiomarkerCardSkeleton() {
  return (
    <div
      className="rounded-lg border p-6 space-y-4 animate-pulse"
      role="status"
      aria-label="Loading biomarker data"
    >
      <div className="flex justify-between">
        <div className="h-6 bg-slate-200 rounded w-1/3" />
        <div className="h-6 bg-slate-200 rounded w-1/4" />
      </div>
      <div className="h-3 bg-slate-200 rounded-full" />
      <div className="h-4 bg-slate-200 rounded w-5/6" />
      <div className="h-10 bg-slate-200 rounded" />
    </div>
  );
}

export function BiomarkerGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, idx) => (
        <BiomarkerCardSkeleton key={idx} />
      ))}
    </div>
  );
}

