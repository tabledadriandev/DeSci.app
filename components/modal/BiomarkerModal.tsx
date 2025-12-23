'use client';

interface BiomarkerModalProps {
  biomarkerName: string;
  value: number;
  unit: string;
  explanation: string;
  actions: string[];
  researchLinks: { title: string; doi: string; year: number }[];
  modalId: string;
}

export function BiomarkerModal({
  biomarkerName,
  value,
  unit,
  explanation,
  actions,
  researchLinks,
  modalId,
}: BiomarkerModalProps) {
  return (
    <dialog id={modalId} className="modal modal-bottom sm:modal-middle">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg text-base-content mb-4">{biomarkerName}</h3>

        {/* Value Display */}
        <div className="bg-base-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-base-content/60">Current Value</p>
          <p className="text-3xl font-bold text-base-content">
            {value.toFixed(2)} <span className="text-lg">{unit}</span>
          </p>
        </div>

        {/* Explanation */}
        <div className="mb-4">
          <h4 className="font-semibold text-base-content mb-2">What It Means</h4>
          <p className="text-base-content/80">{explanation}</p>
        </div>

        {/* Actions */}
        <div className="mb-4">
          <h4 className="font-semibold text-base-content mb-2">Recommendations</h4>
          <ul className="list-disc list-inside space-y-1">
            {actions.map((action, idx) => (
              <li key={idx} className="text-base-content/80">
                {action}
              </li>
            ))}
          </ul>
        </div>

        {/* Research Links */}
        <div className="mb-6">
          <h4 className="font-semibold text-base-content mb-2">Research Basis</h4>
          <div className="space-y-2">
            {researchLinks.map((link, idx) => (
              <a
                key={idx}
                href={`https://doi.org/${link.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-info hover:underline"
              >
                {link.title} ({link.year})
              </a>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-ghost">Close</button>
          </form>
          <button className="btn btn-primary">View Full Report</button>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>Close</button>
      </form>
    </dialog>
  );
}

