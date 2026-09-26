import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user, logout } = useAuth();

  const stats = [
    { label: "Active vehicles", value: "128" },
    { label: "Open jobs", value: "24" },
    { label: "Efficiency", value: "94%" },
  ];

  const actions = [
    "Dispatch updates",
    "Fleet health",
    "Route planning",
    "Maintenance logs",
  ];

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-50">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/40 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Welcome back, {user?.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
            >
              Home
            </Link>
            <button
              onClick={logout}
              className="rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-400"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-3 text-3xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="text-xl font-semibold text-white">Quick actions</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {actions.map((action) => (
                <button
                  key={action}
                  className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-left text-sm text-slate-200 hover:border-sky-400 hover:text-sky-300"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-sky-950/70 to-slate-900 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Profile</p>
            <div className="mt-5 space-y-3 text-sm text-slate-200">
              <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2">
                <span>Name</span>
                <strong className="text-white">{user?.name}</strong>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2">
                <span>Email</span>
                <strong className="text-white">{user?.email}</strong>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2">
                <span>Role</span>
                <strong className="text-white uppercase">{user?.role}</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
