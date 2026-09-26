const AdminPage = () => (
  <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-50">
    <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/50">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Admin access</p>
      <h1 className="mt-4 text-3xl font-bold text-white">Admin Panel</h1>
      <p className="mt-4 max-w-xl text-slate-300">
        Restricted to admin users only. This area is reserved for operational oversight and fleet control features.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["Users", "128"],
          ["Vehicles", "356"],
          ["Alerts", "7"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AdminPage;
