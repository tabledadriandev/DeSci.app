'use client';

/**
 * Full Dashboard Example using daisyUI
 * 
 * This component demonstrates daisyUI components integrated
 * with Table d'Adrian's health/DeSci theme.
 */

export default function DashboardExample() {
  return (
    <main className="p-4 md:p-8 bg-base-200 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Wellness Dashboard</h1>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
            <div className="card-body">
              <p className="text-sm text-base-content/60 uppercase tracking-wide">Biological Age</p>
              <p className="text-3xl font-bold text-primary">47.3</p>
              <p className="text-xs text-base-content/60">years</p>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
            <div className="card-body">
              <p className="text-sm text-base-content/60 uppercase tracking-wide">Health Score</p>
              <p className="text-3xl font-bold text-secondary">847</p>
              <p className="text-xs text-base-content/60">/ 850</p>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
            <div className="card-body">
              <p className="text-sm text-base-content/60 uppercase tracking-wide">Credentials</p>
              <p className="text-3xl font-bold text-info">3</p>
              <p className="text-xs text-base-content/60">verified</p>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
            <div className="card-body">
              <p className="text-sm text-base-content/60 uppercase tracking-wide">Percentile</p>
              <p className="text-3xl font-bold text-accent">87th</p>
              <p className="text-xs text-base-content/60">of peers</p>
            </div>
          </div>
        </div>

        {/* Biomarkers Table */}
        <div className="card bg-base-100 shadow-md mb-8">
          <div className="card-body">
            <h2 className="card-title mb-4">Recent Biomarkers</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Marker</th>
                    <th>Value</th>
                    <th>Unit</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover">
                    <td className="font-semibold">Glucose</td>
                    <td>92</td>
                    <td>mg/dL</td>
                    <td>
                      <div className="badge badge-success gap-2">
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                        Optimal
                      </div>
                    </td>
                    <td className="text-sm text-base-content/60">2025-01-20</td>
                  </tr>
                  <tr className="hover">
                    <td className="font-semibold">Creatinine</td>
                    <td>0.95</td>
                    <td>mg/dL</td>
                    <td>
                      <div className="badge badge-info gap-2">
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                        Normal
                      </div>
                    </td>
                    <td className="text-sm text-base-content/60">2025-01-20</td>
                  </tr>
                  <tr className="hover">
                    <td className="font-semibold">Cystatin C</td>
                    <td>1.1</td>
                    <td>mg/L</td>
                    <td>
                      <div className="badge badge-warning gap-2">
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                        Caution
                      </div>
                    </td>
                    <td className="text-sm text-base-content/60">2025-01-20</td>
                  </tr>
                  <tr className="hover">
                    <td className="font-semibold">Total Cholesterol</td>
                    <td>185</td>
                    <td>mg/dL</td>
                    <td>
                      <div className="badge badge-success gap-2">
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                        Optimal
                      </div>
                    </td>
                    <td className="text-sm text-base-content/60">2025-01-20</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title">Calculate Biological Age</h2>
              <p className="text-sm text-base-content/70 mb-4">
                Enter your biomarkers to get your biological age calculation using the UK Biobank model.
              </p>
              <div className="card-actions">
                <button className="btn btn-primary">
                  Get Started
                </button>
                <button className="btn btn-outline btn-primary">
                  Learn More
                </button>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title">Verify Credentials</h2>
              <p className="text-sm text-base-content/70 mb-4">
                Verify your research credentials on-chain with zkTLS. Instant verification in seconds.
              </p>
              <div className="card-actions">
                <button className="btn btn-secondary">
                  Verify Now
                </button>
                <button className="btn btn-outline btn-secondary">
                  View Docs
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-4">
          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Your health data is private and secure. All calculations use zero-knowledge proofs.</span>
          </div>

          <div className="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Your biological age is 2.3 years younger than your chronological age! Keep it up.</span>
          </div>
        </div>
      </div>
    </main>
  );
}

