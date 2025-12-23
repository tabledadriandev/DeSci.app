'use client';

/**
 * Loading Skeleton Card Component
 * 
 * Provides visual feedback during data loading
 */

export function SkeletonCard() {
  return (
    <div className="card bg-base-100 shadow animate-pulse">
      <div className="card-body space-y-4">
        <div className="skeleton h-8 w-2/5" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-12 w-1/4 mt-4" />
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th><div className="skeleton h-4 w-24" /></th>
            <th><div className="skeleton h-4 w-20" /></th>
            <th><div className="skeleton h-4 w-32" /></th>
            <th><div className="skeleton h-4 w-16" /></th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i}>
              <td><div className="skeleton h-4 w-32" /></td>
              <td><div className="skeleton h-4 w-20" /></td>
              <td><div className="skeleton h-4 w-24" /></td>
              <td><div className="skeleton h-4 w-16" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonGauge() {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body items-center">
        <div className="skeleton h-32 w-32 rounded-full" />
        <div className="skeleton h-6 w-24 mt-4" />
        <div className="skeleton h-4 w-32 mt-2" />
      </div>
    </div>
  );
}

