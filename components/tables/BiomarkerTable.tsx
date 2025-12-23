'use client';

interface BiomarkerRow {
  name: string;
  value: number;
  unit: string;
  normalRange: { min: number; max: number };
  status: 'optimal' | 'normal' | 'caution' | 'alert';
  percentile: number;
}

interface BiomarkerTableProps {
  data: BiomarkerRow[];
}

export function BiomarkerTable({ data }: BiomarkerTableProps) {
  const getStatusBadge = (status: string) => {
    const badges = {
      optimal: 'badge badge-success',
      normal: 'badge badge-info',
      caution: 'badge badge-warning',
      alert: 'badge badge-error',
    };
    return badges[status as keyof typeof badges] || badges.normal;
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full" role="table" aria-label="Biomarker results table">
        {/* Head */}
        <thead>
          <tr className="bg-base-200">
            <th className="text-base-content font-semibold">Biomarker</th>
            <th className="text-base-content font-semibold">Value</th>
            <th className="text-base-content font-semibold">Normal Range</th>
            <th className="text-base-content font-semibold">Status</th>
            <th className="text-base-content font-semibold">Percentile</th>
            <th className="text-base-content font-semibold">Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="hover">
              <td className="font-semibold text-base-content">{row.name}</td>
              <td>
                <span className="font-mono font-bold">{row.value.toFixed(2)}</span>
                <span className="text-sm text-base-content/60 ml-1">{row.unit}</span>
              </td>
              <td className="text-sm text-base-content/60">
                {row.normalRange.min} — {row.normalRange.max}
              </td>
              <td>
                <div className={getStatusBadge(row.status)}>
                  {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </div>
              </td>
              <td className="text-sm font-semibold">{row.percentile}th</td>
              <td>
                <button
                  className="btn btn-xs btn-outline btn-info"
                  onClick={() => {
                    const modal = document.getElementById(
                      `biomarker_modal_${idx}`
                    ) as HTMLDialogElement;
                    modal?.showModal();
                  }}
                >
                  Learn More
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

