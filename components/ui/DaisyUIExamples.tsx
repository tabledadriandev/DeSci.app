'use client';

/**
 * daisyUI Component Examples
 * 
 * Quick reference for all daisyUI components
 * used in Table d'Adrian DeSci.app
 */

export function DaisyUIExamples() {
  return (
    <div className="p-8 space-y-8 bg-base-200 min-h-screen">
      <h1 className="text-4xl font-bold">daisyUI Component Examples</h1>

      {/* Buttons */}
      <section className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Buttons</h2>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary">Primary</button>
            <button className="btn btn-secondary">Secondary</button>
            <button className="btn btn-accent">Accent</button>
            <button className="btn btn-outline btn-primary">Outline</button>
            <button className="btn btn-sm btn-info">Small</button>
            <button className="btn btn-lg btn-success">Large</button>
            <button className="btn btn-warning" disabled>Disabled</button>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title">Card Title</h2>
                <p>Card content goes here.</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary btn-sm">Action</button>
                </div>
              </div>
            </div>
            <div className="card bg-primary text-primary-content shadow-md">
              <div className="card-body">
                <h2 className="card-title">Primary Card</h2>
                <p>With primary color scheme.</p>
              </div>
            </div>
            <div className="card bg-secondary text-secondary-content shadow-md">
              <div className="card-body">
                <h2 className="card-title">Secondary Card</h2>
                <p>With secondary color scheme.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tables */}
      <section className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Tables</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Biomarker</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Glucose</td>
                  <td>92 mg/dL</td>
                  <td><div className="badge badge-success">Normal</div></td>
                </tr>
                <tr>
                  <td>Creatinine</td>
                  <td>0.95 mg/dL</td>
                  <td><div className="badge badge-info">Normal</div></td>
                </tr>
                <tr>
                  <td>Cystatin C</td>
                  <td>1.1 mg/L</td>
                  <td><div className="badge badge-warning">Caution</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Badges</h2>
          <div className="flex flex-wrap gap-2">
            <div className="badge">Default</div>
            <div className="badge badge-primary">Primary</div>
            <div className="badge badge-secondary">Secondary</div>
            <div className="badge badge-accent">Accent</div>
            <div className="badge badge-success">Success</div>
            <div className="badge badge-warning">Warning</div>
            <div className="badge badge-error">Error</div>
            <div className="badge badge-info">Info</div>
            <div className="badge badge-outline">Outline</div>
            <div className="badge badge-lg">Large</div>
            <div className="badge badge-sm">Small</div>
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section className="space-y-4">
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Info alert: Your data is secure.</span>
        </div>
        <div className="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Success alert: Operation completed!</span>
        </div>
        <div className="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Warning alert: Please review your data.</span>
        </div>
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error alert: Something went wrong.</span>
        </div>
      </section>

      {/* Forms */}
      <section className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Form Inputs</h2>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Age" 
              className="input input-bordered w-full" 
            />
            <select className="select select-bordered w-full">
              <option disabled selected>Select sex</option>
              <option>Male</option>
              <option>Female</option>
            </select>
            <textarea 
              className="textarea textarea-bordered w-full" 
              placeholder="Notes"
            ></textarea>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Remember me</span>
                <input type="checkbox" className="checkbox checkbox-primary" />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Loading */}
      <section className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Loading States</h2>
          <div className="flex gap-4 items-center">
            <span className="loading loading-spinner loading-sm"></span>
            <span className="loading loading-spinner"></span>
            <span className="loading loading-spinner loading-lg"></span>
            <span className="loading loading-dots loading-lg"></span>
            <span className="loading loading-ring loading-lg"></span>
            <span className="loading loading-ball loading-lg"></span>
            <span className="loading loading-bars loading-lg"></span>
            <span className="loading loading-infinity loading-lg"></span>
          </div>
        </div>
      </section>

      {/* Modal Example */}
      <section className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Modal</h2>
          <button 
            className="btn btn-primary"
            onClick={() => {
              const modal = document.getElementById('my_modal') as HTMLDialogElement;
              modal?.showModal();
            }}
          >
            Open Modal
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Stats</h2>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Biological Age</div>
              <div className="stat-value text-primary">47.3</div>
              <div className="stat-desc">years</div>
            </div>
            <div className="stat">
              <div className="stat-title">Health Score</div>
              <div className="stat-value text-secondary">847</div>
              <div className="stat-desc">/ 850</div>
            </div>
            <div className="stat">
              <div className="stat-title">Percentile</div>
              <div className="stat-value text-accent">87th</div>
              <div className="stat-desc">of peers</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Modal component
export function ExampleModal() {
  return (
    <dialog id="my_modal" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Biomarker Details</h3>
        <p className="py-4">Learn more about your biomarker results and what they mean for your health.</p>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn">Close</button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

